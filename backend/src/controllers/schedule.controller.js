const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Create or update schedule
 */
const upsertSchedule = async (req, res) => {
  try {
    const { establishmentId, schedules } = req.body;

    // Verify user is SENIOR_MERCHANT of this establishment or ROOT
    if (req.user.role !== 'ROOT' && (req.user.role !== 'SENIOR_MERCHANT' || req.user.establishmentId !== establishmentId)) {
      return res.status(403).json({ error: 'Only senior merchant can manage schedules' });
    }

    if (!Array.isArray(schedules)) {
      return res.status(400).json({ error: 'Schedules must be an array' });
    }

    // Upsert all schedules
    const results = [];
    for (const schedule of schedules) {
      const { dayOfWeek, openTime, closeTime, isClosed } = schedule;

      const result = await prisma.schedule.upsert({
        where: {
          establishmentId_dayOfWeek: {
            establishmentId,
            dayOfWeek: parseInt(dayOfWeek)
          }
        },
        update: {
          openTime: openTime || '09:00',
          closeTime: closeTime || '23:00',
          isClosed: isClosed || false
        },
        create: {
          establishmentId,
          dayOfWeek: parseInt(dayOfWeek),
          openTime: openTime || '09:00',
          closeTime: closeTime || '23:00',
          isClosed: isClosed || false
        }
      });
      results.push(result);
    }

    res.json({
      message: 'Schedules updated successfully',
      schedules: results
    });

  } catch (error) {
    console.error('Upsert schedule error:', error);
    res.status(500).json({ error: 'Failed to update schedules' });
  }
};

/**
 * Get establishment schedule
 */
const getEstablishmentSchedule = async (req, res) => {
  try {
    const { establishmentId } = req.params;

    const schedules = await prisma.schedule.findMany({
      where: { establishmentId },
      orderBy: {
        dayOfWeek: 'asc'
      }
    });

    res.json({ schedules });

  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
};

module.exports = {
  upsertSchedule,
  getEstablishmentSchedule
};
