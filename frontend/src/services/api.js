import axios from 'axios';
import { io } from 'socket.io-client';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || '/api';

// Axios instance
export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Socket.IO client
export const socket = io(window.location.origin, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
});

// API helpers
export const messagesApi = {
    getContacts: () => api.get('/messages/contacts'),
    getHistory: (contactId, limit = 50) =>
        api.get(`/messages/history/${encodeURIComponent(contactId)}`, { params: { limit } }),
    send: (to, text, mediaUrl, mediaType) =>
        api.post('/messages/send', { to, text, mediaUrl, mediaType })
};

export const crmApi = {
    createOpportunity: (data) => api.post('/crm/opportunity', data),
    getInventory: (params) => api.get('/crm/inventory', { params }),
    getMotorcycleDetails: (modelId) => api.get(`/crm/inventory/${modelId}`)
};

export default { api, socket, messagesApi, crmApi };
