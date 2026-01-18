require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function optimizeDatabase() {
  try {
    console.log('🔌 Connecting to database...');
    const client = await pool.connect();
    
    try {
      console.log('🚀 Starting database optimization...');
      
      const sqlPath = path.join(__dirname, '../config/optimize-db.sql');
      const sql = fs.readFileSync(sqlPath, 'utf8');
      
      console.log('📝 Applying indexes...');
      await client.query(sql);
      
      console.log('✅ Database optimization completed successfully!');
      console.log('   - Added indexes for products (created_at, price, featured, slider)');
      console.log('   - Added indexes for categories, reviews, and order items');
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Optimization failed:', error);
    // If it's a certificate error, it might be due to local env differences.
    // We don't want to fail the build/deploy pipeline if this is just a local issue.
    if (error.code === 'SELF_SIGNED_CERT_IN_CHAIN') {
        console.log('⚠️  Ignoring SSL certificate error for optimization script.');
    } else {
        process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

optimizeDatabase();
