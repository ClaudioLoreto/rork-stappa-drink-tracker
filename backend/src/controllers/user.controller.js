const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all users (admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        firstName: true,
        lastName: true,
        phone: true,
        city: true,
        province: true,
        region: true,
        establishmentId: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        firstName: true,
        lastName: true,
        phone: true,
        city: true,
        province: true,
        region: true,
        establishmentId: true,
        favoriteEstablishments: true,
        canPostSocial: true,
        isSocialManager: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

/**
 * Toggle favorite establishment
 */
const toggleFavorite = async (req, res) => {
  try {
    const { userId } = req.params;
    const { establishmentId } = req.body;

    // Verify user is requesting their own data or is admin
    if (req.user.id !== userId && req.user.role !== 'ROOT') {
      return res.status(403).json({ error: 'Cannot modify other users favorites' });
    }

    if (!establishmentId) {
      return res.status(400).json({ error: 'Establishment ID is required' });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { favoriteEstablishments: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Toggle favorite
    const favorites = user.favoriteEstablishments || [];
    const isFavorite = favorites.includes(establishmentId);
    
    const updatedFavorites = isFavorite
      ? favorites.filter(id => id !== establishmentId)
      : [...favorites, establishmentId];

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: { favoriteEstablishments: updatedFavorites }
    });

    res.json({
      isFavorite: !isFavorite,
      favorites: updatedFavorites
    });

  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
};

/**
 * Get user favorites
 */
const getFavorites = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user is requesting their own data or is admin
    if (req.user.id !== userId && req.user.role !== 'ROOT') {
      return res.status(403).json({ error: 'Cannot access other users favorites' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { favoriteEstablishments: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ favorites: user.favoriteEstablishments || [] });

  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to get favorites' });
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, phone, city, province, region } = req.body;

    // Verify user is updating their own profile or is admin
    if (req.user.id !== userId && req.user.role !== 'ROOT') {
      return res.status(403).json({ error: 'Cannot modify other users profile' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(city !== undefined && { city }),
        ...(province !== undefined && { province }),
        ...(region !== undefined && { region })
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        city: true,
        province: true,
        region: true,
        updatedAt: true
      }
    });

    res.json({ 
      message: 'Profile updated successfully',
      user 
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  toggleFavorite,
  getFavorites,
  updateProfile
};
