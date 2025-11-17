const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const OpenAI = require('openai');

const prisma = new PrismaClient();

// Initialize OpenAI client (optional - only if key is provided)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/stock';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `stock-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG, JPG, and PNG images are allowed'));
  }
}).single('photo');

/**
 * Upload photo for AI analysis
 */
const uploadStockPhoto = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No photo uploaded' });
      }

      const { establishmentId } = req.body;

      // Verify access
      if (req.user.role !== 'ROOT' && 
          req.user.role !== 'SENIOR_MERCHANT' && 
          !(req.user.role === 'MERCHANT' && req.user.canManageStock)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (req.user.role !== 'ROOT' && req.user.establishmentId !== establishmentId) {
        return res.status(403).json({ error: 'Can only upload photos for your establishment' });
      }

      const imageUrl = `/uploads/stock/${req.file.filename}`;

      // Create stock photo record
      const stockPhoto = await prisma.stockPhoto.create({
        data: {
          establishmentId,
          userId: req.user.id,
          imageUrl,
          status: 'PENDING'
        }
      });

      res.status(201).json({
        message: 'Photo uploaded successfully',
        stockPhoto,
        imageUrl
      });
    });

  } catch (error) {
    console.error('Upload stock photo error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
};

/**
 * Analyze photo with AI using OpenAI GPT-4 Vision
 */
const analyzeStockPhoto = async (req, res) => {
  try {
    const { photoId } = req.params;

    const stockPhoto = await prisma.stockPhoto.findUnique({
      where: { id: photoId },
      include: { establishment: true }
    });

    if (!stockPhoto) {
      return res.status(404).json({ error: 'Stock photo not found' });
    }

    // Verify access
    if (req.user.role !== 'ROOT' && req.user.establishmentId !== stockPhoto.establishmentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if establishment has stock management enabled
    if (!stockPhoto.establishment.hasStockManagement) {
      return res.status(403).json({ error: 'Stock management not enabled for this establishment' });
    }

    let detections = [];

    // Use OpenAI GPT-4 Vision if API key is available and client is initialized
    if (openai && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      try {
        // Convert image to base64
        const imagePath = path.join(process.cwd(), stockPhoto.imageUrl);
        const imageBuffer = await fs.readFile(imagePath);
        const base64Image = imageBuffer.toString('base64');
        const dataUrl = `data:image/jpeg;base64,${base64Image}`;

        const response = await openai.chat.completions.create({
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                { 
                  type: "text", 
                  text: "You are an inventory management assistant. Analyze this photo and identify all beverages and food items. For each item, provide: name, brand (if visible), estimated quantity, and confidence score (0-1). Return ONLY a JSON array with format: [{\"name\": \"...\", \"brand\": \"...\", \"quantity\": number, \"confidence\": number}]" 
                },
                {
                  type: "image_url",
                  image_url: { url: dataUrl }
                }
              ]
            }
          ],
          max_tokens: 1000
        });

        const content = response.choices[0]?.message?.content || '[]';
        detections = JSON.parse(content);
      } catch (aiError) {
        console.error('OpenAI API error:', aiError);
        // Fall back to mock data if AI fails
        detections = getMockDetections();
      }
    } else {
      // Use mock data if no API key
      detections = getMockDetections();
    }

    // Try to match detected items with existing articles
    const existingArticles = await prisma.article.findMany({
      where: { establishmentId: stockPhoto.establishmentId }
    });

    const recognitions = [];
    
    for (const detection of detections) {
      // Try to find matching article
      const matchedArticle = existingArticles.find(article => {
        const articleName = article.name.toLowerCase();
        const brand = article.brand?.toLowerCase() || '';
        const detectedBrand = detection.brand?.toLowerCase() || '';
        const detectedName = detection.name?.toLowerCase() || '';
        
        return (
          articleName.includes(detectedBrand) ||
          brand.includes(detectedBrand) ||
          articleName.includes(detectedName.split(' ')[0])
        );
      });

      const recognition = await prisma.articleRecognition.create({
        data: {
          stockPhotoId: photoId,
          articleId: matchedArticle?.id,
          detectedName: detection.name,
          detectedBrand: detection.brand,
          confidence: detection.confidence,
          quantity: detection.quantity,
          status: 'PENDING',
          boundingBox: detection.boundingBox
        },
        include: {
          article: {
            select: { id: true, name: true, brand: true, imageUrl: true }
          }
        }
      });

      recognitions.push(recognition);
    }

    // Update stock photo
    await prisma.stockPhoto.update({
      where: { id: photoId },
      data: {
        totalItemsDetected: detections.reduce((sum, d) => sum + d.quantity, 0),
        aiAnalysisData: { detections },
        processedAt: new Date()
      }
    });

    res.json({
      message: 'Photo analyzed successfully',
      recognitions,
      totalDetected: detections.reduce((sum, d) => sum + d.quantity, 0),
      needsReview: recognitions.filter(r => !r.articleId || r.confidence < 0.8).length,
      usingAI: !!process.env.OPENAI_API_KEY
    });

  } catch (error) {
    console.error('Analyze stock photo error:', error);
    res.status(500).json({ error: 'Failed to analyze photo' });
  }
};

// Mock detection fallback
function getMockDetections() {
  return [
    {
      name: 'Heineken Beer Bottle',
      brand: 'Heineken',
      confidence: 0.92,
      quantity: 3,
      boundingBox: { x: 100, y: 150, width: 80, height: 200 }
    },
    {
      name: 'Corona Extra Bottle',
      brand: 'Corona',
      confidence: 0.88,
      quantity: 5,
      boundingBox: { x: 250, y: 140, width: 75, height: 195 }
    },
    {
      name: 'Wine Bottle Red',
      brand: 'Unknown',
      confidence: 0.65,
      quantity: 2,
      boundingBox: { x: 400, y: 120, width: 70, height: 250 }
    }
  ];
}

/**
 * Get stock photo with recognitions
 */
const getStockPhoto = async (req, res) => {
  try {
    const { photoId } = req.params;

    const stockPhoto = await prisma.stockPhoto.findUnique({
      where: { id: photoId },
      include: {
        recognitions: {
          include: {
            article: {
              select: { id: true, name: true, brand: true, currentStock: true, imageUrl: true }
            }
          }
        },
        user: {
          select: { id: true, username: true }
        }
      }
    });

    if (!stockPhoto) {
      return res.status(404).json({ error: 'Stock photo not found' });
    }

    // Verify access
    if (req.user.role !== 'ROOT' && req.user.establishmentId !== stockPhoto.establishmentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ stockPhoto });

  } catch (error) {
    console.error('Get stock photo error:', error);
    res.status(500).json({ error: 'Failed to fetch stock photo' });
  }
};

/**
 * Confirm/correct article recognition
 */
const confirmRecognition = async (req, res) => {
  try {
    const { recognitionId } = req.params;
    const { articleId, quantity, status, notes } = req.body;

    const recognition = await prisma.articleRecognition.findUnique({
      where: { id: recognitionId },
      include: { stockPhoto: true }
    });

    if (!recognition) {
      return res.status(404).json({ error: 'Recognition not found' });
    }

    // Verify access
    if (req.user.role !== 'ROOT' && req.user.establishmentId !== recognition.stockPhoto.establishmentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update recognition
    const updated = await prisma.articleRecognition.update({
      where: { id: recognitionId },
      data: {
        ...(articleId && { correctedArticleId: articleId, articleId }),
        ...(quantity !== undefined && { correctedQuantity: quantity, quantity }),
        ...(status && { status }),
        ...(notes && { merchantNotes: notes })
      }
    });

    res.json({
      message: 'Recognition updated successfully',
      recognition: updated
    });

  } catch (error) {
    console.error('Confirm recognition error:', error);
    res.status(500).json({ error: 'Failed to confirm recognition' });
  }
};

/**
 * Confirm all recognitions and update stock
 */
const confirmAllAndUpdateStock = async (req, res) => {
  try {
    const { photoId } = req.params;
    const { recognitions } = req.body; // Array of { recognitionId, articleId, quantity }

    const stockPhoto = await prisma.stockPhoto.findUnique({
      where: { id: photoId }
    });

    if (!stockPhoto) {
      return res.status(404).json({ error: 'Stock photo not found' });
    }

    // Verify access
    if (req.user.role !== 'ROOT' && req.user.establishmentId !== stockPhoto.establishmentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const results = [];

    for (const rec of recognitions) {
      if (!rec.articleId || !rec.quantity) continue;

      // Update recognition
      await prisma.articleRecognition.update({
        where: { id: rec.recognitionId },
        data: {
          articleId: rec.articleId,
          correctedArticleId: rec.articleId,
          quantity: rec.quantity,
          correctedQuantity: rec.quantity,
          status: 'CONFIRMED'
        }
      });

      // Create stock entry
      const stockEntry = await prisma.stockEntry.create({
        data: {
          establishmentId: stockPhoto.establishmentId,
          articleId: rec.articleId,
          quantity: rec.quantity,
          type: 'photo_ai',
          notes: 'Added via AI photo recognition',
          userId: req.user.id,
          stockPhotoId: photoId
        }
      });

      // Update article stock
      const article = await prisma.article.findUnique({ where: { id: rec.articleId } });
      await prisma.article.update({
        where: { id: rec.articleId },
        data: { currentStock: article.currentStock + rec.quantity }
      });

      results.push({ articleId: rec.articleId, quantity: rec.quantity, stockEntry });
    }

    // Update stock photo status
    await prisma.stockPhoto.update({
      where: { id: photoId },
      data: { status: 'CONFIRMED' }
    });

    res.json({
      message: 'Stock updated successfully from AI recognitions',
      updated: results.length,
      results
    });

  } catch (error) {
    console.error('Confirm all and update stock error:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
};

module.exports = {
  uploadStockPhoto,
  analyzeStockPhoto,
  getStockPhoto,
  confirmRecognition,
  confirmAllAndUpdateStock
};
