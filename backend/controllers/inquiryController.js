const { v4: uuidv4 } = require('uuid');
const googleSheets = require('../services/googleSheets');

// GET /api/inquiries - Get all inquiries with filtering
const getInquiries = async (req, res) => {
    try {
        let inquiries = await googleSheets.getInquiries();
        const { status, search, page = 1, limit = 20 } = req.query;

        if (status && status !== 'all') {
            inquiries = inquiries.filter(i => i.status === status);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            inquiries = inquiries.filter(i =>
                i.name.toLowerCase().includes(searchLower) ||
                i.email.toLowerCase().includes(searchLower) ||
                i.city.toLowerCase().includes(searchLower)
            );
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const total = inquiries.length;
        const totalPages = Math.ceil(total / limitNum);
        const startIndex = (pageNum - 1) * limitNum;

        res.json({
            inquiries: inquiries.slice(startIndex, startIndex + limitNum),
            pagination: { page: pageNum, limit: limitNum, total, totalPages }
        });
    } catch (error) {
        console.error('Error getting inquiries:', error);
        res.status(500).json({ error: 'Failed to fetch inquiries' });
    }
};

// GET /api/inquiries/:id - Get single inquiry
const getInquiryById = async (req, res) => {
    try {
        const inquiry = await googleSheets.getInquiryById(req.params.id);

        if (!inquiry || inquiry.error) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }

        res.json(inquiry);
    } catch (error) {
        console.error('Error getting inquiry:', error);
        res.status(500).json({ error: 'Failed to fetch inquiry' });
    }
};

// POST /api/inquiries - Create inquiry
const createInquiry = async (req, res) => {
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

        await googleSheets.addInquiry(newInquiry);

        res.status(201).json(newInquiry);
    } catch (error) {
        console.error('Error creating inquiry:', error);
        res.status(500).json({ error: 'Failed to create inquiry' });
    }
};

// PUT /api/inquiries/:id - Update inquiry status
const updateInquiry = async (req, res) => {
    try {
        const { status, notes } = req.body;
        const updateData = {};

        if (status) updateData.status = status;
        if (notes) updateData.notes = notes;

        const result = await googleSheets.updateInquiry(req.params.id, updateData);

        if (result.error) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }

        // Fetch updated inquiry to return full data
        const updatedInquiry = await googleSheets.getInquiryById(req.params.id);
        res.json(updatedInquiry);
    } catch (error) {
        console.error('Error updating inquiry:', error);
        res.status(500).json({ error: 'Failed to update inquiry' });
    }
};

module.exports = { getInquiries, getInquiryById, createInquiry, updateInquiry };