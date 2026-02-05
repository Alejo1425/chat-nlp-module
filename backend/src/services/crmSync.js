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
/**
 * Create a new opportunity in CRM
 */
async function createOpportunity(data) {
    try {
        // Generate a random numeric ID for IDOportunidadAuteco (as recommended > 0)
        const randomId = Math.floor(Math.random() * 1000000) + 1;

        const opportunity = {
            ID: -1, // Always -1 for creation
            NombreContacto: data.name || data.phone || 'Cliente Chat',
            TipoDocumento: data.documentType || 'CC',
            Documento: data.cedula || '',
            Email: data.email || 'sin_email@example.com',
            Telefono2: data.phone || '',
            CodigoDANE: config.crm.defaults.codigoDane,
            IDOportunidadAuteco: randomId.toString(),
            Origen: config.crm.defaults.origen,
            Campanna: data.campaign || config.crm.defaults.campana,
            Establecimiento: config.crm.defaults.establecimiento,
            Productos: [{
                Producto: data.motoModel || 'Interés General',
                Marca: data.brand || 'TVS'
            }],
            Observaciones: `Generado desde Chat NLP. \nNotas: ${data.notes || ''} \nProfesión: ${data.profession || 'No especificada'}`,
            HabeasData: true,
            Sistema: 'mobility',
            NivelInteres: config.crm.defaults.nivelInteres
            // Usuario: config.crm.defaults.usuario // Optional field, omitting to avoid validation errors with 'CHATBOT_NLP'
        };

        logger.info('Sending opportunity to CRM:', opportunity);

        const response = await api.post('/oportunidades/Crear', opportunity);

        if (response.data && response.data.Exitoso) {
            const opportunityId = response.data.IDRegistro;
            logger.info(`Opportunity created successfully. ID: ${opportunityId}`);

            // Automatically add follow-up to set status to "In Process"
            try {
                await addFollowUp(opportunityId, data.notes);
                logger.info(`Opportunity ${opportunityId} status updated to PR (En Proceso)`);
            } catch (followUpError) {
                logger.error(`Failed to update status for opportunity ${opportunityId}:`, followUpError.message);
                // We don't fail the whole request, just log it, as the opportunity IS created.
            }

            return { success: true, id: opportunityId, raw: response.data };
        } else {
            logger.error('CRM returned unsuccessful response:', response.data);
            throw new Error(response.data?.Error?.Mensaje || 'CRM rejected the request');
        }

    } catch (error) {
        // ... existing catch block ...
    }
}

/**
 * Add follow-up to opportunity (change status)
 */
async function addFollowUp(opportunityId, notes) {
    try {
        const followUp = {
            IDOportunidad: opportunityId,
            IDItem: 0,
            Observaciones: notes || 'Oportunidad creada desde Chat NLP - Inicio de proceso',
            UsuarioCreacion: config.crm.defaults.usuario,
            CodigoEstado: 'PR', // PR = En Proceso
            FechaProximoContacto: new Date().toISOString()
        };

        const response = await api.post('/oportunidades/ActualizarSeguimiento', followUp);
        return response.data;
    } catch (error) {
        logger.error('CRM addFollowUp error:', error.response?.data || error.message);
        throw error;
    }
}
// Enhance error with request details for debugging 404s
const debugInfo = {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    config: {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method
    }
};
logger.error('CRM createOpportunity error details:', JSON.stringify(debugInfo, null, 2));

// Attach config info to the error object so route handler sees it
error.debugInfo = debugInfo;
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
