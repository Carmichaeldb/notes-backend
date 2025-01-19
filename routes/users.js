const express = require('express');
const router = express.Router();
const userModel = require('../models/users');

// Login user
router.post('api/auth/login', async (req, res) => { 

});

// Register new user
router.post('api/auth/signup', async (req, res) => { 

});

module.exports = router;