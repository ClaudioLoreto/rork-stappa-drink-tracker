const express = require('express');
const router = express.Router();
const stockPhotoController = require('../controllers/stock-photo.controller');
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

// Upload photo for AI analysis
router.post('/upload', canManageStock, stockPhotoController.uploadStockPhoto);

// Analyze photo with AI
router.post('/analyze/:photoId', canManageStock, stockPhotoController.analyzeStockPhoto);

// Get stock photo with recognitions
router.get('/:photoId', stockPhotoController.getStockPhoto);

// Confirm/correct single recognition
router.patch('/recognition/:recognitionId', canManageStock, stockPhotoController.confirmRecognition);

// Confirm all recognitions and update stock
router.post('/confirm/:photoId', canManageStock, stockPhotoController.confirmAllAndUpdateStock);

module.exports = router;
