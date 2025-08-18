-- SAHYADRI COLLEGE DATABASE SCHEMA
-- Updated schema for Exam Management System based on actual college data

-- Drop existing tables if needed (uncomment if you want to reset)
-- DROP TABLE IF EXISTS seat_allocations CASCADE;
-- DROP TABLE IF EXISTS seat_assignments CASCADE;
-- DROP TABLE IF EXISTS exams CASCADE;
-- DROP TABLE IF EXISTS subjects CASCADE;
-- DROP TABLE IF EXISTS students CASCADE;
-- DROP TABLE IF EXISTS admins CASCADE;
-- DROP TABLE IF EXISTS classrooms CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced Students table based on your CSV structure
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  registration_number VARCHAR(20) UNIQUE NOT NULL, -- USN like 4SF22CS001
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  branch VARCHAR(10) NOT NULL CHECK (branch IN ('CS', 'ME', 'CE', 'ECE', 'ISE', 'AI')),
  classroom VARCHAR(10), -- Like C201, C301, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subjects table for managing subject codes and names
CREATE TABLE IF NOT EXISTS subjects (
  id SERIAL PRIMARY KEY,
  subject_code VARCHAR(10) UNIQUE NOT NULL, -- Like CS201, ME201, etc.
  subject_name VARCHAR(255) NOT NULL,
  branch VARCHAR(10) NOT NULL,
  semester INTEGER DEFAULT 2, -- Assuming 2nd year
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student-Subject mapping (since each student has 6 subjects)
CREATE TABLE IF NOT EXISTS student_subjects (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  subject_position INTEGER CHECK (subject_position BETWEEN 1 AND 6), -- sub1 to sub6
  UNIQUE(student_id, subject_position),
  UNIQUE(student_id, subject_id)
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced Classrooms table
CREATE TABLE IF NOT EXISTS classrooms (
  id SERIAL PRIMARY KEY,
  room_number VARCHAR(10) UNIQUE NOT NULL,
  block VARCHAR(10),
  floor INTEGER,
  capacity INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exams table
CREATE TABLE IF NOT EXISTS exams (
  id SERIAL PRIMARY KEY,
  subject_code VARCHAR(10) REFERENCES subjects(subject_code),
  exam_date DATE NOT NULL,
  exam_time TIME NOT NULL,
  duration INTEGER DEFAULT 180, -- 3 hours in minutes
  classroom_id INTEGER REFERENCES classrooms(id),
  created_by INTEGER REFERENCES admins(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seat allocations table (for tracking seating arrangements)
CREATE TABLE IF NOT EXISTS seat_allocations (
  id SERIAL PRIMARY KEY,
  exam_session VARCHAR(255) NOT NULL, -- Unique identifier for exam session
  classroom_id INTEGER REFERENCES classrooms(id),
  student_id INTEGER REFERENCES students(id),
  seat_number INTEGER NOT NULL,
  subject_code VARCHAR(10),
  branch VARCHAR(10),
  allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(exam_session, seat_number, classroom_id)
);

-- Insert default admin user
INSERT INTO users (email, password_hash, role) VALUES 
('admin@scem.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert admin data
INSERT INTO admins (user_id, name, department) 
SELECT u.id, 'System Administrator', 'Computer Science'
FROM users u WHERE u.email = 'admin@scem.edu'
ON CONFLICT DO NOTHING;

-- Insert Sahyadri College classrooms
INSERT INTO classrooms (room_number, block, floor, capacity) VALUES 
('C201', 'C', 2, 60),
('C202', 'C', 2, 60),
('C203', 'C', 2, 60),
('C301', 'C', 3, 60),
('C302', 'C', 3, 60),
('C401', 'C', 4, 60),
('C402', 'C', 4, 60),
('C501', 'C', 5, 60),
('C502', 'C', 5, 60),
('C601', 'C', 6, 60),
('C701', 'C', 7, 60),
('A101', 'A', 1, 80),
('A102', 'A', 1, 80),
('B201', 'B', 2, 70),
('B202', 'B', 2, 70)
ON CONFLICT (room_number) DO NOTHING;

-- Insert CS subjects
INSERT INTO subjects (subject_code, subject_name, branch, semester) VALUES 
('CS201', 'Data Structures', 'CS', 2),
('CS202', 'Computer Organization', 'CS', 2),
('CS203', 'Discrete Mathematics', 'CS', 2),
('CS204', 'Digital Logic', 'CS', 2),
('CS205', 'Object Oriented Programming', 'CS', 2),
('CS206', 'Microprocessors', 'CS', 2)
ON CONFLICT (subject_code) DO NOTHING;

-- Insert ME subjects
INSERT INTO subjects (subject_code, subject_name, branch, semester) VALUES 
('ME201', 'Thermodynamics', 'ME', 2),
('ME202', 'Engineering Mechanics', 'ME', 2),
('ME203', 'Fluid Mechanics', 'ME', 2),
('ME204', 'Manufacturing Processes', 'ME', 2),
('ME205', 'Mechanical Measurements', 'ME', 2),
('ME206', 'Kinematics of Machines', 'ME', 2)
ON CONFLICT (subject_code) DO NOTHING;

-- Insert CE subjects
INSERT INTO subjects (subject_code, subject_name, branch, semester) VALUES 
('CE201', 'Surveying', 'CE', 2),
('CE202', 'Building Materials', 'CE', 2),
('CE203', 'Strength of Materials', 'CE', 2),
('CE204', 'Fluid Mechanics', 'CE', 2),
('CE205', 'Concrete Technology', 'CE', 2),
('CE206', 'Structural Analysis', 'CE', 2)
ON CONFLICT (subject_code) DO NOTHING;

-- Insert ECE subjects
INSERT INTO subjects (subject_code, subject_name, branch, semester) VALUES 
('EC201', 'Analog Electronics', 'ECE', 2),
('EC202', 'Signals & Systems', 'ECE', 2),
('EC203', 'Logic Design', 'ECE', 2),
('EC204', 'Control Systems', 'ECE', 2),
('EC205', 'Microprocessors', 'ECE', 2),
('EC206', 'Communication Engineering', 'ECE', 2)
ON CONFLICT (subject_code) DO NOTHING;

-- Insert ISE subjects
INSERT INTO subjects (subject_code, subject_name, branch, semester) VALUES 
('IS201', 'Software Engineering', 'ISE', 2),
('IS202', 'Data Structures', 'ISE', 2),
('IS203', 'Database Management', 'ISE', 2),
('IS204', 'Computer Networks', 'ISE', 2),
('IS205', 'Operating Systems', 'ISE', 2),
('IS206', 'Web Technologies', 'ISE', 2)
ON CONFLICT (subject_code) DO NOTHING;

-- Insert AI subjects
INSERT INTO subjects (subject_code, subject_name, branch, semester) VALUES 
('AI201', 'Intro to AI', 'AI', 2),
('AI202', 'Machine Learning', 'AI', 2),
('AI203', 'Data Science', 'AI', 2),
('AI204', 'Python Programming', 'AI', 2),
('AI205', 'Neural Networks', 'AI', 2),
('AI206', 'Deep Learning', 'AI', 2)
ON CONFLICT (subject_code) DO NOTHING;

-- Sample student data (you can expand this)
INSERT INTO students (registration_number, name, email, branch, classroom) VALUES 
('4SF22CS001', 'Alice Johnson', 'alice.johnson@scem.edu', 'CS', 'C201'),
('4SF22CS002', 'Rahul Mehra', 'rahul.mehra@scem.edu', 'CS', 'C201'),
('4SF22ME001', 'Bob Mathew', 'bob.mathew@scem.edu', 'ME', 'C301'),
('4SF22ME002', 'Ajay Singh', 'ajay.singh@scem.edu', 'ME', 'C301'),
('4SF22CE001', 'Deepa Rao', 'deepa.rao@scem.edu', 'CE', 'C401'),
('4SF22CE002', 'Prakash N', 'prakash.n@scem.edu', 'CE', 'C401'),
('4SF22EC001', 'Priya Shetty', 'priya.shetty@scem.edu', 'ECE', 'C501'),
('4SF22EC002', 'Srinivas R', 'srinivas.r@scem.edu', 'ECE', 'C501'),
('4SF22IS001', 'Manoj K', 'manoj.k@scem.edu', 'ISE', 'C601'),
('4SF22IS002', 'Sunita P', 'sunita.p@scem.edu', 'ISE', 'C601'),
('4SF22AI001', 'Amith Rao', 'amith.rao@scem.edu', 'AI', 'C701'),
('4SF22AI002', 'Keerthi S', 'keerthi.s@scem.edu', 'AI', 'C701')
ON CONFLICT (registration_number) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_branch ON students(branch);
CREATE INDEX IF NOT EXISTS idx_students_registration ON students(registration_number);
CREATE INDEX IF NOT EXISTS idx_subjects_branch ON subjects(branch);
CREATE INDEX IF NOT EXISTS idx_seat_allocations_session ON seat_allocations(exam_session);
CREATE INDEX IF NOT EXISTS idx_seat_allocations_classroom ON seat_allocations(classroom_id);
