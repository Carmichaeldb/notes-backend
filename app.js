require('dotenv').config();
const express = require('express');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const app = express();
const users = require('./routes/users');
const notes = require('./routes/notes');

// Middleware //
// parse JSON
app.use(express.json());

// Rate Limiter //
app.use('/api/auth/', authLimiter);
app.use('/api/', apiLimiter);

// Routes //
app.use('/api/auth', users);
app.use('/api/', notes);


// test route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Notes API' });
  });

module.exports = app; 