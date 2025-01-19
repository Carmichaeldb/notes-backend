const rateLimit = require('express-rate-limit');

// General limiter for all routes
const apiLimiter = rateLimit({
    windowMs: 1000,
    max: 50,
    message: { error: 'Too many requests, please try again later.' }
});

// Stricter limiter for auth routes
const authLimiter = rateLimit({
    windowMs: 1000,
    max: 10,
    message: { error: 'Too many login attempts, please try again later.' }
});

module.exports = { apiLimiter, authLimiter }; 