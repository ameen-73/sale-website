const { v4: uuidv4 } = require('uuid');
const supabase = require('../services/supabase');

// GET /api/inquiries - Get all inquiries with filtering
const getInquiries = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;

        // Initialize Supabase query
        let query = supabase.from('inquiries').select('*', { count: 'exact' });

        // Filter by status
        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        // Search by name, email, or city
        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,city.ilike.%${search}%`);
        }

        // Sort by createdAt descending
        query = query.order('createdAt', { ascending: false });

        // Pagination
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

        res.json({
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
};

// GET /api/inquiries/:id - Get single inquiry
const getInquiryById = async (req, res) => {
    try {
        const { data: inquiry, error } = await supabase
            .from('inquiries')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error || !inquiry) {
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
};

// PUT /api/inquiries/:id - Update inquiry status
const updateInquiry = async (req, res) => {
    try {
        const { status, notes } = req.body;
        const updateData = {};

        if (status) updateData.status = status;
        if (notes) updateData.notes = notes;

        const { data, error } = await supabase
            .from('inquiries')
            .update(updateData)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }

        res.json(data);
    } catch (error) {
        console.error('Error updating inquiry:', error);
        res.status(500).json({ error: 'Failed to update inquiry' });
    }
};

module.exports = { getInquiries, getInquiryById, createInquiry, updateInquiry };