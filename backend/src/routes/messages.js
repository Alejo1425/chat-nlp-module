const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const evolutionApi = require('../services/evolutionApi');

/**
 * GET /api/messages/contacts
 * Get all contacts/conversations
 */
router.get('/contacts', async (req, res) => {
    try {
        const contacts = await evolutionApi.getContacts();
        res.json(contacts);
    } catch (error) {
        logger.error('Error fetching contacts:', error);
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
});

/**
 * GET /api/messages/history/:contactId
 * Get message history for a specific contact
 */
router.get('/history/:contactId', async (req, res) => {
    try {
        const { contactId } = req.params;
        const { limit = 50 } = req.query;

        const messages = await evolutionApi.getMessages(contactId, parseInt(limit, 10));
        res.json(messages);
    } catch (error) {
        logger.error('Error fetching message history:', error);
        res.status(500).json({ error: 'Failed to fetch message history' });
    }
});

/**
 * POST /api/messages/send
 * Send a message to a contact
 */
router.post('/send', async (req, res) => {
    try {
        const { to, text, mediaUrl, mediaType } = req.body;
        const io = req.app.get('io');

        if (!to || !text) {
            return res.status(400).json({ error: 'Missing required fields: to, text' });
        }

        let result;
        if (mediaUrl) {
            result = await evolutionApi.sendMedia(to, mediaUrl, mediaType, text);
        } else {
            result = await evolutionApi.sendText(to, text);
        }

        // Emit sent message to connected clients
        io.emit('message-sent', {
            conversationId: to,
            message: {
                id: result.key?.id,
                to,
                text,
                fromMe: true,
                timestamp: Date.now()
            }
        });

        logger.info(`Message sent to ${to}`);
        res.json({ success: true, messageId: result.key?.id });
    } catch (error) {
        logger.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

module.exports = router;
