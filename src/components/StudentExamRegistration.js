// StudentExamRegistration.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import axios from 'axios'; // You can replace this with your API call

const StudentExamRegistration = () => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);

  useEffect(() => {
    // Fetch the list of available exams from API (use your backend API)
    axios.get('http://localhost:5000/api/exams')
      .then((response) => {
        setExams(response.data); // Assuming response contains an array of exams
      })
      .catch((error) => {
        console.error('Error fetching exams:', error);
      });
  }, []);

  const handleRegister = (examId) => {
    // Register for the exam (send selected exam ID to the backend)
    console.log('Registering for exam with ID:', examId);
    alert('You have successfully registered for the exam!');
  };

  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col md={8}>
          <Card>
            <Card.Body>
              <h3 className="text-center">Available Exams</h3>
              {exams.length === 0 ? (
                <p>No exams available for registration.</p>
              ) : (
                exams.map((exam) => (
                  <Card className="mb-3" key={exam.id}>
                    <Card.Body>
                      <Card.Title>{exam.subject}</Card.Title>
                      <Card.Text>
                        Date: {exam.date}<br />
                        Time: {exam.time}<br />
                        Duration: {exam.duration} minutes
                      </Card.Text>
                      <Button
                        variant="primary"
                        onClick={() => handleRegister(exam.id)}
                        disabled={selectedExam === exam.id}
                      >
                        Register
                      </Button>
                    </Card.Body>
                  </Card>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentExamRegistration;
