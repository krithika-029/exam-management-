import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import './authnew.css'; // Custom CSS for styling
import { useNavigate } from 'react-router-dom';

const AuthNew = () => {
  const [role, setRole] = useState('student'); // Default role: Student
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRoleSelection = (selectedRole) => {
    setRole(selectedRole);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    alert(`Logged in as ${role.toUpperCase()}`);
    navigate('/admin'); // Redirect to home/dashboard
  };

  return (
    <Container fluid className="auth-page d-flex justify-content-center align-items-center">
      <Row>
        <Col>
          <Card className="auth-card p-4">
            {/* Role Selection */}
            <h3 className="text-center mb-4">Choose Account Type</h3>
            <div className="role-selection d-flex justify-content-center mb-4">
              <Card
                className={`role-card mx-2 ${role === 'student' ? 'selected' : ''}`}
                onClick={() => handleRoleSelection('student')}
              >
                <Card.Body className="text-center">
                  <img
                    src="https://img.icons8.com/color/96/student-male.png"
                    alt="Student Icon"
                    className="role-icon"
                  />
                  <h5>Student</h5>
                </Card.Body>
              </Card>
              <Card
                className={`role-card mx-2 ${role === 'admin' ? 'selected' : ''}`}
                onClick={() => handleRoleSelection('admin')}
              >
                <Card.Body className="text-center">
                  <img
                    src="https://img.icons8.com/color/96/administrator-male.png"
                    alt="Admin Icon"
                    className="role-icon"
                  />
                  <h5>Admin</h5>
                </Card.Body>
              </Card>
            </div>

            {/* Login Form */}
            <Form onSubmit={handleSubmit}>
              {error && <p className="text-danger text-center">{error}</p>}
              <Form.Group controlId="formEmail" className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="formPassword" className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>
              <div className="d-flex justify-content-between mb-3">
                <Form.Check type="checkbox" label="Remember Me" />
                <a href="#" className="forgot-password">
                  Forgot?
                </a>
              </div>
              <Button variant="primary" type="submit" className="w-100">
                Login
              </Button>
            </Form>

            {/* Signup Link */}
            <p className="text-center mt-3">
              No account? <a href="/signup">Sign Up</a>
            </p>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AuthNew;
