-- Add discount fields to products table

-- Add discount_percentage field (0-100)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5,2) DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100);

-- Add optional discount_price field (pre-calculated sale price)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS discount_price DECIMAL(10,2);

-- Add sale start and end dates (optional)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS sale_start_date TIMESTAMP;

ALTER TABLE products
ADD COLUMN IF NOT EXISTS sale_end_date TIMESTAMP;

-- Add is_on_sale computed indicator
ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_on_sale BOOLEAN DEFAULT false;

-- Add index for querying sale products
CREATE INDEX IF NOT EXISTS idx_products_on_sale ON products(is_on_sale) WHERE is_on_sale = true;
CREATE INDEX IF NOT EXISTS idx_products_discount ON products(discount_percentage) WHERE discount_percentage > 0;

-- Add comments
COMMENT ON COLUMN products.discount_percentage IS 'Discount percentage (0-100). Example: 20 = 20% off';
COMMENT ON COLUMN products.discount_price IS 'Pre-calculated sale price. If null, calculated as: price * (1 - discount_percentage/100)';
COMMENT ON COLUMN products.is_on_sale IS 'Indicates if product is currently on sale';
COMMENT ON COLUMN products.sale_start_date IS 'Optional: Sale starts at this date';
COMMENT ON COLUMN products.sale_end_date IS 'Optional: Sale ends at this date';
