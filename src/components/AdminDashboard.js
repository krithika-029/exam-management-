import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Navbar, Nav, Dropdown } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './dashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClassrooms: 0,
    totalExams: 0,
    upcomingExams: 0
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [studentsRes, classroomsRes, examsRes] = await Promise.all([
        axios.get('/api/students'),
        axios.get('/api/classrooms'),
        axios.get('/api/exams')
      ]);

      const today = new Date();
      const upcomingExams = examsRes.data.filter(exam => 
        new Date(exam.exam_date) >= today
      ).length;

      setStats({
        totalStudents: studentsRes.data.length,
        totalClassrooms: classroomsRes.data.length,
        totalExams: examsRes.data.length,
        upcomingExams
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardCards = [
    {
      title: 'Manage Students',
      description: 'Add, edit, and view student records',
      icon: '👥',
      path: '/students-management',
      color: 'primary',
      stat: stats.totalStudents,
      statLabel: 'Total Students'
    },
    {
      title: 'Classroom Management',
      description: 'Configure classrooms and seating arrangements',
      icon: '🏛️',
      path: '/classroom-management',
      color: 'success',
      stat: stats.totalClassrooms,
      statLabel: 'Active Classrooms'
    },
    {
      title: 'Exam Scheduling',
      description: 'Schedule exams and assign classrooms',
      icon: '📅',
      path: '/exam-scheduling',
      color: 'warning',
      stat: stats.totalExams,
      statLabel: 'Total Exams'
    },
    {
      title: 'Seating Allocation',
      description: 'Generate and manage seating arrangements',
      icon: '💺',
      path: '/seating-allocation',
      color: 'info',
      stat: stats.upcomingExams,
      statLabel: 'Upcoming Exams'
    },
    {
      title: 'Allocation History',
      description: 'View and manage allocation history',
      icon: '📋',
      path: '/allocation-history',
      color: 'warning'
    },
    {
      title: 'Calendar View',
      description: 'View exam schedule in calendar format',
      icon: '📆',
      path: '/calendar-view',
      color: 'secondary'
    },
    {
      title: 'Reports & Export',
      description: 'Generate and export seating arrangements',
      icon: '📊',
      path: '/reports',
      color: 'dark'
    }
  ];

  return (
    <div className="dashboard-container">
      {/* Navigation Bar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand href="#home">
            <strong>📚 Exam Management System</strong>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#home">Dashboard</Nav.Link>
              <Nav.Link onClick={() => navigate('/classroom-management')}>Classrooms</Nav.Link>
              <Nav.Link onClick={() => navigate('/exam-scheduling')}>Exams</Nav.Link>
              <Nav.Link onClick={() => navigate('/seating-allocation')}>Seating</Nav.Link>
            </Nav>
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-light" id="dropdown-basic">
                👤 {user?.name || 'Admin'}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => navigate('/profile')}>Profile</Dropdown.Item>
                <Dropdown.Item onClick={() => navigate('/settings')}>Settings</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content */}
      <Container className="mt-4">
        {/* Welcome Section */}
        <Row className="mb-4">
          <Col>
            <div className="welcome-section p-4 rounded bg-gradient-primary text-white">
              <h2>Welcome back, {user?.name}! 👋</h2>
              <p className="mb-0">Manage your examination seating system with ease.</p>
            </div>
          </Col>
        </Row>

        {/* Dashboard Cards */}
        <Row>
          {dashboardCards.map((card, index) => (
            <Col md={6} lg={4} key={index} className="mb-4">
              <Card 
                className={`dashboard-card h-100 border-${card.color} shadow-sm hover-lift`}
                onClick={() => navigate(card.path)}
                style={{ cursor: 'pointer' }}
              >
                <Card.Body className="text-center p-4">
                  <div className="icon-container mb-3">
                    <span className="dashboard-icon">{card.icon}</span>
                  </div>
                  <Card.Title className={`text-${card.color} h5`}>
                    {card.title}
                  </Card.Title>
                  <Card.Text className="text-muted mb-3">
                    {card.description}
                  </Card.Text>
                  
                  {card.stat !== undefined && (
                    <div className="stat-section">
                      <h3 className={`text-${card.color} mb-1`}>{card.stat}</h3>
                      <small className="text-muted">{card.statLabel}</small>
                    </div>
                  )}

                  <Button 
                    variant={`outline-${card.color}`} 
                    size="sm" 
                    className="mt-3"
                  >
                    Open →
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Quick Actions */}
        <Row className="mt-4">
          <Col>
            <Card className="shadow-sm">
              <Card.Header>
                <h5 className="mb-0">Quick Actions</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3} className="mb-2">
                    <Button 
                      variant="outline-primary" 
                      className="w-100"
                      onClick={() => navigate('/classroom-management/new')}
                    >
                      + Add Classroom
                    </Button>
                  </Col>
                  <Col md={3} className="mb-2">
                    <Button 
                      variant="outline-success" 
                      className="w-100"
                      onClick={() => navigate('/exam-scheduling/new')}
                    >
                      + Schedule Exam
                    </Button>
                  </Col>
                  <Col md={3} className="mb-2">
                    <Button 
                      variant="outline-warning" 
                      className="w-100"
                      onClick={() => navigate('/students-management/import')}
                    >
                      📥 Import Students
                    </Button>
                  </Col>
                  <Col md={3} className="mb-2">
                    <Button 
                      variant="outline-info" 
                      className="w-100"
                      onClick={() => navigate('/reports/generate')}
                    >
                      📊 Generate Report
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminDashboard;
