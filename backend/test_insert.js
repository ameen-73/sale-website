const supabase = require('./services/supabase');
const { v4: uuidv4 } = require('uuid');

async function testInsert() {
    const newProduct = {
        id: `prod-${uuidv4().slice(0, 8)}`,
        title: 'Test Product',
        category: 'Fancy Lighting',
        price: Number(3334),
        description: 'Test description',
        images: ['https://i.pinimg.com/736x/fb/a3/23/fba323c9981020ddfa6d13.jpg'],
        inventory: Number(3),
        featured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rating: 0,
        reviews: []
    };

    console.log('Attempting to insert:', newProduct);

    try {
        const { data, error } = await supabase
            .from('products')
            .insert([newProduct])
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
        } else {
            console.log('Insert successful:', data);
        }
    } catch (e) {
        console.error('Execution error:', e);
    }
}

testInsert();
