const rateLimit = require('express-rate-limit');

const isDevelopment = process.env.NODE_ENV !== 'production';

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDevelopment ? 1000 : 200,
    message: 'Preveč zahtev, poskusi znova kasneje.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === 'GET' || isDevelopment === false && req.path.includes('/health')
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDevelopment ? 50 : 15,
    message: 'Preveč poskusov, poskusi znova čez 15 minut.',
    standardHeaders: true,
    legacyHeaders: false,

});

module.exports = { generalLimiter, authLimiter };