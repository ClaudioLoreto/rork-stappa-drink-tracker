const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get stock for establishment
 */
const getStock = async (req, res) => {
  try {
    const { establishmentId } = req.params;
    const { lowStock, category } = req.query;

    // Verify access
    if (req.user.role !== 'ROOT' && req.user.establishmentId !== establishmentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const where = { establishmentId };
    if (category) where.category = category;

    let articles = await prisma.article.findMany({
      where,
      select: {
        id: true,
        name: true,
        category: true,
        brand: true,
        size: true,
        currentStock: true,
        minStock: true,
        imageUrl: true
      },
      orderBy: { name: 'asc' }
    });

    // Filter low stock
    if (lowStock === 'true') {
      articles = articles.filter(a => a.currentStock <= a.minStock);
    }

    res.json({ articles });

  } catch (error) {
    console.error('Get stock error:', error);
    res.status(500).json({ error: 'Failed to fetch stock' });
  }
};

/**
 * Update stock manually
 */
const updateStock = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { quantity, type, notes } = req.body;

    // Verify access
    if (req.user.role !== 'ROOT' && 
        req.user.role !== 'SENIOR_MERCHANT' && 
        !(req.user.role === 'MERCHANT' && req.user.canManageStock)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    if (req.user.role !== 'ROOT' && req.user.establishmentId !== article.establishmentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!quantity || quantity === 0) {
      return res.status(400).json({ error: 'Quantity is required' });
    }

    // Create stock entry
    const stockEntry = await prisma.stockEntry.create({
      data: {
        establishmentId: article.establishmentId,
        articleId: article.id,
        quantity: parseInt(quantity),
        type: type || 'manual',
        notes,
        userId: req.user.id
      }
    });

    // Update article current stock
    const newStock = Math.max(0, article.currentStock + parseInt(quantity));
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: { currentStock: newStock }
    });

    res.json({
      message: 'Stock updated successfully',
      article: updatedArticle,
      stockEntry
    });

  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
};

/**
 * Get stock history
 */
const getStockHistory = async (req, res) => {
  try {
    const { establishmentId } = req.params;
    const { articleId, limit = 50 } = req.query;

    // Verify access
    if (req.user.role !== 'ROOT' && req.user.establishmentId !== establishmentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const where = { establishmentId };
    if (articleId) where.articleId = articleId;

    const entries = await prisma.stockEntry.findMany({
      where,
      include: {
        article: {
          select: { id: true, name: true, brand: true }
        },
        user: {
          select: { id: true, username: true, role: true }
        },
        stockPhoto: {
          select: { id: true, imageUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    res.json({ entries });

  } catch (error) {
    console.error('Get stock history error:', error);
    res.status(500).json({ error: 'Failed to fetch stock history' });
  }
};

/**
 * Set stock to specific value (not increment/decrement)
 */
const setStock = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { newStock, notes } = req.body;

    // Verify access
    if (req.user.role !== 'ROOT' && 
        req.user.role !== 'SENIOR_MERCHANT' && 
        !(req.user.role === 'MERCHANT' && req.user.canManageStock)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    if (req.user.role !== 'ROOT' && req.user.establishmentId !== article.establishmentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (newStock === undefined || newStock < 0) {
      return res.status(400).json({ error: 'Valid stock value is required' });
    }

    const difference = parseInt(newStock) - article.currentStock;

    // Create stock entry for the adjustment
    if (difference !== 0) {
      await prisma.stockEntry.create({
        data: {
          establishmentId: article.establishmentId,
          articleId: article.id,
          quantity: difference,
          type: 'manual',
          notes: notes || `Stock adjusted to ${newStock}`,
          userId: req.user.id
        }
      });
    }

    // Update article stock
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: { currentStock: parseInt(newStock) }
    });

    res.json({
      message: 'Stock set successfully',
      article: updatedArticle
    });

  } catch (error) {
    console.error('Set stock error:', error);
    res.status(500).json({ error: 'Failed to set stock' });
  }
};

module.exports = {
  getStock,
  updateStock,
  getStockHistory,
  setStock
};
