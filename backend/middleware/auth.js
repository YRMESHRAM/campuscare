const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const AuditLog = require('../models/AuditLog');

/**
 * Middleware: Authenticates JWT from cookie or Bearer header
 */
const authenticateUser = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('+passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account not found or session invalid.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administrator.',
      });
    }

    // Attach user to req without passwordHash
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please log in again.',
    });
  }
};

/**
 * Middleware: Requires one of specified roles
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission for this resource.',
      });
    }
    next();
  };
};

/**
 * Middleware: Requires a specific permission string
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    // Super admin may have wildcard or direct permission check
    const hasPermission =
      (req.user.permissions && req.user.permissions.includes(permission)) ||
      (req.user.role === 'admin' && req.user.permissions && req.user.permissions.includes(permission));

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Missing required permission '${permission}'.`,
      });
    }
    next();
  };
};

/**
 * Middleware: Validates that the requesting user has legitimate resource access to a complaint
 */
const checkComplaintAccess = async (req, res, next) => {
  try {
    const complaintId = req.params.id;
    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    const user = req.user;

    // Admin has access to all complaints
    if (user.role === 'admin') {
      req.complaint = complaint;
      return next();
    }

    // Student: can ONLY access their own complaints
    if (user.role === 'student') {
      if (complaint.submittedBy.toString() !== user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only view your own complaints.',
        });
      }
      req.complaint = complaint;
      return next();
    }

    // Faculty: assigned to them, or belongs to their department/facility if permitted
    if (user.role === 'faculty') {
      const isAssigned = complaint.assignedTo && complaint.assignedTo.toString() === user._id.toString();
      const inDepartment = user.departmentId && complaint.departmentId && complaint.departmentId.toString() === user.departmentId.toString();
      const inFacility = user.assignedFacilityIds && user.assignedFacilityIds.some(f => f.toString() === complaint.facilityId.toString());

      if (isAssigned || inDepartment || inFacility) {
        req.complaint = complaint;
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this complaint.',
      });
    }

    // Department Coordinator & HOD: within their authorized department
    if (user.role === 'coordinator' || user.role === 'hod') {
      const inDepartment = user.departmentId && complaint.departmentId && complaint.departmentId.toString() === user.departmentId.toString();
      if (inDepartment) {
        req.complaint = complaint;
        return next();
      }
      return res.status(403).json({
        success: false,
        message: 'Access denied: This complaint does not belong to your department.',
      });
    }

    // Facility Manager: within their authorized facilities
    if (user.role === 'facility_manager') {
      const inFacility = user.assignedFacilityIds && user.assignedFacilityIds.some(f => f.toString() === complaint.facilityId.toString());
      if (inFacility) {
        req.complaint = complaint;
        return next();
      }
      return res.status(403).json({
        success: false,
        message: 'Access denied: This complaint is outside your assigned facilities.',
      });
    }

    return res.status(403).json({ success: false, message: 'Access denied.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  authenticateUser,
  requireRole,
  requirePermission,
  checkComplaintAccess,
};
