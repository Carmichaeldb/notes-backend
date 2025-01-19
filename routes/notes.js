const express = require('express');
const router = express.Router();
const noteModel = require('../models/notes');
const authToken = require('../middleware/auth');

// Protect all routes
router.use(authToken);

// Get all notes
router.get('/api/notes', async (req, res) => {
});

// Get specific note
router.get('/api/notes/:id', async (req, res) => {
});

// Create note
router.post('/api/notes', async (req, res) => {
});

// Update note
router.put('/api/notes/:id', async (req, res) => {
});

// Delete note
router.delete('/api/notes/:id', async (req, res) => {
});

// Share note
router.post('/api/notes/:id/share', async (req, res) => {
});

// Search notes
router.get('/api/search', async (req, res) => {
});

module.exports = router;