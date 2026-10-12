const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const {
  authenticateUser,
  requireRole,
  requirePermission,
  checkComplaintAccess,
} = require('../middleware/auth');
const upload = require('../middleware/upload');

// All complaint routes require authentication
router.use(authenticateUser);

router.post(
  '/',
  upload.array('attachments', 5),
  complaintController.createComplaint
);

router.get('/', complaintController.getComplaints);

router.get('/:id', checkComplaintAccess, complaintController.getComplaintById);

router.patch('/:id/status', checkComplaintAccess, complaintController.updateComplaintStatus);

router.patch(
  '/:id/assign',
  requireRole('admin', 'coordinator', 'hod', 'facility_manager'),
  complaintController.assignComplaint
);

router.post('/:id/comments', checkComplaintAccess, complaintController.addComment);

router.post('/:id/feedback', requireRole('student'), complaintController.submitFeedback);

router.post('/:id/reopen', requireRole('student'), complaintController.reopenComplaint);

// Submitter identity revelation endpoint - strictly guarded by permission & audit log
router.get(
  '/:id/submitter-identity',
  requirePermission('complaints.viewSubmitterIdentity'),
  complaintController.getSubmitterIdentity
);

module.exports = router;
