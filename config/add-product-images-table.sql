-- Add Multiple Product Images Support
-- Creates product_images table for storing multiple images per product

-- 1. Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  thumb_url TEXT,
  medium_url TEXT,
  alt_text VARCHAR(255),
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_sort_order ON product_images(product_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_product_images_primary ON product_images(product_id, is_primary) WHERE is_primary = true;

-- 3. Migrate existing image_url data to product_images table
-- This makes existing single images the primary image
INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
SELECT id, image_url, true, 0
FROM products
WHERE image_url IS NOT NULL
  AND image_url != ''
  AND NOT EXISTS (
    SELECT 1 FROM product_images WHERE product_id = products.id
  );

-- 4. Add comment for documentation
COMMENT ON TABLE product_images IS 'Stores multiple images for each product with metadata';
COMMENT ON COLUMN products.image_url IS 'Legacy field - kept for backward compatibility. Synced with primary image from product_images table.';
