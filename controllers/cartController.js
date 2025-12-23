const pool = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

const getCart = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.quantity, c.created_at,
              p.id as product_id, p.name, p.price, p.image_url, p.stock
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1`,
      [req.user.id]
    );

    const cartItems = result.rows.map(item => ({
      id: item.id,
      quantity: item.quantity,
      created_at: item.created_at,
      product: {
        id: item.product_id,
        name: item.name,
        price: item.price,
        image_url: item.image_url,
        stock: item.stock
      },
      subtotal: parseFloat(item.price) * item.quantity
    }));

    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    successResponse(res, { items: cartItems, total }, 'Cart retrieved successfully');
  } catch (error) {
    console.error('Get cart error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const addToCart = async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return errorResponse(res, 'Product ID is required', 'MISSING_FIELDS', 400);
    }

    const productResult = await pool.query(
      'SELECT id, stock, is_active FROM products WHERE id = $1',
      [product_id]
    );

    if (productResult.rows.length === 0) {
      return errorResponse(res, 'Product not found', 'PRODUCT_NOT_FOUND', 404);
    }

    const product = productResult.rows[0];

    if (!product.is_active) {
      return errorResponse(res, 'Product is not available', 'PRODUCT_INACTIVE', 400);
    }

    if (product.stock < quantity) {
      return errorResponse(res, 'Insufficient stock', 'INSUFFICIENT_STOCK', 400);
    }

    const existingCart = await pool.query(
      'SELECT id, quantity FROM cart WHERE user_id = $1 AND product_id = $2',
      [req.user.id, product_id]
    );

    if (existingCart.rows.length > 0) {
      const newQuantity = existingCart.rows[0].quantity + quantity;

      if (product.stock < newQuantity) {
        return errorResponse(res, 'Insufficient stock', 'INSUFFICIENT_STOCK', 400);
      }

      const result = await pool.query(
        'UPDATE cart SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [newQuantity, existingCart.rows[0].id]
      );

      return successResponse(res, result.rows[0], 'Cart updated successfully');
    }

    const result = await pool.query(
      'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, product_id, quantity]
    );

    successResponse(res, result.rows[0], 'Item added to cart successfully', 201);
  } catch (error) {
    console.error('Add to cart error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return errorResponse(res, 'Valid quantity is required', 'INVALID_QUANTITY', 400);
    }

    const cartResult = await pool.query(
      'SELECT c.*, p.stock FROM cart c JOIN products p ON c.product_id = p.id WHERE c.id = $1 AND c.user_id = $2',
      [itemId, req.user.id]
    );

    if (cartResult.rows.length === 0) {
      return errorResponse(res, 'Cart item not found', 'CART_ITEM_NOT_FOUND', 404);
    }

    if (cartResult.rows[0].stock < quantity) {
      return errorResponse(res, 'Insufficient stock', 'INSUFFICIENT_STOCK', 400);
    }

    const result = await pool.query(
      'UPDATE cart SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [quantity, itemId]
    );

    successResponse(res, result.rows[0], 'Cart item updated successfully');
  } catch (error) {
    console.error('Update cart item error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const result = await pool.query(
      'DELETE FROM cart WHERE id = $1 AND user_id = $2 RETURNING *',
      [itemId, req.user.id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Cart item not found', 'CART_ITEM_NOT_FOUND', 404);
    }

    successResponse(res, null, 'Cart item removed successfully');
  } catch (error) {
    console.error('Remove cart item error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

const clearCart = async (req, res) => {
  try {
    await pool.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);

    successResponse(res, null, 'Cart cleared successfully');
  } catch (error) {
    console.error('Clear cart error:', error);
    errorResponse(res, 'Server error', 'SERVER_ERROR', 500);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};
