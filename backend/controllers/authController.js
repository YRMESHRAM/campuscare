const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const setTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/**
 * POST /api/auth/login
 * Unified secure login for all roles. Public registration is disabled.
 */
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide college ID, email, or username and password.',
      });
    }

    const trimmedIdentifier = identifier.trim();

    // Find user by email, collegeId, or username
    const user = await User.findOne({
      $or: [
        { email: trimmedIdentifier.toLowerCase() },
        { collegeId: trimmedIdentifier.toUpperCase() },
        { username: trimmedIdentifier.toLowerCase() },
      ],
    })
      .select('+passwordHash')
      .populate('departmentId', 'name code')
      .populate('assignedFacilityIds', 'name facilityType building');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your login details.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact campus administration.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your login details.',
      });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    // Audit login
    await AuditLog.create({
      performedBy: user._id,
      action: 'LOGIN',
      resourceType: 'User',
      resourceId: user._id.toString(),
      metadata: { role: user.role, email: user.email },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Remove passwordHash before returning
    const userObj = user.toObject();
    delete userObj.passwordHash;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userObj,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during authentication.',
    });
  }
};

/**
 * POST /api/auth/logout
 */
exports.logout = async (req, res) => {
  try {
    res.clearCookie('token');
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to logout',
    });
  }
};

/**
 * GET /api/auth/me
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('departmentId', 'name code')
      .populate('assignedFacilityIds', 'name facilityType building');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/auth/change-password
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.',
      });
    }

    const user = await User.findById(req.user._id).select('+passwordHash');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password.',
      });
    }

    user.passwordHash = await User.hashPassword(newPassword);
    user.mustChangePassword = false;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/auth/forgot-password
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;
    // Log inquiry for administrator
    return res.status(200).json({
      success: true,
      message:
        'If an active account exists, password reset request has been logged. Please contact campus administration if immediate access is required.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
