const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'exam_management',
  password: process.env.DB_PASSWORD || '232910',
  port: process.env.DB_PORT || 5432,
});

async function createCollegeTables() {
  try {
    console.log('Creating college tables...');

    // Create subjects table
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

    // Create student_subjects mapping table
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

    // Add email column to students if it doesn't exist
    await pool.query(`
      ALTER TABLE students 
      ADD COLUMN IF NOT EXISTS email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS classroom VARCHAR(10)
    `);
    console.log('✓ Added email and classroom columns to students');

    // Update branch constraint
    await pool.query(`
      ALTER TABLE students 
      DROP CONSTRAINT IF EXISTS students_branch_check
    `);
    await pool.query(`
      ALTER TABLE students 
      ADD CONSTRAINT students_branch_check 
      CHECK (branch IN ('CS', 'ME', 'CE', 'ECE', 'ISE', 'AI'))
    `);
    console.log('✓ Updated branch constraints');

    // Insert subjects
    const subjects = [
      // CS subjects
      ['CS201', 'Data Structures', 'CS', 2],
      ['CS202', 'Computer Organization', 'CS', 2],
      ['CS203', 'Discrete Mathematics', 'CS', 2],
      ['CS204', 'Digital Logic', 'CS', 2],
      ['CS205', 'Object Oriented Programming', 'CS', 2],
      ['CS206', 'Microprocessors', 'CS', 2],
      // ME subjects
      ['ME201', 'Thermodynamics', 'ME', 2],
      ['ME202', 'Engineering Mechanics', 'ME', 2],
      ['ME203', 'Fluid Mechanics', 'ME', 2],
      ['ME204', 'Manufacturing Processes', 'ME', 2],
      ['ME205', 'Mechanical Measurements', 'ME', 2],
      ['ME206', 'Kinematics of Machines', 'ME', 2],
      // CE subjects
      ['CE201', 'Surveying', 'CE', 2],
      ['CE202', 'Building Materials', 'CE', 2],
      ['CE203', 'Strength of Materials', 'CE', 2],
      ['CE204', 'Fluid Mechanics', 'CE', 2],
      ['CE205', 'Concrete Technology', 'CE', 2],
      ['CE206', 'Structural Analysis', 'CE', 2],
      // ECE subjects
      ['EC201', 'Analog Electronics', 'ECE', 2],
      ['EC202', 'Signals & Systems', 'ECE', 2],
      ['EC203', 'Logic Design', 'ECE', 2],
      ['EC204', 'Control Systems', 'ECE', 2],
      ['EC205', 'Microprocessors', 'ECE', 2],
      ['EC206', 'Communication Engineering', 'ECE', 2],
      // ISE subjects
      ['IS201', 'Software Engineering', 'ISE', 2],
      ['IS202', 'Data Structures', 'ISE', 2],
      ['IS203', 'Database Management', 'ISE', 2],
      ['IS204', 'Computer Networks', 'ISE', 2],
      ['IS205', 'Operating Systems', 'ISE', 2],
      ['IS206', 'Web Technologies', 'ISE', 2],
      // AI subjects
      ['AI201', 'Intro to AI', 'AI', 2],
      ['AI202', 'Machine Learning', 'AI', 2],
      ['AI203', 'Data Science', 'AI', 2],
      ['AI204', 'Python Programming', 'AI', 2],
      ['AI205', 'Neural Networks', 'AI', 2],
      ['AI206', 'Deep Learning', 'AI', 2]
    ];

    for (const [code, name, branch, semester] of subjects) {
      await pool.query(
        `INSERT INTO subjects (subject_code, subject_name, branch, semester) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (subject_code) DO NOTHING`,
        [code, name, branch, semester]
      );
    }
    console.log('✓ Subjects inserted');

    // Update existing students to have the new branch format
    await pool.query(`UPDATE students SET branch = 'ECE' WHERE branch = 'EE'`);
    await pool.query(`UPDATE students SET branch = 'ISE' WHERE branch = 'CSE' AND id > 300`);
    console.log('✓ Updated existing student branches');

    // Create indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_students_branch ON students(branch)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_subjects_branch ON subjects(branch)`);
    console.log('✓ Indexes created');

    console.log('College database setup completed successfully!');

  } catch (error) {
    console.error('Error setting up college database:', error);
  } finally {
    await pool.end();
  }
}

createCollegeTables();
