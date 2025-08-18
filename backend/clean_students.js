const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'exam_management',
  password: process.env.DB_PASSWORD || '2710',
  port: process.env.DB_PORT || 5432,
});

async function cleanDatabase() {
  try {
    console.log('🧹 Cleaning existing student data...');
    
    // Check what tables exist
    const tableResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('📋 Existing tables:');
    tableResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // Clean tables in proper order (children first)
    const tablesToClean = [
      'seat_assignments', 
      'seat_allocations', 
      'student_subjects', 
      'students'
    ];
    
    for (const table of tablesToClean) {
      try {
        const result = await pool.query(`DELETE FROM ${table}`);
        console.log(`✅ Cleared ${table} (${result.rowCount} rows deleted)`);
      } catch (error) {
        console.log(`⚠️  Table ${table} might not exist or already empty: ${error.message}`);
      }
    }
    
    // Reset sequences
    try {
      await pool.query('ALTER SEQUENCE students_id_seq RESTART WITH 1');
      await pool.query('ALTER SEQUENCE student_subjects_id_seq RESTART WITH 1');
      console.log('✅ Reset ID sequences');
    } catch (error) {
      console.log('⚠️  Some sequences might not exist');
    }
    
    console.log('\n🎯 Database cleaned successfully!');
    
  } catch (error) {
    console.error('❌ Error cleaning database:', error.message);
  } finally {
    await pool.end();
  }
}

cleanDatabase();
