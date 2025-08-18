import React from 'react';
import { Container, Button, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const handleProceed = () => {
    navigate('/authnew'); // Redirect to the AuthNew page
  };

  return (
    <Container className="mt-5 text-center">
      {/* Welcome Section */}
      <div className="mb-4">
        <h1>Welcome to the College Exam Management System</h1>
        <Image
          src="path_to_college_picture.jpg" // Replace with actual path to the image
          alt="College"
          fluid
          style={{ maxHeight: '300px', objectFit: 'cover', marginBottom: '20px' }}
        />
        <p>Effortlessly manage exams, seating arrangements, and results with our system.</p>
      </div>

      {/* Proceed Button */}
      <Button variant="primary" size="lg" onClick={handleProceed}>
        Proceed to Login
      </Button>
    </Container>
  );
};

export default HomePage;
