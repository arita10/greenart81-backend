// Fix admin account by creating it with correct password hash
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DB_CONNECTION_STRING,
  ssl: process.env.DB_CONNECTION_STRING.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false
});

async function fixAdmin() {
  try {
    const email = 'admin@greenart81.com';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Deleting old admin account if exists...');
    await pool.query('DELETE FROM users WHERE email = $1', [email]);

    console.log('Creating new admin account...');
    const result = await pool.query(
      `INSERT INTO users (email, password, name, phone, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, role`,
      [email, hashedPassword, 'Admin User', '1234567890', 'admin']
    );

    console.log('\n✅ Admin account created successfully!');
    console.log('Admin details:', result.rows[0]);
    console.log('\nCredentials:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('\n⚠️  IMPORTANT: Change password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixAdmin();
