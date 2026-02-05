const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

const api = axios.create({
    baseURL: config.crm.url,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.crm.apiKey}`
    }
});

/**
 * Create a new opportunity in CRM
 */
async function createOpportunity(data) {
    try {
        const opportunity = {
            title: `Oportunidad - ${data.name || data.phone || 'Sin nombre'}`,
            contact: {
                name: data.name,
                phone: data.phone,
                cedula: data.cedula,
                email: data.email,
                profession: data.profession
            },
            product: {
                model: data.motoModel,
                type: 'motorcycle'
            },
            source: 'whatsapp-chat',
            notes: data.notes || '',
            status: 'new',
            createdAt: new Date().toISOString()
        };

        const response = await api.post('/opportunities', opportunity);
        logger.info(`Opportunity created: ${response.data.id}`);
        return response.data;
    } catch (error) {
        logger.error('CRM createOpportunity error:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Get motorcycle inventory from CRM
 */
async function getInventory({ category, search } = {}) {
    try {
        const params = {};
        if (category) params.category = category;
        if (search) params.search = search;

        const response = await api.get('/inventory/motorcycles', { params });
        return response.data || [];
    } catch (error) {
        logger.error('CRM getInventory error:', error.response?.data || error.message);

        // Return mock data if CRM is unavailable
        return getMockInventory(search);
    }
}

/**
 * Get specific motorcycle details
 */
async function getMotorcycleDetails(modelId) {
    try {
        const response = await api.get(`/inventory/motorcycles/${modelId}`);
        return response.data;
    } catch (error) {
        logger.error('CRM getMotorcycleDetails error:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Mock inventory for development/fallback
 */
function getMockInventory(search = '') {
    const inventory = [
        { id: '1', model: 'Bajaj Pulsar NS 200', price: 12500000, stock: 5, category: 'Sport' },
        { id: '2', model: 'Dominar 400', price: 21000000, stock: 3, category: 'Touring' },
        { id: '3', model: 'KTM Duke 200', price: 18500000, stock: 2, category: 'Sport' },
        { id: '4', model: 'TVS Apache RTR 200', price: 14000000, stock: 4, category: 'Sport' },
        { id: '5', model: 'Bajaj Boxer CT 100', price: 5500000, stock: 8, category: 'Economy' },
        { id: '6', model: 'Discover 125', price: 7200000, stock: 6, category: 'Economy' },
        { id: '7', model: 'KTM RC 390', price: 28000000, stock: 1, category: 'Sport' },
        { id: '8', model: 'TVS Ntorq 125', price: 9800000, stock: 4, category: 'Scooter' }
    ];

    if (search) {
        const searchLower = search.toLowerCase();
        return inventory.filter(item =>
            item.model.toLowerCase().includes(searchLower) ||
            item.category.toLowerCase().includes(searchLower)
        );
    }

    return inventory;
}

module.exports = {
    createOpportunity,
    getInventory,
    getMotorcycleDetails
};
