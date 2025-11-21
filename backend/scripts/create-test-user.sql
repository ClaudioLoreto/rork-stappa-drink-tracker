-- Script parametrico per creare un utente di test
-- Usa variabili psql per evitare di salvare credenziali in chiaro.
-- Esempio:
--   psql -U postgres -d stappa_db --     -v username='mario_rossi' --     -v email='mario.rossi@test.com' --     -v password='Test123' --     -v firstName='Mario' --     -v lastName='Rossi' --     -f backend/scripts/create-test-user.sql

\set username :username
\set email :email
\set password :password
\set firstName :firstName
\set lastName :lastName

INSERT INTO users (
    id,
    username,
    email,
    password,
    "firstName",
    "lastName",
    phone,
    city,
    province,
    region,
    role,
    status,
    "createdAt",
    "updatedAt"
) VALUES (
    gen_random_uuid(),
    :'username',
    :'email',
    crypt(:'password', gen_salt('bf')),
    :'firstName',
    :'lastName',
    NULL,
    NULL,
    NULL,
    NULL,
    'USER',
    'ACTIVE',
    NOW(),
    NOW()
) RETURNING id, username, email, role, status;
