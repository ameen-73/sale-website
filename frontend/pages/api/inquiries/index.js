import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../../lib/supabaseServer';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const { status, search, page = 1, limit = 20 } = req.query;

            let query = supabase.from('inquiries').select('*', { count: 'exact' });

            if (status && status !== 'all') {
                query = query.eq('status', status);
            }

            if (search) {
                query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,city.ilike.%${search}%`);
            }

            query = query.order('createdAt', { ascending: false });

            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const startIndex = (pageNum - 1) * limitNum;
            const endIndex = startIndex + limitNum - 1;

            query = query.range(startIndex, endIndex);

            const { data: inquiries, error, count } = await query;

            if (error) {
                throw error;
            }

            const total = count || 0;
            const totalPages = Math.ceil(total / limitNum);

            res.status(200).json({
                inquiries: inquiries || [],
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages
                }
            });
        } catch (error) {
            console.error('Error getting inquiries:', error);
            res.status(500).json({ error: 'Failed to fetch inquiries' });
        }
    } else if (req.method === 'POST') {
        try {
            const { name, email, phone, city, roomType, houseSize, budget, style, details, preferredDate } = req.body;

            const newInquiry = {
                id: `inq-${uuidv4().slice(0, 8)}`,
                name,
                email,
                phone,
                city,
                roomType,
                houseSize,
                budget,
                style,
                details,
                preferredDate,
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('inquiries')
                .insert([newInquiry])
                .select()
                .single();

            if (error) {
                throw error;
            }

            res.status(201).json(data);
        } catch (error) {
            console.error('Error creating inquiry:', error);
            res.status(500).json({ error: 'Failed to create inquiry' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
