const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stock.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticateToken);

// Middleware to check stock management permission AND establishment feature flag
const canManageStock = async (req, res, next) => {
  try {
    // Check user permission
    if (req.user.role !== 'ROOT' && 
        req.user.role !== 'SENIOR_MERCHANT' && 
        !(req.user.role === 'MERCHANT' && req.user.canManageStock)) {
      return res.status(403).json({ error: 'You do not have permission to manage stock' });
    }

    // Check establishment has stock management enabled
    if (req.user.establishmentId) {
      const establishment = await prisma.establishment.findUnique({
        where: { id: req.user.establishmentId }
      });

      if (!establishment || !establishment.hasStockManagement) {
        return res.status(403).json({ error: 'Stock management not enabled for this establishment' });
      }
    }

    return next();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to verify permissions' });
  }
};

// Get stock for establishment
router.get('/establishment/:establishmentId', stockController.getStock);

// Get stock history
router.get('/history/:establishmentId', stockController.getStockHistory);

// Update stock (add/remove quantity)
router.post('/update/:articleId', canManageStock, stockController.updateStock);

// Set stock to specific value
router.post('/set/:articleId', canManageStock, stockController.setStock);

module.exports = router;
