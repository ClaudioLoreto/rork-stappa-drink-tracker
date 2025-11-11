const { PrismaClient } = require('@prisma/client');
const { isPromoValid } = require('../utils/validation.util');
const prisma = new PrismaClient();

/**
 * Create new promo (Senior Merchant only)
 */
const createPromo = async (req, res) => {
  try {
    const { establishmentId, ticketCost, ticketsRequired, rewardValue, description, durationDays } = req.body;

    // Validation
    if (!establishmentId || !ticketCost || !ticketsRequired || !rewardValue || !durationDays) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify user is SENIOR_MERCHANT of this establishment
    if (req.user.role !== 'ROOT' && (req.user.role !== 'SENIOR_MERCHANT' || req.user.establishmentId !== establishmentId)) {
      return res.status(403).json({ error: 'Only senior merchant of this establishment can create promos' });
    }

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(durationDays));
    
    const expiresAt = new Date(endDate);

    // Deactivate old promos for this establishment
    await prisma.promo.updateMany({
      where: {
        establishmentId,
        isActive: true
      },
      data: {
        isActive: false
      }
    });

    // Create new promo
    const promo = await prisma.promo.create({
      data: {
        establishmentId,
        ticketCost: parseInt(ticketCost),
        ticketsRequired: parseInt(ticketsRequired),
        rewardValue: parseFloat(rewardValue),
        description: description || null,
        startDate,
        endDate,
        expiresAt,
        isActive: true
      },
      include: {
        establishment: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Promo created successfully',
      promo
    });

  } catch (error) {
    console.error('Create promo error:', error);
    res.status(500).json({ error: 'Failed to create promo' });
  }
};

/**
 * Get active promo for establishment
 */
const getActivePromo = async (req, res) => {
  try {
    const { establishmentId } = req.params;

    const promo = await prisma.promo.findFirst({
      where: {
        establishmentId,
        isActive: true,
        endDate: {
          gte: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!promo) {
      return res.status(404).json({ error: 'No active promo found' });
    }

    // Validate promo dates
    if (!isPromoValid(promo)) {
      return res.status(404).json({ error: 'Promo expired or not yet active' });
    }

    res.json({ promo });

  } catch (error) {
    console.error('Get active promo error:', error);
    res.status(500).json({ error: 'Failed to fetch promo' });
  }
};

/**
 * Get all promos for establishment
 */
const getEstablishmentPromos = async (req, res) => {
  try {
    const { establishmentId } = req.params;

    const promos = await prisma.promo.findMany({
      where: {
        establishmentId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ promos });

  } catch (error) {
    console.error('Get establishment promos error:', error);
    res.status(500).json({ error: 'Failed to fetch promos' });
  }
};

/**
 * Update promo (Senior Merchant only)
 */
const updatePromo = async (req, res) => {
  try {
    const { id } = req.params;
    const { ticketCost, ticketsRequired, rewardValue, description, isActive } = req.body;

    // Get promo to verify ownership
    const existingPromo = await prisma.promo.findUnique({
      where: { id }
    });

    if (!existingPromo) {
      return res.status(404).json({ error: 'Promo not found' });
    }

    // Verify user is SENIOR_MERCHANT of this establishment
    if (req.user.role !== 'ROOT' && (req.user.role !== 'SENIOR_MERCHANT' || req.user.establishmentId !== existingPromo.establishmentId)) {
      return res.status(403).json({ error: 'Not authorized to update this promo' });
    }

    const promo = await prisma.promo.update({
      where: { id },
      data: {
        ...(ticketCost !== undefined && { ticketCost: parseInt(ticketCost) }),
        ...(ticketsRequired !== undefined && { ticketsRequired: parseInt(ticketsRequired) }),
        ...(rewardValue !== undefined && { rewardValue: parseFloat(rewardValue) }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json({
      message: 'Promo updated successfully',
      promo
    });

  } catch (error) {
    console.error('Update promo error:', error);
    res.status(500).json({ error: 'Failed to update promo' });
  }
};

/**
 * Delete promo (Senior Merchant only)
 */
const deletePromo = async (req, res) => {
  try {
    const { id } = req.params;

    // Get promo to verify ownership
    const existingPromo = await prisma.promo.findUnique({
      where: { id }
    });

    if (!existingPromo) {
      return res.status(404).json({ error: 'Promo not found' });
    }

    // Verify user is SENIOR_MERCHANT of this establishment or ROOT
    if (req.user.role !== 'ROOT' && (req.user.role !== 'SENIOR_MERCHANT' || req.user.establishmentId !== existingPromo.establishmentId)) {
      return res.status(403).json({ error: 'Not authorized to delete this promo' });
    }

    await prisma.promo.delete({
      where: { id }
    });

    res.json({ message: 'Promo deleted successfully' });

  } catch (error) {
    console.error('Delete promo error:', error);
    res.status(500).json({ error: 'Failed to delete promo' });
  }
};

module.exports = {
  createPromo,
  getActivePromo,
  getEstablishmentPromos,
  updatePromo,
  deletePromo
};
