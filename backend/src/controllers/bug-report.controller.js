const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const prisma = new PrismaClient();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/bug-reports';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'screenshot-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

/**
 * Create bug report
 */
const createBugReport = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const userId = req.user.id;

    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Title, description, and category are required' });
    }

    // Get screenshot paths from uploaded files
    const screenshots = req.files ? req.files.map(file => `/uploads/bug-reports/${file.filename}`) : [];

    const bugReport = await prisma.bugReport.create({
      data: {
        userId,
        title,
        description,
        category,
        screenshots,
        status: 'OPEN',
        priority: 'MEDIUM'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Bug report submitted successfully',
      bugReport
    });

  } catch (error) {
    console.error('Create bug report error:', error);
    res.status(500).json({ error: 'Failed to create bug report' });
  }
};

/**
 * Get all bug reports (Admin)
 */
const getAllBugReports = async (req, res) => {
  try {
    const { status, priority } = req.query;

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const bugReports = await prisma.bugReport.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({ bugReports });

  } catch (error) {
    console.error('Get bug reports error:', error);
    res.status(500).json({ error: 'Failed to fetch bug reports' });
  }
};

/**
 * Get user bug reports
 */
const getUserBugReports = async (req, res) => {
  try {
    const userId = req.user.id;

    const bugReports = await prisma.bugReport.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ bugReports });

  } catch (error) {
    console.error('Get user bug reports error:', error);
    res.status(500).json({ error: 'Failed to fetch bug reports' });
  }
};

/**
 * Update bug report status (Admin)
 */
const updateBugReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;

    const bugReport = await prisma.bugReport.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority })
      }
    });

    res.json({
      message: 'Bug report updated successfully',
      bugReport
    });

  } catch (error) {
    console.error('Update bug report error:', error);
    res.status(500).json({ error: 'Failed to update bug report' });
  }
};

/**
 * Delete bug report (Admin)
 */
const deleteBugReport = async (req, res) => {
  try {
    const { id } = req.params;

    // Get bug report to delete screenshots
    const bugReport = await prisma.bugReport.findUnique({
      where: { id }
    });

    if (!bugReport) {
      return res.status(404).json({ error: 'Bug report not found' });
    }

    // Delete screenshot files
    if (bugReport.screenshots && bugReport.screenshots.length > 0) {
      bugReport.screenshots.forEach(screenshot => {
        const filePath = path.join(__dirname, '../../', screenshot);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    // Delete bug report
    await prisma.bugReport.delete({
      where: { id }
    });

    res.json({ message: 'Bug report deleted successfully' });

  } catch (error) {
    console.error('Delete bug report error:', error);
    res.status(500).json({ error: 'Failed to delete bug report' });
  }
};

module.exports = {
  createBugReport,
  getAllBugReports,
  getUserBugReports,
  updateBugReportStatus,
  deleteBugReport,
  upload
};
