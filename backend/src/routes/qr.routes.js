const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qr.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// Generate validation QR (User)
router.post('/generate/validation', requireRole('USER', 'MERCHANT', 'SENIOR_MERCHANT', 'ROOT'), qrController.generateValidationQR);

// Generate bonus QR (User)
router.post('/generate/bonus', requireRole('USER', 'MERCHANT', 'SENIOR_MERCHANT', 'ROOT'), qrController.generateBonusQR);

// Scan QR (Merchant/Senior/Admin)
router.post('/scan', requireRole('MERCHANT', 'SENIOR_MERCHANT', 'ROOT'), qrController.scanQR);

// Get progress
router.get('/progress', qrController.getProgress);

module.exports = router;
