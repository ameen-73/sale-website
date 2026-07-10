const supabase = require('../services/supabase');

// GET /api/dashboard - Get dashboard metrics
const getDashboard = async (req, res) => {
    try {
        // Fetch only necessary fields for calculations to keep response lightweight
        const { data: products, error: prodErr } = await supabase
            .from('products')
            .select('price, inventory, featured, category');

        const { data: inquiries, error: inqErr } = await supabase
            .from('inquiries')
            .select('status');

        if (prodErr) throw prodErr;
        if (inqErr) throw inqErr;

        const safeProducts = products || [];
        const safeInquiries = inquiries || [];

        // Calculate revenue metrics
        const totalRevenue = safeProducts.reduce((sum, p) => sum + (Number(p.price) * (Number(p.inventory) > 0 ? 1 : 0)), 0);
        const todayRevenue = Math.round(totalRevenue * 0.05); // Simulated today's revenue

        // Product metrics
        const totalProducts = safeProducts.length;
        const featuredProducts = safeProducts.filter(p => p.featured).length;
        const lowStock = safeProducts.filter(p => Number(p.inventory) < 10).length;

        // Inquiry metrics
        const totalInquiries = safeInquiries.length;
        const pendingInquiries = safeInquiries.filter(i => i.status === 'pending').length;
        const inProgressInquiries = safeInquiries.filter(i => i.status === 'in-progress').length;
        const completedInquiries = safeInquiries.filter(i => i.status === 'completed').length;

        // Category distribution
        const categoryDistribution = {};
        safeProducts.forEach(p => {
            if (p.category) {
                categoryDistribution[p.category] = (categoryDistribution[p.category] || 0) + 1;
            }
        });

        // Monthly revenue simulation (last 6 months)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const monthlyRevenue = months.map((month, i) => ({
            month,
            revenue: Math.round(totalRevenue * (0.1 + (i * 0.03))),
            orders: Math.round(10 + (i * 3))
        }));

        // Fetch recent inquiries from database for dynamic activity feed
        const { data: recentInquiries } = await supabase
            .from('inquiries')
            .select('name, createdAt')
            .order('createdAt', { ascending: false })
            .limit(2);

        const recentActivity = [];
        if (recentInquiries && recentInquiries.length > 0) {
            recentInquiries.forEach(inq => {
                recentActivity.push({
                    type: 'inquiry',
                    message: `New inquiry from ${inq.name}`,
                    time: formatTimeAgo(inq.createdAt)
                });
            });
        }

        // Add static items to populate timeline
        const staticActivities = [
            { type: 'order', message: 'Order #ORD-0042 completed', time: '4 hours ago' },
            { type: 'product', message: 'Nova pendant light inventory updated', time: '6 hours ago' },
            { type: 'product', message: 'New product added: Arc floor light', time: '2 days ago' },
        ];

        staticActivities.forEach(act => {
            if (recentActivity.length < 5) {
                recentActivity.push(act);
            }
        });

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

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) {
        return 'just now';
    } else if (diffMins < 60) {
        return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
}

module.exports = { getDashboard };