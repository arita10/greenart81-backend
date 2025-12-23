process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const pool = require('../config/database');

const testConnection = async () => {
  try {
    console.log('Testing database connection...');

    const result = await pool.query('SELECT NOW()');

    console.log('Connection successful!');
    console.log('Server time:', result.rows[0].now);

    const versionResult = await pool.query('SELECT version()');
    console.log('PostgreSQL version:', versionResult.rows[0].version);

    process.exit(0);
  } catch (error) {
    console.error('Connection failed:', error.message);
    process.exit(1);
  }
};

testConnection();
