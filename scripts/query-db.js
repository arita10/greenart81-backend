// Disable SSL certificate validation for Render.com database
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = require('../config/database');

async function queryDatabase() {
  try {
    console.log('🔍 Querying PostgreSQL Database...\n');

    // Get all tables
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('📋 Tables:', tables.rows.map(r => r.table_name).join(', '));
    console.log('');

    // Products
    console.log('📦 PRODUCTS (Last 10):');
    const products = await pool.query(`
      SELECT p.id, p.name, p.price, p.stock, c.name as category, p.image_url, p.is_active
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
      LIMIT 10
    `);
    if (products.rows.length > 0) {
      console.table(products.rows);
    } else {
      console.log('   No products found.\n');
    }

    // Users
    console.log('\n👥 USERS:');
    const users = await pool.query(`
      SELECT id, email, name, role, is_active
      FROM users
      ORDER BY created_at DESC
    `);
    if (users.rows.length > 0) {
      console.table(users.rows);
    } else {
      console.log('   No users found.\n');
    }

    // Orders
    console.log('\n🛒 RECENT ORDERS (Last 5):');
    const orders = await pool.query(`
      SELECT o.id, o.order_number, u.name as customer, o.total_amount,
             o.order_status, o.payment_status
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);
    if (orders.rows.length > 0) {
      console.table(orders.rows);
    } else {
      console.log('   No orders found.\n');
    }

    // Categories
    console.log('\n📁 CATEGORIES:');
    const categories = await pool.query(`
      SELECT id, name, description, is_active
      FROM categories
      ORDER BY name
    `);
    if (categories.rows.length > 0) {
      console.table(categories.rows);
    } else {
      console.log('   No categories found.\n');
    }

    // QR Payment Codes
    console.log('\n💳 QR PAYMENT CODES:');
    const qrCodes = await pool.query(`
      SELECT id, bank_name, account_name, payment_type, is_active
      FROM qr_payment_codes
      ORDER BY created_at DESC
    `);
    if (qrCodes.rows.length > 0) {
      console.table(qrCodes.rows);
    } else {
      console.log('   No QR codes found.\n');
    }

    // Stats
    console.log('\n📊 STATISTICS:');
    const stats = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM products) as total_products,
        (SELECT COUNT(*) FROM products WHERE is_active = true) as active_products,
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'admin') as admin_users,
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COUNT(*) FROM orders WHERE payment_status = 'completed') as completed_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE payment_status = 'completed') as total_revenue
    `);
    console.table(stats.rows);

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

queryDatabase();
