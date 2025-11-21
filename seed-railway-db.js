/**
 * Script per popolare il database di produzione Railway
 * Chiama l'endpoint POST /api/admin/seed tramite HTTP
 */

const BACKEND_URL = 'https://rork-stappa-drink-tracker-production.up.railway.app';

async function seedDatabase() {
  console.log('🔐 Step 1: Login come ROOT...');
  
  // 1. Login come ROOT
  let loginResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'root',
      password: 'Root123!',
    }),
  });

  // Se login fallisce, prova password alternativa o crea account
  if (!loginResponse.ok) {
    console.log('⚠️  Password Root123! non funziona, provo Root1234@...');
    
    loginResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'root',
        password: 'Root1234@',
      }),
    });
  }

  if (!loginResponse.ok) {
    const error = await loginResponse.json();
    console.error('❌ Login fallito con entrambe le password:', error);
    console.log('\n💡 SOLUZIONE:');
    console.log('1. Vai su Railway Dashboard');
    console.log('2. Apri il database PostgreSQL');
    console.log('3. Esegui questo comando SQL:');
    console.log(`
INSERT INTO "User" (id, username, email, password, "firstName", "lastName", role, status, city, province, region)
VALUES (
  gen_random_uuid(),
  'root',
  'root@stappa.com',
  '$2a$10$YourHashedPasswordHere',  -- Usa bcrypt per hashare 'Root123!'
  'Super',
  'Admin',
  'ROOT',
  'ACTIVE',
  'Milano',
  'MI',
  'Lombardia'
) ON CONFLICT (username) DO NOTHING;
    `);
    console.log('\n4. Oppure usa Prisma Studio per creare manualmente l\'utente ROOT');
    process.exit(1);
  }

  const { token } = await loginResponse.json();
  console.log('✅ Login riuscito!\n');

  // 2. Chiamata endpoint seed
  console.log('🌱 Step 2: Popolamento database...');
  console.log('   (Questa operazione può richiedere 10-20 secondi)\n');

  const seedResponse = await fetch(`${BACKEND_URL}/api/admin/seed?clean=true`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!seedResponse.ok) {
    const error = await seedResponse.json();
    console.error('❌ Seed fallito:', error);
    process.exit(1);
  }

  const result = await seedResponse.json();
  console.log('✅ Database popolato con successo!\n');
  console.log('📊 RIEPILOGO:');
  console.log(`   - ${result.data.establishments} Establishments`);
  console.log(`   - ${result.data.users} Utenti (+ ROOT già esistente)`);
  console.log(`   - ${result.data.promos} Promo`);
  console.log('\n🔐 Credenziali ROOT: root / Root123!');
  console.log('📄 Tutte le credenziali in: CREDENZIALI_TEST.md\n');
}

// Esegui
seedDatabase().catch((error) => {
  console.error('❌ Errore:', error.message);
  process.exit(1);
});
