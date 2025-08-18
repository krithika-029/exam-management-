const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'exam_management',
  password: process.env.DB_PASSWORD || '232910',
  port: process.env.DB_PORT || 5432,
});

async function fixData() {
  try {
    console.log('Fixing existing data...');

    // Check current branch values
    const branches = await pool.query('SELECT DISTINCT branch FROM students');
    console.log('Current branches:', branches.rows.map(r => r.branch));

    // Update branch names to match college format
    await pool.query(`UPDATE students SET branch = 'CS' WHERE branch = 'CSE'`);
    await pool.query(`UPDATE students SET branch = 'ECE' WHERE branch = 'EE'`);
    await pool.query(`UPDATE students SET branch = 'ME' WHERE branch = 'MECH'`);
    await pool.query(`UPDATE students SET branch = 'CE' WHERE branch = 'CIVIL'`);
    
    // Check updated branches
    const updatedBranches = await pool.query('SELECT DISTINCT branch FROM students');
    console.log('Updated branches:', updatedBranches.rows.map(r => r.branch));

    // Now add the constraint
    await pool.query(`
      ALTER TABLE students 
      ADD CONSTRAINT students_branch_check 
      CHECK (branch IN ('CS', 'ME', 'CE', 'ECE', 'ISE', 'AI'))
    `);
    console.log('✓ Branch constraint added');

    // Add subjects table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id SERIAL PRIMARY KEY,
        subject_code VARCHAR(10) UNIQUE NOT NULL,
        subject_name VARCHAR(255) NOT NULL,
        branch VARCHAR(10) NOT NULL,
        semester INTEGER DEFAULT 2,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Subjects table created');

    // Add student_subjects mapping
    await pool.query(`
      CREATE TABLE IF NOT EXISTS student_subjects (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
        subject_position INTEGER CHECK (subject_position BETWEEN 1 AND 6),
        UNIQUE(student_id, subject_position),
        UNIQUE(student_id, subject_id)
      )
    `);
    console.log('✓ Student_subjects table created');

    // Add email and classroom columns
    try {
      await pool.query(`ALTER TABLE students ADD COLUMN email VARCHAR(255)`);
      console.log('✓ Added email column');
    } catch (e) {
      console.log('Email column already exists');
    }

    try {
      await pool.query(`ALTER TABLE students ADD COLUMN classroom VARCHAR(10)`);
      console.log('✓ Added classroom column');
    } catch (e) {
      console.log('Classroom column already exists');
    }

    console.log('Data fix completed!');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixData();
