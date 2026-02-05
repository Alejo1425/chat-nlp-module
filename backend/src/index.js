require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const config = require('./config');
const logger = require('./utils/logger');

// Routes
const webhookRoutes = require('./routes/webhook');
const messagesRoutes = require('./routes/messages');
const crmRoutes = require('./routes/crm');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin: config.corsOrigin,
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/webhook', webhookRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/crm', crmRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on('join-conversation', (conversationId) => {
        socket.join(`conversation-${conversationId}`);
        logger.info(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    socket.on('leave-conversation', (conversationId) => {
        socket.leave(`conversation-${conversationId}`);
    });

    socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
    });
});

// Start server
server.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`);
});

module.exports = { app, io };
