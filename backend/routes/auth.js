const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const router = express.Router();
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'exam_management',
  password: process.env.DB_PASSWORD || '232910',
  port: process.env.DB_PORT || 5432,
});

// Sign up
router.post('/signup', async (req, res) => {
  const { email, password, role, name, registrationNumber, branch, department } = req.body;

  try {
    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userResult = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING *',
      [email, passwordHash, role]
    );

    const userId = userResult.rows[0].id;

    // Create role-specific record
    if (role === 'student') {
      await pool.query(
        'INSERT INTO students (user_id, registration_number, name, branch) VALUES ($1, $2, $3, $4)',
        [userId, registrationNumber, name, branch]
      );
    } else if (role === 'admin') {
      await pool.query(
        'INSERT INTO admins (user_id, name, department) VALUES ($1, $2, $3)',
        [userId, name, department]
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: userId, 
        email: email, 
        role: role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: userId,
        email,
        role,
        name
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get user details based on role
    let userDetails = { name: '' };
    if (user.role === 'student') {
      const studentResult = await pool.query('SELECT * FROM students WHERE user_id = $1', [user.id]);
      userDetails = studentResult.rows[0] || {};
    } else if (user.role === 'admin') {
      const adminResult = await pool.query('SELECT * FROM admins WHERE user_id = $1', [user.id]);
      userDetails = adminResult.rows[0] || {};
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: userDetails.name,
        registrationNumber: userDetails.registration_number,
        branch: userDetails.branch
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
