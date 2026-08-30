const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    }
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    table: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Table',
        required: true
    },
    items: [orderItemSchema],
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    tax: {
        type: Number,
        required: true,
        min: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'],
        default: 'PENDING'
    },
    // We can track timeline for analytics
    timeline: {
        placedAt: { type: Date, default: Date.now },
        preparingAt: { type: Date },
        readyAt: { type: Date },
        deliveredAt: { type: Date },
        cancelledAt: { type: Date }
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
