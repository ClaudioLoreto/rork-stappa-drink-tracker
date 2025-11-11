const express = require('express');
const router = express.Router();
const socialController = require('../controllers/social.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// Create social post
router.post('/', requireRole('MERCHANT', 'SENIOR_MERCHANT', 'ROOT'), socialController.createSocialPost);

// Get establishment posts
router.get('/:establishmentId', socialController.getEstablishmentPosts);

// Delete social post
router.delete('/:id', socialController.deleteSocialPost);

module.exports = router;
