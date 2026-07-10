const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Generic fetch wrapper
async function fetchAPI(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        throw error;
    }
}

// Products API
export const productsAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                query.append(key, value);
            }
        });
        return fetchAPI(`/products?${query.toString()}`);
    },

    getById: (id) => fetchAPI(`/products/${id}`),

    create: (product) => fetchAPI('/products', {
        method: 'POST',
        body: JSON.stringify(product),
    }),

    update: (id, product) => fetchAPI(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(product),
    }),

    delete: (id) => fetchAPI(`/products/${id}`, {
        method: 'DELETE',
    }),
};

// Inquiries API
export const inquiriesAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                query.append(key, value);
            }
        });
        return fetchAPI(`/inquiries?${query.toString()}`);
    },

    getById: (id) => fetchAPI(`/inquiries/${id}`),

    create: (inquiry) => fetchAPI('/inquiries', {
        method: 'POST',
        body: JSON.stringify(inquiry),
    }),

    update: (id, data) => fetchAPI(`/inquiries/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
};

// Dashboard API
export const dashboardAPI = {
    get: () => fetchAPI('/dashboard'),
};

// Format price in INR
export const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(price);
};