const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Prisma baseline...');

  const rootPassword = await bcrypt.hash('Root123!', 10);

  await prisma.user.upsert({
    where: { username: 'root' },
    update: {
      email: 'root@stappa.com',
      password: rootPassword,
      role: 'ROOT',
      status: 'ACTIVE',
      firstName: 'Super',
      lastName: 'Admin',
      city: 'Milano',
      province: 'MI',
      region: 'Lombardia',
      phone: '+39 333 1234567',
    },
    create: {
      username: 'root',
      email: 'root@stappa.com',
      password: rootPassword,
      role: 'ROOT',
      status: 'ACTIVE',
      firstName: 'Super',
      lastName: 'Admin',
      city: 'Milano',
      province: 'MI',
      region: 'Lombardia',
      phone: '+39 333 1234567',
    },
  });

  console.log('ROOT admin ready (root / Root123!)');
  console.log('Consulta CREDENZIALI_TEST.md per gli altri account di test.');
}

main()
  .catch((error) => {
    console.error('Prisma seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
