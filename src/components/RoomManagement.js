import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [roomDetails, setRoomDetails] = useState({
    roomNumber: '',
    rows: '',
    columns: '',
    benchType: '3-seater',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoomDetails({ ...roomDetails, [name]: value });
  };

  const handleAddRoom = () => {
    setRooms([...rooms, roomDetails]);
    setRoomDetails({ roomNumber: '', rows: '', columns: '', benchType: '3-seater' });
  };

  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col md={8}>
          <h3 className="text-center">Room Management</h3>
          <Form>
            <Form.Group controlId="formRoomNumber">
              <Form.Label>Room Number</Form.Label>
              <Form.Control
                type="text"
                name="roomNumber"
                value={roomDetails.roomNumber}
                onChange={handleChange}
                placeholder="Enter room number"
              />
            </Form.Group>

            <Form.Group controlId="formRows">
              <Form.Label>Rows</Form.Label>
              <Form.Control
                type="number"
                name="rows"
                value={roomDetails.rows}
                onChange={handleChange}
                placeholder="Enter number of rows"
              />
            </Form.Group>

            <Form.Group controlId="formColumns">
              <Form.Label>Columns</Form.Label>
              <Form.Control
                type="number"
                name="columns"
                value={roomDetails.columns}
                onChange={handleChange}
                placeholder="Enter number of columns"
              />
            </Form.Group>

            <Form.Group controlId="formBenchType">
              <Form.Label>Bench Type</Form.Label>
              <Form.Control
                as="select"
                name="benchType"
                value={roomDetails.benchType}
                onChange={handleChange}
              >
                <option value="3-seater">3-seater</option>
                <option value="5-seater">5-seater</option>
              </Form.Control>
            </Form.Group>

            <Button variant="primary" onClick={handleAddRoom} className="mt-3">
              Add Room
            </Button>
          </Form>

          <Table striped bordered hover className="mt-5">
            <thead>
              <tr>
                <th>Room Number</th>
                <th>Rows</th>
                <th>Columns</th>
                <th>Bench Type</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room, index) => (
                <tr key={index}>
                  <td>{room.roomNumber}</td>
                  <td>{room.rows}</td>
                  <td>{room.columns}</td>
                  <td>{room.benchType}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default RoomManagement;
