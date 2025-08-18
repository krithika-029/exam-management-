import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardRedirect from './components/DashboardRedirect';

// Auth Components
import Auth from './components/Auth';

// Dashboard Components
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';

// Management Components
import ClassroomManagement from './components/ClassroomManagement';
import ExamReports from './components/ExamReports';
import StudentManagement from './components/StudentManagement';

// Legacy Components (to be updated)
import AuthNew from './components/authnew';
import Details from './components/Details';
import ExamScheduling from './components/ExamScheduling';
import StudentExamRegistration from './components/StudentExamRegistration';
import CalendarView from './components/CalendarView';
import RoomManagement from './components/RoomManagement';
import SeatingAllocation from './components/SeatingAllocation';
import AllocationHistory from './components/AllocationHistory';
import SeatSelector from './components/SeatSelector';
import SeatingTable from './components/SeatingTable';

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <AuthProvider>
      <Router> 
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />
          
          {/* Default Route - redirect to appropriate dashboard */}
          <Route path="/" element={<DashboardRedirect />} />
          
          {/* Protected Routes */}
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/student-dashboard" 
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/classroom-management" 
            element={
              <ProtectedRoute adminOnly>
                <ClassroomManagement />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/students-management" 
            element={
              <ProtectedRoute adminOnly>
                <StudentManagement />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/exam-scheduling" 
            element={
              <ProtectedRoute adminOnly>
                <ExamScheduling />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/seating-allocation" 
            element={
              <ProtectedRoute adminOnly>
                <SeatingAllocation />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/calendar-view" 
            element={
              <ProtectedRoute adminOnly>
                <CalendarView />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/allocation-history" 
            element={
              <ProtectedRoute adminOnly>
                <AllocationHistory />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/reports" 
            element={
              <ProtectedRoute adminOnly>
                <ExamReports />
              </ProtectedRoute>
            } 
          />

          {/* Legacy Routes (to be updated) */}
          <Route path="/authnew" element={<AuthNew />} />
          <Route path="/details" element={<Details />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/stduentexamination" element={<StudentExamRegistration />} />
          <Route path="/room" element={<RoomManagement />} />
          <Route path="/seat" element={<SeatingAllocation />} />
          <Route path="/select-seats" element={<SeatSelector />} />
          <Route path="/seat-selector/:classroomId" element={<SeatSelector />} />
          <Route path="/ss" element={<SeatingTable />} />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;