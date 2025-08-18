import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Nav } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student',
    registrationNumber: '',
    branch: '',
    department: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await signup(formData);
      }

      if (result.success) {
        // Redirect based on role
        if (result.user.role === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/student-dashboard');
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }

    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'student',
      registrationNumber: '',
      branch: '',
      department: ''
    });
    setError('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <Container fluid className="auth-container">
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col md={6} lg={5} xl={4}>
          <Card className="auth-card shadow-lg">
            <Card.Header className="text-center bg-primary text-white">
              <h4 className="mb-0">Exam Seating Management System</h4>
            </Card.Header>
            <Card.Body className="p-4">
              <Nav variant="pills" className="justify-content-center mb-4">
                <Nav.Item>
                  <Nav.Link 
                    active={isLogin} 
                    onClick={() => setIsLogin(true)}
                    className="px-4"
                  >
                    Login
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={!isLogin} 
                    onClick={() => setIsLogin(false)}
                    className="px-4"
                  >
                    Sign Up
                  </Nav.Link>
                </Nav.Item>
              </Nav>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                    minLength="6"
                  />
                </Form.Group>

                {!isLogin && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Role</Form.Label>
                      <Form.Select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                      >
                        <option value="student">Student</option>
                        <option value="admin">Administrator</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your full name"
                      />
                    </Form.Group>

                    {formData.role === 'student' ? (
                      <>
                        <Form.Group className="mb-3">
                          <Form.Label>Registration Number</Form.Label>
                          <Form.Control
                            type="text"
                            name="registrationNumber"
                            value={formData.registrationNumber}
                            onChange={handleChange}
                            required
                            placeholder="Enter your registration number"
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Branch</Form.Label>
                          <Form.Select
                            name="branch"
                            value={formData.branch}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Select Branch</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Information Technology">Information Technology</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Mechanical">Mechanical</option>
                            <option value="Civil">Civil</option>
                          </Form.Select>
                        </Form.Group>
                      </>
                    ) : (
                      <Form.Group className="mb-3">
                        <Form.Label>Department</Form.Label>
                        <Form.Control
                          type="text"
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          placeholder="Enter your department"
                        />
                      </Form.Group>
                    )}
                  </>
                )}

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {isLogin ? 'Logging in...' : 'Creating Account...'}
                    </>
                  ) : (
                    isLogin ? 'Login' : 'Create Account'
                  )}
                </Button>
              </Form>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={toggleMode}
                  className="text-decoration-none"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
                </Button>
              </div>

              {isLogin && (
                <div className="text-center mt-3">
                  <small className="text-muted">
                    Demo Credentials:<br/>
                    Admin: admin@test.com / admin123<br/>
                    Student: student@test.com / student123
                  </small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Auth;
