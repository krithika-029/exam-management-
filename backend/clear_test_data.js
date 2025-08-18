const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'exam_management',
  password: process.env.DB_PASSWORD || '232910',
  port: process.env.DB_PORT || 5432,
});

async function clearTestData() {
  try {
    const result = await pool.query("DELETE FROM seat_allocations WHERE exam_session LIKE 'continuous_test%' OR exam_session LIKE 'test_%'");
    console.log(`🧹 Cleared ${result.rowCount} test seat allocations`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

clearTestData();
