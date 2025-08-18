# Exam Management System - Smart Seating Allocation

A comprehensive exam management system with intelligent seating allocation built with React, Node.js, and PostgreSQL.

## Features

### 🎯 Smart Seating Allocation
- **3-Seater Benches**: Allocates 2 students with different subject codes
- **5-Seater Benches**: Allocates 2 students with the same subject code
- **Row-wise Allocation**: Students are arranged left to right, top to bottom
- **Visual Layout**: Interactive grid view of seating arrangement
- **Export Functionality**: Export seating arrangements to CSV

### 🏫 Classroom Management
- Dynamic classroom configuration
- Configurable rows, columns, and bench types
- Support for mixed bench types in same classroom

### 📊 Student Management
- PostgreSQL database integration
- Subject-wise student grouping
- Registration number sorting
- Real-time statistics display

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation & Setup

### 1. PostgreSQL Setup

1. Install PostgreSQL and create a database:
```sql
CREATE DATABASE exam_management;
```

2. Connect to the database and run the setup script:
```bash
psql -U postgres -d exam_management -f backend/database.sql
```

### 2. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit the `.env` file with your PostgreSQL credentials:
```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=exam_management
DB_PASSWORD=your_password_here
DB_PORT=5432
PORT=5000
```

4. Start the backend server:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

### 3. Frontend Setup

1. Navigate to the project root:
```bash
cd ..
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Usage

### 1. Adding Classrooms

1. Click "Add New Classroom" in the Classroom Configuration section
2. Enter:
   - Room Number
   - Number of Rows and Columns
   - Number of 3-seater benches
   - Number of 5-seater benches
3. Click "Add" to save

### 2. Generating Seating Arrangements

1. Select a classroom from the dropdown
2. Click "Generate Smart Seating"
3. View the results in both visual grid and detailed table formats
4. Export to CSV if needed

### 3. Understanding the Seating Logic

**3-Seater Benches:**
- Seat 2 students with different subject codes
- Helps prevent cheating by mixing subjects

**5-Seater Benches:**
- Seat 2 students with the same subject code
- Efficient for subjects with many students

## Database Schema

### Students Table
```sql
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  registration_number VARCHAR(20) UNIQUE NOT NULL,
  subject_code VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Classrooms Table
```sql
CREATE TABLE classrooms (
  id SERIAL PRIMARY KEY,
  room_number VARCHAR(10) UNIQUE NOT NULL,
  rows INTEGER NOT NULL,
  columns INTEGER NOT NULL,
  num_3seater INTEGER NOT NULL DEFAULT 0,
  num_5seater INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Students
- `GET /api/students` - Get all students
- `POST /api/students/sample` - Add sample students

### Classrooms
- `GET /api/classrooms` - Get all classrooms
- `POST /api/classrooms` - Add new classroom

### Seating Allocation
- `POST /api/allocate-seating` - Generate smart seating arrangement

## Project Structure

```
Exam-management/
├── backend/
│   ├── server.js           # Express server
│   ├── database.sql        # Database setup
│   ├── package.json        # Backend dependencies
│   └── .env               # Environment variables
├── src/
│   ├── components/
│   │   ├── SeatingAllocation.js  # Main seating component
│   │   ├── SeatingTable.js       # Visual seating display
│   │   └── ...
│   ├── App.js
│   └── index.js
├── public/
└── package.json           # Frontend dependencies
```

## Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
