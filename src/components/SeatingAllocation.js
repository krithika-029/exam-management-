import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Alert, Badge, Card } from 'react-bootstrap';
import axios from 'axios';
import './SeatingAllocation.css';

const SeatingAllocation = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [examForm, setExamForm] = useState({
    examDate: '',
    examTime: '',
    roomNumber: '',
    selectedClassroom: '',
    block: '',
    branch1: '',
    branch2: '',
    subjectCode1: '',
    subjectCode2: ''
  });
  const [seatingArrangement, setSeatingArrangement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [branches] = useState(['CS', 'ME', 'CE', 'ECE', 'ISE', 'AI']);
  const [subjects] = useState({
    'CS': ['CS201', 'CS202', 'CS203', 'CS204', 'CS205', 'CS206'],
    'ME': ['ME201', 'ME202', 'ME203', 'ME204', 'ME205', 'ME206'],
    'CE': ['CE201', 'CE202', 'CE203', 'CE204', 'CE205', 'CE206'],
    'ECE': ['EC201', 'EC202', 'EC203', 'EC204', 'EC205', 'EC206'],
    'ISE': ['IS201', 'IS202', 'IS203', 'IS204', 'IS205', 'IS206'],
    'AI': ['AI201', 'AI202', 'AI203', 'AI204', 'AI205', 'AI206']
  });

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/classrooms');
      setClassrooms(response.data);
    } catch (err) {
      setError('Failed to fetch classrooms');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setExamForm({
      ...examForm,
      [name]: value
    });

    // Auto-fill room number and block when classroom is selected
    if (name === 'selectedClassroom') {
      const selectedRoom = classrooms.find(room => room.id.toString() === value);
      if (selectedRoom) {
        setExamForm(prev => ({
          ...prev,
          selectedClassroom: value,
          roomNumber: selectedRoom.room_number,
          block: selectedRoom.block || 'Not specified'
        }));
      }
    }
  };

  const generateSeatingArrangement = async () => {
    if (!examForm.selectedClassroom || !examForm.branch1 || !examForm.subjectCode1 || !examForm.subjectCode2) {
      setError('Please fill in all required fields including classroom selection');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get selected classroom details
      const selectedRoom = classrooms.find(room => room.id.toString() === examForm.selectedClassroom);
      if (!selectedRoom) {
        setError('Selected classroom not found');
        return;
      }

      // Create exam session identifier
      const examSession = `${examForm.examDate}_${examForm.examTime}_${selectedRoom.room_number}_${examForm.subjectCode1}_${examForm.subjectCode2}`;

      // Get available students (not already allocated for this session)
      const response = await axios.post('http://localhost:5000/api/seatAllocation/get-available-students', {
        branch1: examForm.branch1,
        branch2: examForm.branch2,
        subjectCode1: examForm.subjectCode1,
        subjectCode2: examForm.subjectCode2,
        examSession: examSession,
        classroomCapacity: selectedRoom.capacity
      });

      const { branch1Students, branch2Students, allocatedCount, lastSeatNumber } = response.data;

      // Generate seating arrangement with continuous seat numbering
      const seatingData = [];
      const totalAllocated = branch1Students.length + branch2Students.length;
      let branch1Index = 0;
      let branch2Index = 0;
      let currentSeatNumber = lastSeatNumber + 1; // Start from the next seat number

      // Calculate rows needed (6 students per row: 3 benches × 2 students per bench)
      const studentsPerRow = 6;
      const rowsNeeded = Math.ceil(totalAllocated / studentsPerRow);

      for (let row = 0; row < rowsNeeded; row++) {
        const rowData = [];

        // Each row has 3 benches, each bench has 2 students (one from each branch)
        for (let bench = 0; bench < 3; bench++) {
          // Use continuous seat numbering instead of vertical column numbering

          // First student in the bench (from branch1) - left seat
          if (branch1Index < branch1Students.length) {
            rowData.push({
              seatNumber: currentSeatNumber++,
              student: branch1Students[branch1Index++],
              subject: examForm.subjectCode1,
              branch: examForm.branch1
            });
          } else {
            // If branch1 is exhausted, add empty seat (but don't increment seat number)
            rowData.push({
              seatNumber: null,
              student: null,
              subject: null,
              branch: null
            });
          }

          // Second student in the bench (from branch2) - right seat
          if (branch2Index < branch2Students.length) {
            rowData.push({
              seatNumber: currentSeatNumber++,
              student: branch2Students[branch2Index++],
              subject: examForm.subjectCode2,
              branch: examForm.branch2
            });
          } else {
            // If branch2 is exhausted, add empty seat (but don't increment seat number)
            rowData.push({
              seatNumber: null,
              student: null,
              subject: null,
              branch: null
            });
          }
        }

        seatingData.push(rowData);
      }

      // Assign seat numbers to students before saving
      const studentsWithSeats = [];

      // Extract students with their assigned seat numbers from the seating grid
      seatingData.forEach(row => {
        row.forEach(seat => {
          if (seat.student && seat.seatNumber) {
            studentsWithSeats.push({
              ...seat.student,
              seatNumber: seat.seatNumber,
              subject: seat.subject,
              branch: seat.branch
            });
          }
        });
      });

      // Separate students by branch for backend compatibility
      const branch1StudentsWithSeats = studentsWithSeats.filter(s => s.branch === examForm.branch1);
      const branch2StudentsWithSeats = studentsWithSeats.filter(s => s.branch === (examForm.branch2 || examForm.branch1));

      // Save allocation to database
      await axios.post('http://localhost:5000/api/seatAllocation/save-seat-allocation', {
        examSession: examSession,
        classroomId: selectedRoom.id,
        branch1Students: branch1StudentsWithSeats,
        branch2Students: branch2StudentsWithSeats,
        branch1: examForm.branch1,
        branch2: examForm.branch2,
        subjectCode1: examForm.subjectCode1,
        subjectCode2: examForm.subjectCode2
      });

      setSeatingArrangement({
        examInfo: { ...examForm, classroom: selectedRoom },
        branch1Count: branch1Students.length,
        branch2Count: branch2Students.length,
        totalAllocated: totalAllocated,
        classroomCapacity: selectedRoom.capacity,
        previouslyAllocated: allocatedCount,
        seatingGrid: seatingData
      });

    } catch (err) {
      console.error('Error generating seating:', err);
      setError(err.response?.data?.error || 'Failed to generate seating arrangement');
    } finally {
      setLoading(false);
    }
  };

  const exportSeatingArrangement = () => {
    if (!seatingArrangement) return;

    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Seating Arrangement</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .exam-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .course-info { margin-bottom: 20px; }
          .seating-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .seating-table th, .seating-table td { border: 1px solid #000; padding: 8px; text-align: center; }
          .seating-table th { background-color: #f0f0f0; }
          .branch1 { background-color: #e3f2fd; }
          .branch2 { background-color: #f3e5f5; }
          .footer { margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Sahyadri College of Engineering & Management, Mangaluru</h2>
        </div>
        
        <div class="exam-info">
          <div>
            <strong>Exam date:</strong> ${seatingArrangement.examInfo.examDate}<br>
            <strong>Exam Time:</strong> ${seatingArrangement.examInfo.examTime}
          </div>
          <div>
            <strong>Room No:</strong> ${seatingArrangement.examInfo.classroom.room_number}<br>
            <strong>Block:</strong> ${seatingArrangement.examInfo.classroom.block}<br>
            <strong>Capacity:</strong> ${seatingArrangement.classroomCapacity} students
          </div>
        </div>
        
        <div class="course-info">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <th style="border: 1px solid #000; padding: 8px; background-color: #f0f0f0;">Course name</th>
              <th style="border: 1px solid #000; padding: 8px; background-color: #f0f0f0;">No.of candidates:</th>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 8px;">${seatingArrangement.examInfo.subjectCode1}(${seatingArrangement.examInfo.branch1})</td>
              <td style="border: 1px solid #000; padding: 8px;">${seatingArrangement.branch1Count}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 8px;">${seatingArrangement.examInfo.subjectCode2}(${seatingArrangement.examInfo.branch2})</td>
              <td style="border: 1px solid #000; padding: 8px;">${seatingArrangement.branch2Count}</td>
            </tr>
          </table>
        </div>
        
        <h3 style="text-align: center; background-color: #d0d0d0; padding: 10px; margin: 20px 0;">SEATING ARRANGEMENT</h3>
        
        <table class="seating-table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="background-color: #f0f0f0; border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">SN</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">USN</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">SN</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">USN</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">SN</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">USN</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">SN</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">USN</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">SN</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">USN</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">SN</th>
              <th style="background-color: #f0f0f0; border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">USN</th>
            </tr>
          </thead>
          <tbody>
            ${seatingArrangement.seatingGrid.map((row, rowIndex) => `
              <tr>
                ${row.map((seat, colIndex) => {
      const bgClass = seat.student ? (seat.branch === seatingArrangement.examInfo.branch1 ? 'branch1' : 'branch2') : '';
      return `
                    <td class="${bgClass}" style="border: 1px solid #000; padding: 8px; text-align: center;">${seat.seatNumber}</td>
                    <td class="${bgClass}" style="border: 1px solid #000; padding: 8px; text-align: center;">${seat.student ? seat.student.registration_number : ''}</td>
                  `;
    }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p><strong>USN OF ABSENTEES:</strong></p>
          <hr>
          <p><strong>NO.OF ANSWER BOOKLET USED:</strong></p>
          <hr>
          <p><strong>SL NO.OF BLANK ANSWER BOOKS RETURNED:</strong></p>
          <hr>
          <p><strong>SL NO.OF DEFECTIVE/REPLACED ANSWER BOOKS:</strong></p>
          <table style="width: 100%; margin-top: 10px;">
            <tr>
              <td><strong>Defective:</strong></td>
            </tr>
            <tr>
              <td><strong>Replaced:</strong></td>
            </tr>
          </table>
          <br>
          <div style="display: flex; justify-content: space-between; margin-top: 40px;">
            <div>
              <p><strong>Name of the invigilator:</strong></p>
              <p><strong>Department:</strong></p>
              <p><strong>sign with date:</strong></p>
              <p><strong>Contact number:</strong></p>
            </div>
            <div>
              <p><strong>signature of DCS/CS</strong></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Container className="seating-allocation-container">
      <Row className="justify-content-center mt-4">
        <Col md={12}>
          <div className="exam-header">
            <h2>Exam Seating Arrangement System</h2>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Card className="mb-4 config-card">
            <Card.Header>
              <h5>Exam Configuration</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Row className="mb-3">
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Exam Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="examDate"
                        value={examForm.examDate}
                        onChange={handleFormChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Exam Time</Form.Label>
                      <Form.Control
                        type="time"
                        name="examTime"
                        value={examForm.examTime}
                        onChange={handleFormChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Select Classroom</Form.Label>
                      <Form.Control
                        as="select"
                        name="selectedClassroom"
                        value={examForm.selectedClassroom}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="">Choose Classroom</option>
                        {classrooms.map(classroom => (
                          <option key={classroom.id} value={classroom.id}>
                            Room {classroom.room_number} - Capacity: {classroom.capacity} (Block {classroom.block})
                          </option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Room Details</Form.Label>
                      <Form.Control
                        type="text"
                        value={examForm.roomNumber ? `${examForm.roomNumber} - ${examForm.block}` : ''}
                        disabled
                        placeholder="Select classroom first"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Branch 1</Form.Label>
                      <Form.Control
                        as="select"
                        name="branch1"
                        value={examForm.branch1}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="">Select Branch</option>
                        {branches.map(branch => (
                          <option key={branch} value={branch}>{branch}</option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Subject Code (Branch 1)</Form.Label>
                      <Form.Control
                        as="select"
                        name="subjectCode1"
                        value={examForm.subjectCode1}
                        onChange={handleFormChange}
                        required
                        disabled={!examForm.branch1}
                      >
                        <option value="">Select Subject</option>
                        {examForm.branch1 && subjects[examForm.branch1] && subjects[examForm.branch1].map(subject => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Branch 2</Form.Label>
                      <Form.Control
                        as="select"
                        name="branch2"
                        value={examForm.branch2}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="">Select Branch</option>
                        {branches.map(branch => (
                          <option key={branch} value={branch}>{branch}</option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Subject Code (Branch 2)</Form.Label>
                      <Form.Control
                        as="select"
                        name="subjectCode2"
                        value={examForm.subjectCode2}
                        onChange={handleFormChange}
                        required
                        disabled={!examForm.branch2}
                      >
                        <option value="">Select Subject</option>
                        {examForm.branch2 && subjects[examForm.branch2] && subjects[examForm.branch2].map(subject => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Button
                      className="btn-generate me-3"
                      onClick={generateSeatingArrangement}
                      disabled={loading}
                    >
                      {loading ? 'Generating...' : 'Generate Seating Arrangement'}
                    </Button>
                    {seatingArrangement && (
                      <Button className="btn-print" onClick={exportSeatingArrangement}>
                        Print/Export Arrangement
                      </Button>
                    )}
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {/* Statistics */}
          {seatingArrangement && (
            <Card className="mb-4 config-card">
              <Card.Header>
                <h5>Allocation Statistics</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <Table bordered size="sm" className="course-info-table">
                      <thead>
                        <tr>
                          <th>Course name</th>
                          <th>Allocated</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{examForm.subjectCode1}({examForm.branch1})</td>
                          <td>{seatingArrangement.branch1Count}</td>
                        </tr>
                        <tr>
                          <td>{examForm.subjectCode2}({examForm.branch2})</td>
                          <td>{seatingArrangement.branch2Count}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Col>
                  <Col md={4}>
                    <div className="stats-card">
                      <div className="stats-number">{seatingArrangement.totalAllocated}</div>
                      <div className="stats-label">Students Allocated</div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="p-3 border rounded text-center">
                      <h6>Classroom Capacity</h6>
                      <div className="mb-2">
                        <Badge bg="info" className="me-2">
                          Capacity: {seatingArrangement.classroomCapacity}
                        </Badge>
                      </div>
                      <div className="mb-2">
                        <Badge bg="success" className="me-2">
                          Used: {seatingArrangement.totalAllocated}
                        </Badge>
                      </div>
                      <div>
                        <Badge bg="warning">
                          Available: {seatingArrangement.classroomCapacity - seatingArrangement.totalAllocated}
                        </Badge>
                      </div>
                      {seatingArrangement.previouslyAllocated > 0 && (
                        <div className="mt-2">
                          <small className="text-muted">
                            Previously allocated: {seatingArrangement.previouslyAllocated} students
                          </small>
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* Seating Arrangement Table */}
          {seatingArrangement && (
            <Card className="config-card">
              <Card.Header className="text-center">
                <h5>SEATING ARRANGEMENT</h5>
                <div className="mt-2">
                  <Badge bg="info" className="me-2">Room: {examForm.roomNumber}</Badge>
                  <Badge bg="success" className="me-2">Date: {examForm.examDate}</Badge>
                  <Badge bg="warning" className="me-2">Time: {examForm.examTime}</Badge>
                  <Badge bg="secondary">Block: {examForm.block}</Badge>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table bordered hover className="seating-table">
                    <thead>
                      <tr>
                        <th style={{ width: '8.33%', backgroundColor: '#495057', color: 'white' }}>SN</th>
                        <th style={{ width: '8.33%', backgroundColor: '#495057', color: 'white' }}>USN</th>
                        <th style={{ width: '8.33%', backgroundColor: '#495057', color: 'white' }}>SN</th>
                        <th style={{ width: '8.33%', backgroundColor: '#495057', color: 'white' }}>USN</th>
                        <th style={{ width: '8.33%', backgroundColor: '#495057', color: 'white' }}>SN</th>
                        <th style={{ width: '8.33%', backgroundColor: '#495057', color: 'white' }}>USN</th>
                        <th style={{ width: '8.33%', backgroundColor: '#495057', color: 'white' }}>SN</th>
                        <th style={{ width: '8.33%', backgroundColor: '#495057', color: 'white' }}>USN</th>
                        <th style={{ width: '8.33%', backgroundColor: '#495057', color: 'white' }}>SN</th>
                        <th style={{ width: '8.33%', backgroundColor: '#495057', color: 'white' }}>USN</th>
                        <th style={{ width: '8.33%', backgroundColor: '#495057', color: 'white' }}>SN</th>
                        <th style={{ width: '8.35%', backgroundColor: '#495057', color: 'white' }}>USN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seatingArrangement.seatingGrid.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((seat, colIndex) => {
                            const isFirstBranch = seat.branch === examForm.branch1;
                            const bgColor = seat.student ?
                              (isFirstBranch ? '#e3f2fd' : '#f3e5f5') : '#ffffff';

                            return (
                              <React.Fragment key={colIndex}>
                                <td
                                  style={{
                                    backgroundColor: bgColor,
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '1rem'
                                  }}
                                  className="align-middle"
                                >
                                  {seat.seatNumber}
                                </td>
                                <td
                                  style={{
                                    backgroundColor: bgColor,
                                    textAlign: 'center'
                                  }}
                                  className="align-middle"
                                >
                                  {seat.student ? (
                                    <div>
                                      <div className="student-usn">
                                        {seat.student.registration_number}
                                      </div>
                                    </div>
                                  ) : ''}
                                </td>
                              </React.Fragment>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                <div className="mt-4 footer-section">
                  <Row>
                    <Col md={12}>
                      <div>
                        <div className="form-field">
                          <strong>USN OF ABSENTEES:</strong>
                        </div>

                        <div className="form-field">
                          <strong>NO.OF ANSWER BOOKLET USED:</strong>
                        </div>

                        <div className="form-field">
                          <strong>SL NO.OF BLANK ANSWER BOOKS RETURNED:</strong>
                        </div>

                        <div className="form-field">
                          <strong>SL NO.OF DEFECTIVE/REPLACED ANSWER BOOKS:</strong>
                          <div className="mt-2">
                            <div className="form-field">
                              <strong>Defective:</strong>
                            </div>
                            <div className="form-field">
                              <strong>Replaced:</strong>
                            </div>
                          </div>
                        </div>

                        <Row className="mt-4">
                          <Col md={6}>
                            <div>
                              <div className="form-field">
                                <strong>Name of the invigilator:</strong>
                              </div>
                              <div className="form-field">
                                <strong>Department:</strong>
                              </div>
                              <div className="form-field">
                                <strong>Sign with date:</strong>
                              </div>
                              <div className="form-field">
                                <strong>Contact number:</strong>
                              </div>
                            </div>
                          </Col>
                          <Col md={6} className="text-end">
                            <div className="form-field">
                              <strong>Signature of DCS/CS</strong>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default SeatingAllocation;
