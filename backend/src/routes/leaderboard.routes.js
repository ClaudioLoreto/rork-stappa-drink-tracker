const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboard.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// Get monthly leaderboard
router.get('/monthly/:establishmentId', leaderboardController.getMonthlyLeaderboard);

module.exports = router;
