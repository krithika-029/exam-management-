-- Database setup for Exam Management System

-- Create database (run this manually in PostgreSQL)
-- CREATE DATABASE exam_management;

-- Connect to the database and create tables

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  registration_number VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  branch VARCHAR(50),
  subject_codes TEXT[], -- Array of subject codes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Classrooms table
CREATE TABLE IF NOT EXISTS classrooms (
  id SERIAL PRIMARY KEY,
  room_number VARCHAR(10) UNIQUE NOT NULL,
  block VARCHAR(50),
  floor INTEGER,
  rows INTEGER NOT NULL,
  columns INTEGER NOT NULL,
  capacity INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Benches table
CREATE TABLE IF NOT EXISTS benches (
  id SERIAL PRIMARY KEY,
  classroom_id INTEGER REFERENCES classrooms(id) ON DELETE CASCADE,
  bench_type VARCHAR(20) NOT NULL CHECK (bench_type IN ('3-seater', '5-seater')),
  row_position INTEGER NOT NULL,
  column_position INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exams table
CREATE TABLE IF NOT EXISTS exams (
  id SERIAL PRIMARY KEY,
  subject_code VARCHAR(20) NOT NULL,
  subject_name VARCHAR(255),
  exam_date DATE NOT NULL,
  exam_time TIME NOT NULL,
  duration INTEGER, -- in minutes
  classroom_id INTEGER REFERENCES classrooms(id),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seat assignments table
CREATE TABLE IF NOT EXISTS seat_assignments (
  id SERIAL PRIMARY KEY,
  exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES students(id),
  bench_id INTEGER REFERENCES benches(id),
  seat_position INTEGER, -- 1 or 2 for each bench
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(exam_id, bench_id, seat_position)
);

-- Insert sample classroom data
INSERT INTO classrooms (room_number, rows, columns, num_3seater, num_5seater) 
VALUES 
  ('101', 5, 4, 8, 2),
  ('102', 4, 5, 6, 4),
  ('103', 6, 3, 9, 3)
ON CONFLICT (room_number) DO NOTHING;

-- Insert sample student data
INSERT INTO students (registration_number, subject_code) 
VALUES 
  ('CS001', 'CS101'),
  ('CS002', 'CS102'),
  ('CS003', 'CS101'),
  ('CS004', 'CS103'),
  ('CS005', 'CS102'),
  ('CS006', 'CS103'),
  ('CS007', 'CS101'),
  ('CS008', 'CS102'),
  ('CS009', 'CS103'),
  ('CS010', 'CS101'),
  ('CS011', 'CS102'),
  ('CS012', 'CS103'),
  ('CS013', 'CS101'),
  ('CS014', 'CS102'),
  ('CS015', 'CS103'),
  ('CS016', 'CS101'),
  ('CS017', 'CS102'),
  ('CS018', 'CS103'),
  ('CS019', 'CS101'),
  ('CS020', 'CS102')
ON CONFLICT (registration_number) DO NOTHING;
