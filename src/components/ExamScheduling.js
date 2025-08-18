// ExamScheduling.js
import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';

const ExamScheduling = () => {
  const [examDetails, setExamDetails] = useState({
    subject: '',
    date: '',
    time: '',
    duration: ''
  });

  const handleChange = (e) => {
    setExamDetails({
      ...examDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // You would normally send this data to the backend API
    console.log(examDetails);
    alert('Exam scheduled successfully!');
  };

  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col md={8}>
          <Card>
            <Card.Body>
              <h3 className="text-center">Schedule Exam</h3>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Subject</Form.Label>
                  <Form.Control
                    type="text"
                    name="subject"
                    value={examDetails.subject}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={examDetails.date}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Time</Form.Label>
                  <Form.Control
                    type="time"
                    name="time"
                    value={examDetails.time}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Duration (in minutes)</Form.Label>
                  <Form.Control
                    type="number"
                    name="duration"
                    value={examDetails.duration}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100">
                  Schedule Exam
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ExamScheduling;
