const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'exam_management',
  password: process.env.DB_PASSWORD || '232910',
  port: process.env.DB_PORT || 5432,
});

async function checkTableStructure() {
  try {
    // Check seat_allocations table structure
    const seatAllocationsResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'seat_allocations'
      ORDER BY ordinal_position
    `);
    
    console.log('🪑 seat_allocations table columns:');
    seatAllocationsResult.rows.forEach(row => {
      console.log(`   ${row.column_name}: ${row.data_type}`);
    });
    
    // Also check if there are any existing allocations
    const countResult = await pool.query('SELECT COUNT(*) as count FROM seat_allocations');
    console.log(`\n📊 Existing seat allocations: ${countResult.rows[0].count}`);
    
    // Check sample student data
    const studentResult = await pool.query(`
      SELECT s.id, s.registration_number, s.name, s.branch, s.classroom,
             array_agg(subj.subject_code ORDER BY ss.subject_position) as subjects
      FROM students s
      LEFT JOIN student_subjects ss ON s.id = ss.student_id
      LEFT JOIN subjects subj ON ss.subject_id = subj.id
      WHERE s.branch = 'CS'
      GROUP BY s.id, s.registration_number, s.name, s.branch, s.classroom
      LIMIT 3
    `);
    
    console.log('\n👥 Sample CS students with subjects:');
    studentResult.rows.forEach(row => {
      console.log(`   ${row.registration_number} - ${row.name} (${row.branch}): ${row.subjects.join(', ')}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTableStructure();
