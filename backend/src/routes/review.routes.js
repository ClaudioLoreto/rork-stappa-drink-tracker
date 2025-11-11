const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// Create or update review
router.post('/', reviewController.createReview);

// Get establishment reviews
router.get('/establishment/:establishmentId', reviewController.getEstablishmentReviews);

// Get user reviews
router.get('/user/:userId', reviewController.getUserReviews);

// Delete review
router.delete('/establishment/:establishmentId', reviewController.deleteReview);

module.exports = router;
