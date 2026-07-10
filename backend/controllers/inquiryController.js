const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dataPath = path.join(__dirname, '../data/inquiries.json');

const readInquiries = () => {
    const data = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(data);
};

const writeInquiries = (inquiries) => {
    fs.writeFileSync(dataPath, JSON.stringify(inquiries, null, 2));
};

// GET /api/inquiries - Get all inquiries with filtering
const getInquiries = (req, res) => {
    try {
        let inquiries = readInquiries();
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
const getInquiryById = (req, res) => {
    try {
        const inquiries = readInquiries();
        const inquiry = inquiries.find(i => i.id === req.params.id);
        if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' });
        res.json(inquiry);
    } catch (error) {
        console.error('Error getting inquiry:', error);
        res.status(500).json({ error: 'Failed to fetch inquiry' });
    }
};

// POST /api/inquiries - Create inquiry
const createInquiry = (req, res) => {
    try {
        const inquiries = readInquiries();
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

        inquiries.unshift(newInquiry);
        writeInquiries(inquiries);

        res.status(201).json(newInquiry);
    } catch (error) {
        console.error('Error creating inquiry:', error);
        res.status(500).json({ error: 'Failed to create inquiry' });
    }
};

// PUT /api/inquiries/:id - Update inquiry status
const updateInquiry = (req, res) => {
    try {
        const inquiries = readInquiries();
        const index = inquiries.findIndex(i => i.id === req.params.id);

        if (index === -1) return res.status(404).json({ error: 'Inquiry not found' });

        const { status, notes } = req.body;
        if (status) inquiries[index].status = status;
        if (notes) inquiries[index].notes = notes;

        writeInquiries(inquiries);
        res.json(inquiries[index]);
    } catch (error) {
        console.error('Error updating inquiry:', error);
        res.status(500).json({ error: 'Failed to update inquiry' });
    }
};

module.exports = { getInquiries, getInquiryById, createInquiry, updateInquiry };