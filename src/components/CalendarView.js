// CalendarView.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import calendar styles
import axios from 'axios';

const CalendarView = () => {
  const [exams, setExams] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    // Fetch exams from the server and set them
    axios.get('http://localhost:5000/api/exams')
      .then((response) => {
        setExams(response.data); // Assuming the response contains a list of exams
      })
      .catch((error) => {
        console.error('Error fetching exams:', error);
      });
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const filteredExams = exams.filter(
    (exam) => new Date(exam.date).toLocaleDateString() === selectedDate.toLocaleDateString()
  );

  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col md={8}>
          <Card>
            <Card.Body>
              <h3 className="text-center">Calendar View</h3>
              <Calendar onChange={handleDateChange} value={selectedDate} />
              <h5 className="mt-4">Exams on {selectedDate.toLocaleDateString()}:</h5>
              {filteredExams.length === 0 ? (
                <p>No exams scheduled on this date.</p>
              ) : (
                filteredExams.map((exam) => (
                  <Card className="mb-3" key={exam.id}>
                    <Card.Body>
                      <Card.Title>{exam.subject}</Card.Title>
                      <Card.Text>
                        Time: {exam.time}<br />
                        Duration: {exam.duration} minutes
                      </Card.Text>
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

export default CalendarView;
