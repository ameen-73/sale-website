const express = require('express');
const router = express.Router();
const { getInquiries, getInquiryById, createInquiry, updateInquiry } = require('../controllers/inquiryController');

// GET /api/inquiries - Get all inquiries
router.get('/', getInquiries);

// GET /api/inquiries/:id - Get single inquiry
router.get('/:id', getInquiryById);

// POST /api/inquiries - Create inquiry
router.post('/', createInquiry);

// PUT /api/inquiries/:id - Update inquiry
router.put('/:id', updateInquiry);

module.exports = router;