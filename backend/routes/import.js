const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const { authenticateToken, requireAdminRole } = require('../middleware/auth');

const router = express.Router();
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'exam_management',
  password: process.env.DB_PASSWORD || '232910',
  port: process.env.DB_PORT || 5432,
});

// Configure multer for file upload
const upload = multer({ dest: 'uploads/' });

// Helper function to convert subject codes string to array
const parseSubjectCodes = (subjectCodesStr) => {
  if (!subjectCodesStr) return [];
  
  // Remove quotes and split by comma
  return subjectCodesStr
    .replace(/"/g, '')
    .split(',')
    .map(code => code.trim())
    .filter(code => code.length > 0);
};

// Helper function to extract name from email
const extractNameFromEmail = (email) => {
  const username = email.split('@')[0];
  // Remove numbers and make it more readable
  return username.replace(/\d+/g, '').charAt(0).toUpperCase() + username.replace(/\d+/g, '').slice(1);
};

// Import students from CSV file
router.post('/import-csv', authenticateToken, requireAdminRole, upload.single('csvFile'), async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const students = [];
    const errors = [];
    let processedCount = 0;
    let successCount = 0;
    
    // Read and parse CSV file
    const stream = fs.createReadStream(req.file.path)
      .pipe(csv());
    
    // Collect all data first
    const csvData = [];
    stream.on('data', (data) => csvData.push(data));
    
    await new Promise((resolve, reject) => {
      stream.on('end', resolve);
      stream.on('error', reject);
    });
    
    // Process each row
    for (const row of csvData) {
      try {
        processedCount++;
        
        const email = row.email?.trim();
        const registerNumber = row.register_number?.trim();
        const branch = row.branch?.trim();
        const subjectCodesStr = row.subject_codes?.trim();
        
        if (!email || !registerNumber || !branch) {
          errors.push(`Row ${processedCount}: Missing required fields`);
          continue;
        }
        
        // Check if user already exists
        const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
          errors.push(`Row ${processedCount}: User with email ${email} already exists`);
          continue;
        }
        
        // Check if registration number already exists
        const existingStudent = await client.query('SELECT id FROM students WHERE registration_number = $1', [registerNumber]);
        if (existingStudent.rows.length > 0) {
          errors.push(`Row ${processedCount}: Student with registration number ${registerNumber} already exists`);
          continue;
        }
        
        // Generate a proper password hash (users should change this)
        const defaultPassword = 'student123';
        const passwordHash = await bcrypt.hash(defaultPassword, 10);
        
        // Extract name from email
        const name = extractNameFromEmail(email);
        
        // Parse subject codes
        const subjectCodes = parseSubjectCodes(subjectCodesStr);
        
        // Create user
        const userResult = await client.query(
          'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id',
          [email, passwordHash, 'student']
        );
        
        const userId = userResult.rows[0].id;
        
        // Create student
        await client.query(
          'INSERT INTO students (user_id, registration_number, name, branch, subject_codes) VALUES ($1, $2, $3, $4, $5)',
          [userId, registerNumber, name, branch, subjectCodes]
        );
        
        successCount++;
        students.push({
          email,
          registerNumber,
          name,
          branch,
          subjectCodes
        });
        
      } catch (error) {
        errors.push(`Row ${processedCount}: ${error.message}`);
      }
    }
    
    await client.query('COMMIT');
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    res.json({
      message: 'CSV import completed',
      summary: {
        totalRows: processedCount,
        successfulImports: successCount,
        errors: errors.length,
        defaultPassword: 'student123'
      },
      students: students.slice(0, 10), // Return first 10 as sample
      errors: errors.slice(0, 20) // Return first 20 errors
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    
    // Clean up uploaded file
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('CSV import error:', error);
    res.status(500).json({ error: 'Failed to import CSV', details: error.message });
  } finally {
    client.release();
  }
});

// Import students from JSON data (for direct data import)
router.post('/import-json', authenticateToken, requireAdminRole, async (req, res) => {
  const { students } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const results = [];
    const errors = [];
    let successCount = 0;
    
    for (let i = 0; i < students.length; i++) {
      try {
        const student = students[i];
        const { email, register_number, branch, subject_codes, name } = student;
        
        if (!email || !register_number || !branch) {
          errors.push(`Student ${i + 1}: Missing required fields`);
          continue;
        }
        
        // Check if user already exists
        const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
          errors.push(`Student ${i + 1}: User with email ${email} already exists`);
          continue;
        }
        
        // Generate password hash
        const defaultPassword = 'student123';
        const passwordHash = await bcrypt.hash(defaultPassword, 10);
        
        // Use provided name or extract from email
        const studentName = name || extractNameFromEmail(email);
        
        // Parse subject codes
        const subjectCodesArray = Array.isArray(subject_codes) ? subject_codes : parseSubjectCodes(subject_codes);
        
        // Create user
        const userResult = await client.query(
          'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id',
          [email, passwordHash, 'student']
        );
        
        const userId = userResult.rows[0].id;
        
        // Create student
        await client.query(
          'INSERT INTO students (user_id, registration_number, name, branch, subject_codes) VALUES ($1, $2, $3, $4, $5)',
          [userId, register_number, studentName, branch, subjectCodesArray]
        );
        
        successCount++;
        results.push({ email, register_number, name: studentName, branch });
        
      } catch (error) {
        errors.push(`Student ${i + 1}: ${error.message}`);
      }
    }
    
    await client.query('COMMIT');
    
    res.json({
      message: 'JSON import completed',
      summary: {
        totalStudents: students.length,
        successfulImports: successCount,
        errors: errors.length,
        defaultPassword: 'student123'
      },
      results: results,
      errors: errors
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('JSON import error:', error);
    res.status(500).json({ error: 'Failed to import students', details: error.message });
  } finally {
    client.release();
  }
});

// Get import template
router.get('/template', authenticateToken, requireAdminRole, (req, res) => {
  const template = {
    csvHeaders: ['student_id', 'email', 'password_hash', 'register_number', 'branch', 'subject_codes'],
    sampleData: [
      {
        student_id: 1,
        email: 'john.doe@university.edu',
        password_hash: 'dummyhashedpassword',
        register_number: '21125104001',
        branch: 'CSE',
        subject_codes: 'CS101,CS102,CS103'
      }
    ],
    instructions: [
      'The student_id and password_hash columns are ignored during import',
      'Email must be unique across all users',
      'Registration number must be unique across all students',
      'Subject codes should be comma-separated (e.g., "CS101,CS102")',
      'Default password "student123" is assigned to all imported students',
      'Students should change their password after first login'
    ]
  };
  
  res.json(template);
});

module.exports = router;
