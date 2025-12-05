const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qr.controller');
const devController = require('../controllers/dev.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

// TEST ENDPOINT - No auth required (for development only)
router.get('/test-token', (req, res) => {
  const testToken = `QR_TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.json({ 
    message: 'Test QR token generated (no database)',
    token: testToken,
    note: 'Use this token in the app DEV button'
  });
});

// All routes below require authentication
router.use(authenticateToken);

// Generate validation QR (User)
router.post('/generate/validation', requireRole('USER', 'MERCHANT', 'SENIOR_MERCHANT', 'ROOT'), qrController.generateValidationQR);

// Generate bonus QR (User)
router.post('/generate/bonus', requireRole('USER', 'MERCHANT', 'SENIOR_MERCHANT', 'ROOT'), qrController.generateBonusQR);

// Scan QR (Merchant/Senior/Admin)
router.post('/scan', requireRole('MERCHANT', 'SENIOR_MERCHANT', 'ROOT'), qrController.scanQR);

// Simulate Scan (Dev Only - No Role Check)
router.post('/simulate-scan', devController.simulateScan);

// Get progress
router.get('/progress', qrController.getProgress);

module.exports = router;
