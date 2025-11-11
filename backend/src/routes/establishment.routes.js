const express = require('express');
const router = express.Router();
const establishmentController = require('../controllers/establishment.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// Get all establishments
router.get('/', establishmentController.getAllEstablishments);

// Get establishment by ID
router.get('/:id', establishmentController.getEstablishmentById);

// Create establishment (admin only)
router.post('/', requireRole('ROOT'), establishmentController.createEstablishment);

// Assign merchant to establishment (admin only)
router.post('/:id/assign-merchant', requireRole('ROOT'), establishmentController.assignMerchant);

// Update establishment (admin only)
router.patch('/:id', requireRole('ROOT'), establishmentController.updateEstablishment);

// Delete establishment (admin only)
router.delete('/:id', requireRole('ROOT'), establishmentController.deleteEstablishment);

module.exports = router;
