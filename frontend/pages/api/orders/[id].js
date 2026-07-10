import { supabase } from '../../../lib/supabaseServer';

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method === 'GET') {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error || !data) {
                return res.status(404).json({ error: 'Order not found' });
            }
            res.status(200).json(data);
        } catch (error) {
            console.error('Error getting order:', error);
            res.status(500).json({ error: 'Failed to fetch order' });
        }
    } else if (req.method === 'PUT') {
        try {
            const updates = req.body;
            const { id: _, createdAt: __, ...validUpdates } = updates;
            
            const updatedFields = {
                ...validUpdates,
                updatedAt: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('orders')
                .update(updatedFields)
                .eq('id', id)
                .select()
                .single();
            
            if (error || !data) {
                return res.status(404).json({ error: 'Order not found' });
            }

            res.status(200).json(data);
        } catch (error) {
            console.error('Error updating order:', error);
            res.status(500).json({ error: 'Failed to update order' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
