const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const nlpExtractor = require('../services/nlpExtractor');

/**
 * POST /api/webhook
 * Recibe eventos de Evolution API (mensajes entrantes, etc.)
 */
router.post('/', async (req, res) => {
    try {
        const event = req.body;
        const io = req.app.get('io');

        logger.debug('Webhook received:', JSON.stringify(event, null, 2));

        // Handle different event types
        if (event.event === 'messages.upsert') {
            const message = event.data;

            // Extract NLP data from incoming messages
            let extractedData = null;
            if (message.message?.conversation || message.message?.extendedTextMessage?.text) {
                const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
                extractedData = nlpExtractor.extractAll(text);
            }

            // Emit to connected clients
            io.emit('new-message', {
                conversationId: message.key?.remoteJid,
                message: {
                    id: message.key?.id,
                    from: message.key?.remoteJid,
                    fromMe: message.key?.fromMe || false,
                    text: message.message?.conversation || message.message?.extendedTextMessage?.text || '',
                    timestamp: message.messageTimestamp,
                    extractedData
                }
            });

            logger.info(`Message received from ${message.key?.remoteJid}`);
        }

        // Handle connection status updates
        if (event.event === 'connection.update') {
            io.emit('connection-status', event.data);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        logger.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
