const ordersStore = require('../services/ordersStore');

// GET /api/orders - Get all orders with filtering and search
const getOrders = async (req, res) => {
    try {
        const { status, paymentStatus, search } = req.query;
        const orders = await ordersStore.getAll({ status, paymentStatus, search });
        res.json({ orders });
    } catch (error) {
        console.error('Error in getOrders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

// GET /api/orders/:id - Get single order by ID
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await ordersStore.getById(id);
        res.json({ order });
    } catch (error) {
        console.error(`Error in getOrderById for ${req.params.id}:`, error);
        res.status(404).json({ error: error.message || 'Order not found' });
    }
};

// POST /api/orders - Create a new order
const createOrder = async (req, res) => {
    try {
        const {
            customerName,
            customerEmail,
            customerPhone,
            address,
            city,
            state,
            zip,
            country,
            items,
            subtotal,
            tax,
            shipping,
            discount,
            total,
            paymentStatus,
            orderStatus,
            paymentMethod,
            id // Allow specifying ID (e.g. from frontend checkout generated)
        } = req.body;

        if (!customerName || !customerEmail || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Missing required fields: customerName, customerEmail, and items array' });
        }

        const newOrder = await ordersStore.create({
            id,
            customerName,
            customerEmail,
            customerPhone,
            address,
            city,
            state,
            zip,
            country,
            items,
            subtotal,
            tax,
            shipping,
            discount,
            total,
            paymentStatus,
            orderStatus,
            paymentMethod
        });

        res.status(201).json({ order: newOrder });
    } catch (error) {
        console.error('Error in createOrder:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
};

// PUT /api/orders/:id - Update an order
const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedOrder = await ordersStore.update(id, updates);
        res.json({ order: updatedOrder });
    } catch (error) {
        console.error(`Error in updateOrder for ${req.params.id}:`, error);
        res.status(500).json({ error: error.message || 'Failed to update order' });
    }
};

module.exports = {
    getOrders,
    getOrderById,
    createOrder,
    updateOrder
};
