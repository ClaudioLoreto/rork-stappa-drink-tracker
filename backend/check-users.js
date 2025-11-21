const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
    }
  });
  
  console.log('\n📋 Users in database:');
  console.log('═══════════════════════════════════════════════════════════');
  users.forEach(user => {
    console.log(`\n👤 ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   ID: ${user.id}`);
  });
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`Total: ${users.length} users\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
