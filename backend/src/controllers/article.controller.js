const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all articles for an establishment
 */
const getArticles = async (req, res) => {
  try {
    const { establishmentId } = req.params;
    const { category, search, lowStock } = req.query;

    // Verify access
    if (req.user.role !== 'ROOT' && 
        req.user.role !== 'SENIOR_MERCHANT' && 
        !(req.user.role === 'MERCHANT' && req.user.canManageStock)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role !== 'ROOT' && req.user.establishmentId !== establishmentId) {
      return res.status(403).json({ error: 'Can only view articles of your establishment' });
    }

    const where = { establishmentId };
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } }
      ];
    }

    let articles = await prisma.article.findMany({
      where,
      include: {
        _count: {
          select: { stockEntries: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Filter low stock if requested
    if (lowStock === 'true') {
      articles = articles.filter(a => a.currentStock <= a.minStock);
    }

    res.json({ articles });

  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
};

/**
 * Get single article
 */
const getArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        establishment: {
          select: { id: true, name: true }
        },
        stockEntries: {
          include: {
            user: {
              select: { id: true, username: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Verify access
    if (req.user.role !== 'ROOT' && req.user.establishmentId !== article.establishmentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ article });

  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
};

/**
 * Create article
 */
const createArticle = async (req, res) => {
  try {
    const {
      establishmentId,
      name,
      category,
      brand,
      size,
      description,
      barcode,
      imageUrl,
      initialStock,
      minStock
    } = req.body;

    // Verify access
    if (req.user.role !== 'ROOT' && 
        req.user.role !== 'SENIOR_MERCHANT' && 
        !(req.user.role === 'MERCHANT' && req.user.canManageStock)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role !== 'ROOT' && req.user.establishmentId !== establishmentId) {
      return res.status(403).json({ error: 'Can only create articles for your establishment' });
    }

    if (!name || !establishmentId) {
      return res.status(400).json({ error: 'Name and establishment are required' });
    }

    // Check for duplicate
    const existing = await prisma.article.findFirst({
      where: {
        establishmentId,
        name: { equals: name, mode: 'insensitive' }
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Article with this name already exists' });
    }

    const article = await prisma.article.create({
      data: {
        establishmentId,
        name: name.trim(),
        category: category || 'OTHER',
        brand: brand?.trim(),
        size: size?.trim(),
        description: description?.trim(),
        barcode: barcode?.trim(),
        imageUrl,
        currentStock: initialStock || 0,
        minStock: minStock || 0
      }
    });

    // Create initial stock entry if stock > 0
    if (initialStock && initialStock > 0) {
      await prisma.stockEntry.create({
        data: {
          establishmentId,
          articleId: article.id,
          quantity: initialStock,
          type: 'manual',
          notes: 'Initial stock',
          userId: req.user.id
        }
      });
    }

    res.status(201).json({
      message: 'Article created successfully',
      article
    });

  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({ error: 'Failed to create article' });
  }
};

/**
 * Update article
 */
const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      brand,
      size,
      description,
      barcode,
      imageUrl,
      minStock
    } = req.body;

    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Verify access
    if (req.user.role !== 'ROOT' && req.user.establishmentId !== article.establishmentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updated = await prisma.article.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(category && { category }),
        ...(brand !== undefined && { brand: brand?.trim() }),
        ...(size !== undefined && { size: size?.trim() }),
        ...(description !== undefined && { description: description?.trim() }),
        ...(barcode !== undefined && { barcode: barcode?.trim() }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(minStock !== undefined && { minStock })
      }
    });

    res.json({
      message: 'Article updated successfully',
      article: updated
    });

  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({ error: 'Failed to update article' });
  }
};

/**
 * Delete article
 */
const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Verify access (only SENIOR_MERCHANT or ROOT can delete)
    if (req.user.role !== 'ROOT' && 
        (req.user.role !== 'SENIOR_MERCHANT' || req.user.establishmentId !== article.establishmentId)) {
      return res.status(403).json({ error: 'Only senior merchant can delete articles' });
    }

    await prisma.article.delete({ where: { id } });

    res.json({ message: 'Article deleted successfully' });

  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
};

module.exports = {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle
};
