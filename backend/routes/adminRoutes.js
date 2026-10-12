const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateUser, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Admin and management routes
router.use(authenticateUser);

// Routes allowed for admin, coordinator, facility manager, hod where appropriate
router.get('/departments', adminController.getDepartments);
router.get('/facilities', adminController.getFacilities);
router.get('/categories', adminController.getCategories);

// Strictly Admin restricted routes
router.get('/analytics', requireRole('admin', 'coordinator', 'hod'), adminController.getAnalytics);

router.use(requireRole('admin'));

router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.post('/users/import', upload.single('file'), adminController.bulkImportUsers);
router.patch('/users/:id', adminController.updateUser);

router.post('/departments', adminController.createDepartment);
router.patch('/departments/:id', adminController.updateDepartment);

router.post('/facilities', adminController.createFacility);
router.patch('/facilities/:id', adminController.updateFacility);

router.post('/categories', adminController.createCategory);
router.patch('/categories/:id', adminController.updateCategory);

router.get('/audit-logs', adminController.getAuditLogs);
router.get('/reports/export', adminController.exportComplaintsCsv);

module.exports = router;
