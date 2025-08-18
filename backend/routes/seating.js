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

// Smart seating allocation algorithm
const allocateSeats = async (examId, classroomId) => {
  const client = await pool.connect();
  
  try {
    // Get exam details
    const examResult = await client.query('SELECT * FROM exams WHERE id = $1', [examId]);
    const exam = examResult.rows[0];
    
    if (!exam) {
      throw new Error(`Exam with ID ${examId} not found`);
    }
    
    // Get students registered for this subject
    const studentsResult = await client.query(
      'SELECT s.*, u.email FROM students s JOIN users u ON s.user_id = u.id WHERE $1 = ANY(s.subject_codes)',
      [exam.subject_code]
    );
    const students = studentsResult.rows;
    
    // Get classroom and benches
    const classroomResult = await client.query('SELECT * FROM classrooms WHERE id = $1', [classroomId]);
    const classroom = classroomResult.rows[0];
    
    const benchesResult = await client.query(
      'SELECT * FROM benches WHERE classroom_id = $1 AND is_active = true ORDER BY row_position, column_position',
      [classroomId]
    );
    const benches = benchesResult.rows;
    
    // Clear existing seat assignments for this exam
    await client.query('DELETE FROM seat_assignments WHERE exam_id = $1', [examId]);
    
    // Group students by subject codes they're registered for (different from current exam subject)
    const studentsByDifferentSubjects = {};
    const studentsBySameSubject = [];
    
    for (const student of students) {
      const otherSubjects = student.subject_codes.filter(code => code !== exam.subject_code);
      if (otherSubjects.length > 0) {
        const key = otherSubjects.join(',');
        if (!studentsByDifferentSubjects[key]) {
          studentsByDifferentSubjects[key] = [];
        }
        studentsByDifferentSubjects[key].push(student);
      } else {
        studentsBySameSubject.push(student);
      }
    }
    
    // Allocation algorithm
    const allocations = [];
    let studentIndex = 0;
    const allStudents = [...students];
    
    for (const bench of benches) {
      if (studentIndex >= allStudents.length) break;
      
      if (bench.bench_type === '3-seater') {
        // For 3-seater: Try to place students with different subjects
        const allocation = {
          benchId: bench.id,
          students: []
        };
        
        // Try to find 2 students with different subject combinations
        if (studentIndex < allStudents.length) {
          allocation.students.push(allStudents[studentIndex++]);
        }
        if (studentIndex < allStudents.length) {
          // Try to find a student with different subjects
          let foundDifferent = false;
          for (let i = studentIndex; i < allStudents.length; i++) {
            const student1Subjects = allocation.students[0].subject_codes;
            const student2Subjects = allStudents[i].subject_codes;
            
            // Check if they have different subjects (not just the exam subject)
            const hasDifferentSubjects = student1Subjects.some(s1 => 
              !student2Subjects.includes(s1) && s1 !== exam.subject_code
            ) || student2Subjects.some(s2 => 
              !student1Subjects.includes(s2) && s2 !== exam.subject_code
            );
            
            if (hasDifferentSubjects) {
              allocation.students.push(allStudents.splice(i, 1)[0]);
              foundDifferent = true;
              break;
            }
          }
          
          if (!foundDifferent && studentIndex < allStudents.length) {
            allocation.students.push(allStudents[studentIndex++]);
          }
        }
        
        allocations.push(allocation);
      } else if (bench.bench_type === '5-seater') {
        // For 5-seater: Can place students with same subjects
        const allocation = {
          benchId: bench.id,
          students: []
        };
        
        // Add up to 2 students
        if (studentIndex < allStudents.length) {
          allocation.students.push(allStudents[studentIndex++]);
        }
        if (studentIndex < allStudents.length) {
          allocation.students.push(allStudents[studentIndex++]);
        }
        
        allocations.push(allocation);
      }
    }
    
    // Save allocations to database
    for (const allocation of allocations) {
      for (let i = 0; i < allocation.students.length; i++) {
        await client.query(
          'INSERT INTO seat_assignments (exam_id, student_id, bench_id, seat_position) VALUES ($1, $2, $3, $4)',
          [examId, allocation.students[i].id, allocation.benchId, i + 1]
        );
      }
    }
    
    return {
      exam,
      classroom,
      allocations,
      totalStudents: students.length,
      allocatedStudents: allocations.reduce((sum, alloc) => sum + alloc.students.length, 0),
      unallocatedStudents: students.length - allocations.reduce((sum, alloc) => sum + alloc.students.length, 0)
    };
    
  } finally {
    client.release();
  }
};

// Allocate seats for an exam
router.post('/allocate', authenticateToken, requireAdminRole, async (req, res) => {
  const { examId, classroomId } = req.body;
  
  try {
    const result = await allocateSeats(examId, classroomId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get seating arrangement for an exam
router.get('/exam/:examId', authenticateToken, async (req, res) => {
  const { examId } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT 
        e.*,
        c.room_number,
        c.block,
        c.floor,
        c.rows,
        c.columns,
        sa.seat_position,
        s.registration_number,
        s.name as student_name,
        s.branch,
        b.bench_type,
        b.row_position,
        b.column_position
      FROM exams e
      JOIN classrooms c ON e.classroom_id = c.id
      LEFT JOIN seat_assignments sa ON e.id = sa.exam_id
      LEFT JOIN students s ON sa.student_id = s.id
      LEFT JOIN benches b ON sa.bench_id = b.id
      WHERE e.id = $1
      ORDER BY b.row_position, b.column_position, sa.seat_position
    `, [examId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exam not found or no seating arrangement' });
    }
    
    // Group by bench position
    const examInfo = {
      id: result.rows[0].id,
      subject_code: result.rows[0].subject_code,
      subject_name: result.rows[0].subject_name,
      exam_date: result.rows[0].exam_date,
      exam_time: result.rows[0].exam_time,
      duration: result.rows[0].duration,
      room_number: result.rows[0].room_number,
      block: result.rows[0].block,
      floor: result.rows[0].floor,
      rows: result.rows[0].rows,
      columns: result.rows[0].columns
    };
    
    const seatingGrid = {};
    
    for (const row of result.rows) {
      if (row.row_position && row.column_position) {
        const key = `${row.row_position}-${row.column_position}`;
        if (!seatingGrid[key]) {
          seatingGrid[key] = {
            row: row.row_position,
            column: row.column_position,
            benchType: row.bench_type,
            students: []
          };
        }
        
        if (row.registration_number) {
          seatingGrid[key].students.push({
            registrationNumber: row.registration_number,
            name: row.student_name,
            branch: row.branch,
            seatPosition: row.seat_position
          });
        }
      }
    }
    
    res.json({
      exam: examInfo,
      seatingGrid: Object.values(seatingGrid)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get student's seating arrangement
router.get('/student/:studentId/exams', authenticateToken, async (req, res) => {
  const { studentId } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT 
        e.*,
        c.room_number,
        c.block,
        c.floor,
        sa.seat_position,
        b.bench_type,
        b.row_position,
        b.column_position
      FROM seat_assignments sa
      JOIN exams e ON sa.exam_id = e.id
      JOIN classrooms c ON e.classroom_id = c.id
      JOIN benches b ON sa.bench_id = b.id
      WHERE sa.student_id = $1
      ORDER BY e.exam_date, e.exam_time
    `, [studentId]);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
