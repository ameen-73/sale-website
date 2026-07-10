-- ==========================================
-- AURA Luxury E-Commerce Database Schema
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. DROP TABLES IF THEY EXIST (for clean re-runs)
-- DROP TABLE IF EXISTS public.inquiries;
-- DROP TABLE IF EXISTS public.products;

-- 2. CREATE PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL,
    description TEXT,
    images TEXT[] NOT NULL DEFAULT '{}',
    inventory INTEGER NOT NULL DEFAULT 0,
    featured BOOLEAN NOT NULL DEFAULT false,
    rating NUMERIC NOT NULL DEFAULT 0,
    reviews JSONB NOT NULL DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 3. CREATE INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.inquiries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    city TEXT,
    "roomType" TEXT,
    "houseSize" TEXT,
    budget TEXT,
    style TEXT,
    details TEXT,
    "preferredDate" TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    notes TEXT
);

-- 4. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- 5. CREATE POLICIES

-- Products policies
CREATE POLICY "Allow public read access to products" 
ON public.products 
FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Allow all access to products for service role" 
ON public.products 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Inquiries policies
CREATE POLICY "Allow public insert access to inquiries" 
ON public.inquiries 
FOR INSERT 
TO public 
WITH CHECK (true);

CREATE POLICY "Allow all access to inquiries for service role" 
ON public.inquiries 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- 6. CREATE HELPER INDEXES FOR FASTER QUERIES
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);

-- 7. GRANT EXPLICIT PERMISSIONS TO API ROLES
-- In some Supabase setups, permissions must be explicitly granted to the api roles
GRANT ALL ON TABLE public.products TO postgres, service_role, anon, authenticated;
GRANT ALL ON TABLE public.inquiries TO postgres, service_role, anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role, anon, authenticated;

-- 8. CREATE ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    country TEXT DEFAULT 'India',
    items JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of { productId, title, price, quantity, image }
    subtotal NUMERIC NOT NULL DEFAULT 0,
    tax NUMERIC NOT NULL DEFAULT 0,
    shipping NUMERIC NOT NULL DEFAULT 0,
    discount NUMERIC NOT NULL DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending', -- pending, paid, refunded
    "orderStatus" TEXT NOT NULL DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
    "paymentMethod" TEXT DEFAULT 'cod',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Allow public insert access to orders" 
ON public.orders 
FOR INSERT 
TO public 
WITH CHECK (true);

CREATE POLICY "Allow all access to orders for service role" 
ON public.orders 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Create Helper Indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders("customerEmail");
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders("orderStatus");

-- Grant permissions to roles
GRANT ALL ON TABLE public.orders TO postgres, service_role, anon, authenticated;

