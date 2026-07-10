import { supabase } from '../../../lib/supabaseServer';

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method === 'GET') {
        try {
            const { data: inquiry, error } = await supabase
                .from('inquiries')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !inquiry) {
                return res.status(404).json({ error: 'Inquiry not found' });
            }

            res.status(200).json(inquiry);
        } catch (error) {
            console.error('Error getting inquiry:', error);
            res.status(500).json({ error: 'Failed to fetch inquiry' });
        }
    } else if (req.method === 'PUT') {
        try {
            const { status, notes } = req.body;
            const updateData = {};

            if (status) updateData.status = status;
            if (notes !== undefined) updateData.notes = notes;

            const { data, error } = await supabase
                .from('inquiries')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error || !data) {
                return res.status(404).json({ error: 'Inquiry not found' });
            }

            res.status(200).json(data);
        } catch (error) {
            console.error('Error updating inquiry:', error);
            res.status(500).json({ error: 'Failed to update inquiry' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
