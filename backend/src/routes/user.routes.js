const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// Get all users (admin only)
router.get('/', requireRole('ROOT'), userController.getAllUsers);

// Get user by ID
router.get('/:userId', userController.getUserById);

// Update user profile
router.patch('/:userId/profile', userController.updateProfile);

// Toggle favorite establishment
router.post('/:userId/favorites', userController.toggleFavorite);

// Get user favorites
router.get('/:userId/favorites', userController.getFavorites);

module.exports = router;
