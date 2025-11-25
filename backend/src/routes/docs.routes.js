const express = require('express');
const router = express.Router();

/**
 * @route   GET /api/docs
 * @desc    Documentazione API - Elenco endpoint disponibili
 * @access  Public
 */
router.get('/', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  const documentation = {
    title: '🍺 Stappa Drink Tracker API',
    version: '1.0.0',
    description: 'Backend API per l\'app Stappa - Sistema di fidelizzazione per locali',
    baseUrl: baseUrl,
    endpoints: {
      
      // ==================== AUTH ====================
      'Authentication': {
        'POST /api/auth/login': {
          description: 'Login utente',
          body: { username: 'string', password: 'string' },
          response: { token: 'string', user: 'User' }
        },
        'POST /api/auth/register': {
          description: 'Registrazione nuovo utente',
          body: { username: 'string', email: 'string', password: 'string', firstName: 'string', lastName: 'string', city: 'string', province: 'string', region: 'string' },
          response: { token: 'string', user: 'User' }
        },
        'GET /api/auth/me': {
          description: 'Ottieni profilo utente corrente',
          auth: 'Bearer token',
          response: 'User'
        }
      },

      // ==================== USERS ====================
      'Users': {
        'GET /api/users': {
          description: 'Lista utenti (solo ROOT/ADMIN)',
          auth: 'Bearer token',
          query: { role: 'optional', status: 'optional' },
          response: 'User[]'
        },
        'GET /api/users/:id': {
          description: 'Dettaglio utente',
          auth: 'Bearer token',
          response: 'User'
        },
        'PUT /api/users/:id': {
          description: 'Aggiorna utente',
          auth: 'Bearer token',
          body: 'Partial<User>',
          response: 'User'
        },
        'DELETE /api/users/:id': {
          description: 'Elimina utente (solo ROOT)',
          auth: 'Bearer token',
          response: { message: 'string' }
        }
      },

      // ==================== ESTABLISHMENTS ====================
      'Establishments': {
        'GET /api/establishments': {
          description: 'Lista locali',
          query: { city: 'optional', region: 'optional', status: 'optional' },
          response: 'Establishment[]'
        },
        'GET /api/establishments/:id': {
          description: 'Dettaglio locale',
          response: 'Establishment'
        },
        'POST /api/establishments': {
          description: 'Crea nuovo locale (solo SENIOR_MERCHANT)',
          auth: 'Bearer token',
          body: { name: 'string', address: 'string', city: 'string', province: 'string', region: 'string' },
          response: 'Establishment'
        },
        'PUT /api/establishments/:id': {
          description: 'Aggiorna locale',
          auth: 'Bearer token',
          body: 'Partial<Establishment>',
          response: 'Establishment'
        },
        'DELETE /api/establishments/:id': {
          description: 'Elimina locale (solo ROOT)',
          auth: 'Bearer token',
          response: { message: 'string' }
        }
      },

      // ==================== PROMOS ====================
      'Promos': {
        'GET /api/promos': {
          description: 'Lista promo',
          query: { establishmentId: 'optional', isActive: 'optional' },
          response: 'Promo[]'
        },
        'GET /api/promos/:id': {
          description: 'Dettaglio promo',
          response: 'Promo'
        },
        'GET /api/promos/active/:establishmentId': {
          description: 'Promo attiva per un locale',
          response: 'Promo | null'
        },
        'POST /api/promos': {
          description: 'Crea nuova promo (solo MERCHANT/SENIOR_MERCHANT)',
          auth: 'Bearer token',
          body: { establishmentId: 'string', ticketCost: 'number', ticketsRequired: 'number', rewardValue: 'number', startDate: 'date', endDate: 'date', expiresAt: 'date' },
          response: 'Promo'
        },
        'PUT /api/promos/:id': {
          description: 'Aggiorna promo',
          auth: 'Bearer token',
          body: 'Partial<Promo>',
          response: 'Promo'
        },
        'DELETE /api/promos/:id': {
          description: 'Elimina promo',
          auth: 'Bearer token',
          response: { message: 'string' }
        }
      },

      // ==================== VALIDATIONS ====================
      'Validations': {
        'GET /api/validations': {
          description: 'Lista validazioni',
          auth: 'Bearer token',
          response: 'Validation[]'
        },
        'GET /api/validations/user/:userId': {
          description: 'Validazioni per utente',
          auth: 'Bearer token',
          response: 'Validation[]'
        },
        'POST /api/validations': {
          description: 'Crea validazione/check-in (solo MERCHANT/SENIOR_MERCHANT)',
          auth: 'Bearer token',
          body: { userId: 'string', establishmentId: 'string', amount: 'number' },
          response: 'Validation'
        }
      },

      // ==================== QR CODES ====================
      'QR Codes': {
        'POST /api/qr/generate': {
          description: 'Genera QR code per locale (solo MERCHANT)',
          auth: 'Bearer token',
          body: { establishmentId: 'string' },
          response: { qrCode: 'string', url: 'string' }
        },
        'POST /api/qr/validate': {
          description: 'Valida QR code scansionato',
          auth: 'Bearer token',
          body: { qrData: 'string' },
          response: { valid: 'boolean', establishment: 'Establishment' }
        }
      },

      // ==================== MERCHANT REQUESTS ====================
      'Merchant Requests': {
        'GET /api/merchant-requests': {
          description: 'Lista richieste merchant (solo ROOT/ADMIN)',
          auth: 'Bearer token',
          query: { status: 'optional' },
          response: 'MerchantRequest[]'
        },
        'POST /api/merchant-requests': {
          description: 'Invia richiesta per diventare merchant',
          auth: 'Bearer token',
          body: { establishmentName: 'string', establishmentAddress: 'string', notes: 'string' },
          response: 'MerchantRequest'
        },
        'POST /api/merchant-requests/:id/approve': {
          description: 'Approva richiesta merchant (solo ROOT)',
          auth: 'Bearer token',
          response: 'MerchantRequest'
        },
        'POST /api/merchant-requests/:id/reject': {
          description: 'Rifiuta richiesta merchant (solo ROOT)',
          auth: 'Bearer token',
          body: { reason: 'string' },
          response: 'MerchantRequest'
        }
      },

      // ==================== BUG REPORTS ====================
      'Bug Reports': {
        'GET /api/bug-reports': {
          description: 'Lista segnalazioni bug (solo ROOT/ADMIN)',
          auth: 'Bearer token',
          response: 'BugReport[]'
        },
        'POST /api/bug-reports': {
          description: 'Invia segnalazione bug',
          auth: 'Bearer token',
          body: { title: 'string', description: 'string', steps: 'string', expectedBehavior: 'string', actualBehavior: 'string' },
          response: 'BugReport'
        },
        'PUT /api/bug-reports/:id': {
          description: 'Aggiorna stato bug (solo ROOT)',
          auth: 'Bearer token',
          body: { status: 'OPEN|IN_PROGRESS|RESOLVED|CLOSED' },
          response: 'BugReport'
        }
      },

      // ==================== REVIEWS ====================
      'Reviews': {
        'GET /api/reviews': {
          description: 'Lista recensioni per locale',
          query: { establishmentId: 'required' },
          response: 'Review[]'
        },
        'POST /api/reviews': {
          description: 'Crea recensione',
          auth: 'Bearer token',
          body: { establishmentId: 'string', rating: 'number', comment: 'string' },
          response: 'Review'
        }
      },

      // ==================== SCHEDULES ====================
      'Schedules': {
        'GET /api/schedules/:establishmentId': {
          description: 'Orari locale',
          response: 'Schedule[]'
        },
        'PUT /api/schedules/:establishmentId': {
          description: 'Aggiorna orari (solo MERCHANT)',
          auth: 'Bearer token',
          body: 'Schedule[]',
          response: 'Schedule[]'
        }
      },

      // ==================== SOCIAL ====================
      'Social': {
        'GET /api/social/:establishmentId/posts': {
          description: 'Post social del locale',
          response: 'SocialPost[]'
        },
        'POST /api/social/posts': {
          description: 'Crea post (solo MERCHANT)',
          auth: 'Bearer token',
          body: { establishmentId: 'string', content: 'string', imageUrl: 'optional' },
          response: 'SocialPost'
        }
      },

      // ==================== STOCK ====================
      'Stock': {
        'GET /api/stock/establishment/:establishmentId': {
          description: 'Inventario locale (solo MERCHANT)',
          auth: 'Bearer token',
          response: 'StockEntry[]'
        },
        'POST /api/stock/update': {
          description: 'Aggiorna quantità (solo MERCHANT)',
          auth: 'Bearer token',
          body: { articleId: 'string', quantity: 'number', type: 'IN|OUT' },
          response: 'StockEntry'
        }
      },

      // ==================== LOCALITIES ====================
      'Localities': {
        'GET /api/localities': {
          description: 'Lista comuni italiani',
          query: { search: 'optional', limit: 'optional' },
          response: 'Locality[]'
        }
      },

      // ==================== ADMIN ====================
      'Admin': {
        'POST /api/admin/seed': {
          description: 'Popola database con dati di test (solo ROOT o DB vuoto)',
          auth: 'Bearer token (se DB non vuoto)',
          query: { clean: 'optional boolean' },
          response: { success: 'boolean', data: { establishments: 'number', users: 'number', promos: 'number' } }
        }
      },

      // ==================== SYSTEM ====================
      'System': {
        'GET /health': {
          description: 'Health check del server',
          response: { status: 'string', message: 'string', timestamp: 'string' }
        },
        'GET /api/docs': {
          description: 'Questa documentazione API',
          response: 'JSON'
        }
      }
    },

    models: {
      User: {
        id: 'uuid',
        username: 'string (unique)',
        email: 'string (unique)',
        password: 'string (hashed)',
        firstName: 'string',
        lastName: 'string',
        role: 'ROOT | ADMIN | SENIOR_MERCHANT | MERCHANT | USER',
        status: 'ACTIVE | SUSPENDED | DELETED',
        city: 'string',
        province: 'string',
        region: 'string',
        establishmentId: 'uuid | null',
        createdAt: 'datetime',
        updatedAt: 'datetime'
      },
      Establishment: {
        id: 'uuid',
        name: 'string',
        address: 'string',
        city: 'string',
        province: 'string',
        region: 'string',
        latitude: 'float | null',
        longitude: 'float | null',
        status: 'ACTIVE | INACTIVE | SUSPENDED',
        createdAt: 'datetime',
        updatedAt: 'datetime'
      },
      Promo: {
        id: 'uuid',
        establishmentId: 'uuid',
        ticketCost: 'number',
        ticketsRequired: 'number',
        rewardValue: 'number',
        description: 'string | null',
        startDate: 'datetime',
        endDate: 'datetime',
        expiresAt: 'datetime',
        isActive: 'boolean',
        createdAt: 'datetime',
        updatedAt: 'datetime'
      }
    },

    authentication: {
      type: 'Bearer Token (JWT)',
      header: 'Authorization: Bearer <token>',
      obtainToken: 'POST /api/auth/login',
      tokenExpiry: '7 days'
    },

    notes: [
      'Tutti gli endpoint che richiedono autenticazione devono includere il token JWT nell\'header Authorization',
      'I ruoli utente sono gerarchici: ROOT > ADMIN > SENIOR_MERCHANT > MERCHANT > USER',
      'Le date devono essere in formato ISO 8601',
      'Le risposte di errore seguono il formato: { error: "messaggio" }',
      'Il database di produzione è su Railway PostgreSQL',
      'Frontend disponibile su Expo (iOS/Android)'
    ]
  };

  res.json(documentation);
});

module.exports = router;
