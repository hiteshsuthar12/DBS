const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');

// Helper for generating order numbers
const generateOrderNumber = async () => {
    // Generate a random 4 digit number or simple counter
    // For simplicity here, a 4 digit random
    const random = Math.floor(1000 + Math.random() * 9000);
    return `ORDER #${random}`;
};

// @desc    Create new order (Customer)
// @route   POST /api/orders
// @access  Public
exports.createOrder = async (req, res, next) => {
    try {
        const { tableId, items } = req.body; // array of { menuItemId, quantity }

        if (!tableId || !items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Please provide tableId and items' });
        }

        // 1. Validate Table
        const table = await Table.findOne({ _id: tableId, status: 'ACTIVE' });
        if (!table) {
            return res.status(404).json({ success: false, message: 'Invalid or inactive table' });
        }

        // 2. Validate Items and calculate prices server-side
        let subtotal = 0;
        const processedItems = [];

        for (const item of items) {
            const menuItem = await MenuItem.findOne({ _id: item.menuItemId, isActive: true, isAvailable: true });
            
            if (!menuItem) {
                return res.status(400).json({ success: false, message: `Menu item not available: ${item.menuItemId}` });
            }
            
            if(item.quantity < 1 || item.quantity > 50) {
                return res.status(400).json({ success: false, message: 'Invalid quantity' });
            }

            subtotal += menuItem.price * item.quantity;
            
            processedItems.push({
                menuItem: menuItem._id,
                name: menuItem.name,
                price: menuItem.price, // Snapshot the price
                quantity: item.quantity
            });
        }

        const tax = subtotal * 0.05; // 5% tax
        const total = subtotal + tax;

        const orderNumber = await generateOrderNumber();

        const order = await Order.create({
            orderNumber,
            table: table._id,
            items: processedItems,
            subtotal,
            tax,
            total,
            status: 'PENDING'
        });

        await order.populate('table', 'tableNumber');

        // Emit socket event for Chef dashboard
        const io = req.app.get('socketio');
        if(io){
            io.to('kitchen').emit('order:new', order);
        }

        res.status(201).json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
};

// @desc    Get order by ID (Customer Tracking)
// @route   GET /api/orders/:id
// @access  Public (Should check table match or session in prod, simplified here)
exports.getOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('table', 'tableNumber');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.status(200).json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all orders (Manager / Chef)
// @route   GET /api/orders
// @access  Private (Manager/Chef)
exports.getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find().populate('table', 'tableNumber').sort('-createdAt');
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        next(error);
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Chef/Manager)
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const validStatuses = ['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Simple state machine validation
        // e.g. cannot go from PENDING directly to DELIVERED
        const currentIndex = validStatuses.indexOf(order.status);
        const newIndex = validStatuses.indexOf(status);

        if (status !== 'CANCELLED' && newIndex < currentIndex) {
            return res.status(400).json({ success: false, message: 'Cannot move order status backwards' });
        }

        order.status = status;
        
        // Update timeline
        if(status === 'PREPARING') order.timeline.preparingAt = Date.now();
        if(status === 'READY') order.timeline.readyAt = Date.now();
        if(status === 'DELIVERED') order.timeline.deliveredAt = Date.now();
        if(status === 'CANCELLED') order.timeline.cancelledAt = Date.now();

        await order.save();

        await order.populate('table', 'tableNumber');

        // Emit socket event to notify customer
        const io = req.app.get('socketio');
        if(io){
            io.to(`order_${order._id}`).emit('order:statusUpdate', order);
            // Also notify kitchen/managers of the update
            io.to('kitchen').emit('order:statusUpdate', order);
        }

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
};
