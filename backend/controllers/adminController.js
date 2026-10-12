const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Department = require('../models/Department');
const Facility = require('../models/Facility');
const ComplaintCategory = require('../models/ComplaintCategory');
const AuditLog = require('../models/AuditLog');
const fs = require('fs');
const csvParser = require('csv-parser');

/**
 * GET /api/admin/analytics
 * Real database aggregation metrics
 */
exports.getAnalytics = async function (req, res) {
  try {
    const now = new Date();

    // 1. Overall counts
    const statusCounts = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusMap = {};
    let total = 0;
    statusCounts.forEach((sc) => {
      statusMap[sc._id] = sc.count;
      total += sc.count;
    });

    // 2. Overdue complaints
    const overdueCount = await Complaint.countDocuments({
      status: { $nin: ['Resolved', 'Closed', 'Rejected'] },
      resolutionDeadline: { $lt: now },
    });

    // 3. Priority distribution
    const priorityCounts = await Complaint.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    // 4. By Facility
    const facilityCounts = await Complaint.aggregate([
      { $group: { _id: '$facilityId', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'facilities',
          localField: '_id',
          foreignField: '_id',
          as: 'facility',
        },
      },
      { $unwind: { path: '$facility', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $ifNull: ['$facility.name', 'Unassigned'] },
          count: 1,
        },
      },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    // 5. By Category
    const categoryCounts = await Complaint.aggregate([
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'complaintcategories',
          localField: '_id',
          foreignField: '_id',
          as: 'cat',
        },
      },
      { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $ifNull: ['$cat.name', 'General'] },
          count: 1,
        },
      },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    // 6. By Department
    const departmentCounts = await Complaint.aggregate([
      { $group: { _id: '$departmentId', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'dept',
        },
      },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $ifNull: ['$dept.name', 'Central Campus'] },
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 7. Average Resolution Time (in hours)
    const resolvedComplaints = await Complaint.find({
      status: { $in: ['Resolved', 'Closed'] },
      resolvedAt: { $exists: true },
    }).select('createdAt resolvedAt');

    let avgResolutionHours = 0;
    if (resolvedComplaints.length > 0) {
      const totalHours = resolvedComplaints.reduce((acc, c) => {
        const diffMs = new Date(c.resolvedAt) - new Date(c.createdAt);
        return acc + diffMs / (1000 * 60 * 60);
      }, 0);
      avgResolutionHours = Math.round((totalHours / resolvedComplaints.length) * 10) / 10;
    }

    const resolvedTotal = (statusMap['Resolved'] || 0) + (statusMap['Closed'] || 0);
    const resolutionRate = total > 0 ? Math.round((resolvedTotal / total) * 100) : 0;
    const overdueRate = total > 0 ? Math.round((overdueCount / total) * 100) : 0;

    // 8. Faculty Workload & Performance
    const facultyWorkload = await Complaint.aggregate([
      { $match: { assignedTo: { $ne: null } } },
      {
        $group: {
          _id: '$assignedTo',
          totalAssigned: { $sum: 1 },
          resolvedCount: {
            $sum: {
              $cond: [{ $in: ['$status', ['Resolved', 'Closed']] }, 1, 0],
            },
          },
          activeCount: {
            $sum: {
              $cond: [{ $not: [{ $in: ['$status', ['Resolved', 'Closed', 'Rejected']] }] }, 1, 0],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          facultyName: '$user.name',
          facultyEmail: '$user.email',
          totalAssigned: 1,
          resolvedCount: 1,
          activeCount: 1,
          resolutionRate: {
            $cond: [
              { $gt: ['$totalAssigned', 0] },
              { $multiply: [{ $divide: ['$resolvedCount', '$totalAssigned'] }, 100] },
              0,
            ],
          },
        },
      },
      { $sort: { totalAssigned: -1 } },
      { $limit: 10 },
    ]);

    // 9. Trend over time (monthly / recent)
    const complaintsTimeline = await Complaint.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 14 },
    ]);

    return res.status(200).json({
      success: true,
      summary: {
        total,
        newComplaints: statusMap['Submitted'] || 0,
        underReview: statusMap['Under Review'] || 0,
        assigned: statusMap['Assigned'] || 0,
        inProgress: statusMap['In Progress'] || 0,
        onHold: statusMap['On Hold'] || 0,
        escalated: statusMap['Escalated'] || 0,
        resolved: statusMap['Resolved'] || 0,
        closed: statusMap['Closed'] || 0,
        reopened: statusMap['Reopened'] || 0,
        rejected: statusMap['Rejected'] || 0,
        overdue: overdueCount,
        resolutionRate,
        overdueRate,
        avgResolutionHours,
      },
      priorityCounts,
      facilityCounts,
      categoryCounts,
      departmentCounts,
      facultyWorkload,
      complaintsTimeline,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * USER MANAGEMENT
 */
exports.getUsers = async function (req, res) {
  try {
    const { role, departmentId, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (departmentId) query.departmentId = departmentId;
    if (search) {
      const reg = { $regex: search, $options: 'i' };
      query.$or = [{ name: reg }, { email: reg }, { collegeId: reg }];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [total, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .populate('departmentId', 'name code')
        .populate('assignedFacilityIds', 'name facilityType')
        .select('-passwordHash'),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      users,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createUser = async function (req, res) {
  try {
    const {
      name,
      email,
      collegeId,
      password,
      role,
      departmentId,
      academicYear,
      assignedFacilityIds,
      permissions,
      organizationalLevel,
    } = req.body;

    if (!name || !email || !collegeId || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, college ID, password, and role are required.',
      });
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { collegeId: collegeId.toUpperCase() }],
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or college ID already exists.',
      });
    }

    const passwordHash = await User.hashPassword(password);
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      collegeId: collegeId.toUpperCase(),
      passwordHash,
      role,
      departmentId: departmentId || null,
      academicYear,
      assignedFacilityIds: assignedFacilityIds || [],
      permissions: permissions || [],
      organizationalLevel: organizationalLevel || (role === 'admin' ? 4 : role === 'hod' ? 3 : 1),
    });

    await AuditLog.create({
      performedBy: req.user._id,
      action: 'USER_CREATED',
      resourceType: 'User',
      resourceId: newUser._id.toString(),
      metadata: { name: newUser.name, email: newUser.email, role: newUser.role },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const userObj = newUser.toObject();
    delete userObj.passwordHash;

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: userObj,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUser = async function (req, res) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    delete updates.passwordHash; // Don't allow direct passwordHash modification

    if (updates.password) {
      updates.passwordHash = await User.hashPassword(updates.password);
      delete updates.password;
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true })
      .populate('departmentId', 'name code')
      .select('-passwordHash');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await AuditLog.create({
      performedBy: req.user._id,
      action: 'USER_UPDATED',
      resourceType: 'User',
      resourceId: user._id.toString(),
      metadata: updates,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Bulk import users via CSV file
 */
exports.bulkImportUsers = async function (req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'CSV file is required.' });
    }

    const results = [];
    const errors = [];
    let importedCount = 0;

    fs.createReadStream(req.file.path)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          fs.unlinkSync(req.file.path); // remove temp file

          for (const row of results) {
            const { name, email, collegeId, role, password, academicYear } = row;
            if (!name || !email || !collegeId || !role) {
              errors.push(`Missing required fields for row: ${JSON.stringify(row)}`);
              continue;
            }

            const exists = await User.findOne({
              $or: [{ email: email.toLowerCase() }, { collegeId: collegeId.toUpperCase() }],
            });

            if (exists) {
              errors.push(`User already exists for ${email} / ${collegeId}`);
              continue;
            }

            const defaultPass = password || 'CampusCare@2026';
            const passwordHash = await User.hashPassword(defaultPass);

            await User.create({
              name: name.trim(),
              email: email.trim().toLowerCase(),
              collegeId: collegeId.trim().toUpperCase(),
              role: role.trim().toLowerCase(),
              passwordHash,
              academicYear: academicYear ? academicYear.trim() : undefined,
              mustChangePassword: true,
            });
            importedCount++;
          }

          await AuditLog.create({
            performedBy: req.user._id,
            action: 'BULK_USER_IMPORT_CSV',
            resourceType: 'User',
            metadata: { importedCount, errorCount: errors.length },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
          });

          return res.status(200).json({
            success: true,
            message: `Bulk import completed. Imported: ${importedCount}, Skipped: ${errors.length}`,
            importedCount,
            errors,
          });
        } catch (innerErr) {
          return res.status(500).json({ success: false, message: innerErr.message });
        }
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DEPARTMENT MANAGEMENT
 */
exports.getDepartments = async function (req, res) {
  try {
    const depts = await Department.find()
      .populate('coordinatorIds', 'name email collegeId')
      .populate('hodId', 'name email collegeId')
      .populate('facilityIds', 'name facilityType');
    return res.status(200).json({ success: true, departments: depts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createDepartment = async function (req, res) {
  try {
    const { name, code, coordinatorIds, hodId, facilityIds } = req.body;
    const dept = await Department.create({
      name,
      code,
      coordinatorIds: coordinatorIds || [],
      hodId: hodId || null,
      facilityIds: facilityIds || [],
    });
    return res.status(201).json({ success: true, department: dept });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateDepartment = async function (req, res) {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.status(200).json({ success: true, department: dept });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * FACILITY MANAGEMENT
 */
exports.getFacilities = async function (req, res) {
  try {
    const facilities = await Facility.find()
      .populate('departmentIds', 'name code')
      .populate('responsibleUserIds', 'name email role');
    return res.status(200).json({ success: true, facilities });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createFacility = async function (req, res) {
  try {
    const facility = await Facility.create(req.body);
    return res.status(201).json({ success: true, facility });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateFacility = async function (req, res) {
  try {
    const facility = await Facility.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.status(200).json({ success: true, facility });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * CATEGORY MANAGEMENT
 */
exports.getCategories = async function (req, res) {
  try {
    const categories = await ComplaintCategory.find().populate('defaultDepartmentId', 'name code');
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCategory = async function (req, res) {
  try {
    const category = await ComplaintCategory.create(req.body);
    return res.status(201).json({ success: true, category });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCategory = async function (req, res) {
  try {
    const category = await ComplaintCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.status(200).json({ success: true, category });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * AUDIT LOGS
 */
exports.getAuditLogs = async function (req, res) {
  try {
    const { page = 1, limit = 30 } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [total, logs] = await Promise.all([
      AuditLog.countDocuments(),
      AuditLog.find()
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .populate('performedBy', 'name email role collegeId'),
    ]);
    return res.status(200).json({ success: true, total, logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * CSV EXPORT WITH STRICT IDENTITY MASKING
 */
exports.exportComplaintsCsv = async function (req, res) {
  try {
    const canViewIdentity =
      req.user.permissions && req.user.permissions.includes('complaints.viewSubmitterIdentity');

    const complaints = await Complaint.find()
      .populate('facilityId', 'name')
      .populate('categoryId', 'name')
      .populate('departmentId', 'name')
      .populate('assignedTo', 'name')
      .populate('submittedBy', 'name email collegeId')
      .sort({ createdAt: -1 });

    const headers = [
      'Ticket ID',
      'Title',
      'Facility',
      'Location',
      'Category',
      'Priority',
      'Status',
      'Department',
      'Assigned Faculty',
      'Submitter Identity',
      'Created Date',
      'Resolution Notes',
    ];

    const rows = complaints.map((c) => {
      let submitterStr = 'Anonymous Student';
      if (canViewIdentity && c.submittedBy) {
        submitterStr = `${c.submittedBy.name} (${c.submittedBy.collegeId})`;
      }

      return [
        `"${c.ticketId}"`,
        `"${(c.title || '').replace(/"/g, '""')}"`,
        `"${c.facilityId?.name || ''}"`,
        `"${(c.location || '').replace(/"/g, '""')}"`,
        `"${c.categoryId?.name || ''}"`,
        `"${c.priority}"`,
        `"${c.status}"`,
        `"${c.departmentId?.name || ''}"`,
        `"${c.assignedTo?.name || 'Unassigned'}"`,
        `"${submitterStr}"`,
        `"${new Date(c.createdAt).toISOString()}"`,
        `"${(c.resolutionNotes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="campuscare_complaints_export.csv"');
    return res.send(csvContent);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
