-- Add brand column to products table
ALTER TABLE public.products 
ADD COLUMN brand text NOT NULL DEFAULT 'anine-bing';

-- Create index for faster brand filtering
CREATE INDEX idx_products_brand ON public.products(brand);