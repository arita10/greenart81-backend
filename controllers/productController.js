const pool = require('../config/database');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

// Helper function to get product images
const getProductImages = async (productId) => {
  try {
    const result = await pool.query(
      `SELECT id, image_url, thumb_url, medium_url, alt_text, is_primary, sort_order
       FROM product_images
       WHERE product_id = $1
       ORDER BY sort_order ASC, created_at ASC`,
      [productId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching product images:', error);
    return [];
  }
};

// Helper function to calculate discount and sale price
const calculateDiscount = (product) => {
  const price = parseFloat(product.price) || 0;
  const discountPercentage = parseFloat(product.discount_percentage) || 0;

  // Check if sale is active (if dates are set)
  const now = new Date();
  const saleStartDate = product.sale_start_date ? new Date(product.sale_start_date) : null;
  const saleEndDate = product.sale_end_date ? new Date(product.sale_end_date) : null;

  let isOnSale = product.is_on_sale || false;

  // Check date-based sale validity
  if (saleStartDate && now < saleStartDate) {
    isOnSale = false; // Sale hasn't started yet
  }
  if (saleEndDate && now > saleEndDate) {
    isOnSale = false; // Sale has ended
  }

  // Calculate sale price
  const salePrice = discountPercentage > 0 && isOnSale
    ? price * (1 - discountPercentage / 100)
    : price;

  return {
    originalPrice: price,
    salePrice: parseFloat(salePrice.toFixed(2)),
    discountPercentage: isOnSale ? discountPercentage : 0,
    discountAmount: isOnSale ? parseFloat((price - salePrice).toFixed(2)) : 0,
    isOnSale: isOnSale && discountPercentage > 0
  };
};

// Helper function to transform product data for frontend compatibility
const transformProduct = async (product) => {
  // Fetch all images for this product
  const images = await getProductImages(product.id);

  // Find primary image or use first one
  const primaryImage = images.find(img => img.is_primary) || images[0];

  // Calculate discount information
  const discount = calculateDiscount(product);

  return {
    ...product,
    _id: product.id, // Add MongoDB-style _id for frontend compatibility
    image: primaryImage?.image_url || product.image_url || '', // Primary image or legacy
    image_url: primaryImage?.image_url || product.image_url || '', // Keep both
    images: images.map(img => ({
      id: img.id,
      url: img.image_url,
      thumbUrl: img.thumb_url,
      mediumUrl: img.medium_url,
      altText: img.alt_text,
      isPrimary: img.is_primary,
      sortOrder: img.sort_order
    })), // All images array
    stock: product.stock || 0, // Ensure stock exists
    category: product.category_name || product.category || '', // Ensure category is a string
    price: discount.originalPrice, // Original price
    originalPrice: discount.originalPrice, // Explicit original price
    salePrice: discount.salePrice, // Sale price (same as price if no discount)
    discountPercentage: discount.discountPercentage, // Discount %
    discountAmount: discount.discountAmount, // Amount saved
    isOnSale: discount.isOnSale, // Is currently on sale
    useAsSlider: product.use_as_slider || false, // Map use_as_slider to useAsSlider for frontend
    use_as_slider: product.use_as_slider || false // Keep both naming conventions
  };
};

const getAllProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = true';
    const params = [];
    let paramCount = 1;

    if (category) {
      query += ` AND c.name ILIKE $${paramCount}`;
      params.push(`%${category}%`);
      paramCount++;
    }

    if (search) {
      query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    const countQuery = query.replace('SELECT p.*, c.name as category_name', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY p.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Transform products for frontend compatibility
    const transformedProducts = await Promise.all(result.rows.map(transformProduct));

    paginatedResponse(res, transformedProducts, page, limit, total, 'Products retrieved successfully');
  } catch (error) {
    console.error('Get all products error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Product not found', 'PRODUCT_NOT_FOUND', 404);
    }

    const reviewsResult = await pool.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE product_id = $1 AND status = $2',
      [id, 'approved']
    );

    const product = {
      ...result.rows[0],
      avg_rating: parseFloat(reviewsResult.rows[0].avg_rating) || 0,
      review_count: parseInt(reviewsResult.rows[0].review_count) || 0
    };

    successResponse(res, await transformProduct(product), 'Product retrieved successfully');
  } catch (error) {
    console.error('Get product by ID error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM products p JOIN categories c ON p.category_id = c.id WHERE c.name ILIKE $1 AND p.is_active = true',
      [`%${category}%`]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      'SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE c.name ILIKE $1 AND p.is_active = true ORDER BY p.created_at DESC LIMIT $2 OFFSET $3',
      [`%${category}%`, limit, offset]
    );

    const transformedProducts = await Promise.all(result.rows.map(transformProduct));
    paginatedResponse(res, transformedProducts, page, limit, total, 'Products retrieved successfully');
  } catch (error) {
    console.error('Get products by category error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const result = await pool.query(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_featured = true AND p.is_active = true ORDER BY p.created_at DESC LIMIT $1',
      [limit]
    );

    const transformedProducts = await Promise.all(result.rows.map(transformProduct));
    successResponse(res, transformedProducts, 'Featured products retrieved successfully');
  } catch (error) {
    console.error('Get featured products error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const searchProducts = async (req, res) => {
  try {
    const { q, category, min_price, max_price, sort = 'newest', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = true';
    const params = [];
    let paramCount = 1;

    if (q) {
      query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      params.push(`%${q}%`);
      paramCount++;
    }

    if (category) {
      query += ` AND c.name ILIKE $${paramCount}`;
      params.push(`%${category}%`);
      paramCount++;
    }

    if (min_price) {
      query += ` AND p.price >= $${paramCount}`;
      params.push(min_price);
      paramCount++;
    }

    if (max_price) {
      query += ` AND p.price <= $${paramCount}`;
      params.push(max_price);
      paramCount++;
    }

    const countQuery = query.replace('SELECT p.*, c.name as category_name', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    if (sort === 'price_asc') {
      query += ' ORDER BY p.price ASC';
    } else if (sort === 'price_desc') {
      query += ' ORDER BY p.price DESC';
    } else {
      query += ' ORDER BY p.created_at DESC';
    }

    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    const transformedProducts = await Promise.all(result.rows.map(transformProduct));
    paginatedResponse(res, transformedProducts, page, limit, total, 'Search results retrieved successfully');
  } catch (error) {
    console.error('Search products error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const getSliderProducts = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    // Get products marked for slider use
    const result = await pool.query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.is_active = true
       AND p.use_as_slider = true
       ORDER BY p.created_at DESC
       LIMIT $1`,
      [limit]
    );

    // If no slider products found, fallback to featured products
    if (result.rows.length === 0) {
      const fallbackResult = await pool.query(
        `SELECT p.*, c.name as category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.is_active = true
         AND p.is_featured = true
         ORDER BY p.created_at DESC
         LIMIT $1`,
        [limit]
      );
      const transformedProducts = await Promise.all(fallbackResult.rows.map(transformProduct));
      return successResponse(res, transformedProducts, 'Slider products retrieved successfully (featured fallback)');
    }

    const transformedProducts = await Promise.all(result.rows.map(transformProduct));
    successResponse(res, transformedProducts, 'Slider products retrieved successfully');
  } catch (error) {
    console.error('Get slider products error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getFeaturedProducts,
  searchProducts,
  getSliderProducts
};
