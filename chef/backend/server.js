require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Route files
const authRoutes = require('./src/routes/authRoutes');
const tableRoutes = require('./src/routes/tableRoutes');
const menuRoutes = require('./src/routes/menuRoutes');
const orderRoutes = require('./src/routes/orderRoutes');

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Make io accessible in routers
app.set('socketio', io);

// Socket connections
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Roles/users joining their respective rooms
    socket.on('join_kitchen', () => {
        // In a real app, verify authentication here before joining
        socket.join('kitchen');
        console.log(`Socket ${socket.id} joined kitchen room`);
    });

    socket.on('join_order', (orderId) => {
        socket.join(`order_${orderId}`);
        console.log(`Socket ${socket.id} joined order room order_${orderId}`);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

// Mount Routers
app.use('/api/auth', authRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
