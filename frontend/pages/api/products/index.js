import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../../lib/supabaseServer';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const { category, minPrice, maxPrice, featured, sort, search, page = 1, limit = 12 } = req.query;

            let query = supabase.from('products').select('*', { count: 'exact' });

            if (category && category !== 'all') {
                query = query.ilike('category', category);
            }

            if (minPrice) {
                query = query.gte('price', Number(minPrice));
            }
            if (maxPrice) {
                query = query.lte('price', Number(maxPrice));
            }

            if (featured === 'true') {
                query = query.eq('featured', true);
            }

            if (search) {
                query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
            }

            if (sort) {
                switch (sort) {
                    case 'price_asc':
                        query = query.order('price', { ascending: true });
                        break;
                    case 'price_desc':
                        query = query.order('price', { ascending: false });
                        break;
                    case 'newest':
                        query = query.order('createdAt', { ascending: false });
                        break;
                    case 'popular':
                        query = query.order('rating', { ascending: false });
                        break;
                    default:
                        query = query.order('createdAt', { ascending: false });
                        break;
                }
            } else {
                query = query.order('createdAt', { ascending: false });
            }

            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const startIndex = (pageNum - 1) * limitNum;
            const endIndex = startIndex + limitNum - 1;

            query = query.range(startIndex, endIndex);

            const { data: products, error, count } = await query;

            if (error) {
                throw error;
            }

            const total = count || 0;
            const totalPages = Math.ceil(total / limitNum);

            res.status(200).json({
                products: products || [],
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages,
                    hasMore: pageNum < totalPages
                }
            });
        } catch (error) {
            console.error('Error getting products:', error);
            res.status(500).json({ error: 'Failed to fetch products' });
        }
    } else if (req.method === 'POST') {
        try {
            const { title, category, price, description, images, inventory, featured } = req.body;

            const newProduct = {
                id: `prod-${uuidv4().slice(0, 8)}`,
                title,
                category,
                price: Number(price),
                description,
                images: images || [],
                inventory: Number(inventory) || 0,
                featured: featured || false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                rating: 0,
                reviews: []
            };

            const { data, error } = await supabase
                .from('products')
                .insert([newProduct])
                .select()
                .single();

            if (error) {
                throw error;
            }

            res.status(201).json(data);
        } catch (error) {
            console.error('Error creating product:', error);
            res.status(500).json({ error: 'Failed to create product' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
