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
        url: process.env.CRM_API_URL || 'http://localhost:8081',
        apiKey: process.env.CRM_API_KEY || ''
    }
};
