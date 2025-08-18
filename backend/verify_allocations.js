const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'exam_management',
  password: process.env.DB_PASSWORD || '232910',
  port: process.env.DB_PORT || 5432,
});

async function verifySeatAllocations() {
  try {
    console.log('🔍 Verifying Seat Allocations...\n');
    
    // Check total allocations
    const totalResult = await pool.query('SELECT COUNT(*) as count FROM seat_allocations');
    console.log(`📊 Total seat allocations: ${totalResult.rows[0].count}`);
    
    // Check allocations by exam session
    const sessionResult = await pool.query(`
      SELECT exam_session, branch, COUNT(*) as students
      FROM seat_allocations 
      GROUP BY exam_session, branch
      ORDER BY exam_session, branch
    `);
    
    console.log('\n📅 Allocations by exam session:');
    sessionResult.rows.forEach(row => {
      console.log(`   ${row.exam_session} (${row.branch}): ${row.students} students`);
    });
    
    // Sample allocated students
    const sampleResult = await pool.query(`
      SELECT sa.seat_number, s.registration_number, s.name, sa.branch, sa.subject_code, sa.exam_session
      FROM seat_allocations sa
      JOIN students s ON sa.student_id = s.id
      ORDER BY sa.exam_session, sa.seat_number
      LIMIT 10
    `);
    
    console.log('\n👥 Sample allocated students:');
    sampleResult.rows.forEach(row => {
      console.log(`   Seat ${row.seat_number}: ${row.registration_number} - ${row.name} (${row.branch}, ${row.subject_code})`);
    });
    
    console.log('\n✅ Seat allocation verification completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

verifySeatAllocations();
