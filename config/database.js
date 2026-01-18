const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

// Optimized connection pool configuration
const pool = new Pool({
  connectionString: process.env.DB_CONNECTION_STRING,
  ssl: process.env.DB_CONNECTION_STRING?.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false,
  // Pool configuration for better performance
  max: parseInt(process.env.DB_POOL_MAX) || 20,              // Maximum connections in pool
  min: parseInt(process.env.DB_POOL_MIN) || 2,               // Minimum connections to maintain
  idleTimeoutMillis: 30000,                                   // Close idle connections after 30s
  connectionTimeoutMillis: 5000,                              // Timeout for new connections
  maxUses: 7500,                                              // Close connection after N uses (prevents memory leaks)
  application_name: 'greenart81-backend'                      // Helps identify connections in pg_stat_activity
});

// Log connection events (only first connect in production)
let hasConnected = false;
pool.on('connect', () => {
  if (!hasConnected) {
    console.log('Connected to PostgreSQL database');
    hasConnected = true;
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit in production, let the pool recover
  if (!isProduction) {
    process.exit(-1);
  }
});

// Graceful shutdown helper
const closePool = async () => {
  try {
    await pool.end();
    console.log('Database pool closed');
  } catch (err) {
    console.error('Error closing database pool:', err);
  }
};

module.exports = pool;
module.exports.closePool = closePool;
