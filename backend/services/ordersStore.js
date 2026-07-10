const fs = require('fs');
const path = require('path');
const supabase = require('./supabase');

const ordersJsonPath = path.join(__dirname, '../data/orders.json');

// Initialize local file if it doesn't exist
function initLocalFile() {
    const dir = path.dirname(ordersJsonPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(ordersJsonPath)) {
        fs.writeFileSync(ordersJsonPath, JSON.stringify([], null, 4), 'utf-8');
    }
}

// Check if orders table exists in Supabase
let useSupabase = null; // null means untested, true/false means verified

async function checkSupabaseConnection() {
    if (useSupabase !== null) return useSupabase;
    try {
        const { error } = await supabase.from('orders').select('id').limit(1);
        if (error && error.code === 'PGRST205') {
            console.warn('⚠️  orders table not found in Supabase. Using local JSON store fallback.');
            useSupabase = false;
        } else if (error) {
            console.warn('⚠️  Supabase query error, using local JSON store fallback:', error.message);
            useSupabase = false;
        } else {
            console.log('✅ Connected to Supabase orders table.');
            useSupabase = true;
        }
    } catch (err) {
        console.warn('⚠️  Could not connect to Supabase orders. Using local JSON store fallback.');
        useSupabase = false;
    }
    return useSupabase;
}

const ordersStore = {
    async getAll(filters = {}) {
        const isDb = await checkSupabaseConnection();
        if (isDb) {
            let query = supabase.from('orders').select('*');
            if (filters.status && filters.status !== 'all') {
                query = query.eq('orderStatus', filters.status);
            }
            if (filters.paymentStatus && filters.paymentStatus !== 'all') {
                query = query.eq('paymentStatus', filters.paymentStatus);
            }
            if (filters.search) {
                query = query.or(`customerName.ilike.%${filters.search}%,customerEmail.ilike.%${filters.search}%,id.ilike.%${filters.search}%`);
            }
            query = query.order('createdAt', { ascending: false });
            
            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        } else {
            initLocalFile();
            let data = JSON.parse(fs.readFileSync(ordersJsonPath, 'utf-8'));
            
            // Filter
            if (filters.status && filters.status !== 'all') {
                data = data.filter(o => o.orderStatus === filters.status);
            }
            if (filters.paymentStatus && filters.paymentStatus !== 'all') {
                data = data.filter(o => o.paymentStatus === filters.paymentStatus);
            }
            if (filters.search) {
                const s = filters.search.toLowerCase();
                data = data.filter(o => 
                    (o.customerName && o.customerName.toLowerCase().includes(s)) || 
                    (o.customerEmail && o.customerEmail.toLowerCase().includes(s)) || 
                    (o.id && o.id.toLowerCase().includes(s))
                );
            }
            // Sort by createdAt descending
            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return data;
        }
    },

    async getById(id) {
        const isDb = await checkSupabaseConnection();
        if (isDb) {
            const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
            if (error) throw error;
            return data;
        } else {
            initLocalFile();
            const data = JSON.parse(fs.readFileSync(ordersJsonPath, 'utf-8'));
            const order = data.find(o => o.id === id);
            if (!order) throw new Error('Order not found');
            return order;
        }
    },

    async create(orderData) {
        const isDb = await checkSupabaseConnection();
        
        // Generate a random ORD ID
        const generatedId = orderData.id || `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

        const newOrder = {
            id: generatedId,
            customerName: orderData.customerName,
            customerEmail: orderData.customerEmail,
            customerPhone: orderData.customerPhone || null,
            address: orderData.address || null,
            city: orderData.city || null,
            state: orderData.state || null,
            zip: orderData.zip || null,
            country: orderData.country || 'India',
            items: orderData.items || [],
            subtotal: Number(orderData.subtotal) || 0,
            tax: Number(orderData.tax) || 0,
            shipping: Number(orderData.shipping) || 0,
            discount: Number(orderData.discount) || 0,
            total: Number(orderData.total) || 0,
            paymentStatus: orderData.paymentStatus || 'pending',
            orderStatus: orderData.orderStatus || 'pending',
            paymentMethod: orderData.paymentMethod || 'cod',
            createdAt: orderData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (isDb) {
            const { data, error } = await supabase.from('orders').insert([newOrder]).select();
            if (error) throw error;
            return data[0];
        } else {
            initLocalFile();
            const data = JSON.parse(fs.readFileSync(ordersJsonPath, 'utf-8'));
            data.push(newOrder);
            fs.writeFileSync(ordersJsonPath, JSON.stringify(data, null, 4), 'utf-8');
            return newOrder;
        }
    },

    async update(id, updates) {
        const isDb = await checkSupabaseConnection();
        
        // Remove fields that shouldn't be directly updated this way or are managed automatically
        const { id: _, createdAt: __, ...validUpdates } = updates;
        
        const updatedFields = {
            ...validUpdates,
            updatedAt: new Date().toISOString()
        };

        if (isDb) {
            const { data, error } = await supabase.from('orders').update(updatedFields).eq('id', id).select();
            if (error) throw error;
            return data[0];
        } else {
            initLocalFile();
            const data = JSON.parse(fs.readFileSync(ordersJsonPath, 'utf-8'));
            const idx = data.findIndex(o => o.id === id);
            if (idx === -1) throw new Error('Order not found');
            
            data[idx] = {
                ...data[idx],
                ...updatedFields,
                updatedAt: new Date().toISOString()
            };
            fs.writeFileSync(ordersJsonPath, JSON.stringify(data, null, 4), 'utf-8');
            return data[idx];
        }
    }
};

module.exports = ordersStore;
