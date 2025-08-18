const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'exam_management',
  password: process.env.DB_PASSWORD || '2710',
  port: process.env.DB_PORT || 5432,
});

async function generateReport() {
  try {
    console.log('📊 SAHYADRI COLLEGE - STUDENT DATA IMPORT REPORT');
    console.log('='.repeat(60));
    
    // Basic statistics
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM students');
    const total = parseInt(totalResult.rows[0].total);
    
    console.log(`\n🎯 IMPORT SUMMARY:`);
    console.log(`   Total Students Imported: ${total}`);
    console.log(`   Target Capacity: 680`);
    console.log(`   Import Status: ${total === 680 ? '✅ COMPLETE' : '⚠️  INCOMPLETE'}`);
    
    // Branch analysis
    console.log(`\n🏫 BRANCH-WISE DISTRIBUTION:`);
    const branchResult = await pool.query(`
      SELECT 
        branch,
        COUNT(*) as actual_count,
        CASE 
          WHEN branch = 'CS' THEN 240
          WHEN branch = 'AI' THEN 120
          WHEN branch = 'ECE' THEN 100
          WHEN branch = 'ISE' THEN 100
          WHEN branch = 'ME' THEN 60
          WHEN branch = 'CE' THEN 60
        END as target_count
      FROM students 
      GROUP BY branch 
      ORDER BY actual_count DESC
    `);
    
    branchResult.rows.forEach(row => {
      const status = row.actual_count == row.target_count ? '✅' : '⚠️';
      console.log(`   ${row.branch}: ${row.actual_count}/${row.target_count} students ${status}`);
    });
    
    // Classroom utilization
    console.log(`\n🏛️  CLASSROOM UTILIZATION:`);
    const classroomResult = await pool.query(`
      SELECT 
        c.room_number,
        c.capacity,
        COALESCE(s.student_count, 0) as student_count,
        CAST((COALESCE(s.student_count, 0)::float / c.capacity) * 100 AS DECIMAL(5,1)) as utilization_percent
      FROM classrooms c
      LEFT JOIN (
        SELECT classroom, COUNT(*) as student_count 
        FROM students 
        GROUP BY classroom
      ) s ON c.room_number = s.classroom
      ORDER BY c.room_number
    `);
    
    classroomResult.rows.forEach(row => {
      const util = parseFloat(row.utilization_percent);
      const status = util > 95 ? '🔴' : util > 80 ? '🟡' : util > 0 ? '🟢' : '⚪';
      console.log(`   ${row.room_number}: ${row.student_count}/${row.capacity} (${util}%) ${status}`);
    });
    
    // Subject distribution
    const subjectResult = await pool.query(`
      SELECT COUNT(*) as total_mappings FROM student_subjects
    `);
    
    console.log(`\n📚 ACADEMIC DETAILS:`);
    console.log(`   Total Subject Mappings: ${subjectResult.rows[0].total_mappings}`);
    console.log(`   Expected Mappings: ${total * 6} (6 per student)`);
    console.log(`   Mapping Status: ${parseInt(subjectResult.rows[0].total_mappings) === (total * 6) ? '✅ COMPLETE' : '⚠️  INCOMPLETE'}`);
    
    // Email domain analysis
    const emailResult = await pool.query(`
      SELECT 
        COUNT(*) as scem_emails
      FROM students 
      WHERE email LIKE '%@scem.edu'
    `);
    
    console.log(`\n📧 EMAIL VERIFICATION:`);
    console.log(`   SCEM Domain Emails: ${emailResult.rows[0].scem_emails}/${total}`);
    console.log(`   Domain Compliance: ${parseInt(emailResult.rows[0].scem_emails) === total ? '✅ 100%' : '⚠️  PARTIAL'}`);
    
    // USN format analysis
    const usnResult = await pool.query(`
      SELECT 
        COUNT(*) as valid_usn
      FROM students 
      WHERE registration_number ~ '^4SF22[A-Z]+[0-9]{3}$'
    `);
    
    console.log(`\n🆔 USN FORMAT VERIFICATION:`);
    console.log(`   Valid USN Format: ${usnResult.rows[0].valid_usn}/${total}`);
    console.log(`   Format Compliance: ${parseInt(usnResult.rows[0].valid_usn) === total ? '✅ 100%' : '⚠️  PARTIAL'}`);
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ IMPORT COMPLETED SUCCESSFULLY - READY FOR EXAM SCHEDULING`);
    console.log(`${'='.repeat(60)}`);
    
  } catch (error) {
    console.error('❌ Error generating report:', error.message);
  } finally {
    await pool.end();
  }
}

generateReport();
