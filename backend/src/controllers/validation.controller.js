const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get user validations
 */
const getUserValidations = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user is requesting their own data or is admin/merchant
    if (req.user.id !== userId && !['ROOT', 'MERCHANT', 'SENIOR_MERCHANT'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Cannot access other users validations' });
    }

    const validations = await prisma.validation.findMany({
      where: { userId },
      include: {
        establishment: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ validations });

  } catch (error) {
    console.error('Get user validations error:', error);
    res.status(500).json({ error: 'Failed to fetch validations' });
  }
};

/**
 * Get establishment validations (Merchant/Admin)
 */
const getEstablishmentValidations = async (req, res) => {
  try {
    const { establishmentId } = req.params;

    // Verify merchant belongs to this establishment or is admin
    if (req.user.role !== 'ROOT' && req.user.establishmentId !== establishmentId) {
      return res.status(403).json({ error: 'Cannot access other establishments validations' });
    }

    const validations = await prisma.validation.findMany({
      where: { establishmentId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ validations });

  } catch (error) {
    console.error('Get establishment validations error:', error);
    res.status(500).json({ error: 'Failed to fetch validations' });
  }
};

/**
 * Get all validations (Admin only)
 */
const getAllValidations = async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const validations = await prisma.validation.findMany({
      take: parseInt(limit),
      skip: parseInt(offset),
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        establishment: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const total = await prisma.validation.count();

    res.json({ 
      validations,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Get all validations error:', error);
    res.status(500).json({ error: 'Failed to fetch validations' });
  }
};

module.exports = {
  getUserValidations,
  getEstablishmentValidations,
  getAllValidations
};
