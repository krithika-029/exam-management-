const fs = require('fs');
const csv = require('csv-parser');
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

async function importStudentsFromCSV(csvFilePath) {
  const students = [];
  const studentSubjects = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        // Add student data
        students.push({
          usn: row.usn,
          name: row.name,
          email: row.email,
          branch: row.branch,
          classroom: row.classroom
        });

        // Add subject mappings (sub1 to sub6)
        for (let i = 1; i <= 6; i++) {
          const subjectCode = row[`sub${i}_code`];
          if (subjectCode) {
            studentSubjects.push({
              usn: row.usn,
              subjectCode: subjectCode,
              position: i,
              subjectName: row[`sub${i}_name`]
            });
          }
        }
      })
      .on('end', async () => {
        try {
          console.log(`Parsed ${students.length} students from CSV`);
          
          // Insert students
          for (const student of students) {
            await pool.query(
              `INSERT INTO students (registration_number, name, email, branch, classroom) 
               VALUES ($1, $2, $3, $4, $5) 
               ON CONFLICT (registration_number) DO NOTHING`,
              [student.usn, student.name, student.email, student.branch, student.classroom]
            );
          }
          console.log('Students imported successfully');

          // Insert subject mappings
          for (const mapping of studentSubjects) {
            // First ensure subject exists
            await pool.query(
              `INSERT INTO subjects (subject_code, subject_name, branch) 
               VALUES ($1, $2, $3) 
               ON CONFLICT (subject_code) DO NOTHING`,
              [mapping.subjectCode, mapping.subjectName, mapping.usn.includes('CS') ? 'CS' : 
                mapping.usn.includes('ME') ? 'ME' : 
                mapping.usn.includes('CE') ? 'CE' : 
                mapping.usn.includes('EC') ? 'ECE' : 
                mapping.usn.includes('IS') ? 'ISE' : 'AI']
            );

            // Then map student to subject
            await pool.query(
              `INSERT INTO student_subjects (student_id, subject_id, subject_position)
               SELECT s.id, sub.id, $3
               FROM students s, subjects sub
               WHERE s.registration_number = $1 AND sub.subject_code = $2
               ON CONFLICT (student_id, subject_position) DO NOTHING`,
              [mapping.usn, mapping.subjectCode, mapping.position]
            );
          }
          console.log('Subject mappings imported successfully');
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
}

// Usage
async function main() {
  const csvFilePath = process.argv[2] || './students_data.csv';
  
  if (!fs.existsSync(csvFilePath)) {
    console.error(`CSV file not found: ${csvFilePath}`);
    console.log('Usage: node import_college_data.js <csv_file_path>');
    process.exit(1);
  }

  try {
    await importStudentsFromCSV(csvFilePath);
    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = { importStudentsFromCSV };
