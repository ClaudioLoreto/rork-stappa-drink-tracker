const { PrismaClient } = require('@prisma/client');
const { validatePhone } = require('../utils/validation.util');
const prisma = new PrismaClient();

/**
 * Create merchant request
 */
const createMerchantRequest = async (req, res) => {
  try {
    const { businessName, address, city, postalCode, country, vatId, phone, description } = req.body;
    const userId = req.user.id;

    // Validation
    if (!businessName || !address || !city || !postalCode || !country || !vatId || !phone) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Check if user already has pending request
    const existingRequest = await prisma.merchantRequest.findFirst({
      where: {
        userId,
        status: 'PENDING'
      }
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'You already have a pending merchant request' });
    }

    // Create request
    const merchantRequest = await prisma.merchantRequest.create({
      data: {
        userId,
        businessName,
        address,
        city,
        postalCode,
        country,
        vatId,
        phone,
        description: description || null,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Merchant request submitted successfully',
      merchantRequest
    });

  } catch (error) {
    console.error('Create merchant request error:', error);
    res.status(500).json({ error: 'Failed to create merchant request' });
  }
};

/**
 * Get all merchant requests (Admin)
 */
const getAllMerchantRequests = async (req, res) => {
  try {
    const { status } = req.query;

    const where = status ? { status } : {};

    const merchantRequests = await prisma.merchantRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ merchantRequests });

  } catch (error) {
    console.error('Get merchant requests error:', error);
    res.status(500).json({ error: 'Failed to fetch merchant requests' });
  }
};

/**
 * Get user merchant requests
 */
const getUserMerchantRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const merchantRequests = await prisma.merchantRequest.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ merchantRequests });

  } catch (error) {
    console.error('Get user merchant requests error:', error);
    res.status(500).json({ error: 'Failed to fetch merchant requests' });
  }
};

/**
 * Approve merchant request (Admin)
 */
const approveMerchantRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { createEstablishment } = req.body;
    const adminId = req.user.id;

    // Get request
    const request = await prisma.merchantRequest.findUnique({
      where: { id },
      include: {
        user: true
      }
    });

    if (!request) {
      return res.status(404).json({ error: 'Merchant request not found' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ error: 'Request already processed' });
    }

    let establishmentId = request.user.establishmentId;

    // Create establishment if requested and user doesn't have one
    if (createEstablishment && !establishmentId) {
      const establishment = await prisma.establishment.create({
        data: {
          name: request.businessName,
          address: request.address,
          city: request.city,
          province: null,
          region: null,
          status: 'ACTIVE'
        }
      });
      establishmentId = establishment.id;
    }

    if (!establishmentId) {
      return res.status(400).json({ error: 'User must be assigned to an establishment or createEstablishment must be true' });
    }

    // Update user role and establishment
    await prisma.user.update({
      where: { id: request.userId },
      data: {
        role: 'MERCHANT',
        establishmentId
      }
    });

    // Update request status
    await prisma.merchantRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
        reviewedBy: adminId
      }
    });

    res.json({
      message: 'Merchant request approved successfully',
      establishmentId,
      userId: request.userId
    });

  } catch (error) {
    console.error('Approve merchant request error:', error);
    res.status(500).json({ error: 'Failed to approve merchant request' });
  }
};

/**
 * Reject merchant request (Admin)
 */
const rejectMerchantRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const adminId = req.user.id;

    // Get request
    const request = await prisma.merchantRequest.findUnique({
      where: { id }
    });

    if (!request) {
      return res.status(404).json({ error: 'Merchant request not found' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ error: 'Request already processed' });
    }

    // Update request status
    await prisma.merchantRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
        reviewedBy: adminId,
        rejectionReason: rejectionReason || null
      }
    });

    res.json({
      message: 'Merchant request rejected',
      rejectionReason
    });

  } catch (error) {
    console.error('Reject merchant request error:', error);
    res.status(500).json({ error: 'Failed to reject merchant request' });
  }
};

module.exports = {
  createMerchantRequest,
  getAllMerchantRequests,
  getUserMerchantRequests,
  approveMerchantRequest,
  rejectMerchantRequest
};
