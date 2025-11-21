const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning database...');

  await prisma.stockEntry.deleteMany({});
  await prisma.stockPhoto.deleteMany({});
  await prisma.socialPost.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.qRCode.deleteMany({});
  await prisma.bugReport.deleteMany({});
  await prisma.merchantRequest.deleteMany({});
  await prisma.validation.deleteMany({});
  await prisma.userProgress.deleteMany({});
  await prisma.promo.deleteMany({});
  await prisma.schedule.deleteMany({});
  await prisma.establishment.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Database cleaned');
  console.log('\\nCreating baseline data...');

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
      phone: '+39 333 1234567',
    },
  });

  console.log('ROOT created: root / Root123!');
  console.log('\\nConsulta CREDENZIALI_TEST.md per gli altri account di test.');
}

main()
  .catch((error) => {
    console.error('Reset failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
