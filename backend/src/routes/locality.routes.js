const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Search localities
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const localities = await prisma.locality.findMany({
      where: {
        name: {
          contains: q,
          mode: 'insensitive'
        }
      },
      take: 20,
      orderBy: {
        name: 'asc'
      }
    });

    res.json(localities);
  } catch (error) {
    console.error('Search localities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
