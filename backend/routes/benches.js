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

// Get benches for a classroom
router.get('/classroom/:classroomId', authenticateToken, async (req, res) => {
  const { classroomId } = req.params;
  
  try {
    const result = await pool.query(
      'SELECT * FROM benches WHERE classroom_id = $1 AND is_active = true ORDER BY row_position, column_position',
      [classroomId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create bench configuration for a classroom
router.post('/classroom/:classroomId', authenticateToken, requireAdminRole, async (req, res) => {
  const { classroomId } = req.params;
  const { benches } = req.body; // Array of bench configurations
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // First, deactivate all existing benches for this classroom
    await client.query(
      'UPDATE benches SET is_active = false WHERE classroom_id = $1',
      [classroomId]
    );
    
    // Insert new bench configurations
    for (const bench of benches) {
      await client.query(
        'INSERT INTO benches (classroom_id, bench_type, row_position, column_position, is_active) VALUES ($1, $2, $3, $4, true)',
        [classroomId, bench.bench_type, bench.row_position, bench.column_position]
      );
    }
    
    await client.query('COMMIT');
    
    // Return updated benches
    const result = await client.query(
      'SELECT * FROM benches WHERE classroom_id = $1 AND is_active = true ORDER BY row_position, column_position',
      [classroomId]
    );
    
    res.json(result.rows);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Update bench
router.put('/:id', authenticateToken, requireAdminRole, async (req, res) => {
  const { id } = req.params;
  const { bench_type, row_position, column_position } = req.body;
  
  try {
    const result = await pool.query(
      'UPDATE benches SET bench_type = $1, row_position = $2, column_position = $3 WHERE id = $4 AND is_active = true RETURNING *',
      [bench_type, row_position, column_position, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bench not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete bench (soft delete)
router.delete('/:id', authenticateToken, requireAdminRole, async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      'UPDATE benches SET is_active = false WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bench not found' });
    }
    
    res.json({ message: 'Bench deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
