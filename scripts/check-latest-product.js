const pool = require('../config/database');

async function checkLatestProduct() {
  try {
    console.log('🔍 Checking latest product in database...\n');

    const result = await pool.query(`
      SELECT p.id, p.name, p.price, p.stock,
             p.category_id, c.name as category_name,
             p.image_url, p.created_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
      LIMIT 1
    `);

    if (result.rows.length > 0) {
      const product = result.rows[0];
      console.log('✅ Latest product:');
      console.log('   ID:', product.id);
      console.log('   Name:', product.name);
      console.log('   Price:', product.price);
      console.log('   Stock:', product.stock);
      console.log('   Category ID:', product.category_id);
      console.log('   Category Name:', product.category_name || 'NULL');
      console.log('   Image URL:', product.image_url || 'NULL');
      console.log('   Created:', product.created_at);

      console.log('\n📊 Field Status:');
      console.log('   Image URL:', product.image_url ? '✅ HAS VALUE' : '❌ NULL');
      console.log('   Category ID:', product.category_id ? '✅ HAS VALUE' : '❌ NULL');
      console.log('   Category Name:', product.category_name ? '✅ HAS VALUE' : '❌ NULL');
    } else {
      console.log('❌ No products found');
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkLatestProduct();
