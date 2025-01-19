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
    try {
        const note = await noteModel.deleteUserNote(req.user.id, req.params.id);
        res.status(200).json({ message: 'Note deleted successfully' });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Share note
router.post('/notes/:id/share', async (req, res) => {
    try {
        const { sharedWith } = req.body;
        
        if (!sharedWith) {
            return res.status(400).json({ error: 'Missing sharedWith' });
        }

        const result = await noteModel.shareUserNote(
            req.user.id,
            req.params.id,
            sharedWith
        );

        res.status(200).json({ message: 'Note shared successfully' });
    } catch (error) {
        if (error.message === 'Note not found' || error.message === 'User not found') {
            res.status(404).json({ error: error.message });
        } else if (error.message === 'Note already shared with this user') {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// Search notes
router.get('/search', async (req, res) => {
        try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const notes = await noteModel.searchUserNotes(req.user.id, query);
        res.status(200).json(notes || []);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;