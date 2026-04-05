const { Pool } = require('pg');
require('dotenv').config();

// 1. Define the base configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'logedge_billing',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

// 2. Automatically add SSL if connecting to a cloud database (like Neon)
if (process.env.DB_HOST && process.env.DB_HOST !== 'localhost') {
  dbConfig.ssl = {
    rejectUnauthorized: false
  };
}

// 3. Create the pool with the smart configuration
const pool = new Pool(dbConfig);

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

module.exports = pool;