import React, { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const HomeNew = () => {
  const [classroomNumber, setClassroomNumber] = useState('');
  const [blockFloor, setBlockFloor] = useState('');
  const [branch1, setBranch1] = useState('');
  const [subject1, setSubject1] = useState('');
  const [branch2, setBranch2] = useState('');
  const [subject2, setSubject2] = useState('');
  const [benchType, setBenchType] = useState('3-seater'); // Default bench type

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent form submission

    // Pass seat allocation details to the SeatSelector component (via route or context)
    const allocationData = {
      classroomNumber,
      blockFloor,
      benches: benchType,
      branch1: { name: branch1, subject: subject1 },
      branch2: { name: branch2, subject: subject2 },
    };

    // Navigate to the SeatSelector page
    navigate('/select-seats', { state: allocationData });
  };

  return (
    <Container>
      <h2 className="mb-4">Seat Allotment</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formClassroomNumber" className="mb-3">
          <Form.Label>Classroom Number</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter classroom number"
            value={classroomNumber}
            onChange={(e) => setClassroomNumber(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="formBlockFloor" className="mb-3">
          <Form.Label>Block/Floor</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter block or floor"
            value={blockFloor}
            onChange={(e) => setBlockFloor(e.target.value)}
            required
          />
        </Form.Group>

        <h5>Branch 1 Details</h5>
        <Form.Group controlId="formBranch1" className="mb-3">
          <Form.Label>Branch Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter branch name"
            value={branch1}
            onChange={(e) => setBranch1(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="formSubject1" className="mb-3">
          <Form.Label>Subject</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter subject"
            value={subject1}
            onChange={(e) => setSubject1(e.target.value)}
            required
          />
        </Form.Group>

        <h5>Branch 2 Details</h5>
        <Form.Group controlId="formBranch2" className="mb-3">
          <Form.Label>Branch Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter branch name"
            value={branch2}
            onChange={(e) => setBranch2(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="formSubject2" className="mb-3">
          <Form.Label>Subject</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter subject"
            value={subject2}
            onChange={(e) => setSubject2(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="formBenchType" className="mb-3">
          <Form.Label>Bench Type</Form.Label>
          <Form.Select
            value={benchType}
            onChange={(e) => setBenchType(e.target.value)}
            required
          >
            <option value="3-seater">3-Seater Bench</option>
            <option value="5-seater">5-Seater Bench</option>
          </Form.Select>
        </Form.Group>

        <Button variant="primary" type="submit" className="mt-3">
          Proceed to Seat Selection
        </Button>
      </Form>
    </Container>
  );
};

export default HomeNew;
