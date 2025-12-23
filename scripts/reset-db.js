process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = require('../config/database');

const resetDatabase = async () => {
  try {
    console.log('Dropping all tables...');

    await pool.query('DROP TABLE IF EXISTS notifications CASCADE');
    await pool.query('DROP TABLE IF EXISTS reviews CASCADE');
    await pool.query('DROP TABLE IF EXISTS wishlist CASCADE');
    await pool.query('DROP TABLE IF EXISTS order_items CASCADE');
    await pool.query('DROP TABLE IF EXISTS orders CASCADE');
    await pool.query('DROP TABLE IF EXISTS cart CASCADE');
    await pool.query('DROP TABLE IF EXISTS products CASCADE');
    await pool.query('DROP TABLE IF EXISTS categories CASCADE');
    await pool.query('DROP TABLE IF EXISTS users CASCADE');

    console.log('All tables dropped successfully!');
    console.log('\nNow run: npm run init-db');

    process.exit(0);
  } catch (error) {
    console.error('Error dropping tables:', error);
    process.exit(1);
  }
};

resetDatabase();
