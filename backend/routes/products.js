const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

// GET /api/products - Get all products
router.get('/', getProducts);

// GET /api/products/:id - Get single product
router.get('/:id', getProductById);

// POST /api/products - Create product
router.post('/', createProduct);

// PUT /api/products/:id - Update product
router.put('/:id', updateProduct);

// DELETE /api/products/:id - Delete product
router.delete('/:id', deleteProduct);

module.exports = router;