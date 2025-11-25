const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get monthly leaderboard for an establishment
 */
const getMonthlyLeaderboard = async (req, res) => {
  try {
    const { establishmentId } = req.params;
    
    if (!establishmentId) {
      return res.status(400).json({ error: 'Establishment ID is required' });
    }

    // Calculate start and end of current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Group validations by user and count them
    const validations = await prisma.validation.groupBy({
      by: ['userId'],
      where: {
        establishmentId,
        type: 'VALIDATION',
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });

    // Fetch user details for the top users
    const leaderboard = await Promise.all(
      validations.map(async (entry, index) => {
        const user = await prisma.user.findUnique({
          where: { id: entry.userId },
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        });

        return {
          userId: entry.userId,
          username: user ? user.username : 'Unknown User',
          drinksCount: entry._count.id,
          rank: index + 1
        };
      })
    );

    res.json(leaderboard);

  } catch (error) {
    console.error('Get monthly leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

module.exports = {
  getMonthlyLeaderboard
};
