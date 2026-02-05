
const path = require('path');
// Load env vars manually since we are running standalone
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const crmSync = require('../services/crmSync');
const logger = require('../utils/logger');

const ids = process.argv.slice(2);

if (ids.length === 0) {
    console.log('\n❌ Por favor proporciona los IDs a actualizar.');
    console.log('Uso: node scripts/manual_update.js <ID1> <ID2> ...');
    console.log('Ejemplo: node scripts/manual_update.js 12345 67890\n');
    process.exit(1);
}

async function run() {
    console.log(`\n🚀 Iniciando actualización manual para ${ids.length} oportunidades...\n`);

    for (const id of ids) {
        try {
            process.stdout.write(`⏳ Actualizando ID ${id}... `);
            await crmSync.addFollowUp(id, 'Actualización manual de estado a En Proceso (Script)');
            console.log('✅ ÉXITO');
        } catch (error) {
            console.log('❌ FALLÓ');
            console.error(`   Error: ${error.message}\n`);
        }
    }
    console.log('\n🏁 Proceso finalizado.\n');
}

run();
