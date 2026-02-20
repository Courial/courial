ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS carrier text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipstation_order_id text;