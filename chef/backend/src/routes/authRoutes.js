const express = require('express');
const { login, getMe, logout, register } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: 'Too many login attempts, please try again later'
});

router.post('/login', loginLimiter, login);
router.post('/register', register); // Normally restricted, kept open for initial setup
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
