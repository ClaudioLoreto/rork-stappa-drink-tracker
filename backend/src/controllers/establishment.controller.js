const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all establishments
 */
const getAllEstablishments = async (req, res) => {
  try {
    const establishments = await prisma.establishment.findMany({
      include: {
        merchants: {
          select: {
            id: true,
            username: true,
            role: true,
            canPostSocial: true,
            isSocialManager: true
          }
        },
        promos: {
          where: {
            isActive: true,
            endDate: {
              gte: new Date()
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ establishments });
  } catch (error) {
    console.error('Get establishments error:', error);
    res.status(500).json({ error: 'Failed to fetch establishments' });
  }
};

/**
 * Get establishment by ID
 */
const getEstablishmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const establishment = await prisma.establishment.findUnique({
      where: { id },
      include: {
        merchants: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            role: true,
            canPostSocial: true,
            isSocialManager: true
          }
        },
        promos: {
          where: {
            isActive: true
          }
        }
      }
    });

    if (!establishment) {
      return res.status(404).json({ error: 'Establishment not found' });
    }

    res.json({ establishment });
  } catch (error) {
    console.error('Get establishment error:', error);
    res.status(500).json({ error: 'Failed to fetch establishment' });
  }
};

/**
 * Create new establishment (admin only)
 */
const createEstablishment = async (req, res) => {
  try {
    const { name, address, city, province, region, latitude, longitude } = req.body;

    if (!name || !address) {
      return res.status(400).json({ error: 'Name and address are required' });
    }

    const establishment = await prisma.establishment.create({
      data: {
        name,
        address,
        city: city || null,
        province: province || null,
        region: region || null,
        latitude: latitude || null,
        longitude: longitude || null,
        status: 'ACTIVE'
      }
    });

    res.status(201).json({
      message: 'Establishment created successfully',
      establishment
    });

  } catch (error) {
    console.error('Create establishment error:', error);
    res.status(500).json({ error: 'Failed to create establishment' });
  }
};

/**
 * Assign merchant to establishment (admin only)
 */
const assignMerchant = async (req, res) => {
  try {
    const { id } = req.params;
    const { merchantId } = req.body;

    if (!merchantId) {
      return res.status(400).json({ error: 'Merchant ID is required' });
    }

    // Check if establishment exists
    const establishment = await prisma.establishment.findUnique({
      where: { id }
    });

    if (!establishment) {
      return res.status(404).json({ error: 'Establishment not found' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: merchantId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Assign merchant to establishment
    await prisma.user.update({
      where: { id: merchantId },
      data: {
        establishmentId: id,
        // Keep existing role if already MERCHANT or SENIOR_MERCHANT
        ...(user.role === 'USER' && { role: 'MERCHANT' })
      }
    });

    res.json({
      message: 'Merchant assigned successfully',
      establishmentId: id,
      merchantId
    });

  } catch (error) {
    console.error('Assign merchant error:', error);
    res.status(500).json({ error: 'Failed to assign merchant' });
  }
};

/**
 * Update establishment
 */
const updateEstablishment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, city, province, region, latitude, longitude, status } = req.body;

    const establishment = await prisma.establishment.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(province !== undefined && { province }),
        ...(region !== undefined && { region }),
        ...(latitude !== undefined && { latitude }),
        ...(longitude !== undefined && { longitude }),
        ...(status !== undefined && { status })
      }
    });

    res.json({
      message: 'Establishment updated successfully',
      establishment
    });

  } catch (error) {
    console.error('Update establishment error:', error);
    res.status(500).json({ error: 'Failed to update establishment' });
  }
};

/**
 * Delete establishment (admin only)
 */
const deleteEstablishment = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.establishment.delete({
      where: { id }
    });

    res.json({ message: 'Establishment deleted successfully' });

  } catch (error) {
    console.error('Delete establishment error:', error);
    res.status(500).json({ error: 'Failed to delete establishment' });
  }
};

module.exports = {
  getAllEstablishments,
  getEstablishmentById,
  createEstablishment,
  assignMerchant,
  updateEstablishment,
  deleteEstablishment
};
