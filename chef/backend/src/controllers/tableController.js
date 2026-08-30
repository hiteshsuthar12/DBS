const Table = require('../models/Table');
const crypto = require('crypto');

// @desc    Get all tables
// @route   GET /api/tables
// @access  Private/Manager
exports.getTables = async (req, res, next) => {
    try {
        const tables = await Table.find().sort('tableNumber');
        res.status(200).json({ success: true, data: tables });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single table
// @route   GET /api/tables/:id
// @access  Private/Manager
exports.getTable = async (req, res, next) => {
    try {
        const table = await Table.findById(req.params.id);
        if (!table) {
            return res.status(404).json({ success: false, message: 'Table not found' });
        }
        res.status(200).json({ success: true, data: table });
    } catch (error) {
        next(error);
    }
};

// @desc    Create table
// @route   POST /api/tables
// @access  Private/Manager
exports.createTable = async (req, res, next) => {
    try {
        const { tableNumber, capacity } = req.body;
        
        // Generate a secure random token for the QR code
        const qrToken = crypto.randomBytes(16).toString('hex');
        
        const table = await Table.create({
            tableNumber,
            capacity,
            qrToken
        });

        res.status(201).json({ success: true, data: table });
    } catch (error) {
        next(error);
    }
};

// @desc    Update table
// @route   PUT /api/tables/:id
// @access  Private/Manager
exports.updateTable = async (req, res, next) => {
    try {
        const { tableNumber, capacity, status } = req.body;
        const table = await Table.findByIdAndUpdate(req.params.id, {
            tableNumber, capacity, status
        }, {
            new: true,
            runValidators: true
        });

        if (!table) {
            return res.status(404).json({ success: false, message: 'Table not found' });
        }

        res.status(200).json({ success: true, data: table });
    } catch (error) {
        next(error);
    }
};

// @desc    Validate table by QR Token (Customer)
// @route   GET /api/tables/validate/:qrToken
// @access  Public
exports.validateTable = async (req, res, next) => {
    try {
        const table = await Table.findOne({ qrToken: req.params.qrToken, status: 'ACTIVE' });
        if (!table) {
            return res.status(404).json({ success: false, message: 'Invalid or inactive table' });
        }
        
        // Don't send sensitive info back to customer
        res.status(200).json({
            success: true,
            data: {
                _id: table._id,
                tableNumber: table.tableNumber
            }
        });
    } catch (error) {
        next(error);
    }
};
