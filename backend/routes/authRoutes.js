const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { authenticateUser } = require('../middleware/auth');

// Rate limiter for authentication to prevent brute force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 login requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticateUser, authController.getMe);
router.post('/change-password', authenticateUser, authController.changePassword);
router.post('/forgot-password', authController.forgotPassword);

module.exports = router;
