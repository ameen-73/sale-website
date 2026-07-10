/**
 * Migration Script: Copy existing JSON data into Supabase
 * 
 * Usage:
 *   1. Make sure your .env has SUPABASE_URL and SUPABASE_KEY set
 *   2. Run: node scripts/migrateToSupabase.js
 */

const path = require('path');
const fs = require('fs');
const supabase = require('../services/supabase');

async function migrate() {
    console.log('🚀 Starting migration to Supabase...\n');

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || supabaseUrl.includes('your-project-id')) {
        console.error('❌ Error: Please configure SUPABASE_URL and SUPABASE_KEY in backend/.env first!');
        process.exit(1);
    }

    // Paths to data
    const productsPath = path.join(__dirname, '../data/products.json');
    const inquiriesPath = path.join(__dirname, '../data/inquiries.json');

    let products = [];
    let inquiries = [];

    // 1. Read products
    try {
        if (fs.existsSync(productsPath)) {
            products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
            console.log(`📦 Read ${products.length} products from products.json`);
        } else {
            console.warn('⚠️  products.json not found, skipping products migration.');
        }
    } catch (err) {
        console.error('❌ Error reading products.json:', err.message);
    }

    // 2. Read inquiries
    try {
        if (fs.existsSync(inquiriesPath)) {
            inquiries = JSON.parse(fs.readFileSync(inquiriesPath, 'utf-8'));
            console.log(`📋 Read ${inquiries.length} inquiries from inquiries.json`);
        } else {
            console.warn('⚠️  inquiries.json not found, skipping inquiries migration.');
        }
    } catch (err) {
        console.error('❌ Error reading inquiries.json:', err.message);
    }

    // 3. Migrate Products
    if (products.length > 0) {
        console.log('\n📤 Migrating products to Supabase...');
        // Ensure properties match PostgreSQL schema exactly
        const formattedProducts = products.map(p => ({
            id: p.id,
            title: p.title,
            category: p.category,
            price: Number(p.price),
            description: p.description,
            images: Array.isArray(p.images) ? p.images : [],
            inventory: Number(p.inventory) || 0,
            featured: !!p.featured,
            rating: Number(p.rating) || 0,
            reviews: p.reviews || [],
            createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString()
        }));

        const { data, error } = await supabase
            .from('products')
            .upsert(formattedProducts, { onConflict: 'id' });

        if (error) {
            console.error('❌ Error migrating products:', error.message);
        } else {
            console.log(`✅ Successfully upserted ${formattedProducts.length} products to Supabase.`);
        }
    }

    // 4. Migrate Inquiries
    if (inquiries.length > 0) {
        console.log('\n📤 Migrating inquiries to Supabase...');
        const formattedInquiries = inquiries.map(i => ({
            id: i.id,
            name: i.name,
            email: i.email,
            phone: i.phone || null,
            city: i.city || null,
            roomType: i.roomType || null,
            houseSize: i.houseSize || null,
            budget: i.budget || null,
            style: i.style || null,
            details: i.details || null,
            preferredDate: i.preferredDate || null,
            status: i.status || 'pending',
            createdAt: i.createdAt ? new Date(i.createdAt).toISOString() : new Date().toISOString(),
            notes: i.notes || null
        }));

        const { data, error } = await supabase
            .from('inquiries')
            .upsert(formattedInquiries, { onConflict: 'id' });

        if (error) {
            console.error('❌ Error migrating inquiries:', error.message);
        } else {
            console.log(`✅ Successfully upserted ${formattedInquiries.length} inquiries to Supabase.`);
        }
    }

    console.log('\n🏁 Migration process completed!');
}

migrate();
