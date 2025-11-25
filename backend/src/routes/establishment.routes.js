const express = require('express');
const router = express.Router();
const establishmentController = require('../controllers/establishment.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Establishments
 *   description: Establishment management endpoints
 */

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/establishments:
 *   get:
 *     summary: Get all establishments
 *     tags: [Establishments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of establishments
 */
router.get('/', establishmentController.getAllEstablishments);

/**
 * @swagger
 * /api/establishments/{id}:
 *   get:
 *     summary: Get establishment by ID
 *     tags: [Establishments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Establishment details
 *       404:
 *         description: Establishment not found
 */
router.get('/:id', establishmentController.getEstablishmentById);

/**
 * @swagger
 * /api/establishments:
 *   post:
 *     summary: Create establishment (ROOT only)
 *     tags: [Establishments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Establishment created
 *       403:
 *         description: Forbidden
 */
router.post('/', requireRole('ROOT'), establishmentController.createEstablishment);

/**
 * @swagger
 * /api/establishments/{id}/assign-merchant:
 *   post:
 *     summary: Assign merchant to establishment (ROOT only)
 *     tags: [Establishments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - merchantId
 *             properties:
 *               merchantId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Merchant assigned
 *       403:
 *         description: Forbidden
 */
router.post('/:id/assign-merchant', requireRole('ROOT'), establishmentController.assignMerchant);

/**
 * @swagger
 * /api/establishments/{id}:
 *   patch:
 *     summary: Update establishment (ROOT only)
 *     tags: [Establishments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Establishment updated
 *       403:
 *         description: Forbidden
 */
router.patch('/:id', requireRole('ROOT'), establishmentController.updateEstablishment);

/**
 * @swagger
 * /api/establishments/{id}:
 *   delete:
 *     summary: Delete establishment (ROOT only)
 *     tags: [Establishments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Establishment deleted
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', requireRole('ROOT'), establishmentController.deleteEstablishment);

module.exports = router;
