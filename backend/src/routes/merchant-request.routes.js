const express = require('express');
const router = express.Router();
const merchantRequestController = require('../controllers/merchant-request.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// Create merchant request (any user)
router.post('/', merchantRequestController.createMerchantRequest);

// Get user's merchant requests
router.get('/my-requests', merchantRequestController.getUserMerchantRequests);

// Get all merchant requests (admin only)
router.get('/', requireRole('ROOT'), merchantRequestController.getAllMerchantRequests);

// Approve merchant request (admin only)
router.post('/:id/approve', requireRole('ROOT'), merchantRequestController.approveMerchantRequest);

// Reject merchant request (admin only)
router.post('/:id/reject', requireRole('ROOT'), merchantRequestController.rejectMerchantRequest);

module.exports = router;
