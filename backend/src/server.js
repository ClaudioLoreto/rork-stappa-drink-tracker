const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (uploads)
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/establishments', require('./routes/establishment.routes'));
app.use('/api/promos', require('./routes/promo.routes'));
app.use('/api/qr', require('./routes/qr.routes'));
app.use('/api/validations', require('./routes/validation.routes'));
app.use('/api/merchant-requests', require('./routes/merchant-request.routes'));
app.use('/api/bug-reports', require('./routes/bug-report.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/schedules', require('./routes/schedule.routes'));
app.use('/api/social', require('./routes/social.routes'));
app.use('/api/articles', require('./routes/article.routes'));
app.use('/api/stock', require('./routes/stock.routes'));
app.use('/api/stock-photos', require('./routes/stock-photo.routes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Stappa Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ┌─────────────────────────────────────────┐
  │  🍺 Stappa Backend API                  │
  │  Server running on port ${PORT}           │
  │  Environment: ${process.env.NODE_ENV || 'development'}          │
  │  Database: PostgreSQL                   │
  └─────────────────────────────────────────┘
  `);
});

module.exports = app;
