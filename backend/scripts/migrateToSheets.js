/**
 * Migration Script: Copy existing JSON data into Google Sheets
 * 
 * Usage: 
 *   1. Make sure your .env has GOOGLE_SCRIPT_URL set
 *   2. Run: node scripts/migrateToSheets.js
 * 
 * This will read products.json and inquiries.json and push all data
 * to your Google Sheet via the Apps Script web app.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const googleSheets = require('../services/googleSheets');

async function migrate() {
    console.log('🚀 Starting migration to Google Sheets...\n');

    // Check connection
    const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;
    if (!SCRIPT_URL || SCRIPT_URL.includes('YOUR_DEPLOYMENT_ID_HERE')) {
        console.error('❌ Error: Please set GOOGLE_SCRIPT_URL in your .env file first!');
        console.error('   Follow the setup guide to deploy your Apps Script and get the URL.');
        process.exit(1);
    }

    // Read existing JSON data
    const productsPath = path.join(__dirname, '../data/products.json');
    const inquiriesPath = path.join(__dirname, '../data/inquiries.json');

    let products = [];
    let inquiries = [];

    try {
        products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
        console.log(`📦 Found ${products.length} products in products.json`);
    } catch (err) {
        console.warn('⚠️  Could not read products.json:', err.message);
    }

    try {
        inquiries = JSON.parse(fs.readFileSync(inquiriesPath, 'utf-8'));
        console.log(`📋 Found ${inquiries.length} inquiries in inquiries.json`);
    } catch (err) {
        console.warn('⚠️  Could not read inquiries.json:', err.message);
    }

    if (products.length === 0 && inquiries.length === 0) {
        console.log('\n⚠️  No data to migrate. Exiting.');
        return;
    }

    // Send to Google Sheets
    console.log('\n📤 Sending data to Google Sheets...');

    try {
        const result = await googleSheets.migrateData(products, inquiries);

        if (result.error) {
            console.error('❌ Migration failed:', result.error);
            process.exit(1);
        }

        console.log('\n✅ Migration complete!');
        console.log(`   Products migrated: ${result.migrated.products}`);
        console.log(`   Inquiries migrated: ${result.migrated.inquiries}`);
        console.log('\n📊 Open your Google Sheet to verify the data.');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

migrate();
