// Add Firebase UID support to users table
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DB_CONNECTION_STRING,
  ssl: process.env.DB_CONNECTION_STRING.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false
});

async function addFirebaseSupport() {
  try {
    console.log('📝 Adding Firebase support to users table...');

    const sqlFilePath = path.join(__dirname, '../config/add-firebase-uid.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    await pool.query(sql);

    console.log('✅ Firebase support added successfully!');
    console.log('\nChanges made:');
    console.log('- Added firebase_uid column to users table');
    console.log('- Created index on firebase_uid for faster lookups');
    console.log('- Made password column nullable (for Firebase users)');
    console.log('\nYour backend is now ready for Google Firebase login! 🎉');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addFirebaseSupport();
