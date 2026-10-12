const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');
const { authenticateUser, requireRole } = require('../middleware/auth');

router.use(authenticateUser);
router.use(requireRole('faculty', 'coordinator', 'facility_manager', 'hod'));

router.get('/dashboard', facultyController.getFacultyDashboard);

module.exports = router;
