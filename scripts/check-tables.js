const pool = require('../config/database');

async function checkTables() {
  try {
    console.log('🔍 Checking database connection and tables...\n');

    // Check connection
    const connResult = await pool.query('SELECT current_database(), current_user, version()');
    console.log('✅ Connected to database:', connResult.rows[0].current_database);
    console.log('👤 User:', connResult.rows[0].current_user);
    console.log('📦 PostgreSQL version:', connResult.rows[0].version.split(',')[0]);
    console.log('');

    // Check tables
    const tables = await pool.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    if (tables.rows.length === 0) {
      console.log('❌ No tables found in public schema!');
      console.log('');
      console.log('💡 Run one of these commands to create tables:');
      console.log('   npm run init-db');
      console.log('   npm run add-qr-payment');
    } else {
      console.log(`✅ Found ${tables.rows.length} tables:\n`);
      tables.rows.forEach((row, i) => {
        console.log(`   ${i + 1}. ${row.tablename}`);
      });
      console.log('');

      // Count rows in each table
      console.log('📊 Row counts:\n');
      for (const table of tables.rows) {
        const count = await pool.query(`SELECT COUNT(*) FROM ${table.tablename}`);
        console.log(`   ${table.tablename.padEnd(20)} → ${count.rows[0].count} rows`);
      }
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Check your .env file:');
    console.log('   DB_CONNECTION_STRING should point to correct database');
    process.exit(1);
  }
}

checkTables();
