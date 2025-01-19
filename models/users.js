//model for users

const pool = require('../db/db');
const jwt = require('jsonwebtoken');

// Login User
const loginUser = async (username, password) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
        if (result.rows.length === 0) {
            throw new Error('Invalid username or password');
        }

        const user = result.rows[0];
        
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return { 
            user: {
                id: user.id, 
                username: user.username, 
                email: user.email
            }, token 
        };
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
}

// Get User if logged in
const getUser = async (userId) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            throw new Error('User does not exist');
        }
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
}

// Create User
const createUser = async (username, email, password) => {
    try {
        // validate required fields
        if (!username || !email || !password) {
            throw new Error('missing required fields');
        }
        // Check if username already exists
        const userCheck = await pool.query(
            'SELECT username FROM users WHERE username = $1 AND email = $2',
            [username, email]
        );
        if (userCheck.rows.length > 0) {
            throw new Error('User already exists');
        }
        const result = await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *', [username, email, password]);
        const user = result.rows[0];
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            },
            token
        };
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

module.exports = {
    loginUser,
    getUser,
    createUser
};