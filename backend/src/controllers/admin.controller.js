const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

/**
 * Popola il database con i dati da CREDENZIALI_TEST.md
 * Endpoint protetto - solo ROOT può chiamarlo
 */
const seedDatabase = async (req, res) => {
  try {
    console.log('🚀 Inizio seed database...');

    // 0. CREAZIONE ROOT (se non esiste)
    const existingRoot = await prisma.user.findUnique({
      where: { username: 'root' }
    });

    if (!existingRoot) {
      console.log('👑 Creazione utente ROOT...');
      const rootPassword = await bcrypt.hash('Root123!', 10);
      await prisma.user.create({
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
      console.log('✅ ROOT creato');
    }

    // 1. PULIZIA (opzionale, basata su query param)
    if (req.query.clean === 'true') {
      console.log('🗑️ Pulizia database...');
      await prisma.validation.deleteMany({});
      await prisma.userProgress.deleteMany({});
      await prisma.promo.deleteMany({});
      await prisma.bugReport.deleteMany({});
      await prisma.merchantRequest.deleteMany({});
      await prisma.review.deleteMany({});
      await prisma.socialPost.deleteMany({});
      await prisma.stockEntry.deleteMany({});
      await prisma.stockPhoto.deleteMany({});
      await prisma.article.deleteMany({});
      await prisma.qRCode.deleteMany({});
      await prisma.schedule.deleteMany({});
      
      // Elimina tutti tranne ROOT
      await prisma.user.deleteMany({
        where: { role: { not: 'ROOT' } }
      });
      await prisma.establishment.deleteMany({});
      console.log('✅ Database pulito');
    }

    // 2. CREAZIONE ESTABLISHMENTS
    console.log('🏪 Creazione establishments...');
    
    const barCentrale = await prisma.establishment.upsert({
      where: { id: '4e757d3a-386e-40fb-957b-8089949a3f46' },
      update: {},
      create: {
        id: '4e757d3a-386e-40fb-957b-8089949a3f46',
        name: 'Bar Centrale',
        address: 'Via Roma 123, Milano, MI, Lombardia',
        city: 'Milano',
        province: 'MI',
        region: 'Lombardia',
        status: 'ACTIVE',
      },
    });

    const pubIrish = await prisma.establishment.upsert({
      where: { id: '03f6533e-b989-458c-9449-b820f9dca3b7' },
      update: {},
      create: {
        id: '03f6533e-b989-458c-9449-b820f9dca3b7',
        name: 'Pub Irish',
        address: 'Via Dante 456, Milano, MI, Lombardia',
        city: 'Milano',
        province: 'MI',
        region: 'Lombardia',
        status: 'ACTIVE',
      },
    });

    const caffeVittoria = await prisma.establishment.upsert({
      where: { id: 'a0d8b1bd-a904-4506-b04c-e895aeec1067' },
      update: {},
      create: {
        id: 'a0d8b1bd-a904-4506-b04c-e895aeec1067',
        name: 'Caffe Vittoria',
        address: 'Piazza Navona 789, Roma, RM, Lazio',
        city: 'Roma',
        province: 'RM',
        region: 'Lazio',
        status: 'ACTIVE',
      },
    });

    const loungeBar360 = await prisma.establishment.upsert({
      where: { id: '1eaf1e5e-9c77-450e-92a1-4c1a9f51ef5d' },
      update: {},
      create: {
        id: '1eaf1e5e-9c77-450e-92a1-4c1a9f51ef5d',
        name: 'Lounge Bar 360',
        address: 'Via Firenze 101, Firenze, FI, Toscana',
        city: 'Firenze',
        province: 'FI',
        region: 'Toscana',
        status: 'ACTIVE',
      },
    });

    // 3. CREAZIONE UTENTI
    console.log('👥 Creazione utenti...');

    // SENIOR MERCHANTS
    const filippoPassword = await bcrypt.hash('Filippo123!', 10);
    await prisma.user.upsert({
      where: { username: 'filippo' },
      update: {},
      create: {
        username: 'filippo',
        email: 'filippo@saitatapo.com',
        password: filippoPassword,
        firstName: 'Filippo',
        lastName: 'Rossi',
        role: 'SENIOR_MERCHANT',
        status: 'ACTIVE',
        establishmentId: barCentrale.id,
        isSocialManager: true,
        canPostSocial: true,
        city: 'Milano',
        province: 'MI',
        region: 'Lombardia',
      },
    });

    const annaPassword = await bcrypt.hash('Anna123!', 10);
    await prisma.user.upsert({
      where: { username: 'anna' },
      update: {},
      create: {
        username: 'anna',
        email: 'anna@pubIrish.com',
        password: annaPassword,
        firstName: 'Anna',
        lastName: 'Bianchi',
        role: 'SENIOR_MERCHANT',
        status: 'ACTIVE',
        establishmentId: pubIrish.id,
        isSocialManager: true,
        canPostSocial: true,
        city: 'Milano',
        province: 'MI',
        region: 'Lombardia',
      },
    });

    // MERCHANTS
    const marioPassword = await bcrypt.hash('Mario123!', 10);
    await prisma.user.upsert({
      where: { username: 'mario' },
      update: {},
      create: {
        username: 'mario',
        email: 'mario@barcentrale.com',
        password: marioPassword,
        firstName: 'Mario',
        lastName: 'Verdi',
        role: 'MERCHANT',
        status: 'ACTIVE',
        establishmentId: caffeVittoria.id,
        city: 'Roma',
        province: 'RM',
        region: 'Lazio',
      },
    });

    const saraPassword = await bcrypt.hash('Sara123!', 10);
    await prisma.user.upsert({
      where: { username: 'sara' },
      update: {},
      create: {
        username: 'sara',
        email: 'sara@loungebar.com',
        password: saraPassword,
        firstName: 'Sara',
        lastName: 'Blu',
        role: 'MERCHANT',
        status: 'ACTIVE',
        establishmentId: loungeBar360.id,
        city: 'Firenze',
        province: 'FI',
        region: 'Toscana',
      },
    });

    // USERS
    const userPassword = await bcrypt.hash('User123!', 10);
    await prisma.user.upsert({
      where: { username: 'claudio' },
      update: {},
      create: {
        username: 'claudio',
        email: 'claudio@example.com',
        password: userPassword,
        firstName: 'Claudio',
        lastName: 'Bianchi',
        role: 'USER',
        status: 'ACTIVE',
        city: 'Milano',
        province: 'MI',
        region: 'Lombardia',
      },
    });

    await prisma.user.upsert({
      where: { username: 'laura' },
      update: {},
      create: {
        username: 'laura',
        email: 'laura@test.com',
        password: userPassword,
        firstName: 'Laura',
        lastName: 'Neri',
        role: 'USER',
        status: 'ACTIVE',
        city: 'Roma',
        province: 'RM',
        region: 'Lazio',
      },
    });

    const marioRossiPassword = await bcrypt.hash('Test123', 10);
    await prisma.user.upsert({
      where: { username: 'mario_rossi' },
      update: {},
      create: {
        username: 'mario_rossi',
        email: 'mario.rossi@test.com',
        password: marioRossiPassword,
        firstName: 'Mario',
        lastName: 'Rossi',
        role: 'USER',
        status: 'ACTIVE',
        city: 'Milano',
        province: 'MI',
        region: 'Lombardia',
      },
    });

    // 4. CREAZIONE PROMOS
    console.log('🎁 Creazione promo...');

    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    // Elimina vecchie promo
    await prisma.promo.deleteMany({
      where: {
        establishmentId: {
          in: [barCentrale.id, pubIrish.id, caffeVittoria.id, loungeBar360.id]
        }
      }
    });

    await prisma.promo.create({
      data: {
        establishmentId: barCentrale.id,
        ticketsRequired: 10,
        ticketCost: 5,
        rewardValue: 5,
        startDate: now,
        endDate: futureDate,
        expiresAt: futureDate,
        isActive: true,
      },
    });

    await prisma.promo.create({
      data: {
        establishmentId: caffeVittoria.id,
        ticketsRequired: 8,
        ticketCost: 4,
        rewardValue: 4,
        startDate: now,
        endDate: futureDate,
        expiresAt: futureDate,
        isActive: true,
      },
    });

    await prisma.promo.create({
      data: {
        establishmentId: loungeBar360.id,
        ticketsRequired: 15,
        ticketCost: 7,
        rewardValue: 12,
        startDate: now,
        endDate: futureDate,
        expiresAt: futureDate,
        isActive: true,
      },
    });

    await prisma.promo.create({
      data: {
        establishmentId: pubIrish.id,
        ticketsRequired: 12,
        ticketCost: 6,
        rewardValue: 10,
        startDate: now,
        endDate: futureDate,
        expiresAt: futureDate,
        isActive: false,
      },
    });

    await prisma.promo.create({
      data: {
        establishmentId: pubIrish.id,
        ticketsRequired: 10,
        ticketCost: 10,
        rewardValue: 10,
        startDate: now,
        endDate: futureDate,
        expiresAt: futureDate,
        isActive: true,
      },
    });

    console.log('✅ Seed completato!');

    res.json({
      success: true,
      message: 'Database popolato con successo',
      data: {
        establishments: 4,
        users: 7, // escluso ROOT già esistente
        promos: 5,
      },
    });
  } catch (error) {
    console.error('❌ Errore durante il seed:', error);
    res.status(500).json({
      success: false,
      error: 'Seed fallito',
      details: error.message,
    });
  }
};

module.exports = {
  seedDatabase,
};
