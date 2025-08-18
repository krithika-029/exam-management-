import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Modal, Alert, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    registration_number: '',
    branch: '',
    subject_codes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, branchFilter]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/students');
      setStudents(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to fetch students');
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.registration_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (branchFilter) {
      filtered = filtered.filter(student => student.branch === branchFilter);
    }

    setFilteredStudents(filtered);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const submitData = {
        ...formData,
        subject_codes: formData.subject_codes.split(',').map(code => code.trim())
      };

      if (editingStudent) {
        await axios.put(`/api/students/${editingStudent.id}`, submitData);
        setSuccess('Student updated successfully');
      } else {
        await axios.post('/api/students', submitData);
        setSuccess('Student created successfully');
      }
      
      fetchStudents();
      handleCloseModal();
    } catch (error) {
      setError(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name || '',
      email: student.email || '',
      registration_number: student.registration_number || '',
      branch: student.branch || '',
      subject_codes: Array.isArray(student.subject_codes) ? student.subject_codes.join(', ') : student.subject_codes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`/api/students/${studentId}`);
        setSuccess('Student deleted successfully');
        fetchStudents();
      } catch (error) {
        setError(error.response?.data?.error || 'Delete failed');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStudent(null);
    setFormData({
      name: '',
      email: '',
      registration_number: '',
      branch: '',
      subject_codes: ''
    });
    setError('');
  };

  const getBranchColor = (branch) => {
    const colors = {
      'CSE': 'primary',
      'ECE': 'success', 
      'EE': 'warning',
      'ME': 'danger',
      'CE': 'info'
    };
    return colors[branch] || 'secondary';
  };

  const uniqueBranches = [...new Set(students.map(student => student.branch))].filter(Boolean);

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>👥 Student Management</h2>
            <div>
              <Button variant="secondary" onClick={() => navigate('/admin-dashboard')} className="me-2">
                ← Back to Dashboard
              </Button>
              <Button variant="primary" onClick={() => setShowModal(true)}>
                + Add Student
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Search and Filter */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Search by name, email, or registration number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
            <option value="">All Branches</option>
            {uniqueBranches.map(branch => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3}>
          <div className="text-muted">
            Showing {filteredStudents.length} of {students.length} students
          </div>
        </Col>
      </Row>

      {/* Students Table */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">All Students</h5>
            </Card.Header>
            <Card.Body>
              {filteredStudents.length > 0 ? (
                <Table responsive striped bordered hover>
                  <thead className="table-dark">
                    <tr>
                      <th>Registration No.</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Branch</th>
                      <th>Subject Codes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map(student => (
                      <tr key={student.id}>
                        <td className="fw-bold">{student.registration_number}</td>
                        <td>{student.name || 'N/A'}</td>
                        <td>{student.email}</td>
                        <td>
                          <Badge bg={getBranchColor(student.branch)}>
                            {student.branch}
                          </Badge>
                        </td>
                        <td>
                          {Array.isArray(student.subject_codes) 
                            ? student.subject_codes.map(code => (
                                <Badge key={code} bg="outline-secondary" className="me-1">
                                  {code}
                                </Badge>
                              ))
                            : student.subject_codes
                          }
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-1"
                            onClick={() => handleEdit(student)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(student.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">No students found.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add/Edit Student Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingStudent ? 'Edit Student' : 'Add New Student'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Registration Number</Form.Label>
              <Form.Control
                type="text"
                name="registration_number"
                value={formData.registration_number}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Branch</Form.Label>
              <Form.Select
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Branch</option>
                <option value="CSE">Computer Science Engineering</option>
                <option value="ECE">Electronics & Communication</option>
                <option value="EE">Electrical Engineering</option>
                <option value="ME">Mechanical Engineering</option>
                <option value="CE">Civil Engineering</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Subject Codes</Form.Label>
              <Form.Control
                type="text"
                name="subject_codes"
                value={formData.subject_codes}
                onChange={handleInputChange}
                placeholder="e.g., CS101, CS102, CS103"
                required
              />
              <Form.Text className="text-muted">
                Enter subject codes separated by commas
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingStudent ? 'Update Student' : 'Add Student'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default StudentManagement;
