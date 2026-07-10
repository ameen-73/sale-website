import { supabase } from '../../../lib/supabaseServer';

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method === 'GET') {
        try {
            const { data: product, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !product) {
                return res.status(404).json({ error: 'Product not found' });
            }

            res.status(200).json(product);
        } catch (error) {
            console.error('Error getting product:', error);
            res.status(500).json({ error: 'Failed to fetch product' });
        }
    } else if (req.method === 'PUT') {
        try {
            const { title, category, price, description, images, inventory, featured } = req.body;

            const updateData = {
                ...(title !== undefined && { title }),
                ...(category !== undefined && { category }),
                ...(price !== undefined && { price: Number(price) }),
                ...(description !== undefined && { description }),
                ...(images !== undefined && { images }),
                ...(inventory !== undefined && { inventory: Number(inventory) }),
                ...(featured !== undefined && { featured }),
                updatedAt: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('products')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error || !data) {
                return res.status(404).json({ error: 'Product not found' });
            }

            res.status(200).json(data);
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ error: 'Failed to update product' });
        }
    } else if (req.method === 'DELETE') {
        try {
            const { data, error } = await supabase
                .from('products')
                .delete()
                .eq('id', id)
                .select();

            if (error || !data || data.length === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }

            res.status(200).json({ message: 'Product deleted successfully' });
        } catch (error) {
            console.error('Error deleting product:', error);
            res.status(500).json({ error: 'Failed to delete product' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
