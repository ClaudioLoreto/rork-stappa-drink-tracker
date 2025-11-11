const express = require('express');
const router = express.Router();
const articleController = require('../controllers/article.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');
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

// Get articles for establishment
router.get('/establishment/:establishmentId', articleController.getArticles);

// Get single article
router.get('/:id', articleController.getArticle);

// Create article
router.post('/', canManageStock, articleController.createArticle);

// Update article
router.put('/:id', canManageStock, articleController.updateArticle);

// Delete article (only SENIOR_MERCHANT or ROOT)
router.delete('/:id', requireRole('SENIOR_MERCHANT', 'ROOT'), articleController.deleteArticle);

module.exports = router;
