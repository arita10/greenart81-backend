const pool = require('../config/database');

async function checkCategories() {
  try {
    console.log('🔍 Checking categories in database...\n');

    const result = await pool.query('SELECT * FROM categories ORDER BY id');

    if (result.rows.length === 0) {
      console.log('❌ No categories found in database!');
      console.log('\n💡 You need to create categories first.');
      console.log('\nRun this SQL to add sample categories:');
      console.log(`
INSERT INTO categories (name, description, is_active) VALUES
('Plants', 'Indoor and outdoor plants', true),
('Tools', 'Gardening tools and equipment', true),
('Seeds', 'Seeds and bulbs', true),
('Pots', 'Planters and containers', true),
('Fertilizers', 'Plant nutrients and fertilizers', true),
('Accessories', 'Garden accessories', true);
      `);
    } else {
      console.log(`✅ Found ${result.rows.length} categories:\n`);
      console.table(result.rows);

      console.log('\n📝 Category names for frontend:');
      result.rows.forEach(cat => {
        console.log(`   - "${cat.name}" (ID: ${cat.id})`);
      });
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkCategories();
