const express = require('express');
const { createOrder, getOrder, getOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const orderLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many orders created from this IP, please try again later'
});

// Public customer routes
router.post('/', orderLimiter, createOrder);
router.get('/:id', getOrder); // Can be accessed with Order ID.

// Protected routes (Chef / Manager)
router.use(protect);
router.use(authorize('CHEF', 'MANAGER'));

router.get('/', getOrders);
router.put('/:id/status', updateOrderStatus);

module.exports = router;
