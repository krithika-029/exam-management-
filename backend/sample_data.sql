-- Sample data setup for development and testing
-- Run this after the main database.sql schema

-- Insert sample admin user
-- Password: admin123 (hashed)
INSERT INTO users (email, password_hash, role) VALUES 
('admin@example.com', '$2a$10$8eQcQE.fFoUfyf5HT0qE/uYSEGNJ2jH9XzGKRjG5TKxJ2Qj3v5.L.', 'admin');

-- Insert admin details
INSERT INTO admins (user_id, name, department) VALUES 
(1, 'System Administrator', 'IT Department');

-- Insert sample student users
-- Password: student123 (hashed)
INSERT INTO users (email, password_hash, role) VALUES 
('student1@example.com', '$2a$10$8eQcQE.fFoUfyf5HT0qE/uYSEGNJ2jH9XzGKRjG5TKxJ2Qj3v5.L.', 'student'),
('student2@example.com', '$2a$10$8eQcQE.fFoUfyf5HT0qE/uYSEGNJ2jH9XzGKRjG5TKxJ2Qj3v5.L.', 'student'),
('student3@example.com', '$2a$10$8eQcQE.fFoUfyf5HT0qE/uYSEGNJ2jH9XzGKRjG5TKxJ2Qj3v5.L.', 'student'),
('student4@example.com', '$2a$10$8eQcQE.fFoUfyf5HT0qE/uYSEGNJ2jH9XzGKRjG5TKxJ2Qj3v5.L.', 'student'),
('student5@example.com', '$2a$10$8eQcQE.fFoUfyf5HT0qE/uYSEGNJ2jH9XzGKRjG5TKxJ2Qj3v5.L.', 'student');

-- Insert student details
INSERT INTO students (user_id, registration_number, name, branch, subject_codes) VALUES 
(2, 'CS001', 'John Doe', 'Computer Science', ARRAY['CS101', 'CS102']),
(3, 'CS002', 'Jane Smith', 'Computer Science', ARRAY['CS101', 'CS103']),
(4, 'IT001', 'Mike Johnson', 'Information Technology', ARRAY['CS102', 'CS103']),
(5, 'CS003', 'Sarah Wilson', 'Computer Science', ARRAY['CS101', 'CS104']),
(6, 'IT002', 'David Brown', 'Information Technology', ARRAY['CS102', 'CS104']);

-- Insert sample classrooms
INSERT INTO classrooms (room_number, block, floor, rows, columns, capacity) VALUES 
('101', 'A', 1, 5, 4, 40),
('102', 'A', 1, 4, 5, 40),
('201', 'B', 2, 6, 3, 36),
('202', 'B', 2, 4, 4, 32);

-- Insert sample benches for classroom 101
INSERT INTO benches (classroom_id, bench_type, row_position, column_position, is_active) VALUES 
-- Row 1
(1, '3-seater', 1, 1, true),
(1, '5-seater', 1, 2, true),
(1, '3-seater', 1, 3, true),
(1, '5-seater', 1, 4, true),
-- Row 2
(1, '3-seater', 2, 1, true),
(1, '3-seater', 2, 2, true),
(1, '5-seater', 2, 3, true),
(1, '3-seater', 2, 4, true),
-- Row 3
(1, '5-seater', 3, 1, true),
(1, '3-seater', 3, 2, true),
(1, '3-seater', 3, 3, true),
(1, '5-seater', 3, 4, true),
-- Row 4
(1, '3-seater', 4, 1, true),
(1, '5-seater', 4, 2, true),
(1, '3-seater', 4, 3, true),
(1, '3-seater', 4, 4, true),
-- Row 5
(1, '5-seater', 5, 1, true),
(1, '3-seater', 5, 2, true),
(1, '5-seater', 5, 3, true),
(1, '3-seater', 5, 4, true);

-- Insert sample exams
INSERT INTO exams (subject_code, subject_name, exam_date, exam_time, duration, classroom_id, created_by) VALUES 
('CS101', 'Introduction to Programming', '2025-08-15', '09:00:00', 180, 1, 1),
('CS102', 'Data Structures', '2025-08-16', '09:00:00', 180, 2, 1),
('CS103', 'Database Management', '2025-08-17', '09:00:00', 180, 1, 1),
('CS104', 'Web Development', '2025-08-18', '09:00:00', 180, 2, 1);
