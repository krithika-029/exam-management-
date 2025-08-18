import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Navbar, Nav, Dropdown, Table, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import './dashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [seatingArrangements, setSeatingArrangements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      // Get student details
      const studentRes = await axios.get(`/api/students`);
      const currentStudent = studentRes.data.find(s => s.user_id === user.id);
      
      if (currentStudent) {
        setStudentData(currentStudent);
        
        // Get seating arrangements for this student
        const seatingRes = await axios.get(`/api/seating/student/${currentStudent.id}/exams`);
        setSeatingArrangements(seatingRes.data);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const exportToPDF = async () => {
    const element = document.getElementById('seating-table');
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF();
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save(`seating-arrangement-${user.registrationNumber}.pdf`);
  };

  const exportToExcel = () => {
    const data = seatingArrangements.map(arrangement => ({
      'Subject': arrangement.subject_code,
      'Subject Name': arrangement.subject_name,
      'Date': new Date(arrangement.exam_date).toLocaleDateString(),
      'Time': arrangement.exam_time,
      'Room': arrangement.room_number,
      'Block': arrangement.block,
      'Floor': arrangement.floor,
      'Bench Type': arrangement.bench_type,
      'Row': arrangement.row_position,
      'Column': arrangement.column_position,
      'Seat Position': arrangement.seat_position
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Seating Arrangements');
    XLSX.writeFile(wb, `seating-arrangement-${user.registrationNumber}.xlsx`);
  };

  const exportToImage = async () => {
    const element = document.getElementById('seating-table');
    const canvas = await html2canvas(element);
    
    // Create download link
    const link = document.createElement('a');
    link.download = `seating-arrangement-${user.registrationNumber}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

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
              <Nav.Link href="#exams">My Exams</Nav.Link>
              <Nav.Link href="#seating">Seating Arrangements</Nav.Link>
            </Nav>
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-light" id="dropdown-basic">
                👤 {user?.name || 'Student'}
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
              <h2>Welcome, {user?.name}! 👋</h2>
              <p className="mb-0">Registration Number: {studentData?.registration_number}</p>
              <p className="mb-0">Branch: {studentData?.branch}</p>
            </div>
          </Col>
        </Row>

        {/* Student Info Cards */}
        <Row className="mb-4">
          <Col md={4}>
            <Card className="h-100 border-primary shadow-sm">
              <Card.Body className="text-center">
                <div className="icon-container mb-3">
                  <span className="dashboard-icon">👤</span>
                </div>
                <Card.Title className="text-primary">Profile Information</Card.Title>
                <Card.Text>
                  <strong>Registration:</strong> {studentData?.registration_number}<br/>
                  <strong>Branch:</strong> {studentData?.branch}<br/>
                  <strong>Email:</strong> {user?.email}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card className="h-100 border-success shadow-sm">
              <Card.Body className="text-center">
                <div className="icon-container mb-3">
                  <span className="dashboard-icon">📚</span>
                </div>
                <Card.Title className="text-success">Registered Subjects</Card.Title>
                <Card.Text>
                  {studentData?.subject_codes ? (
                    studentData.subject_codes.map((subject, index) => (
                      <span key={index} className="badge bg-success me-1 mb-1">{subject}</span>
                    ))
                  ) : (
                    'No subjects registered'
                  )}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card className="h-100 border-warning shadow-sm">
              <Card.Body className="text-center">
                <div className="icon-container mb-3">
                  <span className="dashboard-icon">📅</span>
                </div>
                <Card.Title className="text-warning">Upcoming Exams</Card.Title>
                <div className="stat-section">
                  <h3 className="text-warning mb-1">{seatingArrangements.length}</h3>
                  <small className="text-muted">Scheduled Exams</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Seating Arrangements */}
        <Row>
          <Col>
            <Card className="shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">My Seating Arrangements</h5>
                {seatingArrangements.length > 0 && (
                  <div>
                    <Button variant="outline-primary" size="sm" className="me-2" onClick={exportToPDF}>
                      📄 PDF
                    </Button>
                    <Button variant="outline-success" size="sm" className="me-2" onClick={exportToExcel}>
                      📊 Excel
                    </Button>
                    <Button variant="outline-info" size="sm" onClick={exportToImage}>
                      🖼️ Image
                    </Button>
                  </div>
                )}
              </Card.Header>
              <Card.Body>
                {seatingArrangements.length > 0 ? (
                  <div id="seating-table">
                    <Table responsive striped bordered hover>
                      <thead className="table-dark">
                        <tr>
                          <th>Subject</th>
                          <th>Subject Name</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Room</th>
                          <th>Block/Floor</th>
                          <th>Bench Type</th>
                          <th>Position</th>
                          <th>Seat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seatingArrangements.map((arrangement, index) => (
                          <tr key={index}>
                            <td>
                              <span className="badge bg-primary">{arrangement.subject_code}</span>
                            </td>
                            <td>{arrangement.subject_name}</td>
                            <td>{new Date(arrangement.exam_date).toLocaleDateString()}</td>
                            <td>{arrangement.exam_time}</td>
                            <td>
                              <strong>{arrangement.room_number}</strong>
                            </td>
                            <td>
                              Block {arrangement.block}, Floor {arrangement.floor}
                            </td>
                            <td>
                              <span className={`badge ${arrangement.bench_type === '3-seater' ? 'bg-warning' : 'bg-info'}`}>
                                {arrangement.bench_type}
                              </span>
                            </td>
                            <td>
                              Row {arrangement.row_position}, Col {arrangement.column_position}
                            </td>
                            <td>
                              <span className="badge bg-success">
                                Seat {arrangement.seat_position}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <Alert variant="info" className="text-center">
                    <h5>📅 No Seating Arrangements Yet</h5>
                    <p>Your seating arrangements will appear here once exams are scheduled and seats are allocated.</p>
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Instructions Card */}
        <Row className="mt-4">
          <Col>
            <Card className="shadow-sm border-info">
              <Card.Header className="bg-info text-white">
                <h5 className="mb-0">📋 Important Instructions</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h6>📍 Before Exam:</h6>
                    <ul>
                      <li>Check your seating arrangement 24 hours before the exam</li>
                      <li>Note down your room number, bench position, and seat number</li>
                      <li>Arrive at the examination center 30 minutes early</li>
                      <li>Bring your ID card and hall ticket</li>
                    </ul>
                  </Col>
                  <Col md={6}>
                    <h6>🎯 During Exam:</h6>
                    <ul>
                      <li>Report to your assigned room and seat only</li>
                      <li>Follow the bench type seating arrangement</li>
                      <li>Maintain exam discipline and silence</li>
                      <li>Contact invigilator for any issues</li>
                    </ul>
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

export default StudentDashboard;
