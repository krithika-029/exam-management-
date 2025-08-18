-- Clean Database setup for Exam Management System
-- Drop existing tables and recreate with proper schema

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
  seat_position INTEGER, -- 1, 2, or 3 for 3-seater; 1-5 for 5-seater
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(exam_id, bench_id, seat_position)
);

-- Insert sample admin user
INSERT INTO users (email, password_hash, role) VALUES 
('admin@university.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample admin data
INSERT INTO admins (user_id, name, department) 
SELECT u.id, 'System Administrator', 'Computer Science'
FROM users u WHERE u.email = 'admin@university.edu'
ON CONFLICT DO NOTHING;

-- Insert sample classroom data
INSERT INTO classrooms (room_number, block, floor, rows, columns, capacity) VALUES 
('101', 'A', 1, 5, 4, 40),
('102', 'A', 1, 4, 5, 35),
('103', 'A', 1, 6, 3, 30),
('201', 'B', 2, 5, 5, 45),
('202', 'B', 2, 4, 4, 32)
ON CONFLICT (room_number) DO NOTHING;

-- Insert sample benches for classroom 101 (mixed 3-seater and 5-seater)
INSERT INTO benches (classroom_id, bench_type, row_position, column_position) 
SELECT c.id, '3-seater', 1, 1 FROM classrooms c WHERE c.room_number = '101'
UNION ALL
SELECT c.id, '3-seater', 1, 2 FROM classrooms c WHERE c.room_number = '101'
UNION ALL
SELECT c.id, '5-seater', 1, 3 FROM classrooms c WHERE c.room_number = '101'
UNION ALL
SELECT c.id, '3-seater', 2, 1 FROM classrooms c WHERE c.room_number = '101'
UNION ALL
SELECT c.id, '5-seater', 2, 2 FROM classrooms c WHERE c.room_number = '101'
ON CONFLICT DO NOTHING;
