const supabase = require('./supabase');

const ordersStore = {
    async getAll(filters = {}) {
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
    },

    async getById(id) {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    async create(orderData) {
        // Generate a random ORD ID if not provided
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

        const { data, error } = await supabase
            .from('orders')
            .insert([newOrder])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async update(id, updates) {
        // Remove fields that shouldn't be directly updated
        const { id: _, createdAt: __, ...validUpdates } = updates;
        
        const updatedFields = {
            ...validUpdates,
            updatedAt: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('orders')
            .update(updatedFields)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    }
};

module.exports = ordersStore;
