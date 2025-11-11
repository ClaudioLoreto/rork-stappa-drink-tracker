const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Create social post
 */
const createSocialPost = async (req, res) => {
  try {
    const { establishmentId, type, content, imageUrl } = req.body;
    const authorId = req.user.id;

    if (!establishmentId || !content) {
      return res.status(400).json({ error: 'Establishment ID and content are required' });
    }

    // Verify user can post
    if (req.user.role === 'ROOT') {
      // ROOT can post anywhere
    } else if (req.user.role === 'SENIOR_MERCHANT' && req.user.establishmentId === establishmentId) {
      // SENIOR can post to their establishment
    } else if (req.user.role === 'MERCHANT' && req.user.establishmentId === establishmentId && req.user.canPostSocial) {
      // MERCHANT can post only if canPostSocial is true
    } else {
      return res.status(403).json({ error: 'You do not have permission to post' });
    }

    const post = await prisma.socialPost.create({
      data: {
        establishmentId,
        authorId,
        type: type || 'POST',
        content,
        imageUrl: imageUrl || null
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            role: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Post created successfully',
      post
    });

  } catch (error) {
    console.error('Create social post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

/**
 * Get establishment posts
 */
const getEstablishmentPosts = async (req, res) => {
  try {
    const { establishmentId } = req.params;
    const { type } = req.query;

    const where = { establishmentId };
    if (type) where.type = type;

    const posts = await prisma.socialPost.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ posts });

  } catch (error) {
    console.error('Get establishment posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

/**
 * Delete social post
 */
const deleteSocialPost = async (req, res) => {
  try {
    const { id } = req.params;

    // Get post to verify ownership
    const post = await prisma.socialPost.findUnique({
      where: { id }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Verify user can delete (author or SENIOR of establishment or ROOT)
    if (req.user.role !== 'ROOT' && 
        post.authorId !== req.user.id && 
        !(req.user.role === 'SENIOR_MERCHANT' && req.user.establishmentId === post.establishmentId)) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await prisma.socialPost.delete({
      where: { id }
    });

    res.json({ message: 'Post deleted successfully' });

  } catch (error) {
    console.error('Delete social post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};

module.exports = {
  createSocialPost,
  getEstablishmentPosts,
  deleteSocialPost
};
