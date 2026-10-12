const Complaint = require('../models/Complaint');

/**
 * GET /api/faculty/dashboard
 * Aggregates statistics specifically for the logged-in faculty member
 */
exports.getFacultyDashboard = async function (req, res) {
  try {
    const facultyId = req.user._id;
    const now = new Date();

    const [
      totalAssigned,
      pending,
      inProgress,
      highPriority,
      critical,
      overdue,
      resolved,
    ] = await Promise.all([
      Complaint.countDocuments({ assignedTo: facultyId }),
      Complaint.countDocuments({
        assignedTo: facultyId,
        status: { $in: ['Assigned', 'Submitted', 'Under Review'] },
      }),
      Complaint.countDocuments({ assignedTo: facultyId, status: 'In Progress' }),
      Complaint.countDocuments({
        assignedTo: facultyId,
        priority: 'High',
        status: { $nin: ['Resolved', 'Closed', 'Rejected'] },
      }),
      Complaint.countDocuments({
        assignedTo: facultyId,
        priority: 'Critical',
        status: { $nin: ['Resolved', 'Closed', 'Rejected'] },
      }),
      Complaint.countDocuments({
        assignedTo: facultyId,
        resolutionDeadline: { $lt: now },
        status: { $nin: ['Resolved', 'Closed', 'Rejected'] },
      }),
      Complaint.countDocuments({
        assignedTo: facultyId,
        status: { $in: ['Resolved', 'Closed'] },
      }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalAssigned,
        pending,
        inProgress,
        highPriority,
        critical,
        overdue,
        resolved,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
