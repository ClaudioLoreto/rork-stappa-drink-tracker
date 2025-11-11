const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticateToken);

// Upsert schedule (SENIOR_MERCHANT or ROOT)
router.post('/', requireRole('SENIOR_MERCHANT', 'ROOT'), scheduleController.upsertSchedule);

// Get establishment schedule
router.get('/:establishmentId', scheduleController.getEstablishmentSchedule);

module.exports = router;
