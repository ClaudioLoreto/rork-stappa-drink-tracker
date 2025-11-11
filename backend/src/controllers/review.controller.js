const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Create review
 */
const createReview = async (req, res) => {
  try {
    const { establishmentId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!establishmentId || !rating) {
      return res.status(400).json({ error: 'Establishment ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if user already reviewed this establishment
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_establishmentId: {
          userId,
          establishmentId
        }
      }
    });

    let review;
    if (existingReview) {
      // Update existing review
      review = await prisma.review.update({
        where: {
          userId_establishmentId: {
            userId,
            establishmentId
          }
        },
        data: {
          rating: parseInt(rating),
          comment: comment || null
        },
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
    } else {
      // Create new review
      review = await prisma.review.create({
        data: {
          userId,
          establishmentId,
          rating: parseInt(rating),
          comment: comment || null
        },
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
    }

    res.status(201).json({
      message: existingReview ? 'Review updated successfully' : 'Review created successfully',
      review
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
};

/**
 * Get establishment reviews
 */
const getEstablishmentReviews = async (req, res) => {
  try {
    const { establishmentId } = req.params;

    const reviews = await prisma.review.findMany({
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

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    res.json({
      reviews,
      stats: {
        total: reviews.length,
        averageRating: Math.round(averageRating * 10) / 10
      }
    });

  } catch (error) {
    console.error('Get establishment reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

/**
 * Get user reviews
 */
const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
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

    res.json({ reviews });

  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

/**
 * Delete review
 */
const deleteReview = async (req, res) => {
  try {
    const { establishmentId } = req.params;
    const userId = req.user.id;

    await prisma.review.delete({
      where: {
        userId_establishmentId: {
          userId,
          establishmentId
        }
      }
    });

    res.json({ message: 'Review deleted successfully' });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

module.exports = {
  createReview,
  getEstablishmentReviews,
  getUserReviews,
  deleteReview
};
