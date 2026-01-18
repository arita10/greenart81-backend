const pool = require('../config/database');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

// Helper function to get product images for a single product
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

// Batch fetch images for multiple products (fixes N+1 query problem)
const getBatchProductImages = async (productIds) => {
  if (!productIds || productIds.length === 0) return {};

  try {
    const result = await pool.query(
      `SELECT product_id, id, image_url, thumb_url, medium_url, alt_text, is_primary, sort_order
       FROM product_images
       WHERE product_id = ANY($1)
       ORDER BY product_id, sort_order ASC, created_at ASC`,
      [productIds]
    );

    // Group images by product_id
    const imagesByProduct = {};
    for (const row of result.rows) {
      if (!imagesByProduct[row.product_id]) {
        imagesByProduct[row.product_id] = [];
      }
      imagesByProduct[row.product_id].push(row);
    }
    return imagesByProduct;
  } catch (error) {
    console.error('Error batch fetching product images:', error);
    return {};
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

// Helper function to transform product data for frontend compatibility (single product)
const transformProduct = async (product) => {
  // Fetch all images for this product
  const images = await getProductImages(product.id);
  return transformProductWithImages(product, images);
};

// Transform product with pre-fetched images (used for batch operations)
const transformProductWithImages = (product, images = []) => {
  // Find primary image or use first one
  const primaryImage = images.find(img => img.is_primary) || images[0];

  // Calculate discount information
  const discount = calculateDiscount(product);

  // Ensure ID is always a string for frontend consistency
  const stringId = String(product.id);

  return {
    ...product,
    id: stringId, // Ensure ID is string
    _id: stringId, // Add MongoDB-style _id for frontend compatibility
    image: primaryImage?.image_url || product.image_url || '', // Primary image or legacy
    image_url: primaryImage?.image_url || product.image_url || '', // Keep both
    images: images.map(img => ({
      id: String(img.id),
      url: img.image_url,
      thumbUrl: img.thumb_url,
      mediumUrl: img.medium_url,
      altText: img.alt_text,
      isPrimary: img.is_primary,
      sortOrder: img.sort_order
    })), // All images array
    stock: product.stock_quantity !== undefined ? product.stock_quantity : product.stock, // Handle both field names
    category: product.category_name || product.category || '', // Ensure category is a string
    price: discount.originalPrice, // Original price
    originalPrice: discount.originalPrice, // Explicit original price
    salePrice: discount.salePrice, // Sale price (same as price if no discount)
    discountPercentage: discount.discountPercentage, // Discount %
    discountAmount: discount.discountAmount, // Amount saved
    isOnSale: discount.isOnSale, // Is currently on sale
    stock_quantity: product.stock_quantity !== undefined ? product.stock_quantity : product.stock, // Keep original field
    useAsSlider: product.use_as_slider || false, // Map use_as_slider to useAsSlider for frontend
    use_as_slider: product.use_as_slider || false // Keep both naming conventions
  };
};

// Batch transform products with single image query (optimized for lists)
const transformProductsBatch = async (products) => {
  if (!products || products.length === 0) return [];

  // Fetch all images in one query
  const productIds = products.map(p => p.id);
  const imagesByProduct = await getBatchProductImages(productIds);

  // Transform each product with its pre-fetched images
  return products.map(product => {
    const images = imagesByProduct[product.id] || [];
    return transformProductWithImages(product, images);
  });
};

const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Only count active products (exclude soft-deleted)
    const countResult = await pool.query('SELECT COUNT(*) FROM products WHERE is_active = true');
    const total = parseInt(countResult.rows[0].count);

    // Only return active products (exclude soft-deleted)
    const result = await pool.query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.is_active = true
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Transform products for frontend compatibility (batch optimized - single image query)
    const transformedProducts = await transformProductsBatch(result.rows);

    paginatedResponse(res, transformedProducts, page, limit, total, 'Products retrieved successfully');
  } catch (error) {
    console.error('Admin get all products error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

// Get single product by ID (admin)
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Product not found', 'PRODUCT_NOT_FOUND', 404);
    }

    const transformed = await transformProduct(result.rows[0]);
    successResponse(res, transformed, 'Product retrieved successfully');
  } catch (error) {
    console.error('Admin get product by ID error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const createProduct = async (req, res) => {
  try {
    // Normalize body keys to lower case for insensitive matching
    const body = {};
    for (const key in req.body) {
      body[key.toLowerCase().trim()] = req.body[key];
    }
    
    // Extract fields using normalized keys
    const name = body.name;
    const description = body.description;
    const price = body.price;
    const stock = body.stock || body.stock_quantity;
    const is_featured = body.is_featured || body.featured;
    const use_as_slider = body.use_as_slider || body.useasslider || body.slider || false;
    
    // Discount fields
    const discount_percentage = body.discount_percentage || body.discount || 0;
    const is_on_sale = body.is_on_sale || body.isonsale || body.onsale || false;
    const sale_start_date = body.sale_start_date || body.salestartdate || null;
    const sale_end_date = body.sale_end_date || body.saleenddate || null;

    // Smart Category Extraction
    let categoryInput = body.category || body.category_id || body.categoryid || body.cat;
    
    // Smart Image Extraction
    // Look for any key that looks like an image
    let imageInput = body.image_url || body.image || body.imageurl || body.img || body.url;
    
    // If not found by direct key, search for ANY key containing "image" or "img"
    if (!imageInput) {
       const imageKey = Object.keys(body).find(k => k.includes('image') || k.includes('img'));
       if (imageKey) imageInput = body[imageKey];
    }

    const finalImageUrl = imageInput || '';

    if (!name || !price) {
      return errorResponse(res, 'Name and price are required', 'MISSING_FIELDS', 400);
    }

    // Resolve Category
    let finalCategoryId = null;

    if (categoryInput) {
      // Check if input is a numeric ID
      if (!isNaN(categoryInput) && parseInt(categoryInput) > 0) {
         finalCategoryId = parseInt(categoryInput);
      }
      // Treat as name
      else {
        const categoryResult = await pool.query(
          'SELECT id, name FROM categories WHERE name ILIKE $1 LIMIT 1',
          [categoryInput]
        );

        if (categoryResult.rows.length > 0) {
          finalCategoryId = categoryResult.rows[0].id;
        } else {
          // Auto-create
          const newCatResult = await pool.query(
            'INSERT INTO categories (name, description, is_active) VALUES ($1, $2, true) RETURNING id',
            [categoryInput, 'Auto-created category']
          );
          finalCategoryId = newCatResult.rows[0].id;
        }
      }
    }

    const result = await pool.query(
      `INSERT INTO products (name, description, price, stock, category_id, image_url, is_featured, use_as_slider, discount_percentage, is_on_sale, sale_start_date, sale_end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        name, 
        description, 
        parseFloat(price) || 0, 
        stock || 0, 
        finalCategoryId, 
        finalImageUrl, 
        is_featured || false, 
        use_as_slider,
        parseFloat(discount_percentage) || 0,
        is_on_sale,
        sale_start_date,
        sale_end_date
      ]
    );

    // Get category name for the response
    const productWithCategory = await pool.query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [result.rows[0].id]
    );

    const transformed = await transformProduct(productWithCategory.rows[0]);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: transformed
    });

  } catch (error) {
    console.error('Create product error:', error);
    errorResponse(res, 'Server error: ' + error.message, 'SERVER_ERROR', 500);
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`📝 Updating product ${id}:`, Object.keys(req.body));

    // Normalize body keys to lowercase for flexible field name matching
    const body = {};
    for (const key in req.body) {
      body[key.toLowerCase().trim()] = req.body[key];
    }

    const {
      name, description, price, stock, category_id, category,
      image_url, image, imageUrl, img,
      is_featured, use_as_slider, useAsSlider
    } = req.body;

    // Extract discount fields with fallback to camelCase variations
    const discount_percentage = body.discount_percentage ?? body.discountpercentage;
    const is_on_sale = body.is_on_sale ?? body.isonsale ?? body.onsale;
    const sale_start_date = body.sale_start_date ?? body.salestartdate;
    const sale_end_date = body.sale_end_date ?? body.saleenddate;

    // Handle images array if provided (for multiple images)
    const imagesArray = req.body.images || body.images;

    // Robust image extraction
    const finalImageUrl = image_url || image || imageUrl || img;

    // Handle use_as_slider field
    const finalUseAsSlider = use_as_slider !== undefined ? use_as_slider : (useAsSlider !== undefined ? useAsSlider : undefined);

    // Map category string to category_id
    let finalCategoryId = category_id;

    if (!finalCategoryId && category) {
      // Look up category by name
      const categoryResult = await pool.query(
        'SELECT id FROM categories WHERE name ILIKE $1 LIMIT 1',
        [category]
      );

      if (categoryResult.rows.length > 0) {
        finalCategoryId = categoryResult.rows[0].id;
      } else {
        // Auto-create category on update too if missing
        const newCatResult = await pool.query(
          'INSERT INTO categories (name, description, is_active) VALUES ($1, $2, true) RETURNING id',
          [category, 'Auto-created category']
        );
        finalCategoryId = newCatResult.rows[0].id;
      }
    }

    const result = await pool.query(
      `UPDATE products
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           stock = COALESCE($4, stock),
           category_id = COALESCE($5, category_id),
           image_url = COALESCE($6, image_url),
           is_featured = COALESCE($7, is_featured),
           use_as_slider = COALESCE($8, use_as_slider),
           discount_percentage = COALESCE($9, discount_percentage),
           is_on_sale = COALESCE($10, is_on_sale),
           sale_start_date = COALESCE($11, sale_start_date),
           sale_end_date = COALESCE($12, sale_end_date),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $13
       RETURNING *`,
      [
        name,
        description,
        price,
        stock,
        finalCategoryId,
        finalImageUrl,
        is_featured,
        finalUseAsSlider,
        discount_percentage,
        is_on_sale,
        sale_start_date,
        sale_end_date,
        id
      ]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Product not found', 'PRODUCT_NOT_FOUND', 404);
    }

    // Handle images array update if provided
    if (imagesArray && Array.isArray(imagesArray)) {
      console.log(`🖼️ Updating images array for product ${id}:`, imagesArray.length, 'images');

      // Delete existing images for this product
      await pool.query('DELETE FROM product_images WHERE product_id = $1', [id]);

      // Insert new images
      for (let i = 0; i < imagesArray.length; i++) {
        const img = imagesArray[i];
        const imageUrl = typeof img === 'string' ? img : (img.url || img.image_url);
        const thumbUrl = typeof img === 'string' ? null : (img.thumbUrl || img.thumb_url);
        const mediumUrl = typeof img === 'string' ? null : (img.mediumUrl || img.medium_url);
        const altText = typeof img === 'string' ? null : (img.altText || img.alt_text);
        const isPrimary = i === 0; // First image is primary

        if (imageUrl) {
          await pool.query(
            `INSERT INTO product_images (product_id, image_url, thumb_url, medium_url, alt_text, sort_order, is_primary)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [id, imageUrl, thumbUrl, mediumUrl, altText, i, isPrimary]
          );
        }
      }
      console.log(`✅ Images array updated for product ${id}`);
    }

    // Get category name for the response
    const productWithCategory = await pool.query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [id]
    );

    console.log(`✅ Product ${id} updated successfully`);
    successResponse(res, await transformProduct(productWithCategory.rows[0]), 'Product updated successfully');
  } catch (error) {
    console.error('Update product error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Soft-deleting product with ID: ${id}`);

    const result = await pool.query(
      'UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      console.log(`❌ Product with ID ${id} not found`);
      return errorResponse(res, 'Product not found', 'PRODUCT_NOT_FOUND', 404);
    }

    console.log(`✅ Product ${id} marked as inactive (soft-deleted)`);

    successResponse(res, result.rows[0], 'Product deleted successfully');
  } catch (error) {
    console.error('Delete product error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      return errorResponse(res, 'Valid stock quantity is required', 'INVALID_STOCK', 400);
    }

    const result = await pool.query(
      'UPDATE products SET stock = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [stock, id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Product not found', 'PRODUCT_NOT_FOUND', 404);
    }

    successResponse(res, result.rows[0], 'Stock updated successfully');
  } catch (error) {
    console.error('Update stock error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const toggleActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE products SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Product not found', 'PRODUCT_NOT_FOUND', 404);
    }

    successResponse(res, result.rows[0], 'Product status toggled successfully');
  } catch (error) {
    console.error('Toggle active status error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const bulkUpload = async (req, res) => {
  const client = await pool.connect();

  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return errorResponse(res, 'Products array is required', 'MISSING_FIELDS', 400);
    }

    await client.query('BEGIN');

    const uploadedProducts = [];

    for (const product of products) {
      if (!product.name || !product.price) {
        await client.query('ROLLBACK');
        return errorResponse(res, 'Each product must have name and price', 'INVALID_PRODUCT', 400);
      }

      const result = await client.query(
        `INSERT INTO products (name, description, price, stock, category_id, image_url, is_featured)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          product.name,
          product.description,
          product.price,
          product.stock || 0,
          product.category_id,
          product.image_url,
          product.is_featured || false
        ]
      );

      uploadedProducts.push(result.rows[0]);
    }

    await client.query('COMMIT');

    successResponse(res, uploadedProducts, `${uploadedProducts.length} products uploaded successfully`, 201);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Bulk upload error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  } finally {
    client.release();
  }
};

const toggleSliderStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE products SET use_as_slider = NOT use_as_slider, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Product not found', 'PRODUCT_NOT_FOUND', 404);
    }

    // Get category name for the response
    const productWithCategory = await pool.query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [id]
    );

    successResponse(res, await transformProduct(productWithCategory.rows[0]), 'Product slider status toggled successfully');
  } catch (error) {
    console.error('Toggle slider status error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  toggleActiveStatus,
  toggleSliderStatus,
  bulkUpload
};
