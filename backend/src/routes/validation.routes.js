const express = require('express');
const router = express.Router();
const validationController = require('../controllers/validation.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// Get all validations (admin only)
router.get('/', requireRole('ROOT'), validationController.getAllValidations);

// Get user validations
router.get('/user/:userId', validationController.getUserValidations);

// Get establishment validations (merchant/admin)
router.get('/establishment/:establishmentId', requireRole('MERCHANT', 'SENIOR_MERCHANT', 'ROOT'), validationController.getEstablishmentValidations);

module.exports = router;
