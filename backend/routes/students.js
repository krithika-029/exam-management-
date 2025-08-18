const express = require('express');
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

// Get all students (admin only)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, 
             COALESCE(array_agg(subj.subject_code ORDER BY ss.subject_position), '{}') as subject_codes
      FROM students s
      LEFT JOIN student_subjects ss ON s.id = ss.student_id
      LEFT JOIN subjects subj ON ss.subject_id = subj.id
      GROUP BY s.id, s.registration_number, s.name, s.email, s.branch, s.classroom, s.created_at
      ORDER BY s.registration_number
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get student by ID
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  // Students can only access their own data
  if (req.user.role === 'student') {
    const studentResult = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.userId]);
    if (studentResult.rows.length === 0 || studentResult.rows[0].id != id) {
      return res.status(403).json({ error: 'Access denied' });
    }
  }
  
  try {
    const result = await pool.query(`
      SELECT s.*, u.email
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update student
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, branch, subject_codes } = req.body;
  
  // Students can only update their own data
  if (req.user.role === 'student') {
    const studentResult = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.userId]);
    if (studentResult.rows.length === 0 || studentResult.rows[0].id != id) {
      return res.status(403).json({ error: 'Access denied' });
    }
  }
  
  try {
    const result = await pool.query(
      'UPDATE students SET name = $1, branch = $2, subject_codes = $3 WHERE id = $4 RETURNING *',
      [name, branch, subject_codes, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete student (admin only)
router.delete('/:id', authenticateToken, requireAdminRole, async (req, res) => {
  const { id } = req.params;
  
  try {
    // Get user_id first
    const studentResult = await pool.query('SELECT user_id FROM students WHERE id = $1', [id]);
    
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const userId = studentResult.rows[0].user_id;
    
    // Delete user (this will cascade delete the student due to foreign key)
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add sample students (admin only)
router.post('/sample', authenticateToken, requireAdminRole, async (req, res) => {
  const sampleData = [
    { email: 'student1@example.com', password: 'password123', name: 'John Doe', regNumber: 'CS001', branch: 'Computer Science', subjects: ['CS101', 'CS102'] },
    { email: 'student2@example.com', password: 'password123', name: 'Jane Smith', regNumber: 'CS002', branch: 'Computer Science', subjects: ['CS101', 'CS103'] },
    { email: 'student3@example.com', password: 'password123', name: 'Mike Johnson', regNumber: 'CS003', branch: 'Information Technology', subjects: ['CS102', 'CS103'] },
    { email: 'student4@example.com', password: 'password123', name: 'Sarah Wilson', regNumber: 'CS004', branch: 'Computer Science', subjects: ['CS101', 'CS104'] },
    { email: 'student5@example.com', password: 'password123', name: 'David Brown', regNumber: 'CS005', branch: 'Information Technology', subjects: ['CS102', 'CS104'] },
  ];
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const bcrypt = require('bcryptjs');
    
    for (const data of sampleData) {
      // Check if user already exists
      const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [data.email]);
      
      if (existingUser.rows.length === 0) {
        // Hash password
        const passwordHash = await bcrypt.hash(data.password, 10);
        
        // Create user
        const userResult = await client.query(
          'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id',
          [data.email, passwordHash, 'student']
        );
        
        // Create student
        await client.query(
          'INSERT INTO students (user_id, registration_number, name, branch, subject_codes) VALUES ($1, $2, $3, $4, $5)',
          [userResult.rows[0].id, data.regNumber, data.name, data.branch, data.subjects]
        );
      }
    }
    
    await client.query('COMMIT');
    res.json({ message: 'Sample students created successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

module.exports = router;
