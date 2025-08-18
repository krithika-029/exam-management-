@echo off
echo Setting up Exam Management System...
echo.

echo Step 1: Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies!
    pause
    exit /b 1
)

echo.
echo Step 2: Installing frontend dependencies...
cd ..
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies!
    pause
    exit /b 1
)

echo.
echo Step 3: Setup complete!
echo.
echo Next steps:
echo 1. Set up PostgreSQL database:
echo    - Create database: CREATE DATABASE exam_management;
echo    - Run: psql -U postgres -d exam_management -f backend/database.sql
echo.
echo 2. Configure backend/.env file with your database credentials
echo.
echo 3. Start the backend server:
echo    cd backend
echo    npm run dev
echo.
echo 4. Start the frontend server (in a new terminal):
echo    npm start
echo.
echo The application will be available at http://localhost:3000
echo Backend API will be available at http://localhost:5000
echo.
pause
