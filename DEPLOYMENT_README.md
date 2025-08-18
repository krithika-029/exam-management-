# Exam Management System

## Project Overview
This is a comprehensive exam management system with continuous seat allocation functionality and a complete dataset of 680 students.

## Features Implemented
- ✅ Student dataset import (680 students across 6 branches)
- ✅ Seating allocation with continuous seat numbering across classrooms
- ✅ Room management
- ✅ Exam scheduling
- ✅ Student registration for exams
- ✅ Admin dashboard

## Database Structure
- PostgreSQL database with complete schema
- 680 students distributed across:
  - Computer Science (CS): 240 students
  - Artificial Intelligence (AI): 120 students
  - Electronics & Communication (ECE): 100 students
  - Information Science (ISE): 100 students
  - Mechanical Engineering (ME): 60 students
  - Civil Engineering (CE): 60 students

## Key Features Fixed
1. **Continuous Seat Allocation**: Fixed the seat numbering to continue across classrooms (e.g., first classroom: seats 1-60, second classroom: seats 61-120)
2. **Database Schema**: Added proper seat_number column to seat_allocations table
3. **API Fixes**: Corrected student queries to use student_subjects table properly

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (create .env file):
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=232910
   DB_NAME=exam_management
   ```

4. Import database schema:
   ```bash
   psql -U postgres -d exam_management -f database.sql
   ```

5. Start backend server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start frontend:
   ```bash
   npm start
   ```

## Manual GitHub Push Instructions

Since the automated git push encountered issues, please follow these manual steps:

### Step 1: Initialize Git Repository
Open Command Prompt or PowerShell in the project directory and run:

```bash
git init
```

### Step 2: Add All Files
```bash
git add .
```

### Step 3: Commit Changes
```bash
git commit -m "Complete exam management system with continuous seat allocation and 680 student dataset"
```

### Step 4: Add Remote Repository
```bash
git remote add origin https://github.com/krithika-029/exam-management-.git
```

### Step 5: Set Main Branch
```bash
git branch -M main
```

### Step 6: Push to GitHub
```bash
git push -u origin main
```

## Project Structure
```
exam-management/
├── backend/
│   ├── server.js
│   ├── database.sql
│   ├── package.json
│   └── routes/
│       └── seatAllocation.js
├── src/
│   ├── components/
│   │   ├── SeatingAllocation.js
│   │   ├── AdminDashboard.js
│   │   └── [other components]
│   └── [other source files]
├── public/
├── package.json
└── README.md
```

## Recent Fixes Applied
1. **Seat Allocation API**: Fixed student queries and added continuous numbering logic
2. **Frontend Components**: Updated SeatingAllocation.js to handle continuous seat numbering
3. **Database Schema**: Added seat_number column and proper indexing
4. **Full Dataset**: Imported complete 680-student dataset with proper branch distribution

## Testing
All seating allocation functionality has been tested and verified:
- Continuous numbering works correctly across multiple classrooms
- Database queries return proper student lists
- Seat allocation saves correctly with sequential numbering

## Notes
- The PostgreSQL service needs to be running for the backend to function
- Make sure to configure the database connection parameters in the .env file
- The system has been tested with the complete 680-student dataset
