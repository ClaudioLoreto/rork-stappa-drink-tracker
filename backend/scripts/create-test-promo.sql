-- Script per creare una promo di test per il Pub Irish
-- Esegui questo script con: psql -U postgres -d stappa_db -f create-test-promo.sql

-- 1. Verifica che il Pub Irish esista
SELECT id, name FROM establishments WHERE name LIKE '%Irish%';

-- 2. Crea una nuova promo per il Pub Irish (durata 30 giorni)
-- Sostituisci 'ESTABLISHMENT_ID_QUI' con l'ID del Pub Irish dalla query sopra
INSERT INTO promos (
    id,
    "establishmentId",
    "ticketCost",
    "ticketsRequired",
    "rewardValue",
    description,
    "startDate",
    "endDate",
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM establishments WHERE name LIKE '%Irish%' LIMIT 1),
    5.00,
    8,
    4.00,
    'Promo Test: 8 birre = 1 gratis',
    NOW(),
    NOW() + INTERVAL '30 days',
    true,
    NOW(),
    NOW()
)
RETURNING id, "ticketCost", "ticketsRequired", "rewardValue", "startDate", "endDate";

-- 3. Verifica la promo creata
SELECT 
    p.id,
    e.name as establishment_name,
    p."ticketCost",
    p."ticketsRequired",
    p."rewardValue",
    p."startDate",
    p."endDate",
    p."isActive"
FROM promos p
JOIN establishments e ON p."establishmentId" = e.id
WHERE p."isActive" = true
ORDER BY p."createdAt" DESC
LIMIT 5;
