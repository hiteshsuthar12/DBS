const User = require('../models/User');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '1d',
    });
};

const sendTokenResponse = (user, statusCode, res) => {
    const token = generateToken(user._id, user.role);
    
    const options = {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    };

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            data: user
        });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide an email and password' });
        }

        const user = await User.findOne({ email }).select('+passwordHash');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await argon2.verify(user.passwordHash, password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Log user out / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ success: true, data: {} });
};

// @desc    Register user (For initial setup mostly, typically Manager creates other accounts)
// @route   POST /api/auth/register
// @access  Public (Should be protected in prod, but keeping open for demo setup)
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        
        // Prevent random roles
        if(!['MANAGER', 'CHEF'].includes(role)){
            return res.status(400).json({success: false, message: 'Invalid role'});
        }

        const existingUser = await User.findOne({ email });
        if(existingUser) {
             return res.status(400).json({success: false, message: 'Email already in use'});
        }

        const passwordHash = await argon2.hash(password);
        const user = await User.create({
            name,
            email,
            passwordHash,
            role
        });

        sendTokenResponse(user, 201, res);
    } catch (error) {
        next(error);
    }
};
