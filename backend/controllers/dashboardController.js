const googleSheets = require('../services/googleSheets');

// GET /api/dashboard - Get dashboard metrics
const getDashboard = async (req, res) => {
    try {
        const products = await googleSheets.getProducts();
        const inquiries = await googleSheets.getInquiries();

        // Calculate revenue metrics
        const totalRevenue = products.reduce((sum, p) => sum + (p.price * (p.inventory > 0 ? 1 : 0)), 0);
        const todayRevenue = Math.round(totalRevenue * 0.05); // Simulated today's revenue

        // Product metrics
        const totalProducts = products.length;
        const featuredProducts = products.filter(p => p.featured).length;
        const lowStock = products.filter(p => p.inventory < 10).length;

        // Inquiry metrics
        const totalInquiries = inquiries.length;
        const pendingInquiries = inquiries.filter(i => i.status === 'pending').length;
        const inProgressInquiries = inquiries.filter(i => i.status === 'in-progress').length;
        const completedInquiries = inquiries.filter(i => i.status === 'completed').length;

        // Category distribution
        const categoryDistribution = {};
        products.forEach(p => {
            categoryDistribution[p.category] = (categoryDistribution[p.category] || 0) + 1;
        });

        // Monthly revenue simulation (last 6 months)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const monthlyRevenue = months.map((month, i) => ({
            month,
            revenue: Math.round(totalRevenue * (0.1 + (i * 0.03))),
            orders: Math.round(10 + (i * 3))
        }));

        // Recent activity
        const recentActivity = [
            { type: 'inquiry', message: 'New inquiry from Priya Sharma', time: '2 hours ago' },
            { type: 'order', message: 'Order #ORD-0042 completed', time: '4 hours ago' },
            { type: 'product', message: 'Nova pendant light inventory updated', time: '6 hours ago' },
            { type: 'inquiry', message: 'Arjun Mehta consultation scheduled', time: '1 day ago' },
            { type: 'product', message: 'New product added: Arc floor light', time: '2 days ago' },
        ];

        res.json({
            metrics: {
                totalRevenue,
                todayRevenue,
                totalProducts,
                featuredProducts,
                lowStock,
                totalInquiries,
                pendingInquiries,
                inProgressInquiries,
                completedInquiries
            },
            categoryDistribution,
            monthlyRevenue,
            recentActivity
        });
    } catch (error) {
        console.error('Error getting dashboard data:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
};

module.exports = { getDashboard };