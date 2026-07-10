import { supabase } from '../../../lib/supabaseServer';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const { status, paymentStatus, search, page = 1, limit = 20 } = req.query;

            let query = supabase.from('orders').select('*', { count: 'exact' });

            if (status && status !== 'all') {
                query = query.eq('orderStatus', status);
            }
            if (paymentStatus && paymentStatus !== 'all') {
                query = query.eq('paymentStatus', paymentStatus);
            }
            if (search) {
                query = query.or(`customerName.ilike.%${search}%,customerEmail.ilike.%${search}%,id.ilike.%${search}%`);
            }

            query = query.order('createdAt', { ascending: false });

            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const startIndex = (pageNum - 1) * limitNum;
            const endIndex = startIndex + limitNum - 1;

            query = query.range(startIndex, endIndex);

            const { data: orders, error, count } = await query;
            if (error) throw error;

            const total = count || 0;
            const totalPages = Math.ceil(total / limitNum);

            res.status(200).json({
                orders: orders || [],
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages
                }
            });
        } catch (error) {
            console.error('Error getting orders:', error);
            res.status(500).json({ error: 'Failed to fetch orders' });
        }
    } else if (req.method === 'POST') {
        try {
            const orderData = req.body;
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

            res.status(201).json(data);
        } catch (error) {
            console.error('Error creating order:', error);
            res.status(500).json({ error: 'Failed to create order' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
