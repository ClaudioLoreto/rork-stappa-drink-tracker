// Route temporanea per setup iniziale database - DA ELIMINARE DOPO USO
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Endpoint NON PROTETTO per setup iniziale - usare una sola volta
router.post('/initialize-database', async (req, res) => {
  try {
    console.log('🚀 Inizializzazione database in corso...');

    // 1. Verifica se ROOT esiste già
    const existingRoot = await prisma.user.findUnique({
      where: { username: 'root' }
    });

    if (existingRoot) {
      return res.status(400).json({ 
        error: 'Database già inizializzato (ROOT esiste)' 
      });
    }

    // 2. Crea utente ROOT
    const rootPassword = await bcrypt.hash('Root123!', 10);
    const rootUser = await prisma.user.create({
      data: {
        username: 'root',
        email: 'root@stappa.com',
        password: rootPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'ROOT',
        status: 'ACTIVE',
        city: 'Milano',
        province: 'MI',
        region: 'Lombardia'
      }
    });
    console.log('✓ ROOT creato');

    // 3. Crea establishments
    const establishments = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Bar Centrale',
        address: 'Via Roma 1, 20100 Milano MI',
        city: 'Milano',
        province: 'MI',
        region: 'Lombardia',
        latitude: 45.4642,
        longitude: 9.1900,
        status: 'ACTIVE'
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Pub Irish',
        address: 'Via Dante 15, 00100 Roma RM',
        city: 'Roma',
        province: 'RM',
        region: 'Lazio',
        latitude: 41.9028,
        longitude: 12.4964,
        status: 'ACTIVE'
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174002',
        name: 'Caffe Vittoria',
        address: 'Corso Italia 25, 50100 Firenze FI',
        city: 'Firenze',
        province: 'FI',
        region: 'Toscana',
        latitude: 43.7696,
        longitude: 11.2558,
        status: 'ACTIVE'
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174003',
        name: 'Lounge Bar 360',
        address: 'Via Garibaldi 10, 80100 Napoli NA',
        city: 'Napoli',
        province: 'NA',
        region: 'Campania',
        latitude: 40.8518,
        longitude: 14.2681,
        status: 'ACTIVE'
      }
    ];

    for (const est of establishments) {
      await prisma.establishment.upsert({
        where: { id: est.id },
        update: est,
        create: est
      });
    }
    console.log('✓ 4 establishments creati');

    // 4. Crea utenti
    const users = [
      {
        username: 'filippo',
        email: 'filippo.rossi@email.com',
        password: await bcrypt.hash('Filippo123!', 10),
        firstName: 'Filippo',
        lastName: 'Rossi',
        role: 'SENIOR_MERCHANT',
        status: 'ACTIVE',
        city: 'Milano',
        province: 'MI',
        region: 'Lombardia',
        establishmentId: '123e4567-e89b-12d3-a456-426614174000'
      },
      {
        username: 'anna',
        email: 'anna.bianchi@email.com',
        password: await bcrypt.hash('Anna123!', 10),
        firstName: 'Anna',
        lastName: 'Bianchi',
        role: 'SENIOR_MERCHANT',
        status: 'ACTIVE',
        city: 'Roma',
        province: 'RM',
        region: 'Lazio',
        establishmentId: '123e4567-e89b-12d3-a456-426614174001'
      },
      {
        username: 'mario',
        email: 'mario.verdi@email.com',
        password: await bcrypt.hash('Mario123!', 10),
        firstName: 'Mario',
        lastName: 'Verdi',
        role: 'MERCHANT',
        status: 'ACTIVE',
        city: 'Firenze',
        province: 'FI',
        region: 'Toscana',
        establishmentId: '123e4567-e89b-12d3-a456-426614174002'
      },
      {
        username: 'sara',
        email: 'sara.romano@email.com',
        password: await bcrypt.hash('Sara123!', 10),
        firstName: 'Sara',
        lastName: 'Romano',
        role: 'MERCHANT',
        status: 'ACTIVE',
        city: 'Napoli',
        province: 'NA',
        region: 'Campania',
        establishmentId: '123e4567-e89b-12d3-a456-426614174003'
      },
      {
        username: 'claudio',
        email: 'claudio.ferrari@email.com',
        password: await bcrypt.hash('User123!', 10),
        firstName: 'Claudio',
        lastName: 'Ferrari',
        role: 'USER',
        status: 'ACTIVE',
        city: 'Milano',
        province: 'MI',
        region: 'Lombardia'
      },
      {
        username: 'laura',
        email: 'laura.conti@email.com',
        password: await bcrypt.hash('User123!', 10),
        firstName: 'Laura',
        lastName: 'Conti',
        role: 'USER',
        status: 'ACTIVE',
        city: 'Roma',
        province: 'RM',
        region: 'Lazio'
      },
      {
        username: 'mario_rossi',
        email: 'mario.rossi.user@email.com',
        password: await bcrypt.hash('Test123', 10),
        firstName: 'Mario',
        lastName: 'Rossi',
        role: 'USER',
        status: 'ACTIVE',
        city: 'Milano',
        province: 'MI',
        region: 'Lombardia'
      }
    ];

    for (const user of users) {
      await prisma.user.upsert({
        where: { username: user.username },
        update: user,
        create: user
      });
    }
    console.log('✓ 7 utenti creati');

    // 5. Crea promos
    const promos = [
      {
        establishmentId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Happy Hour Speciale',
        description: 'Promo birra gratis ogni 5 consumazioni',
        ticketsRequired: 5,
        reward: 'Birra media gratis',
        isActive: true,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31')
      },
      {
        establishmentId: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Serata Irlandese',
        description: 'Ogni 3 pinte una gratis',
        ticketsRequired: 3,
        reward: 'Pinta gratis',
        isActive: true,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31')
      },
      {
        establishmentId: '123e4567-e89b-12d3-a456-426614174002',
        name: 'Caffè Loyalty',
        description: '10 caffè = 1 gratis',
        ticketsRequired: 10,
        reward: 'Caffè gratis',
        isActive: true,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31')
      },
      {
        establishmentId: '123e4567-e89b-12d3-a456-426614174003',
        name: 'Aperitivo VIP',
        description: 'Ogni 4 aperitivi uno gratis',
        ticketsRequired: 4,
        reward: 'Aperitivo gratis',
        isActive: true,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31')
      },
      {
        establishmentId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Promo Scaduta Test',
        description: 'Promo di test non attiva',
        ticketsRequired: 99,
        reward: 'Nessun reward',
        isActive: false,
        validFrom: new Date('2023-01-01'),
        validUntil: new Date('2023-12-31')
      }
    ];

    let promoCount = 0;
    for (const promo of promos) {
      await prisma.promo.create({
        data: promo
      });
      promoCount++;
    }
    console.log('✓ 5 promos create');

    res.json({
      success: true,
      message: 'Database inizializzato con successo!',
      data: {
        root: { username: rootUser.username, role: rootUser.role },
        establishments: 4,
        users: 7,
        promos: 5
      }
    });

  } catch (error) {
    console.error('Errore inizializzazione:', error);
    res.status(500).json({ 
      error: 'Errore durante inizializzazione', 
      details: error.message 
    });
  }
});

module.exports = router;
