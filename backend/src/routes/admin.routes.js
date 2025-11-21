const express = require('express');
const { seedDatabase } = require('../controllers/admin.controller');
const { authenticateToken, requireRoot } = require('../middleware/auth.middleware');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @route   POST /api/admin/seed
 * @desc    Popola il database di produzione con i dati da CREDENZIALI_TEST.md
 * @access  ROOT only (o NESSUNA AUTH se DB vuoto)
 */
router.post('/seed', async (req, res, next) => {
  // Se il DB è vuoto (nessun utente), permetti il seed senza autenticazione
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    console.log('⚠️ DB vuoto - seed consentito senza autenticazione');
    return seedDatabase(req, res);
  }
  // Altrimenti richiedi autenticazione ROOT
  return authenticateToken(req, res, () => {
    requireRoot(req, res, () => seedDatabase(req, res));
  });
});

module.exports = router;
