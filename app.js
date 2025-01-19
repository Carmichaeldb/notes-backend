require('dotenv').config();
const express = require('express');
const app = express();
const users = require('./routes/users');
// const notes = require('./routes/notes');

// Middleware //
// parse JSON
app.use(express.json());

app.use('/api/auth', users);
// app.use('/api/', notes);

// test route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Notes API' });
  });

module.exports = app; 