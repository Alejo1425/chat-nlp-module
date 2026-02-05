const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

const api = axios.create({
    baseURL: `${config.evolutionApi.url}`,
    headers: {
        'Content-Type': 'application/json',
        'apikey': config.evolutionApi.apiKey
    }
});

const instance = config.evolutionApi.instance;

/**
 * Send a text message
 */
async function sendText(to, text) {
    try {
        const response = await api.post(`/message/sendText/${instance}`, {
            number: to,
            text
        });
        return response.data;
    } catch (error) {
        logger.error('Evolution API sendText error:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Send media (image, video, document)
 */
async function sendMedia(to, mediaUrl, mediaType = 'image', caption = '') {
    try {
        const endpoint = mediaType === 'image' ? 'sendImage' :
            mediaType === 'video' ? 'sendVideo' : 'sendDocument';

        const response = await api.post(`/message/${endpoint}/${instance}`, {
            number: to,
            mediaUrl,
            caption
        });
        return response.data;
    } catch (error) {
        logger.error('Evolution API sendMedia error:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Get contacts/chats list
 */
async function getContacts() {
    try {
        // Try findChats endpoint (more common in Evolution API v2)
        const response = await api.post(`/chat/findChats/${instance}`, {});
        const chats = response.data || [];

        logger.info(`Found ${chats.length} chats from Evolution API`);

        // Transform to expected format - Evolution API structure
        return chats.map(chat => {
            const id = chat.remoteJid || chat.id;
            const name = chat.pushName || chat.name || id?.split('@')[0] || 'Sin nombre';

            return {
                id: id,
                name: name,
                lastMessage: chat.lastMessage ? { text: chat.lastMessage.content || '' } : null,
                unreadCount: chat.unreadCount || 0
            };
        }).filter(chat => chat.id); // Filter out any without ID
    } catch (error) {
        logger.error('Evolution API getContacts error:', error.response?.data || error.message);
        // Return empty array instead of throwing to avoid breaking the UI
        return [];
    }
}



/**
 * Get messages for a contact
 */
async function getMessages(contactId, limit = 50) {
    try {
        // Ensure contactId has the @s.whatsapp.net suffix
        const remoteJid = contactId.includes('@') ? contactId : `${contactId}@s.whatsapp.net`;

        logger.info(`Fetching messages for: ${remoteJid}`);

        const response = await api.post(`/chat/findMessages/${instance}`, {
            where: {
                key: {
                    remoteJid: remoteJid
                }
            },
            limit
        });

        // Handle Evolution API response structure: { messages: { records: [] } }
        let messages = [];
        if (response.data?.messages?.records) {
            messages = response.data.messages.records;
        } else if (Array.isArray(response.data?.messages)) {
            messages = response.data.messages;
        } else if (Array.isArray(response.data)) {
            messages = response.data;
        }

        logger.info(`Found ${messages.length} messages for ${remoteJid}`);

        // Transform messages to expected format
        return messages.map(msg => ({
            id: msg.key?.id || msg.id,
            from: msg.key?.remoteJid || remoteJid,
            fromMe: msg.key?.fromMe || false,
            text: msg.message?.conversation ||
                msg.message?.extendedTextMessage?.text ||
                msg.content ||
                '[Mensaje multimedia]',
            timestamp: msg.messageTimestamp || msg.timestamp || Date.now()
        }));
    } catch (error) {
        logger.error('Evolution API getMessages error:', error.response?.data || error.message);
        // Return empty array instead of throwing to avoid breaking the UI
        return [];
    }
}



/**
 * Get connection status
 */
async function getConnectionStatus() {
    try {
        const response = await api.get(`/instance/connectionState/${instance}`);
        return response.data;
    } catch (error) {
        logger.error('Evolution API getConnectionStatus error:', error.response?.data || error.message);
        throw error;
    }
}

module.exports = {
    sendText,
    sendMedia,
    getContacts,
    getMessages,
    getConnectionStatus
};
