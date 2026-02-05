/**
 * NLP Extractor - Regex-based extraction of client data from chat messages
 * Extracts: name, phone, cedula, email, profession, Auteco motorcycle model
 */

// Auteco motorcycle models catalog
const AUTECO_MODELS = [
    'AK 125', 'AK 150', 'AK 200', 'AKT 125',
    'Bajaj Boxer', 'Bajaj CT', 'Bajaj Platina', 'Bajaj Pulsar',
    'Discover 125', 'Discover 150',
    'Dominar 250', 'Dominar 400',
    'KTM Duke 200', 'KTM Duke 390', 'KTM RC 200', 'KTM RC 390',
    'Husqvarna Svartpilen', 'Husqvarna Vitpilen',
    'TVS Apache', 'TVS Ntorq', 'TVS Raider', 'TVS Sport'
];

// Patterns for extraction
const PATTERNS = {
    // Colombian cedula (8-10 digits, sometimes with dots)
    cedula: /(?:c[eé]dula|cc|documento|identificaci[oó]n)[:\s]*(\d{6,10}|\d{1,3}(?:\.\d{3}){2,3})/gi,
    cedulaStandalone: /\b(\d{6,10})\b/g,

    // Email
    email: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,

    // Colombian phone (10 digits, may start with +57 or 3)
    phone: /(?:\+57|57)?[:\s]*(3\d{9})/g,
    phoneAlt: /(?:tel[eé]fono|celular|m[oó]vil|whatsapp)[:\s]*([\d\s\-]{7,15})/gi,

    // Name patterns (after "me llamo", "soy", "nombre:")
    name: /(?:me llamo|soy|mi nombre es|nombre)[:\s]*([A-ZÁÉÍÓÚÑa-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑa-záéíóúñ]+){0,3})/gi,

    // Profession patterns
    profession: /(?:soy|trabajo como|profesion|ocupaci[oó]n)[:\s]*(?:un[ao]?\s+)?([a-záéíóúñ]+(?:\s+[a-záéíóúñ]+){0,2})/gi
};

/**
 * Extract cedula from text
 */
function extractCedula(text) {
    let match = PATTERNS.cedula.exec(text);
    if (match) {
        return match[1].replace(/\./g, '');
    }

    // Try standalone number if looks like cedula
    const numbers = text.match(PATTERNS.cedulaStandalone);
    if (numbers) {
        const cedula = numbers.find(n => n.length >= 6 && n.length <= 10);
        if (cedula) return cedula;
    }

    return null;
}

/**
 * Extract email from text
 */
function extractEmail(text) {
    const match = text.match(PATTERNS.email);
    return match ? match[0].toLowerCase() : null;
}

/**
 * Extract phone number from text
 */
function extractPhone(text) {
    let match = PATTERNS.phone.exec(text);
    if (match) {
        return match[1].replace(/[\s\-]/g, '');
    }

    match = PATTERNS.phoneAlt.exec(text);
    if (match) {
        return match[1].replace(/[\s\-]/g, '');
    }

    return null;
}

/**
 * Extract name from text
 */
function extractName(text) {
    const match = PATTERNS.name.exec(text);
    if (match) {
        return match[1].trim();
    }
    return null;
}

/**
 * Extract profession from text
 */
function extractProfession(text) {
    const match = PATTERNS.profession.exec(text);
    if (match) {
        const profession = match[1].trim().toLowerCase();
        // Filter out common false positives
        if (!['un', 'una', 'el', 'la', 'de'].includes(profession)) {
            return profession;
        }
    }
    return null;
}

/**
 * Extract Auteco motorcycle model from text
 */
function extractMotoModel(text) {
    const textLower = text.toLowerCase();

    for (const model of AUTECO_MODELS) {
        if (textLower.includes(model.toLowerCase())) {
            return model;
        }
    }

    // Check for partial matches
    const keywords = ['duke', 'pulsar', 'dominar', 'apache', 'boxer', 'discover', 'ntorq', 'raider'];
    for (const keyword of keywords) {
        if (textLower.includes(keyword)) {
            const model = AUTECO_MODELS.find(m => m.toLowerCase().includes(keyword));
            if (model) return model;
        }
    }

    return null;
}

/**
 * Extract all data from text
 */
function extractAll(text) {
    if (!text || typeof text !== 'string') {
        return null;
    }

    const data = {
        name: extractName(text),
        cedula: extractCedula(text),
        email: extractEmail(text),
        phone: extractPhone(text),
        profession: extractProfession(text),
        motoModel: extractMotoModel(text)
    };

    // Only return if at least one field was extracted
    const hasData = Object.values(data).some(v => v !== null);
    return hasData ? data : null;
}

/**
 * Merge extracted data from multiple messages
 */
function mergeExtractedData(existingData, newData) {
    if (!newData) return existingData;
    if (!existingData) return newData;

    return {
        name: newData.name || existingData.name,
        cedula: newData.cedula || existingData.cedula,
        email: newData.email || existingData.email,
        phone: newData.phone || existingData.phone,
        profession: newData.profession || existingData.profession,
        motoModel: newData.motoModel || existingData.motoModel
    };
}

module.exports = {
    extractAll,
    extractName,
    extractCedula,
    extractEmail,
    extractPhone,
    extractProfession,
    extractMotoModel,
    mergeExtractedData,
    AUTECO_MODELS
};
