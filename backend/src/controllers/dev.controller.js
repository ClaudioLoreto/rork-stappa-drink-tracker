const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Simulate QR scan (Dev Only)
 * Bypasses merchant check
 */
const simulateScan = async (req, res) => {
  try {
    const { token } = req.body;
    
    // In a real scenario, we might want to restrict this further, 
    // but for this specific request, we just bypass the merchant check.
    // We still need a valid user to be the "merchant" for the record, 
    // so we'll use the user themselves or a system user if available.
    // For simplicity, we'll use the user who requested it as the "merchant" 
    // (even though they are a USER role).
    
    const merchantId = req.user.id; 

    if (!token) {
      return res.status(400).json({ error: 'QR token is required' });
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
        establishmentId: qrCode.establishmentId,
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
            establishmentId: qrCode.establishmentId
          }
        },
        update: {
          drinksCount: {
            increment: 1
          }
        },
        create: {
          userId: qrCode.userId,
          establishmentId: qrCode.establishmentId,
          drinksCount: 1
        }
      });

      return res.json({
        message: 'Drink validated successfully (SIMULATION)',
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
            establishmentId: qrCode.establishmentId
          }
        },
        data: {
          drinksCount: 0
        }
      });

      return res.json({
        message: 'Bonus redeemed successfully! Card reset (SIMULATION)',
        type: 'BONUS',
        user: qrCode.user,
        drinksCount: 0
      });
    }

  } catch (error) {
    console.error('Simulate scan error:', error);
    res.status(500).json({ error: 'Failed to simulate scan' });
  }
};

module.exports = {
  simulateScan
};
