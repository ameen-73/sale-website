const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dataPath = path.join(__dirname, '../data/products.json');

// Helper: Read products from JSON file
const readProducts = () => {
    const data = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(data);
};

// Helper: Write products to JSON file
const writeProducts = (products) => {
    fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));
};

// GET /api/products - Get all products with filtering and sorting
const getProducts = (req, res) => {
    try {
        let products = readProducts();
        const { category, minPrice, maxPrice, featured, sort, search, page = 1, limit = 12 } = req.query;

        // Filter by category
        if (category && category !== 'all') {
            products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
        }

        // Filter by price range
        if (minPrice) {
            products = products.filter(p => p.price >= Number(minPrice));
        }
        if (maxPrice) {
            products = products.filter(p => p.price <= Number(maxPrice));
        }

        // Filter featured
        if (featured === 'true') {
            products = products.filter(p => p.featured);
        }

        // Search by title
        if (search) {
            const searchLower = search.toLowerCase();
            products = products.filter(p =>
                p.title.toLowerCase().includes(searchLower) ||
                p.description.toLowerCase().includes(searchLower)
            );
        }

        // Sort
        if (sort) {
            switch (sort) {
                case 'price_asc':
                    products.sort((a, b) => a.price - b.price);
                    break;
                case 'price_desc':
                    products.sort((a, b) => b.price - a.price);
                    break;
                case 'newest':
                    products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    break;
                case 'popular':
                    products.sort((a, b) => b.rating - a.rating);
                    break;
                default:
                    break;
            }
        }

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const total = products.length;
        const totalPages = Math.ceil(total / limitNum);
        const startIndex = (pageNum - 1) * limitNum;
        const paginatedProducts = products.slice(startIndex, startIndex + limitNum);

        res.json({
            products: paginatedProducts,
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
const getProductById = (req, res) => {
    try {
        const products = readProducts();
        const product = products.find(p => p.id === req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error getting product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
};

// POST /api/products - Create product
const createProduct = (req, res) => {
    try {
        const products = readProducts();
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

        products.push(newProduct);
        writeProducts(products);

        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
};

// PUT /api/products/:id - Update product
const updateProduct = (req, res) => {
    try {
        const products = readProducts();
        const index = products.findIndex(p => p.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const { title, category, price, description, images, inventory, featured } = req.body;

        products[index] = {
            ...products[index],
            ...(title !== undefined && { title }),
            ...(category !== undefined && { category }),
            ...(price !== undefined && { price: Number(price) }),
            ...(description !== undefined && { description }),
            ...(images !== undefined && { images }),
            ...(inventory !== undefined && { inventory: Number(inventory) }),
            ...(featured !== undefined && { featured }),
            updatedAt: new Date().toISOString()
        };

        writeProducts(products);
        res.json(products[index]);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
};

// DELETE /api/products/:id - Delete product
const deleteProduct = (req, res) => {
    try {
        const products = readProducts();
        const index = products.findIndex(p => p.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({ error: 'Product not found' });
        }

        products.splice(index, 1);
        writeProducts(products);

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