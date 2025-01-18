require('dotenv').config();
const express = require('express');
const db = require('./db/db');
const app = express();

// Middleware //
// parse JSON
app.use(express.json());

// test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Notes API' });
});

//test db connection
app.get('/test-db', async (req, res) => {
    try {
      const result = await db.query('SELECT NOW()');
      res.json({ message: 'Database connected successfully', timestamp: result.rows[0].now });
    } catch (err) {
      res.status(500).json({ error: 'Database connection failed', details: err.message });
    }
  });

// Define port
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
