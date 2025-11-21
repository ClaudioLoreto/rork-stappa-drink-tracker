const express = require('express');
const { seedDatabase } = require('../controllers/admin.controller');
const { authenticateToken, requireRoot } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/admin/seed
 * @desc    Popola il database di produzione con i dati da CREDENZIALI_TEST.md
 * @access  ROOT only
 */
router.post('/seed', authenticateToken, requireRoot, seedDatabase);

module.exports = router;
