
-- Add weight_oz column to products for shipping calculation
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS weight_oz integer NOT NULL DEFAULT 16;

-- 16oz (1 lb) is a sensible default for courier gear
