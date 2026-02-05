module.exports = {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || '*',

    // Database
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        user: process.env.DB_USER || 'chatuser',
        password: process.env.DB_PASSWORD || 'chatpass',
        name: process.env.DB_NAME || 'chatnlp'
    },

    // Evolution API
    evolutionApi: {
        url: process.env.EVOLUTION_API_URL || 'http://localhost:8080',
        apiKey: process.env.EVOLUTION_API_KEY || '',
        instance: process.env.EVOLUTION_INSTANCE || 'default'
    },

    // CRM API
    crm: {
        url: process.env.CRM_API_URL || 'https://apiimpulsa.impulsacrm.com/api/v2',
        apiKey: process.env.CRM_API_KEY || 'yXY9j+MWU2XjERV/0X8NjC1bUgAQoVtNLxYvWxXi4odeoCMkjmi2ZazCshkP6T+s7zQJq41Pj9WPOCZ0kTTEOchaD91P6fcmPG3ok35uSzfznCSclhoNqeiQl9H9NSb+IcfjQ38RehgwBhcbYnE1sdhxHIROYq26i9/y6kVSjBA=',
        defaults: {
            establecimiento: process.env.CRM_ESTABLECIMIENTO || '550026948',
            origen: process.env.CRM_ORIGEN || 'SOCIO COMERCIAL',
            campana: process.env.CRM_CAMPANA || 'REDES COLOMBIANO',
            codigoDane: process.env.CRM_CODIGO_DANE || '05001',
            usuario: process.env.CRM_USUARIO || 'CHATBOT_NLP',
            nivelInteres: 'AA'
        }
    }
};
