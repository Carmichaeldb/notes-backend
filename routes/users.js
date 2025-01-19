const express = require('express');
const router = express.Router();
const userModel = require('../models/users');

// Login user
router.post('/login', async (req, res) => { 
    try {
        const { username, password } = req.body;
        const result = await userModel.loginUser(username, password);
        res.json(result);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

// Register new user
router.post('/signup', async (req, res) => { 
    try {
        const { username, email, password } = req.body;
        const result = await userModel.createUser(username, email, password);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;