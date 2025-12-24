const crypto = require('crypto');
const axios = require('axios');

/**
 * Shopier Payment Gateway Integration
 * Documentation: https://www.shopier.com/apidoc/
 */

class ShopierService {
  constructor() {
    this.apiKey = process.env.SHOPIER_API_KEY;
    this.apiSecret = process.env.SHOPIER_API_SECRET;
    this.baseURL = 'https://www.shopier.com/api';
  }

  /**
   * Generate signature for Shopier API requests
   */
  generateSignature(data) {
    const signatureData = `${this.apiKey}${data.random_nr}${this.apiSecret}`;
    return crypto.createHash('sha256').update(signatureData).digest('hex');
  }

  /**
   * Create payment form data
   * @param {Object} orderData - Order information
   * @returns {Object} Payment form data
   */
  createPaymentForm(orderData) {
    const {
      orderId,
      totalAmount,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items
    } = orderData;

    // Generate random number for signature
    const randomNr = Math.random().toString(36).substring(2, 15);

    // Prepare Shopier payment data
    const paymentData = {
      // API Credentials
      API_key: this.apiKey,
      website_index: 1, // Your website index from Shopier panel
      platform_order_id: orderId.toString(),

      // Customer Information
      buyer_name: customerName,
      buyer_email: customerEmail,
      buyer_phone: customerPhone,
      buyer_address: shippingAddress,

      // Order Information
      total_order_value: parseFloat(totalAmount).toFixed(2),
      currency: 'TL', // Turkish Lira

      // Products (Shopier requires at least product_name_1, product_type_1, etc.)
      ...this.formatProducts(items),

      // Security
      random_nr: randomNr,

      // Callback URLs
      callback_url: `${process.env.API_URL}/api/payment/shopier/callback`,

      // Language
      lang: 'tr', // Turkish

      // Module name
      modul_name: 'greenart81',
      modul_version: '1.0'
    };

    // Generate signature
    paymentData.signature = this.generateSignature(paymentData);

    return paymentData;
  }

  /**
   * Format products for Shopier API
   */
  formatProducts(items) {
    const products = {};

    items.forEach((item, index) => {
      const idx = index + 1;
      products[`product_name_${idx}`] = item.name;
      products[`product_type_${idx}`] = '0'; // 0 = Physical product
      products[`product_quantity_${idx}`] = item.quantity;
      products[`product_price_${idx}`] = parseFloat(item.price).toFixed(2);
    });

    return products;
  }

  /**
   * Verify callback signature from Shopier
   */
  verifyCallback(callbackData) {
    const { signature, random_nr, ...data } = callbackData;
    const expectedSignature = this.generateSignature({ random_nr });

    return signature === expectedSignature;
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(orderId) {
    try {
      const response = await axios.get(`${this.baseURL}/payment/status`, {
        params: {
          api_key: this.apiKey,
          order_id: orderId
        }
      });

      return response.data;
    } catch (error) {
      console.error('Shopier payment status check error:', error);
      throw error;
    }
  }
}

module.exports = new ShopierService();
