const express = require('express');
const router = express.Router();
const promoController = require('../controllers/promo.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// Create promo (Senior Merchant or Admin)
router.post('/', requireRole('SENIOR_MERCHANT', 'ROOT'), promoController.createPromo);

// Get active promo for establishment
router.get('/active/:establishmentId', promoController.getActivePromo);

// Get all promos for establishment
router.get('/establishment/:establishmentId', promoController.getEstablishmentPromos);

// Update promo
router.patch('/:id', requireRole('SENIOR_MERCHANT', 'ROOT'), promoController.updatePromo);

// Delete promo
router.delete('/:id', requireRole('SENIOR_MERCHANT', 'ROOT'), promoController.deletePromo);

module.exports = router;
