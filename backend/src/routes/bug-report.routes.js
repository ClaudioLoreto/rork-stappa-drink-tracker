const express = require('express');
const router = express.Router();
const bugReportController = require('../controllers/bug-report.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// Create bug report (with file upload)
router.post('/', bugReportController.upload.array('screenshots', 3), bugReportController.createBugReport);

// Get user's bug reports
router.get('/my-reports', bugReportController.getUserBugReports);

// Get all bug reports (admin only)
router.get('/', requireRole('ROOT'), bugReportController.getAllBugReports);

// Update bug report status (admin only)
router.patch('/:id', requireRole('ROOT'), bugReportController.updateBugReportStatus);

// Delete bug report (admin only)
router.delete('/:id', requireRole('ROOT'), bugReportController.deleteBugReport);

module.exports = router;
