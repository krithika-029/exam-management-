import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge, Modal, Table } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './Seatselector.css';

const SeatSelector = () => {
  const navigate = useNavigate();
  const { classroomId } = useParams();
  const { user } = useAuth();
  
  const [classroom, setClassroom] = useState(null);
  const [rows, setRows] = useState(5);
  const [columns, setColumns] = useState(6);
  const [benches, setBenches] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [benchType, setBenchType] = useState('3-seater');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (classroomId) {
      fetchClassroom();
    }
  }, [classroomId]);

  const fetchClassroom = async () => {
    try {
      const response = await axios.get(`/api/classrooms/${classroomId}`);
      setClassroom(response.data);
      setRows(response.data.rows || 5);
      setColumns(response.data.columns || 6);
      
      // Fetch existing benches
      const benchesResponse = await axios.get(`/api/classrooms/${classroomId}/benches`);
      setBenches(benchesResponse.data || []);
    } catch (error) {
      console.error('Error fetching classroom:', error);
      setError('Failed to load classroom data');
    }
  };

  // Generate grid positions
  const generateGrid = () => {
    const grid = [];
    for (let row = 1; row <= rows; row++) {
      for (let col = 1; col <= columns; col++) {
        grid.push({ row, col });
      }
    }
    return grid;
  };

  // Check if position has a bench
  const getBenchAtPosition = (row, col) => {
    return benches.find(bench => bench.row_position === row && bench.column_position === col);
  };

  // Add bench to position
  const addBench = async (row, col) => {
    if (!classroomId) {
      setError('No classroom selected');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`/api/classrooms/${classroomId}/benches`, {
        row_position: row,
        column_position: col,
        bench_type: benchType
      });
      
      setBenches([...benches, response.data]);
      setSuccess('Bench added successfully');
      setSelectedPosition(null);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to add bench');
    } finally {
      setLoading(false);
    }
  };

  // Remove bench
  const removeBench = async (benchId) => {
    try {
      setLoading(true);
      await axios.delete(`/api/classrooms/${classroomId}/benches/${benchId}`);
      setBenches(benches.filter(bench => bench.id !== benchId));
      setSuccess('Bench removed successfully');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to remove bench');
    } finally {
      setLoading(false);
    }
  };

  // Save configuration
  const saveConfiguration = async () => {
    try {
      setLoading(true);
      await axios.put(`/api/classrooms/${classroomId}`, {
        rows,
        columns
      });
      setSuccess('Configuration saved successfully');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const getBenchTypeColor = (type) => {
    return type === '3-seater' ? 'primary' : 'success';
  };

  const getBenchTypeIcon = (type) => {
    return type === '3-seater' ? '🪑🪑🪑' : '🪑🪑🪑🪑🪑';
  };

  return (
    <Container className="mt-4 seat-selector-container">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="text-primary">🪑 Classroom Bench Configuration</h2>
              <p className="text-muted mb-0">
                {classroom ? `Room ${classroom.room_number} - ${classroom.block}` : 'Configure Seating Layout'}
              </p>
            </div>
            <div>
              <Button variant="outline-secondary" onClick={() => navigate('/classroom-management')} className="me-2">
                ← Back to Classrooms
              </Button>
              <Button variant="info" onClick={() => setShowPreview(true)}>
                👁️ Preview Layout
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Configuration Panel */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="h-100">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">📐 Classroom Dimensions</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Number of Rows</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="10"
                  value={rows}
                  onChange={(e) => setRows(Number(e.target.value))}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Number of Columns</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="15"
                  value={columns}
                  onChange={(e) => setColumns(Number(e.target.value))}
                />
              </Form.Group>
              <Button variant="success" onClick={saveConfiguration} disabled={loading} className="w-100">
                {loading ? 'Saving...' : '💾 Save Dimensions'}
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">🪑 Bench Configuration</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Bench Type</Form.Label>
                <Form.Select value={benchType} onChange={(e) => setBenchType(e.target.value)}>
                  <option value="3-seater">3-Seater Bench 🪑🪑🪑</option>
                  <option value="5-seater">5-Seater Bench 🪑🪑🪑🪑🪑</option>
                </Form.Select>
              </Form.Group>
              <div className="bench-info mb-3 p-3 bg-light rounded">
                <div className="text-center">
                  <div className="fs-2 mb-2">{getBenchTypeIcon(benchType)}</div>
                  <Badge bg={getBenchTypeColor(benchType)} className="fs-6">
                    {benchType.toUpperCase()}
                  </Badge>
                  <p className="text-muted small mt-2 mb-0">
                    {benchType === '3-seater' 
                      ? 'For students with different subjects' 
                      : 'Can accommodate same subject students'
                    }
                  </p>
                </div>
              </div>
              <p className="text-info small">
                💡 Click on empty grid positions to add benches
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">📊 Statistics</h5>
            </Card.Header>
            <Card.Body>
              <div className="stat-item mb-3">
                <div className="d-flex justify-content-between">
                  <span>Total Positions:</span>
                  <Badge bg="secondary">{rows * columns}</Badge>
                </div>
              </div>
              <div className="stat-item mb-3">
                <div className="d-flex justify-content-between">
                  <span>Configured Benches:</span>
                  <Badge bg="primary">{benches.length}</Badge>
                </div>
              </div>
              <div className="stat-item mb-3">
                <div className="d-flex justify-content-between">
                  <span>3-Seater Benches:</span>
                  <Badge bg="primary">{benches.filter(b => b.bench_type === '3-seater').length}</Badge>
                </div>
              </div>
              <div className="stat-item mb-3">
                <div className="d-flex justify-content-between">
                  <span>5-Seater Benches:</span>
                  <Badge bg="success">{benches.filter(b => b.bench_type === '5-seater').length}</Badge>
                </div>
              </div>
              <div className="stat-item">
                <div className="d-flex justify-content-between">
                  <span>Empty Positions:</span>
                  <Badge bg="warning">{(rows * columns) - benches.length}</Badge>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Interactive Grid */}
      <Row>
        <Col>
          <Card>
            <Card.Header className="bg-dark text-white">
              <h5 className="mb-0">🗂️ Interactive Seating Grid</h5>
              <small>Click empty positions to add benches • Click benches to remove them</small>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="classroom-grid">
                <div className="grid-header mb-3 text-center">
                  <Badge bg="secondary" className="fs-6">📚 Front of Classroom (Blackboard)</Badge>
                </div>
                <div 
                  className="seating-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gap: '10px',
                    maxWidth: '100%',
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '10px',
                    border: '2px dashed #dee2e6'
                  }}
                >
                  {generateGrid().map(({ row, col }) => {
                    const bench = getBenchAtPosition(row, col);
                    return (
                      <div
                        key={`${row}-${col}`}
                        className={`grid-position ${bench ? 'has-bench' : 'empty-position'}`}
                        onClick={() => bench ? removeBench(bench.id) : addBench(row, col)}
                        style={{
                          minHeight: '80px',
                          border: '2px solid',
                          borderColor: bench ? (bench.bench_type === '3-seater' ? '#0d6efd' : '#198754') : '#dee2e6',
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          backgroundColor: bench 
                            ? (bench.bench_type === '3-seater' ? '#e7f1ff' : '#e8f5e8')
                            : '#ffffff',
                          position: 'relative'
                        }}
                      >
                        <div className="position-label" style={{ 
                          fontSize: '10px', 
                          color: '#6c757d',
                          position: 'absolute',
                          top: '2px',
                          left: '4px'
                        }}>
                          R{row}C{col}
                        </div>
                        
                        {bench ? (
                          <div className="bench-display text-center">
                            <div className="bench-icon mb-1" style={{ fontSize: '20px' }}>
                              {getBenchTypeIcon(bench.bench_type)}
                            </div>
                            <Badge bg={getBenchTypeColor(bench.bench_type)} style={{ fontSize: '8px' }}>
                              {bench.bench_type}
                            </Badge>
                            <div style={{ fontSize: '8px', color: '#6c757d', marginTop: '2px' }}>
                              Click to remove
                            </div>
                          </div>
                        ) : (
                          <div className="empty-display text-center text-muted">
                            <div style={{ fontSize: '20px', marginBottom: '4px' }}>➕</div>
                            <div style={{ fontSize: '8px' }}>Add Bench</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="grid-footer mt-3 text-center">
                  <Badge bg="secondary" className="fs-6">🚪 Back of Classroom (Exit)</Badge>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bench List */}
      {benches.length > 0 && (
        <Row className="mt-4">
          <Col>
            <Card>
              <Card.Header>
                <h5 className="mb-0">📋 Configured Benches</h5>
              </Card.Header>
              <Card.Body>
                <Table responsive striped bordered hover size="sm">
                  <thead className="table-dark">
                    <tr>
                      <th>Position</th>
                      <th>Bench Type</th>
                      <th>Capacity</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {benches.map(bench => (
                      <tr key={bench.id}>
                        <td>Row {bench.row_position}, Column {bench.column_position}</td>
                        <td>
                          <Badge bg={getBenchTypeColor(bench.bench_type)}>
                            {bench.bench_type}
                          </Badge>
                        </td>
                        <td>{bench.bench_type === '3-seater' ? '2 students' : '2 students'}</td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeBench(bench.id)}
                            disabled={loading}
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Preview Modal */}
      <Modal show={showPreview} onHide={() => setShowPreview(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>🪑 Classroom Layout Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="preview-container">
            <div className="text-center mb-3">
              <h4>{classroom?.room_number} - {classroom?.block}</h4>
              <p className="text-muted">Seating Capacity: {benches.length * 2} students</p>
            </div>
            <div 
              className="preview-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: '8px',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '10px'
              }}
            >
              {generateGrid().map(({ row, col }) => {
                const bench = getBenchAtPosition(row, col);
                return (
                  <div
                    key={`${row}-${col}`}
                    style={{
                      minHeight: '60px',
                      border: '1px solid',
                      borderColor: bench ? (bench.bench_type === '3-seater' ? '#0d6efd' : '#198754') : '#dee2e6',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: bench 
                        ? (bench.bench_type === '3-seater' ? '#e7f1ff' : '#e8f5e8')
                        : '#ffffff',
                      fontSize: '12px'
                    }}
                  >
                    {bench ? getBenchTypeIcon(bench.bench_type) : ''}
                  </div>
                );
              })}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreview(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SeatSelector;