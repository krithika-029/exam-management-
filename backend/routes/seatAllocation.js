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

// Get available students for seating allocation
router.post('/get-available-students', async (req, res) => {
  const client = await pool.connect();

  try {
    const { branch1, branch2, subjectCode1, subjectCode2, examSession, classroomCapacity } = req.body;

    // Get students from branch1 who are registered for subjectCode1 and not already allocated
    const branch1Query = `
      SELECT DISTINCT s.*, s.email 
      FROM students s 
      JOIN student_subjects ss ON s.id = ss.student_id
      JOIN subjects subj ON ss.subject_id = subj.id
      WHERE s.branch = $1 
      AND subj.subject_code = $2
      AND s.id NOT IN (
        SELECT student_id FROM seat_allocations WHERE exam_session = $3
      )
      ORDER BY s.registration_number
      LIMIT $4
    `;

    const halfCapacity = Math.floor(classroomCapacity / 2);
    const branch1Result = await client.query(branch1Query, [branch1, subjectCode1, examSession, halfCapacity]);

    // Get students from branch2 who are registered for subjectCode2 and not already allocated  
    const branch2Query = `
      SELECT DISTINCT s.*, s.email 
      FROM students s 
      JOIN student_subjects ss ON s.id = ss.student_id
      JOIN subjects subj ON ss.subject_id = subj.id
      WHERE s.branch = $1 
      AND subj.subject_code = $2
      AND s.id NOT IN (
        SELECT student_id FROM seat_allocations WHERE exam_session = $3
      )
      ORDER BY s.registration_number
      LIMIT $4
    `;

    const branch2Result = await client.query(branch2Query, [branch2 || branch1, subjectCode2, examSession, halfCapacity]);

    // Get count of already allocated students for this session and highest seat number
    const allocatedStatsQuery = `
      SELECT 
        COUNT(*) as count,
        COALESCE(MAX(seat_number), 0) as max_seat_number
      FROM seat_allocations 
      WHERE exam_session = $1
    `;
    const allocatedStatsResult = await client.query(allocatedStatsQuery, [examSession]);
    const totalAllocatedInSession = parseInt(allocatedStatsResult.rows[0].count);
    const lastSeatNumber = parseInt(allocatedStatsResult.rows[0].max_seat_number);

    // For continuous seat numbering, we use the full classroom capacity
    // The 'allocatedCount' is just for information, not for capacity checking
    const remainingCapacity = classroomCapacity;

    // Allocate students based on remaining capacity (50-50 split)
    const studentsPerBranch = Math.floor(remainingCapacity / 2);
    const extraCapacity = remainingCapacity % 2;

    // Get the required number of students from each branch
    const branch1Students = branch1Result.rows.slice(0, studentsPerBranch + (extraCapacity > 0 ? 1 : 0));
    const branch2Students = branch2Result.rows.slice(0, studentsPerBranch);

    res.json({
      branch1Students,
      branch2Students,
      allocatedCount: totalAllocatedInSession,
      lastSeatNumber,
      remainingCapacity,
      totalAvailableBranch1: branch1Result.rows.length,
      totalAvailableBranch2: branch2Result.rows.length
    });

  } catch (error) {
    console.error('Error getting available students:', error);
    res.status(500).json({ error: 'Failed to get available students' });
  } finally {
    client.release();
  }
});

// Save seat allocation
router.post('/save-seat-allocation', async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      examSession,
      classroomId,
      branch1Students,
      branch2Students,
      branch1,
      branch2,
      subjectCode1,
      subjectCode2
    } = req.body;

    await client.query('BEGIN');

    // Insert branch1 students
    for (let i = 0; i < branch1Students.length; i++) {
      const student = branch1Students[i];
      await client.query(
        `INSERT INTO seat_allocations (student_id, classroom_id, exam_session, branch, subject_code, seat_number)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [student.id, classroomId, examSession, branch1, subjectCode1, student.seatNumber || (i + 1)]
      );
    }

    // Insert branch2 students
    for (let i = 0; i < branch2Students.length; i++) {
      const student = branch2Students[i];
      await client.query(
        `INSERT INTO seat_allocations (student_id, classroom_id, exam_session, branch, subject_code, seat_number)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [student.id, classroomId, examSession, branch2 || branch1, subjectCode2, student.seatNumber || (branch1Students.length + i + 1)]
      );
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Seat allocation saved successfully',
      allocatedStudents: branch1Students.length + branch2Students.length
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving seat allocation:', error);
    res.status(500).json({ error: 'Failed to save seat allocation' });
  } finally {
    client.release();
  }
});

// Get allocation history
router.get('/allocation-history', authenticateToken, async (req, res) => {
  const client = await pool.connect();

  try {
    const query = `
      SELECT 
        sa.exam_session,
        sa.branch,
        sa.subject_code,
        c.room_number,
        c.block,
        COUNT(sa.student_id) as student_count,
        sa.allocated_at
      FROM seat_allocations sa
      JOIN classrooms c ON sa.classroom_id = c.id
      GROUP BY sa.exam_session, sa.branch, sa.subject_code, c.room_number, c.block, sa.allocated_at
      ORDER BY sa.allocated_at DESC
    `;

    const result = await client.query(query);
    res.json(result.rows);

  } catch (error) {
    console.error('Error getting allocation history:', error);
    res.status(500).json({ error: 'Failed to get allocation history' });
  } finally {
    client.release();
  }
});

// Clear allocations for a specific exam session
router.delete('/clear-allocation/:examSession', authenticateToken, requireAdminRole, async (req, res) => {
  const client = await pool.connect();

  try {
    const { examSession } = req.params;

    const result = await client.query(
      'DELETE FROM seat_allocations WHERE exam_session = $1',
      [examSession]
    );

    res.json({
      success: true,
      message: `Cleared ${result.rowCount} seat allocations for session: ${examSession}`
    });

  } catch (error) {
    console.error('Error clearing allocations:', error);
    res.status(500).json({ error: 'Failed to clear allocations' });
  } finally {
    client.release();
  }
});

// Get allocation history
router.get('/history', async (req, res) => {
  try {
    const query = `
      SELECT 
        sa.id,
        sa.student_id,
        sa.classroom_id,
        sa.exam_session,
        sa.allocated_at as created_at,
        s.registration_number,
        s.name,
        s.branch,
        c.room_number,
        c.block
      FROM seat_allocations sa
      JOIN students s ON sa.student_id = s.id
      JOIN classrooms c ON sa.classroom_id = c.id
      ORDER BY sa.allocated_at DESC
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      message: 'Allocation history retrieved successfully',
      allocations: result.rows
    });
  } catch (error) {
    console.error('Error fetching allocation history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch allocation history',
      error: error.message
    });
  }
});

// Clear all allocations
router.delete('/clear', async (req, res) => {
  try {
    const deleteQuery = 'DELETE FROM seat_allocations';
    await pool.query(deleteQuery);

    res.json({
      success: true,
      message: 'All allocations cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing allocations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear allocations',
      error: error.message
    });
  }
});

module.exports = router;
