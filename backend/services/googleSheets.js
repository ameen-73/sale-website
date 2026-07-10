const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

if (!SCRIPT_URL) {
    console.warn('⚠️  GOOGLE_SCRIPT_URL not set in .env — Google Sheets integration will not work');
}

// ============================================================
// GET requests (read data)
// ============================================================

async function fetchFromSheet(action, params = {}) {
    const url = new URL(SCRIPT_URL);
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString(), {
        method: 'GET',
        redirect: 'follow', // Apps Script redirects on deploy
    });

    if (!response.ok) {
        throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

// ============================================================
// POST requests (write data)
// ============================================================

async function postToSheet(body) {
    const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain' }, // Apps Script requires text/plain for CORS
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

// ============================================================
// Products
// ============================================================

async function getProducts() {
    return fetchFromSheet('getProducts');
}

async function getProductById(id) {
    return fetchFromSheet('getProduct', { id });
}

async function addProduct(productData) {
    return postToSheet({
        action: 'addProduct',
        data: productData,
    });
}

async function updateProduct(id, productData) {
    return postToSheet({
        action: 'updateProduct',
        id: id,
        data: productData,
    });
}

async function deleteProduct(id) {
    return postToSheet({
        action: 'deleteProduct',
        id: id,
    });
}

// ============================================================
// Inquiries
// ============================================================

async function getInquiries() {
    return fetchFromSheet('getInquiries');
}

async function getInquiryById(id) {
    return fetchFromSheet('getInquiry', { id });
}

async function addInquiry(inquiryData) {
    return postToSheet({
        action: 'addInquiry',
        data: inquiryData,
    });
}

async function updateInquiry(id, inquiryData) {
    return postToSheet({
        action: 'updateInquiry',
        id: id,
        data: inquiryData,
    });
}

// ============================================================
// Migration
// ============================================================

async function migrateData(products, inquiries) {
    return postToSheet({
        action: 'migrate',
        products: products,
        inquiries: inquiries,
    });
}

// ============================================================
// Test connection
// ============================================================

async function testConnection() {
    try {
        const products = await getProducts();
        console.log(`✅ Google Sheets connected. Found ${Array.isArray(products) ? products.length : 0} products.`);
        return true;
    } catch (error) {
        console.error('❌ Google Sheets connection failed:', error.message);
        return false;
    }
}

module.exports = {
    getProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    getInquiries,
    getInquiryById,
    addInquiry,
    updateInquiry,
    migrateData,
    testConnection,
};
