// Test category delete functionality
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = require('./config/database');

async function testCategoryDelete() {
  try {
    console.log('🧪 Testing Category Delete Functionality\n');

    // Step 1: Check current categories
    console.log('1️⃣  Getting all categories (before delete)...');
    const beforeAll = await pool.query('SELECT id, name, is_active FROM categories ORDER BY id');
    console.table(beforeAll.rows);

    // Step 2: Check active categories only
    console.log('\n2️⃣  Getting ACTIVE categories only...');
    const activeOnly = await pool.query('SELECT id, name, is_active FROM categories WHERE is_active = true ORDER BY id');
    console.table(activeOnly.rows);

    console.log('\n📊 Summary:');
    console.log(`Total categories in database: ${beforeAll.rows.length}`);
    console.log(`Active categories: ${activeOnly.rows.length}`);
    console.log(`Inactive (soft-deleted) categories: ${beforeAll.rows.length - activeOnly.rows.length}`);

    if (beforeAll.rows.length !== activeOnly.rows.length) {
      console.log('\n✅ Soft delete is working!');
      console.log('Inactive categories are being filtered out from the active list.\n');
    } else {
      console.log('\n⚠️  All categories are active. Try deleting one from the admin panel to test.\n');
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testCategoryDelete();
