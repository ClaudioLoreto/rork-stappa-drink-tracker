// Script per creare l'utente ROOT direttamente su Railway DB
const { Client } = require('pg');

async function createRootUser() {
  // Railway fornisce DATABASE_URL tramite environment
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✓ Connesso al database Railway');

    const result = await client.query(`
      INSERT INTO "User" (
        id, username, email, password, 
        "firstName", "lastName", role, status, 
        city, province, region, "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), 
        'root', 
        'root@stappa.com', 
        '$2b$10$2tOhLQcRBL6/AMBNw/Ou/utWSsoojirm5SB2ExUrxyk4nlm1Cvk8y', 
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
      ON CONFLICT (username) DO NOTHING
      RETURNING id, username, role;
    `);

    if (result.rows.length > 0) {
      console.log('✓ Utente ROOT creato con successo!');
      console.log('  Username:', result.rows[0].username);
      console.log('  Role:', result.rows[0].role);
      console.log('  ID:', result.rows[0].id);
    } else {
      console.log('⚠ Utente ROOT già esistente (conflict risolto)');
    }

  } catch (error) {
    console.error('✗ Errore:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createRootUser();
