-- Performance Optimization Indexes
-- These indexes target frequently filtered, sorted, and joined columns

-- 1. Products Table Optimizations
-- Used for sorting by newest (default sort)
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Used for filtering/sorting by price
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- Used for 'Featured' products query
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;

-- Used for 'Slider' products query
CREATE INDEX IF NOT EXISTS idx_products_slider ON products(use_as_slider) WHERE use_as_slider = true;

-- Used for searching/filtering by name (basic index, helps with prefix search or equality)
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);


-- 2. Categories Table Optimizations
-- Used for filtering products by category name (joins)
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);


-- 3. Reviews Table Optimizations
-- Used for calculating average ratings efficiently
CREATE INDEX IF NOT EXISTS idx_reviews_product_status ON reviews(product_id, status);


-- 4. Order Items Optimizations
-- Used when fetching order details
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Used for sorting orders by date
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);


-- 5. Product Images Optimizations
-- Used for fetching images for products (sorting by sort_order)
CREATE INDEX IF NOT EXISTS idx_product_images_product_sort ON product_images(product_id, sort_order);
