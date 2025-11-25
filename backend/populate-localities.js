const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const csvPath = path.join(__dirname, 'localities.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('CSV file not found at:', csvPath);
    process.exit(1);
  }

  console.log('Reading CSV file...');
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n');
  
  // Skip header
  const dataLines = lines.slice(1).filter(line => line.trim() !== '');

  console.log(`Found ${dataLines.length} localities to insert.`);

  // Clear existing localities? Maybe not, or maybe yes to avoid duplicates if run multiple times.
  // For now, let's assume empty or just append.
  // Better to delete all first if we want a clean state.
  // await prisma.locality.deleteMany({}); 

  // Batch insert for performance
  const batchSize = 100;
  let batch = [];
  let count = 0;

  for (const line of dataLines) {
    const parts = line.split(';');
    if (parts.length >= 4) {
      const name = parts[0].trim();
      const postalCode = parts[1].trim();
      const province = parts[2].trim();
      const region = parts[3].trim();

      batch.push({
        name,
        postalCode,
        province,
        region
      });

      if (batch.length >= batchSize) {
        await prisma.locality.createMany({
          data: batch
        });
        count += batch.length;
        batch = [];
        if (count % 1000 === 0) process.stdout.write('.');
      }
    }
  }

  if (batch.length > 0) {
    await prisma.locality.createMany({
      data: batch
    });
    count += batch.length;
  }

  console.log(`\nDone! Inserted ${count} localities.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
