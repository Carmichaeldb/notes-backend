const express = require('express');
const router = express.Router();
const noteModel = require('../models/notes');
const authToken = require('../middleware/auth');

// Protect all routes
router.use(authToken);

// Get all notes
router.get('/notes', async (req, res) => { 
    try {
        const notes = await noteModel.getUsersNotes(req.user.id);
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get specific note
router.get('/notes/:id', async (req, res) => {
    try {
        const note = await noteModel.getNoteById(req.user.id, req.params.id);
        // Check if note belongs to user
        if (note.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        res.status(200).json(note);
    } catch (error) {
            res.status(404).json({ error: error.message });
    }
});

// Create note
router.post('/notes', async (req, res) => {
    try {
        const { title, content } = req.body;
        const note = await noteModel.createUserNote(req.user.id, title, content);
        res.status(201).json(note);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Update note
router.put('/notes/:id', async (req, res) => {
    try {
        const { title, content } = req.body;
        const note = await noteModel.updateUserNote(req.user.id, req.params.id, title, content);
        res.status(200).json(note);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Delete note
router.delete('/notes/:id', async (req, res) => {
});

// Share note
router.post('/notes/:id/share', async (req, res) => {
});

// Search notes
router.get('/search', async (req, res) => {
});

module.exports = router;