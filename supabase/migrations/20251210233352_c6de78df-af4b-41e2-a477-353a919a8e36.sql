-- Add display_order column for product ordering
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- Set initial order based on created_at
UPDATE public.products 
SET display_order = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY brand ORDER BY created_at) as row_num
  FROM public.products
) AS subquery
WHERE public.products.id = subquery.id;