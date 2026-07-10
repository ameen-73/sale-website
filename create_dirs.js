const fs = require('fs');
const dirs = [
    'backend/data',
    'backend/routes',
    'backend/controllers',
    'backend/middleware',
    'frontend/components/ui',
    'frontend/components/admin',
    'frontend/components/shop',
    'frontend/components/home',
    'frontend/pages/admin',
    'frontend/pages/shop',
    'frontend/pages/product',
    'frontend/pages/journal',
    'frontend/pages/custom-design',
    'frontend/pages/about',
    'frontend/pages/contact',
    'frontend/pages/cart',
    'frontend/pages/checkout',
    'frontend/pages/wishlist',
    'frontend/layouts',
    'frontend/hooks',
    'frontend/lib',
    'frontend/styles',
    'frontend/public'
];
dirs.forEach(d => fs.mkdirSync(d, { recursive: true }));
console.log('All directories created successfully');