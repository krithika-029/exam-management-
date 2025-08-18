const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'exam_management',
  password: process.env.DB_PASSWORD || '2710',
  port: process.env.DB_PORT || 5432,
});

async function verifyImport() {
  try {
    console.log('🔍 Verifying student data import...\n');
    
    // Check total student count
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM students');
    console.log(`📊 Total students: ${totalResult.rows[0].total}`);
    
    // Check branch-wise distribution
    const branchResult = await pool.query(`
      SELECT branch, COUNT(*) as student_count 
      FROM students 
      GROUP BY branch 
      ORDER BY branch
    `);
    
    console.log('\n🏫 Branch-wise distribution:');
    let total = 0;
    branchResult.rows.forEach(row => {
      console.log(`   ${row.branch}: ${row.student_count} students`);
      total += parseInt(row.student_count);
    });
    
    // Check classroom distribution
    const classroomResult = await pool.query(`
      SELECT classroom, COUNT(*) as student_count 
      FROM students 
      GROUP BY classroom 
      ORDER BY classroom
    `);
    
    console.log('\n🏛️  Classroom distribution:');
    classroomResult.rows.forEach(row => {
      console.log(`   ${row.classroom}: ${row.student_count} students`);
    });
    
    // Check subject mappings
    const subjectResult = await pool.query(`
      SELECT COUNT(*) as total_mappings FROM student_subjects
    `);
    console.log(`\n📚 Total subject mappings: ${subjectResult.rows[0].total_mappings}`);
    
    // Sample students from each branch
    console.log('\n👥 Sample students:');
    const sampleResult = await pool.query(`
      SELECT registration_number, name, branch, classroom 
      FROM students 
      WHERE id IN (
        SELECT DISTINCT ON (branch) id FROM students ORDER BY branch, id LIMIT 6
      )
      ORDER BY branch
    `);
    
    sampleResult.rows.forEach(row => {
      console.log(`   ${row.registration_number} - ${row.name} (${row.branch}, ${row.classroom})`);
    });
    
    console.log('\n✅ Import verification completed successfully!');
    
  } catch (error) {
    console.error('❌ Error verifying import:', error.message);
  } finally {
    await pool.end();
  }
}

verifyImport();
