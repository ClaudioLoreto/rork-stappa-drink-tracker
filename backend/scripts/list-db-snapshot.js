const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        establishmentId: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const establishments = await prisma.establishment.findMany({
      select: { id: true, name: true, city: true, province: true, region: true },
      orderBy: { createdAt: 'asc' },
    });

    console.log('USERS:', users);
    console.log('ESTABLISHMENTS:', establishments);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
})();
