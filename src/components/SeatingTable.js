import React from 'react';
import { Table, Container, Badge, Card } from 'react-bootstrap';

const SeatingTable = ({ seatingData, subjectColors }) => {
  if (!seatingData || !seatingData.seatingMap) {
    return <div className="text-center">No seating data available</div>;
  }

  const { seatingMap, classroom } = seatingData;

  return (
    <Container>
      <div className="mb-4">
        <h4>Visual Seating Layout - Room {classroom.room_number}</h4>
        <p className="text-muted">
          Classroom: {classroom.rows} rows × {classroom.columns} columns | 
          3-seater benches: {classroom.num_3seater} | 5-seater benches: {classroom.num_5seater}
        </p>
      </div>

      {/* Visual Grid Layout */}
      <div className="mb-4">
        <h5>Seating Grid</h5>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${classroom.columns}, 1fr)`, gap: '10px', maxWidth: '100%' }}>
          {seatingMap.map((row, rowIndex) => 
            row.map((seat, colIndex) => (
              <div 
                key={`${rowIndex}-${colIndex}`} 
                style={{ 
                  border: '2px solid #dee2e6', 
                  borderRadius: '8px', 
                  padding: '8px', 
                  minHeight: '80px',
                  backgroundColor: seat ? '#f8f9fa' : '#ffffff',
                  borderColor: seat ? '#28a745' : '#dee2e6'
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '4px' }}>
                  R{rowIndex + 1}C{colIndex + 1}
                </div>
                {seat ? (
                  <div>
                    <Badge bg="secondary" style={{ fontSize: '8px' }} className="mb-1">
                      {seat.benchType}
                    </Badge>
                    {seat.students.map((student, studentIndex) => (
                      <div key={studentIndex} style={{ fontSize: '11px', marginBottom: '2px' }}>
                        <Badge bg={subjectColors[student.subject_code]} style={{ fontSize: '9px' }}>
                          {student.registration_number}
                        </Badge>
                        <br />
                        <span style={{ fontSize: '9px' }}>{student.subject_code}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#6c757d', fontSize: '10px' }}>Empty</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detailed Table View */}
      <div>
        <h5>Detailed Seating Table</h5>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Row</th>
              <th>Column</th>
              <th>Bench Type</th>
              <th>Bench Number</th>
              <th>Students</th>
              <th>Subject Codes</th>
            </tr>
          </thead>
          <tbody>
            {seatingMap.map((row, rowIndex) => 
              row.map((seat, colIndex) => {
                if (!seat) return null;
                return (
                  <tr key={`${rowIndex}-${colIndex}`}>
                    <td>{rowIndex + 1}</td>
                    <td>{colIndex + 1}</td>
                    <td>
                      <Badge bg={seat.benchType === '3-seater' ? 'primary' : 'success'}>
                        {seat.benchType}
                      </Badge>
                    </td>
                    <td>#{seat.benchNumber}</td>
                    <td>
                      {seat.students.map((student, studentIndex) => (
                        <div key={studentIndex} className="mb-1">
                          <Badge bg={subjectColors[student.subject_code]} className="me-1">
                            {student.registration_number}
                          </Badge>
                        </div>
                      ))}
                    </td>
                    <td>
                      {seat.students.map((student, studentIndex) => (
                        <div key={studentIndex} className="mb-1">
                          <Badge bg="outline-secondary" text="dark">
                            {student.subject_code}
                          </Badge>
                        </div>
                      ))}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </div>

      {/* Legend */}
      <Card className="mt-4">
        <Card.Header>
          <h6>Legend</h6>
        </Card.Header>
        <Card.Body>
          <div className="d-flex flex-wrap gap-3">
            <div>
              <Badge bg="primary">3-seater</Badge>
              <small className="ms-2">Different subject codes</small>
            </div>
            <div>
              <Badge bg="success">5-seater</Badge>
              <small className="ms-2">Same subject codes</small>
            </div>
          </div>
          <div className="mt-2">
            <strong>Subject Colors:</strong>
            <div className="mt-1">
              {Object.entries(subjectColors).map(([subject, color]) => (
                <Badge key={subject} bg={color} className="me-2">
                  {subject}
                </Badge>
              ))}
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SeatingTable;
