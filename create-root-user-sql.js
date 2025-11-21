/**
 * Genera hash bcrypt per password ROOT
 */

const bcrypt = require('bcryptjs');

async function generateRootHash() {
  const password = 'Root123!';
  const hash = await bcrypt.hash(password, 10);
  
  console.log('\n🔐 CREA UTENTE ROOT NEL DATABASE RAILWAY\n');
  console.log('Esegui questo comando SQL nel pannello Railway (Database → Data → Query):\n');
  console.log('━'.repeat(80));
  console.log(`
INSERT INTO "User" (
  id, 
  username, 
  email, 
  password, 
  "firstName", 
  "lastName", 
  role, 
  status, 
  city, 
  province, 
  region,
  "createdAt",
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'root',
  'root@stappa.com',
  '${hash}',
  'Super',
  'Admin',
  'ROOT',
  'ACTIVE',
  'Milano',
  'MI',
  'Lombardia',
  NOW(),
  NOW()
)
ON CONFLICT (username) DO NOTHING;
  `);
  console.log('━'.repeat(80));
  console.log('\n✅ Dopo aver eseguito il comando, lancia: node seed-railway-db.js');
  console.log('🔑 Credenziali: root / Root123!\n');
}

generateRootHash();
