const { v4: uuidv4 } = require('uuid');
const supabase = require('../services/supabase');

// GET /api/products - Get all products with filtering and sorting
const getProducts = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, featured, sort, search, page = 1, limit = 12 } = req.query;

        // Initialize Supabase query
        let query = supabase.from('products').select('*', { count: 'exact' });

        // Filter by category
        if (category && category !== 'all') {
            // Case-insensitive match for category
            query = query.ilike('category', category);
        }

        // Filter by price range
        if (minPrice) {
            query = query.gte('price', Number(minPrice));
        }
        if (maxPrice) {
            query = query.lte('price', Number(maxPrice));
        }

        // Filter featured
        if (featured === 'true') {
            query = query.eq('featured', true);
        }

        // Search by title or description
        if (search) {
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        }

        // Sort
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

        // Pagination
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

        res.json({
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
};

// GET /api/products/:id - Get single product
const getProductById = async (req, res) => {
    try {
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error || !product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error getting product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
};

// POST /api/products - Create product
const createProduct = async (req, res) => {
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
};

// PUT /api/products/:id - Update product
const updateProduct = async (req, res) => {
    try {
        const { title, category, price, description, images, inventory, featured } = req.body;

        const updateData = {
            ...(title !== undefined && { title }),
            ...(category !== undefined && { category }),
            ...(price !== undefined && { price: Number(price) }),
            ...(description !== undefined && { description }),
            ...(images !== undefined && { images }),
            ...(inventory !== undefined && { inventory: Number(inventory) }),
            ...(featured !== undefined && { featured }),
            updatedAt: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(data);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
};

// DELETE /api/products/:id - Delete product
const deleteProduct = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('products')
            .delete()
            .eq('id', req.params.id)
            .select();

        if (error || !data || data.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};