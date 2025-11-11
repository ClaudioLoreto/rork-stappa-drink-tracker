const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('./utils/password.util');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // 1. Create ROOT admin user
  console.log('Creating ROOT admin...');
  const rootPassword = await hashPassword('Root1234@');
  const rootUser = await prisma.user.upsert({
    where: { username: 'root' },
    update: {},
    create: {
      username: 'root',
      email: 'admin@stappa.com',
      password: rootPassword,
      role: 'ROOT',
      status: 'ACTIVE',
      firstName: 'Admin',
      lastName: 'Root',
      phone: '+39 333 1234567',
      city: 'Milano',
      province: 'MI',
      region: 'Lombardia'
    }
  });
  console.log('✅ ROOT admin created:', rootUser.username);

  // 2. Create test establishments
  console.log('\nCreating establishments...');
  const establishments = [];
  
  const estData = [
    { name: 'Bar Centrale', address: 'Via Roma 1', city: 'Milano', province: 'MI', region: 'Lombardia', hasStockManagement: true },
    { name: 'Pub Irish', address: 'Corso Italia 45', city: 'Milano', province: 'MI', region: 'Lombardia', hasStockManagement: true },
    { name: 'Caffè Vittoria', address: 'Piazza Duomo 3', city: 'Roma', province: 'RM', region: 'Lazio', hasStockManagement: false },
    { name: 'Birreria Artigianale', address: 'Via Torino 22', city: 'Torino', province: 'TO', region: 'Piemonte', hasStockManagement: true },
    { name: 'Lounge Bar 360', address: 'Via Veneto 8', city: 'Firenze', province: 'FI', region: 'Toscana', hasStockManagement: false }
  ];

  for (const data of estData) {
    const est = await prisma.establishment.create({ data: { ...data, status: 'ACTIVE' } });
    establishments.push(est);
    console.log(`✅ Created: ${est.name} (${est.city})`);
  }

  // 3. Create senior merchants
  console.log('\nCreating senior merchants...');
  const seniorMerchants = [];
  
  const seniorPassword = await hashPassword('Senior1234@');
  const seniorData = [
    { username: 'mario_rossi', email: 'mario@barcentrale.com', firstName: 'Mario', lastName: 'Rossi', establishmentId: establishments[0].id },
    { username: 'luigi_verdi', email: 'luigi@pubirish.com', firstName: 'Luigi', lastName: 'Verdi', establishmentId: establishments[1].id },
    { username: 'anna_bianchi', email: 'anna@caffevittoria.com', firstName: 'Anna', lastName: 'Bianchi', establishmentId: establishments[2].id }
  ];

  for (const data of seniorData) {
    const senior = await prisma.user.create({
      data: {
        ...data,
        password: seniorPassword,
        role: 'SENIOR_MERCHANT',
        status: 'ACTIVE',
        phone: '+39 333 9876543',
        city: 'Milano',
        province: 'MI',
        region: 'Lombardia',
        canPostSocial: true,
        isSocialManager: true,
        canManageStock: true
      }
    });
    seniorMerchants.push(senior);
    console.log(`✅ Created senior: ${senior.username}`);
  }

  // 4. Create regular merchants
  console.log('\nCreating regular merchants...');
  const merchantPassword = await hashPassword('Merchant1234@');
  const merchantData = [
    { username: 'carlo_neri', email: 'carlo@barcentrale.com', firstName: 'Carlo', lastName: 'Neri', establishmentId: establishments[0].id, canPostSocial: false, canManageStock: true },
    { username: 'sara_blu', email: 'sara@pubirish.com', firstName: 'Sara', lastName: 'Blu', establishmentId: establishments[1].id, canPostSocial: true, canManageStock: false }
  ];

  for (const data of merchantData) {
    const merchant = await prisma.user.create({
      data: {
        ...data,
        password: merchantPassword,
        role: 'MERCHANT',
        status: 'ACTIVE',
        phone: '+39 333 5554444',
        city: 'Milano',
        province: 'MI',
        region: 'Lombardia',
        isSocialManager: false
      }
    });
    console.log(`✅ Created merchant: ${merchant.username}`);
  }

  // 5. Create test users
  console.log('\nCreating test users...');
  const userPassword = await hashPassword('User1234@');
  const userData = [
    { username: 'giovanni_test', email: 'giovanni@test.com', firstName: 'Giovanni', lastName: 'Test', city: 'Milano', province: 'MI', region: 'Lombardia' },
    { username: 'laura_demo', email: 'laura@test.com', firstName: 'Laura', lastName: 'Demo', city: 'Roma', province: 'RM', region: 'Lazio' },
    { username: 'marco_user', email: 'marco@test.com', firstName: 'Marco', lastName: 'User', city: 'Torino', province: 'TO', region: 'Piemonte' }
  ];

  const users = [];
  for (const data of userData) {
    const user = await prisma.user.create({
      data: {
        ...data,
        password: userPassword,
        role: 'USER',
        status: 'ACTIVE',
        phone: '+39 333 1112222',
        favoriteEstablishments: []
      }
    });
    users.push(user);
    console.log(`✅ Created user: ${user.username}`);
  }

  // 6. Create promos for establishments
  console.log('\nCreating promos...');
  const promoData = [
    { establishmentId: establishments[0].id, ticketCost: 5, ticketsRequired: 10, rewardValue: 10, description: 'Promo Natalizia! 10 birre = 1 gratis', durationDays: 60 },
    { establishmentId: establishments[1].id, ticketCost: 6, ticketsRequired: 8, rewardValue: 12, description: 'Happy Hour Extended', durationDays: 30 },
    { establishmentId: establishments[2].id, ticketCost: 4, ticketsRequired: 10, rewardValue: 8, description: 'Caffè Loyalty Card', durationDays: 90 }
  ];

  for (const data of promoData) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + data.durationDays);
    
    const promo = await prisma.promo.create({
      data: {
        establishmentId: data.establishmentId,
        ticketCost: data.ticketCost,
        ticketsRequired: data.ticketsRequired,
        rewardValue: data.rewardValue,
        description: data.description,
        startDate,
        endDate,
        expiresAt: endDate,
        isActive: true
      }
    });
    console.log(`✅ Created promo for establishment ${data.establishmentId}`);
  }

  // 7. Create user progress (some users already have drinks)
  console.log('\nCreating user progress...');
  await prisma.userProgress.create({
    data: {
      userId: users[0].id,
      establishmentId: establishments[0].id,
      drinksCount: 5
    }
  });
  console.log(`✅ User ${users[0].username} has 5 drinks at ${establishments[0].name}`);

  await prisma.userProgress.create({
    data: {
      userId: users[1].id,
      establishmentId: establishments[1].id,
      drinksCount: 8
    }
  });
  console.log(`✅ User ${users[1].username} has 8 drinks at ${establishments[1].name}`);

  // 8. Create reviews
  console.log('\nCreating reviews...');
  
  await prisma.review.createMany({
    data: [
      {
        userId: users[0].id,
        establishmentId: establishments[0].id,
        rating: 5,
        comment: 'Ottima birra e staff super gentile!'
      },
      {
        userId: users[1].id,
        establishmentId: establishments[0].id,
        rating: 4,
        comment: 'Bel locale, prezzi onesti'
      },
      {
        userId: users[0].id,
        establishmentId: establishments[1].id,
        rating: 5,
        comment: 'Il mio bar preferito!'
      },
      {
        userId: users[2].id,
        establishmentId: establishments[2].id,
        rating: 3,
        comment: 'Buono ma un po caro'
      },
      {
        userId: users[1].id,
        establishmentId: establishments[2].id,
        rating: 4,
        comment: 'Atmosfera fantastica'
      }
    ]
  });

  console.log('✅ Reviews created');

  // 9. Create schedules
  console.log('\nCreating schedules...');
  
  // Schedule for first establishment (Mon-Sun)
  const schedule1 = [];
  for (let day = 0; day < 7; day++) {
    schedule1.push({
      establishmentId: establishments[0].id,
      dayOfWeek: day,
      openTime: day === 0 ? '18:00' : '17:00', // Sunday opens later
      closeTime: '01:00',
      isClosed: false
    });
  }

  // Schedule for second establishment (closed Mondays)
  const schedule2 = [];
  for (let day = 0; day < 7; day++) {
    schedule2.push({
      establishmentId: establishments[1].id,
      dayOfWeek: day,
      openTime: '11:00',
      closeTime: '23:00',
      isClosed: day === 1 // Closed on Mondays
    });
  }

  await prisma.schedule.createMany({
    data: [...schedule1, ...schedule2]
  });

  console.log('✅ Schedules created');

  // 10. Create social posts
  console.log('\nCreating social posts...');
  
  await prisma.socialPost.createMany({
    data: [
      {
        establishmentId: establishments[0].id,
        authorId: rootUser.id,
        type: 'POST',
        content: '🍺 Nuova birra artigianale in arrivo questo weekend! Non perdetela!',
        imageUrl: null
      },
      {
        establishmentId: establishments[0].id,
        authorId: seniorMerchants[0].id,
        type: 'STORY',
        content: 'Live music tonight! 🎸',
        imageUrl: null
      },
      {
        establishmentId: establishments[1].id,
        authorId: seniorMerchants[1].id,
        type: 'POST',
        content: 'Happy Hour 18-20! Tutte le birre alla spina a €3 🍻',
        imageUrl: null
      },
      {
        establishmentId: establishments[2].id,
        authorId: rootUser.id,
        type: 'STORY',
        content: 'Aperti anche domenica! Vi aspettiamo ☀️',
        imageUrl: null
      }
    ]
  });

  console.log('✅ Social posts created');

  // 11. Create sample validations (history)
  console.log('\nCreating validation history...');
  const validationDates = [-7, -5, -3, -2, -1]; // Days ago
  for (const daysAgo of validationDates) {
    const date = new Date();
    date.setDate(date.getDate() + daysAgo);
    
    await prisma.validation.create({
      data: {
        userId: users[0].id,
        establishmentId: establishments[0].id,
        type: 'VALIDATION',
        merchantId: seniorMerchants[0].id,
        createdAt: date
      }
    });
  }
  console.log(`✅ Created ${validationDates.length} validation records`);

  console.log('\n✅ Database seed completed successfully!\n');
  console.log('═══════════════════════════════════════════════');
  console.log('📋 Test Credentials:');
  console.log('═══════════════════════════════════════════════');
  console.log('ROOT Admin:');
  console.log('  Username: root');
  console.log('  Password: Root1234@');
  console.log('');
  console.log('Senior Merchant:');
  console.log('  Username: mario_rossi');
  console.log('  Password: Senior1234@');
  console.log('');
  console.log('Merchant:');
  console.log('  Username: carlo_neri');
  console.log('  Password: Merchant1234@');
  console.log('');
  console.log('User:');
  console.log('  Username: giovanni_test');
  console.log('  Password: User1234@');
  console.log('═══════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
