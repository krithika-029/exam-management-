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

// Get all classrooms
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, 
             COUNT(b.id) as total_benches,
             COUNT(CASE WHEN b.bench_type = '3-seater' THEN 1 END) as three_seater_count,
             COUNT(CASE WHEN b.bench_type = '5-seater' THEN 1 END) as five_seater_count
      FROM classrooms c
      LEFT JOIN benches b ON c.id = b.classroom_id AND b.is_active = true
      GROUP BY c.id
      ORDER BY c.room_number
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get classroom by ID with benches
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    const classroomResult = await pool.query('SELECT * FROM classrooms WHERE id = $1', [id]);
    if (classroomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    const benchesResult = await pool.query(
      'SELECT * FROM benches WHERE classroom_id = $1 AND is_active = true ORDER BY row_position, column_position',
      [id]
    );

    res.json({
      classroom: classroomResult.rows[0],
      benches: benchesResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new classroom
router.post('/', authenticateToken, requireAdminRole, async (req, res) => {
  const { room_number, block, floor, rows, columns } = req.body;
  
  try {
    const capacity = rows * columns * 2; // Assuming 2 students per bench
    
    const result = await pool.query(
      'INSERT INTO classrooms (room_number, block, floor, rows, columns, capacity) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [room_number, block, floor, rows, columns, capacity]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') { // Unique violation
      res.status(400).json({ error: 'Classroom with this room number already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Update classroom
router.put('/:id', authenticateToken, requireAdminRole, async (req, res) => {
  const { id } = req.params;
  const { room_number, block, floor, rows, columns } = req.body;
  
  try {
    const capacity = rows * columns * 2;
    
    const result = await pool.query(
      'UPDATE classrooms SET room_number = $1, block = $2, floor = $3, rows = $4, columns = $5, capacity = $6 WHERE id = $7 RETURNING *',
      [room_number, block, floor, rows, columns, capacity, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Classroom not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete classroom
router.delete('/:id', authenticateToken, requireAdminRole, async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query('DELETE FROM classrooms WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Classroom not found' });
    }
    
    res.json({ message: 'Classroom deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get benches for a classroom
router.get('/:id/benches', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      'SELECT * FROM benches WHERE classroom_id = $1 AND is_active = true ORDER BY row_position, column_position',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add bench to classroom
router.post('/:id/benches', authenticateToken, requireAdminRole, async (req, res) => {
  const { id } = req.params;
  const { row_position, column_position, bench_type } = req.body;
  
  try {
    // Check if bench already exists at this position
    const existingBench = await pool.query(
      'SELECT id FROM benches WHERE classroom_id = $1 AND row_position = $2 AND column_position = $3 AND is_active = true',
      [id, row_position, column_position]
    );
    
    if (existingBench.rows.length > 0) {
      return res.status(400).json({ error: 'Bench already exists at this position' });
    }
    
    const result = await pool.query(
      'INSERT INTO benches (classroom_id, row_position, column_position, bench_type, is_active) VALUES ($1, $2, $3, $4, true) RETURNING *',
      [id, row_position, column_position, bench_type]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete bench
router.delete('/:classroomId/benches/:benchId', authenticateToken, requireAdminRole, async (req, res) => {
  const { benchId } = req.params;
  
  try {
    const result = await pool.query(
      'UPDATE benches SET is_active = false WHERE id = $1 RETURNING *',
      [benchId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bench not found' });
    }
    
    res.json({ message: 'Bench removed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
