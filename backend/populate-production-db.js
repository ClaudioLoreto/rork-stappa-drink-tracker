/**
 * Popola il database di PRODUZIONE Railway con i dati da CREDENZIALI_TEST.md
 * 
 * ATTENZIONE: Questo script SVUOTA il database e inserisce i dati di test
 * Usare SOLO per setup iniziale del database di produzione
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Inizio popolamento database PRODUZIONE Railway...\n');

  // 1. PULIZIA DATABASE
  console.log('🗑️  Step 1: Pulizia database...');
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
  await prisma.user.deleteMany({});
  await prisma.establishment.deleteMany({});
  console.log('✅ Database pulito\n');

  // 2. CREAZIONE ESTABLISHMENTS
  console.log('🏪 Step 2: Creazione establishments...');
  
  const barCentrale = await prisma.establishment.create({
    data: {
      id: '4e757d3a-386e-40fb-957b-8089949a3f46',
      name: 'Bar Centrale',
      address: 'Via Roma 123, Milano, MI, Lombardia',
      city: 'Milano',
      province: 'MI',
      region: 'Lombardia',
      status: 'ACTIVE',
    },
  });
  console.log('  ✓ Bar Centrale creato');

  const pubIrish = await prisma.establishment.create({
    data: {
      id: '03f6533e-b989-458c-9449-b820f9dca3b7',
      name: 'Pub Irish',
      address: 'Via Dante 456, Milano, MI, Lombardia',
      city: 'Milano',
      province: 'MI',
      region: 'Lombardia',
      status: 'ACTIVE',
    },
  });
  console.log('  ✓ Pub Irish creato');

  const caffeVittoria = await prisma.establishment.create({
    data: {
      id: 'a0d8b1bd-a904-4506-b04c-e895aeec1067',
      name: 'Caffe Vittoria',
      address: 'Piazza Navona 789, Roma, RM, Lazio',
      city: 'Roma',
      province: 'RM',
      region: 'Lazio',
      status: 'ACTIVE',
    },
  });
  console.log('  ✓ Caffe Vittoria creato');

  const loungeBar360 = await prisma.establishment.create({
    data: {
      id: '1eaf1e5e-9c77-450e-92a1-4c1a9f51ef5d',
      name: 'Lounge Bar 360',
      address: 'Via Firenze 101, Firenze, FI, Toscana',
      city: 'Firenze',
      province: 'FI',
      region: 'Toscana',
      status: 'ACTIVE',
    },
  });
  console.log('  ✓ Lounge Bar 360 creato\n');

  // 3. CREAZIONE UTENTI
  console.log('👥 Step 3: Creazione utenti...');

  // ROOT
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
      region: 'Lombardia',
    },
  });
  console.log('  ✓ ROOT (root/Root123!) creato');

  // SENIOR MERCHANTS
  const filippoPassword = await bcrypt.hash('Filippo123!', 10);
  await prisma.user.create({
    data: {
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
  console.log('  ✓ SENIOR_MERCHANT filippo/Filippo123! (Bar Centrale) creato');

  const annaPassword = await bcrypt.hash('Anna123!', 10);
  await prisma.user.create({
    data: {
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
  console.log('  ✓ SENIOR_MERCHANT anna/Anna123! (Pub Irish) creato');

  // MERCHANTS
  const marioPassword = await bcrypt.hash('Mario123!', 10);
  await prisma.user.create({
    data: {
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
  console.log('  ✓ MERCHANT mario/Mario123! (Caffe Vittoria) creato');

  const saraPassword = await bcrypt.hash('Sara123!', 10);
  await prisma.user.create({
    data: {
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
  console.log('  ✓ MERCHANT sara/Sara123! (Lounge Bar 360) creato');

  // USERS
  const userPassword = await bcrypt.hash('User123!', 10);
  await prisma.user.create({
    data: {
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
  console.log('  ✓ USER claudio/User123! creato');

  await prisma.user.create({
    data: {
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
  console.log('  ✓ USER laura/User123! creato');

  const marioRossiPassword = await bcrypt.hash('Test123', 10);
  await prisma.user.create({
    data: {
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
  console.log('  ✓ USER mario_rossi/Test123 creato\n');

  // 4. CREAZIONE PROMOS
  console.log('🎁 Step 4: Creazione promo...');

  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);

  await prisma.promo.create({
    data: {
      establishmentId: barCentrale.id,
      ticketsRequired: 10,
      ticketCost: 5,
      rewardValue: 5,
      startDate: now,
      endDate: futureDate,
      isActive: true,
    },
  });
  console.log('  ✓ Promo Bar Centrale (10 tickets, 5€) creata');

  await prisma.promo.create({
    data: {
      establishmentId: caffeVittoria.id,
      ticketsRequired: 8,
      ticketCost: 4,
      rewardValue: 4,
      startDate: now,
      endDate: futureDate,
      isActive: true,
    },
  });
  console.log('  ✓ Promo Caffe Vittoria (8 tickets, 4€) creata');

  await prisma.promo.create({
    data: {
      establishmentId: loungeBar360.id,
      ticketsRequired: 15,
      ticketCost: 7,
      rewardValue: 12,
      startDate: now,
      endDate: futureDate,
      isActive: true,
    },
  });
  console.log('  ✓ Promo Lounge Bar 360 (15 tickets, 7€) creata');

  await prisma.promo.create({
    data: {
      establishmentId: pubIrish.id,
      ticketsRequired: 12,
      ticketCost: 6,
      rewardValue: 10,
      startDate: now,
      endDate: futureDate,
      isActive: false,
    },
  });
  console.log('  ✓ Promo Pub Irish (12 tickets, 6€) INATTIVA creata');

  await prisma.promo.create({
    data: {
      establishmentId: pubIrish.id,
      ticketsRequired: 10,
      ticketCost: 10,
      rewardValue: 10,
      startDate: now,
      endDate: futureDate,
      isActive: true,
    },
  });
  console.log('  ✓ Promo Pub Irish (10 tickets, 10€) ATTIVA creata');

  console.log('\n✅ Database popolato con successo!');
  console.log('\n📊 RIEPILOGO:');
  console.log('   - 4 Establishments');
  console.log('   - 8 Utenti (1 ROOT, 2 SENIOR_MERCHANT, 2 MERCHANT, 3 USER)');
  console.log('   - 5 Promo (4 attive, 1 inattiva)');
  console.log('\n🔐 Credenziali ROOT: root / Root123!');
  console.log('📄 Tutte le credenziali in: CREDENZIALI_TEST.md\n');
}

main()
  .catch((e) => {
    console.error('❌ Errore durante il popolamento:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
