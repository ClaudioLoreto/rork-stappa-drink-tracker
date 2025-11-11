const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const { isPromoValid } = require('../utils/validation.util');
const prisma = new PrismaClient();

/**
 * Generate validation QR code (User)
 */
const generateValidationQR = async (req, res) => {
  try {
    const { establishmentId } = req.body;
    const userId = req.user.id;

    if (!establishmentId) {
      return res.status(400).json({ error: 'Establishment ID is required' });
    }

    // Check if establishment has active promo
    const promo = await prisma.promo.findFirst({
      where: {
        establishmentId,
        isActive: true,
        endDate: {
          gte: new Date()
        }
      }
    });

    if (!promo || !isPromoValid(promo)) {
      return res.status(400).json({ error: 'Establishment must have an active promo' });
    }

    // Get or create user progress
    let progress = await prisma.userProgress.findUnique({
      where: {
        userId_establishmentId: {
          userId,
          establishmentId
        }
      }
    });

    if (!progress) {
      progress = await prisma.userProgress.create({
        data: {
          userId,
          establishmentId,
          drinksCount: 0
        }
      });
    }

    // Check if user has already completed the card
    if (progress.drinksCount >= 10) {
      return res.status(400).json({ error: 'Card already completed. Generate bonus QR instead' });
    }

    // Generate QR token
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5 minutes expiration

    // Create QR code
    const qrCode = await prisma.qRCode.create({
      data: {
        token,
        userId,
        establishmentId,
        type: 'VALIDATION',
        expiresAt,
        isUsed: false
      }
    });

    res.status(201).json({
      message: 'Validation QR code generated',
      qrCode: {
        token: qrCode.token,
        type: qrCode.type,
        expiresAt: qrCode.expiresAt,
        establishmentId: qrCode.establishmentId
      }
    });

  } catch (error) {
    console.error('Generate validation QR error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
};

/**
 * Generate bonus QR code (User)
 */
const generateBonusQR = async (req, res) => {
  try {
    const { establishmentId } = req.body;
    const userId = req.user.id;

    if (!establishmentId) {
      return res.status(400).json({ error: 'Establishment ID is required' });
    }

    // Check if establishment has active promo
    const promo = await prisma.promo.findFirst({
      where: {
        establishmentId,
        isActive: true,
        endDate: {
          gte: new Date()
        }
      }
    });

    if (!promo || !isPromoValid(promo)) {
      return res.status(400).json({ error: 'Establishment must have an active promo' });
    }

    // Get user progress
    const progress = await prisma.userProgress.findUnique({
      where: {
        userId_establishmentId: {
          userId,
          establishmentId
        }
      }
    });

    if (!progress || progress.drinksCount < 10) {
      return res.status(400).json({ error: 'Must complete 10 drinks first' });
    }

    // Generate QR token
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5 minutes expiration

    // Create QR code
    const qrCode = await prisma.qRCode.create({
      data: {
        token,
        userId,
        establishmentId,
        type: 'BONUS',
        expiresAt,
        isUsed: false
      }
    });

    res.status(201).json({
      message: 'Bonus QR code generated',
      qrCode: {
        token: qrCode.token,
        type: qrCode.type,
        expiresAt: qrCode.expiresAt,
        establishmentId: qrCode.establishmentId
      }
    });

  } catch (error) {
    console.error('Generate bonus QR error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
};

/**
 * Scan and validate QR code (Merchant)
 */
const scanQR = async (req, res) => {
  try {
    const { token } = req.body;
    const merchantId = req.user.id;
    const merchantEstablishmentId = req.user.establishmentId;

    if (!token) {
      return res.status(400).json({ error: 'QR token is required' });
    }

    // Verify merchant has establishment
    if (!merchantEstablishmentId) {
      return res.status(403).json({ error: 'Merchant must be assigned to an establishment' });
    }

    // Check if establishment has active promo
    const promo = await prisma.promo.findFirst({
      where: {
        establishmentId: merchantEstablishmentId,
        isActive: true,
        endDate: {
          gte: new Date()
        }
      }
    });

    if (!promo || !isPromoValid(promo)) {
      return res.status(400).json({ error: 'Your establishment must have an active promo to validate tickets' });
    }

    // Find QR code
    const qrCode = await prisma.qRCode.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!qrCode) {
      return res.status(404).json({ error: 'Invalid QR code' });
    }

    // Check if already used
    if (qrCode.isUsed) {
      return res.status(400).json({ error: 'QR code already used' });
    }

    // Check expiration
    if (new Date() > new Date(qrCode.expiresAt)) {
      return res.status(400).json({ error: 'QR code expired' });
    }

    // Check establishment match
    if (qrCode.establishmentId !== merchantEstablishmentId) {
      return res.status(403).json({ error: 'QR code is for a different establishment' });
    }

    // Mark QR as used
    await prisma.qRCode.update({
      where: { token },
      data: {
        isUsed: true,
        usedAt: new Date()
      }
    });

    // Create validation record
    await prisma.validation.create({
      data: {
        userId: qrCode.userId,
        establishmentId: merchantEstablishmentId,
        type: qrCode.type,
        merchantId
      }
    });

    // Update user progress
    if (qrCode.type === 'VALIDATION') {
      // Increment drinks count
      const progress = await prisma.userProgress.upsert({
        where: {
          userId_establishmentId: {
            userId: qrCode.userId,
            establishmentId: merchantEstablishmentId
          }
        },
        update: {
          drinksCount: {
            increment: 1
          }
        },
        create: {
          userId: qrCode.userId,
          establishmentId: merchantEstablishmentId,
          drinksCount: 1
        }
      });

      return res.json({
        message: 'Drink validated successfully',
        type: 'VALIDATION',
        user: qrCode.user,
        drinksCount: progress.drinksCount,
        isComplete: progress.drinksCount >= 10
      });

    } else if (qrCode.type === 'BONUS') {
      // Reset drinks count
      await prisma.userProgress.update({
        where: {
          userId_establishmentId: {
            userId: qrCode.userId,
            establishmentId: merchantEstablishmentId
          }
        },
        data: {
          drinksCount: 0
        }
      });

      return res.json({
        message: 'Bonus redeemed successfully! Card reset',
        type: 'BONUS',
        user: qrCode.user,
        drinksCount: 0
      });
    }

  } catch (error) {
    console.error('Scan QR error:', error);
    res.status(500).json({ error: 'Failed to scan QR code' });
  }
};

/**
 * Get user progress
 */
const getProgress = async (req, res) => {
  try {
    const { establishmentId } = req.query;
    const userId = req.user.id;

    if (!establishmentId) {
      return res.status(400).json({ error: 'Establishment ID is required' });
    }

    const progress = await prisma.userProgress.findUnique({
      where: {
        userId_establishmentId: {
          userId,
          establishmentId
        }
      },
      include: {
        establishment: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      }
    });

    if (!progress) {
      return res.json({
        userId,
        establishmentId,
        drinksCount: 0,
        establishment: null
      });
    }

    res.json({ progress });

  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
};

module.exports = {
  generateValidationQR,
  generateBonusQR,
  scanQR,
  getProgress
};
