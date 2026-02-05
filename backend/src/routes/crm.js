const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const crmSync = require('../services/crmSync');

/**
 * POST /api/crm/opportunity
 * Create a new opportunity in CRM
 */
router.post('/opportunity', async (req, res) => {
    try {
        const { contactId, extractedData, notes } = req.body;

        if (!contactId || !extractedData) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const opportunity = await crmSync.createOpportunity({
            contactId,
            name: extractedData.name,
            phone: extractedData.phone,
            cedula: extractedData.cedula,
            email: extractedData.email,
            profession: extractedData.profession,
            motoModel: extractedData.motoModel,
            documentType: extractedData.documentType,
            brand: extractedData.brand,
            campaign: extractedData.campaign,
            notes
        });

        logger.info(`Opportunity created for contact ${contactId}`);
        res.json({ success: true, opportunityId: opportunity.id });
    } catch (error) {
        // Detailed logging for debugging
        console.error('CRM OPPORTUNITY ERROR:', JSON.stringify(error.response?.data || error.message, null, 2));
        logger.error('Error creating opportunity:', error);
        res.status(500).json({
            error: 'Failed to create opportunity',
            details: error.message,
            crmError: error.response?.data || 'No CRM response data',
            debug: error.debugInfo
        });
    }
});

/**
 * GET /api/crm/inventory
 * Get Auteco motorcycle inventory
 */
router.get('/inventory', async (req, res) => {
    try {
        const { category, search } = req.query;
        const inventory = await crmSync.getInventory({ category, search });
        res.json(inventory);
    } catch (error) {
        logger.error('Error fetching inventory:', error);
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});

/**
 * GET /api/crm/inventory/:modelId
 * Get specific motorcycle details
 */
router.get('/inventory/:modelId', async (req, res) => {
    try {
        const { modelId } = req.params;
        const model = await crmSync.getMotorcycleDetails(modelId);

        if (!model) {
            return res.status(404).json({ error: 'Model not found' });
        }

        res.json(model);
    } catch (error) {
        logger.error('Error fetching motorcycle details:', error);
        res.status(500).json({ error: 'Failed to fetch motorcycle details' });
    }
});

module.exports = router;
