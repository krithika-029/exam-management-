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

// Get all exams
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, c.room_number, c.block, c.floor,
             COUNT(sa.id) as assigned_students
      FROM exams e
      LEFT JOIN classrooms c ON e.classroom_id = c.id
      LEFT JOIN seat_assignments sa ON e.id = sa.exam_id
      GROUP BY e.id, c.room_number, c.block, c.floor
      ORDER BY e.exam_date, e.exam_time
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get exam by ID
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT e.*, c.room_number, c.block, c.floor, c.capacity
      FROM exams e
      LEFT JOIN classrooms c ON e.classroom_id = c.id
      WHERE e.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exam not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new exam
router.post('/', authenticateToken, requireAdminRole, async (req, res) => {
  const { subject_code, subject_name, exam_date, exam_time, duration, classroom_id } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO exams (subject_code, subject_name, exam_date, exam_time, duration, classroom_id, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [subject_code, subject_name, exam_date, exam_time, duration, classroom_id, req.user.userId]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update exam
router.put('/:id', authenticateToken, requireAdminRole, async (req, res) => {
  const { id } = req.params;
  const { subject_code, subject_name, exam_date, exam_time, duration, classroom_id } = req.body;
  
  try {
    const result = await pool.query(
      'UPDATE exams SET subject_code = $1, subject_name = $2, exam_date = $3, exam_time = $4, duration = $5, classroom_id = $6 WHERE id = $7 RETURNING *',
      [subject_code, subject_name, exam_date, exam_time, duration, classroom_id, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exam not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete exam
router.delete('/:id', authenticateToken, requireAdminRole, async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query('DELETE FROM exams WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exam not found' });
    }
    
    res.json({ message: 'Exam deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
