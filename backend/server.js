const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'exam_management',
  password: process.env.DB_PASSWORD || '232910',
  port: process.env.DB_PORT || 5432,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
  } else {
    console.log('Connected to PostgreSQL database');
    release();
  }
});

// Import routes
const authRoutes = require('./routes/auth');
const classroomRoutes = require('./routes/classrooms');
const benchRoutes = require('./routes/benches');
const examRoutes = require('./routes/exams');
const studentRoutes = require('./routes/students');
const seatingRoutes = require('./routes/seating');
const importRoutes = require('./routes/import');
const seatAllocationRoutes = require('./routes/seatAllocation');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/benches', benchRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/seating', seatingRoutes);
app.use('/api/import', importRoutes);
app.use('/api/seatAllocation', seatAllocationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Legacy endpoints for backward compatibility (can be removed later)
// Get all students
app.get('/api/students-legacy', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students ORDER BY registration_number');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all classrooms
app.get('/api/classrooms-legacy', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM classrooms ORDER BY room_number');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
