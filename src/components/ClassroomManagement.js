import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Modal, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ClassroomManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState(null);
  const [formData, setFormData] = useState({
    room_number: '',
    block: '',
    floor: '',
    rows: '',
    columns: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const response = await axios.get('/api/classrooms');
      setClassrooms(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      setError('Failed to fetch classrooms');
      setLoading(false);
    }
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
      if (editingClassroom) {
        await axios.put(`/api/classrooms/${editingClassroom.id}`, formData);
        setSuccess('Classroom updated successfully');
      } else {
        await axios.post('/api/classrooms', formData);
        setSuccess('Classroom created successfully');
      }
      
      fetchClassrooms();
      handleCloseModal();
    } catch (error) {
      setError(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (classroom) => {
    setEditingClassroom(classroom);
    setFormData({
      room_number: classroom.room_number,
      block: classroom.block || '',
      floor: classroom.floor || '',
      rows: classroom.rows,
      columns: classroom.columns
    });
    setShowModal(true);
  };

  const handleDelete = async (classroomId) => {
    if (window.confirm('Are you sure you want to delete this classroom?')) {
      try {
        await axios.delete(`/api/classrooms/${classroomId}`);
        setSuccess('Classroom deleted successfully');
        fetchClassrooms();
      } catch (error) {
        setError(error.response?.data?.error || 'Delete failed');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingClassroom(null);
    setFormData({
      room_number: '',
      block: '',
      floor: '',
      rows: '',
      columns: ''
    });
    setError('');
  };

  const configureBenches = (classroom) => {
    navigate(`/seat-selector/${classroom.id}`);
  };

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
            <h2>🏛️ Classroom Management</h2>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              + Add Classroom
            </Button>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">All Classrooms</h5>
            </Card.Header>
            <Card.Body>
              {classrooms.length > 0 ? (
                <Table responsive striped bordered hover>
                  <thead className="table-dark">
                    <tr>
                      <th>Room Number</th>
                      <th>Block</th>
                      <th>Floor</th>
                      <th>Dimensions</th>
                      <th>Capacity</th>
                      <th>Benches</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classrooms.map((classroom) => (
                      <tr key={classroom.id}>
                        <td>
                          <strong>{classroom.room_number}</strong>
                        </td>
                        <td>{classroom.block || 'N/A'}</td>
                        <td>{classroom.floor || 'N/A'}</td>
                        <td>
                          {classroom.rows} × {classroom.columns}
                        </td>
                        <td>
                          <span className="badge bg-info">
                            {classroom.capacity} students
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-success me-1">
                            3-seater: {classroom.three_seater_count || 0}
                          </span>
                          <span className="badge bg-warning">
                            5-seater: {classroom.five_seater_count || 0}
                          </span>
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => configureBenches(classroom)}
                          >
                            🪑 Configure
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEdit(classroom)}
                          >
                            ✏️ Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(classroom.id)}
                          >
                            🗑️ Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info" className="text-center">
                  <h5>🏛️ No Classrooms Found</h5>
                  <p>Add your first classroom to get started with exam management.</p>
                  <Button variant="primary" onClick={() => setShowModal(true)}>
                    + Add First Classroom
                  </Button>
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add/Edit Classroom Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingClassroom ? '✏️ Edit Classroom' : '➕ Add New Classroom'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Room Number *</Form.Label>
                  <Form.Control
                    type="text"
                    name="room_number"
                    value={formData.room_number}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 101, A-201"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Block</Form.Label>
                  <Form.Control
                    type="text"
                    name="block"
                    value={formData.block}
                    onChange={handleInputChange}
                    placeholder="e.g., A, B, Main"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Floor</Form.Label>
                  <Form.Select
                    name="floor"
                    value={formData.floor}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Floor</option>
                    <option value="0">Ground Floor</option>
                    <option value="1">1st Floor</option>
                    <option value="2">2nd Floor</option>
                    <option value="3">3rd Floor</option>
                    <option value="4">4th Floor</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Number of Rows *</Form.Label>
                  <Form.Control
                    type="number"
                    name="rows"
                    value={formData.rows}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="20"
                    placeholder="e.g., 5"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Number of Columns *</Form.Label>
                  <Form.Control
                    type="number"
                    name="columns"
                    value={formData.columns}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="20"
                    placeholder="e.g., 4"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Alert variant="info">
              <h6>📋 Next Steps:</h6>
              <p className="mb-0">
                After creating the classroom, you'll be able to configure the bench layout 
                using the "Configure" button. This will allow you to set up 3-seater and 
                5-seater benches for optimal seating arrangements.
              </p>
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingClassroom ? 'Update Classroom' : 'Create Classroom'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ClassroomManagement;
