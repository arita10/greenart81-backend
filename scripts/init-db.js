process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

const initDatabase = async () => {
  try {
    console.log('Starting database initialization...');

    const sqlFilePath = path.join(__dirname, '../config/db-init.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    await pool.query(sql);

    console.log('Database initialized successfully!');
    console.log('Tables created:');
    console.log('- users');
    console.log('- categories');
    console.log('- products');
    console.log('- cart');
    console.log('- orders');
    console.log('- order_items');
    console.log('- wishlist');
    console.log('- reviews');
    console.log('- notifications');
    console.log('\nDefault admin account created:');
    console.log('Email: admin@greenart81.com');
    console.log('Password: admin123');
    console.log('\nIMPORTANT: Please change the admin password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initDatabase();
