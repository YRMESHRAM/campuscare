const Complaint = require('../models/Complaint');
const ComplaintHistory = require('../models/ComplaintHistory');
const ComplaintComment = require('../models/ComplaintComment');
const ComplaintCategory = require('../models/ComplaintCategory');
const Facility = require('../models/Facility');
const Department = require('../models/Department');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const { generateTicketId } = require('../utils/ticketGenerator');
const { serializeComplaint, serializeComplaints } = require('../utils/serializer');

/**
 * POST /api/complaints
 * Submit a new complaint (student only)
 */
exports.createComplaint = async function (req, res) {
  try {
    const { title, description, facilityId, location, categoryId, priority } = req.body;

    if (!title || !description || !facilityId || !location || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, facility, location, and category.',
      });
    }

    const facility = await Facility.findById(facilityId);
    if (!facility) {
      return res.status(404).json({ success: false, message: 'Selected facility not found.' });
    }

    const category = await ComplaintCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Selected category not found.' });
    }

    // Determine department
    let departmentId = category.defaultDepartmentId;
    if (!departmentId && facility.departmentIds && facility.departmentIds.length > 0) {
      departmentId = facility.departmentIds[0];
    }

    // Determine responsible faculty if mapped
    let assignedTo = null;
    if (facility.responsibleUserIds && facility.responsibleUserIds.length > 0) {
      assignedTo = facility.responsibleUserIds[0];
    }

    // Calculate SLA resolution deadline
    const hours = category.resolutionTargetHours || 48;
    const resolutionDeadline = new Date(Date.now() + hours * 60 * 60 * 1000);

    // Generate unique concurrency-safe ticket ID
    const ticketId = await generateTicketId();

    // Process attachments if any uploaded
    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        attachments.push({
          url: `/uploads/${file.filename}`,
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        });
      });
    }

    const newComplaint = new Complaint({
      ticketId,
      title: title.trim(),
      description: description.trim(),
      submittedBy: req.user._id,
      facilityId,
      location: location.trim(),
      categoryId,
      departmentId,
      assignedTo,
      priority: priority || category.defaultPriority || 'Medium',
      status: assignedTo ? 'Assigned' : 'Submitted',
      attachments,
      resolutionDeadline,
    });

    await newComplaint.save();

    // Create history record
    await ComplaintHistory.create({
      complaintId: newComplaint._id,
      action: 'COMPLAINT_CREATED',
      newStatus: newComplaint.status,
      performedBy: req.user._id,
      remarks: 'Complaint lodged by student via portal',
    });

    // Notify submitter
    await Notification.create({
      recipientId: req.user._id,
      complaintId: newComplaint._id,
      ticketId: newComplaint.ticketId,
      message: `Your complaint "${newComplaint.title}" has been submitted with Ticket ID: ${newComplaint.ticketId}`,
      type: 'submission',
    });

    // If auto-assigned, notify assigned faculty
    if (assignedTo) {
      await Notification.create({
        recipientId: assignedTo,
        complaintId: newComplaint._id,
        ticketId: newComplaint.ticketId,
        message: `New complaint [${newComplaint.ticketId}] "${newComplaint.title}" assigned to you.`,
        type: 'assignment',
      });
    }

    const populated = await Complaint.findById(newComplaint._id)
      .populate('facilityId', 'name facilityType building')
      .populate('categoryId', 'name resolutionTargetHours')
      .populate('departmentId', 'name code')
      .populate('assignedTo', 'name email role');

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint: serializeComplaint(populated, req.user),
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/complaints
 * Filterable, searchable, paginated complaints with role-based scoping and identity masking
 */
exports.getComplaints = async function (req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      priority,
      facilityId,
      categoryId,
      departmentId,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};
    const user = req.user;

    // RBAC Query Scoping
    if (user.role === 'student') {
      query.submittedBy = user._id;
    } else if (user.role === 'faculty') {
      const orConditions = [{ assignedTo: user._id }];
      if (user.departmentId) orConditions.push({ departmentId: user.departmentId });
      if (user.assignedFacilityIds && user.assignedFacilityIds.length > 0) {
        orConditions.push({ facilityId: { $in: user.assignedFacilityIds } });
      }
      query.$or = orConditions;
    } else if (user.role === 'coordinator' || user.role === 'hod') {
      if (user.departmentId) {
        query.departmentId = user.departmentId;
      }
    } else if (user.role === 'facility_manager') {
      if (user.assignedFacilityIds && user.assignedFacilityIds.length > 0) {
        query.facilityId = { $in: user.assignedFacilityIds };
      }
    }
    // Admin: no mandatory scoping filter

    // Additional query filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (facilityId) query.facilityId = facilityId;
    if (categoryId) query.categoryId = categoryId;
    if (departmentId && user.role === 'admin') query.departmentId = departmentId;

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      const searchMatch = [
        { ticketId: searchRegex },
        { title: searchRegex },
        { location: searchRegex },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchMatch }];
        delete query.$or;
      } else {
        query.$or = searchMatch;
      }
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const [total, complaints] = await Promise.all([
      Complaint.countDocuments(query),
      Complaint.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit, 10))
        .populate('facilityId', 'name facilityType building')
        .populate('categoryId', 'name resolutionTargetHours')
        .populate('departmentId', 'name code')
        .populate('assignedTo', 'name email role')
        .populate('submittedBy', 'name email collegeId departmentId academicYear'),
    ]);

    // Apply strict privacy serialization
    const serialized = serializeComplaints(complaints, user);

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      complaints: serialized,
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/complaints/:id
 * Get single complaint detail with history, comments, and identity protection
 */
exports.getComplaintById = async function (req, res) {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('facilityId', 'name facilityType building floorOrBlock')
      .populate('categoryId', 'name description resolutionTargetHours')
      .populate('departmentId', 'name code')
      .populate('assignedTo', 'name email role collegeId')
      .populate('submittedBy', 'name email collegeId departmentId academicYear');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Check resource access
    const user = req.user;
    if (user.role === 'student' && complaint.submittedBy._id.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied to this complaint.' });
    }

    // Fetch history
    const history = await ComplaintHistory.find({ complaintId: complaint._id })
      .sort({ createdAt: -1 })
      .populate('performedBy', 'name role');

    // Fetch comments: filter internal comments if user is student
    const commentQuery = { complaintId: complaint._id };
    if (user.role === 'student') {
      commentQuery.visibility = 'student-visible';
    }
    const comments = await ComplaintComment.find(commentQuery)
      .sort({ createdAt: 1 })
      .populate('authorId', 'name role');

    const serialized = serializeComplaint(complaint, user);

    return res.status(200).json({
      success: true,
      complaint: serialized,
      history,
      comments,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/complaints/:id/status
 * Update status with validation rules and history record
 */
exports.updateComplaintStatus = async function (req, res) {
  try {
    const { status, remarks, holdReason, escalationReason, resolutionNotes, rejectionReason } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const previousStatus = complaint.status;

    // Validate reason requirements
    if (status === 'On Hold' && !holdReason && !remarks) {
      return res.status(400).json({ success: false, message: 'Reason is required when placing complaint on hold.' });
    }
    if (status === 'Escalated' && !escalationReason && !remarks) {
      return res.status(400).json({ success: false, message: 'Reason is required when escalating a complaint.' });
    }
    if (status === 'Resolved' && !resolutionNotes && !remarks) {
      return res.status(400).json({ success: false, message: 'Resolution notes are required when marking as resolved.' });
    }
    if (status === 'Rejected' && !rejectionReason && !remarks) {
      return res.status(400).json({ success: false, message: 'Explanation is required when rejecting a complaint.' });
    }

    complaint.status = status;
    if (holdReason) complaint.holdReason = holdReason;
    if (escalationReason) complaint.escalationReason = escalationReason;
    if (rejectionReason) complaint.rejectionReason = rejectionReason;
    if (resolutionNotes) {
      complaint.resolutionNotes = resolutionNotes;
      complaint.resolvedAt = new Date();
    }
    if (status === 'Closed') {
      complaint.closedAt = new Date();
    }

    await complaint.save();

    // Create history
    await ComplaintHistory.create({
      complaintId: complaint._id,
      action: `STATUS_CHANGED_TO_${status.toUpperCase().replace(/\s+/g, '_')}`,
      previousStatus,
      newStatus: status,
      performedBy: req.user._id,
      remarks: remarks || holdReason || escalationReason || resolutionNotes || rejectionReason || `Status updated to ${status}`,
    });

    // Notify student
    await Notification.create({
      recipientId: complaint.submittedBy,
      complaintId: complaint._id,
      ticketId: complaint.ticketId,
      message: `Your complaint [${complaint.ticketId}] status changed from ${previousStatus} to "${status}".`,
      type: 'status_update',
    });

    return res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      complaint,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/complaints/:id/assign
 * Assign or reassign complaint to faculty
 */
exports.assignComplaint = async function (req, res) {
  try {
    const { assignedToId, remarks } = req.body;
    if (!assignedToId) {
      return res.status(400).json({ success: false, message: 'Target faculty ID is required.' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const previousAssigned = complaint.assignedTo;
    complaint.assignedTo = assignedToId;
    if (complaint.status === 'Submitted' || complaint.status === 'Under Review') {
      complaint.status = 'Assigned';
    }

    await complaint.save();

    await ComplaintHistory.create({
      complaintId: complaint._id,
      action: 'COMPLAINT_ASSIGNED',
      previousStatus: complaint.status,
      newStatus: complaint.status,
      performedBy: req.user._id,
      remarks: remarks || 'Assigned to faculty member',
      metadata: { previousAssigned, newAssigned: assignedToId },
    });

    // Notify assigned faculty
    await Notification.create({
      recipientId: assignedToId,
      complaintId: complaint._id,
      ticketId: complaint.ticketId,
      message: `Complaint [${complaint.ticketId}] "${complaint.title}" has been assigned to you.`,
      type: 'assignment',
    });

    return res.status(200).json({
      success: true,
      message: 'Complaint successfully assigned',
      complaint,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/complaints/:id/comments
 * Add progress note or comment (with internal vs student-visible separation)
 */
exports.addComment = async function (req, res) {
  try {
    const { message, visibility } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Comment message is required.' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // If student, visibility is always student-visible
    const commentVisibility = req.user.role === 'student' ? 'student-visible' : (visibility || 'student-visible');

    const comment = await ComplaintComment.create({
      complaintId: complaint._id,
      authorId: req.user._id,
      message: message.trim(),
      visibility: commentVisibility,
    });

    const populated = await ComplaintComment.findById(comment._id).populate('authorId', 'name role');

    // Notify opposite party if visible
    if (commentVisibility === 'student-visible') {
      if (req.user.role === 'student' && complaint.assignedTo) {
        await Notification.create({
          recipientId: complaint.assignedTo,
          complaintId: complaint._id,
          ticketId: complaint.ticketId,
          message: `New message on complaint [${complaint.ticketId}] from student.`,
          type: 'comment',
        });
      } else if (req.user.role !== 'student') {
        await Notification.create({
          recipientId: complaint.submittedBy,
          complaintId: complaint._id,
          ticketId: complaint.ticketId,
          message: `New update from campus staff on your complaint [${complaint.ticketId}].`,
          type: 'comment',
        });
      }
    }

    return res.status(201).json({
      success: true,
      comment: populated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/complaints/:id/feedback
 * Submit student satisfaction rating and feedback after resolution
 */
exports.submitFeedback = async function (req, res) {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5 stars.' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (complaint.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the complaint submitter can provide feedback.' });
    }

    complaint.feedback = {
      rating,
      comment: comment ? comment.trim() : '',
      submittedAt: new Date(),
    };
    complaint.status = 'Closed';
    complaint.closedAt = new Date();
    await complaint.save();

    await ComplaintHistory.create({
      complaintId: complaint._id,
      action: 'FEEDBACK_SUBMITTED_AND_CLOSED',
      previousStatus: 'Resolved',
      newStatus: 'Closed',
      performedBy: req.user._id,
      remarks: `Student submitted feedback: ${rating} Stars. Closed automatically.`,
    });

    return res.status(200).json({
      success: true,
      message: 'Feedback submitted and complaint closed successfully. Thank you!',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/complaints/:id/reopen
 * Request reopening a closed or resolved complaint with reason
 */
exports.reopenComplaint = async function (req, res) {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a reason for reopening.' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (complaint.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the student submitter can reopen this complaint.' });
    }

    const previousStatus = complaint.status;
    complaint.status = 'Reopened';
    complaint.reopenReason = reason.trim();
    await complaint.save();

    await ComplaintHistory.create({
      complaintId: complaint._id,
      action: 'COMPLAINT_REOPENED',
      previousStatus,
      newStatus: 'Reopened',
      performedBy: req.user._id,
      remarks: `Reopened by student: ${reason.trim()}`,
    });

    if (complaint.assignedTo) {
      await Notification.create({
        recipientId: complaint.assignedTo,
        complaintId: complaint._id,
        ticketId: complaint.ticketId,
        message: `Complaint [${complaint.ticketId}] has been reopened by the student.`,
        type: 'reopened',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Complaint reopened successfully.',
      complaint,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/complaints/:id/submitter-identity
 * Revealed ONLY with explicit 'complaints.viewSubmitterIdentity' permission + logs AuditLog
 */
exports.getSubmitterIdentity = async function (req, res) {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('submittedBy', 'name email collegeId departmentId academicYear');
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Audit logging of identity disclosure
    await AuditLog.create({
      performedBy: req.user._id,
      action: 'VIEW_STUDENT_IDENTITY',
      resourceType: 'Complaint',
      resourceId: complaint.ticketId,
      metadata: {
        complaintId: complaint._id,
        studentId: complaint.submittedBy._id,
        studentName: complaint.submittedBy.name,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.status(200).json({
      success: true,
      submitter: {
        name: complaint.submittedBy.name,
        email: complaint.submittedBy.email,
        collegeId: complaint.submittedBy.collegeId,
        department: complaint.submittedBy.departmentId,
        academicYear: complaint.submittedBy.academicYear,
      },
      accessedAt: new Date(),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
