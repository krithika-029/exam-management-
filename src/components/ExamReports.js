import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Alert, Modal } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

const ExamReports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [seatingData, setSeatingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await axios.get('/api/exams');
      setExams(response.data);
    } catch (error) {
      console.error('Error fetching exams:', error);
      setError('Failed to fetch exams');
    }
  };

  const generateSeatingReport = async () => {
    if (!selectedExam) {
      setError('Please select an exam');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`/api/seating/exam/${selectedExam}`);
      setSeatingData(response.data);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate seating report');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    const element = document.getElementById('seating-report');
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4'); // landscape orientation
    
    const imgWidth = 297; // A4 landscape width
    const pageHeight = 210; // A4 landscape height
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const examInfo = seatingData?.exam || {};
    const fileName = `Seating_${examInfo.subject_code}_${examInfo.room_number}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  };

  const exportToExcel = () => {
    if (!seatingData || !seatingData.seatingGrid) return;

    const exam = seatingData.exam;
    const grid = seatingData.seatingGrid;

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Create exam info sheet
    const examInfoData = [
      ['Sahyadri College of Engineering & Management, Mangaluru'],
      [''],
      ['Exam Date:', exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : ''],
      ['Exam Time:', exam.exam_time || ''],
      ['Room No:', exam.room_number || ''],
      ['Block:', exam.block || ''],
      [''],
      ['Course Name', 'No. of Candidates'],
      [exam.subject_name || exam.subject_code, grid.length]
    ];

    const examInfoWS = XLSX.utils.aoa_to_sheet(examInfoData);
    XLSX.utils.book_append_sheet(wb, examInfoWS, 'Exam Info');

    // Create seating arrangement sheet
    const seatingData_arr = [
      ['SN', 'USN', 'SN', 'USN', 'SN', 'USN', 'SN', 'USN', 'SN', 'USN']
    ];

    // Process grid data into table format
    let seatNumber = 1;
    const rowData = [];
    
    for (const bench of grid) {
      for (const student of bench.students) {
        rowData.push({
          sn: seatNumber++,
          usn: student.registrationNumber || `${exam.subject_code}${String(seatNumber-1).padStart(3, '0')}`
        });
      }
    }

    // Group into rows of 5 pairs (10 columns)
    for (let i = 0; i < rowData.length; i += 5) {
      const row = [];
      for (let j = 0; j < 5; j++) {
        if (i + j < rowData.length) {
          row.push(rowData[i + j].sn, rowData[i + j].usn);
        } else {
          row.push('', '');
        }
      }
      seatingData_arr.push(row);
    }

    const seatingWS = XLSX.utils.aoa_to_sheet(seatingData_arr);
    XLSX.utils.book_append_sheet(wb, seatingWS, 'Seating Arrangement');

    const fileName = `Seating_${exam.subject_code}_${exam.room_number}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const exportToImage = async () => {
    const element = document.getElementById('seating-report');
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    });

    const link = document.createElement('a');
    link.download = `Seating_${seatingData?.exam?.subject_code}_${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const SeatingReportPreview = () => {
    if (!seatingData) return null;

    const { exam, seatingGrid } = seatingData;
    const examDate = exam.exam_date ? new Date(exam.exam_date).toLocaleDateString('en-GB') : '27-12-2024';
    const examTime = exam.exam_time || '8:30 AM';

    return (
      <div id="seating-report" style={{ backgroundColor: 'white', padding: '20px', minHeight: '297mm' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: '0', fontSize: '18px', fontWeight: 'bold' }}>
            Sahyadri College of Engineering & Management, Mangaluru
          </h3>
        </div>

        {/* Exam Details */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '10px' }}>Exam date:</span>
            <div style={{ border: '1px solid #000', padding: '5px', minWidth: '100px', textAlign: 'center' }}>
              {examDate}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '10px' }}>Room No:</span>
            <div style={{ border: '1px solid #000', padding: '5px', minWidth: '50px', textAlign: 'center' }}>
              {exam.room_number || '101'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '10px' }}>Exam Time:</span>
            <div style={{ border: '1px solid #000', padding: '5px', minWidth: '100px', textAlign: 'center' }}>
              {examTime}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '10px' }}>Block:</span>
            <div style={{ border: '1px solid #000', padding: '5px', minWidth: '100px', textAlign: 'center' }}>
              {exam.block || 'First Floor'}
            </div>
          </div>
        </div>

        {/* Course Information */}
        <table style={{ width: '60%', margin: '20px auto', border: '1px solid #000', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#f0f0f0' }}>Course name</th>
              <th style={{ border: '1px solid #000', padding: '8px', backgroundColor: '#f0f0f0' }}>No. of candidates:</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>
                {exam.subject_name || `Data Structures(${exam.subject_code})`}
              </td>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>
                {seatingGrid.reduce((total, bench) => total + bench.students.length, 0)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Seating Arrangement Header */}
        <div style={{ 
          backgroundColor: '#d3d3d3', 
          textAlign: 'center', 
          padding: '10px', 
          fontSize: '16px', 
          fontWeight: 'bold',
          margin: '20px 0'
        }}>
          SEATING ARRANGEMENT
        </div>

        {/* Seating Table */}
        <table style={{ width: '100%', border: '1px solid #000', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0c0c0' }}>
              <th style={{ border: '1px solid #000', padding: '8px', width: '8%' }}>SN</th>
              <th style={{ border: '1px solid #000', padding: '8px', width: '17%' }}>USN</th>
              <th style={{ border: '1px solid #000', padding: '8px', width: '8%' }}>SN</th>
              <th style={{ border: '1px solid #000', padding: '8px', width: '17%' }}>USN</th>
              <th style={{ border: '1px solid #000', padding: '8px', width: '8%' }}>SN</th>
              <th style={{ border: '1px solid #000', padding: '8px', width: '17%' }}>USN</th>
              <th style={{ border: '1px solid #000', padding: '8px', width: '8%' }}>SN</th>
              <th style={{ border: '1px solid #000', padding: '8px', width: '17%' }}>USN</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const allStudents = [];
              seatingGrid.forEach(bench => {
                bench.students.forEach(student => {
                  allStudents.push(student);
                });
              });

              const rows = [];
              for (let i = 0; i < allStudents.length; i += 4) {
                const row = [];
                for (let j = 0; j < 4; j++) {
                  if (i + j < allStudents.length) {
                    const student = allStudents[i + j];
                    row.push(i + j + 1);
                    row.push(student.registrationNumber || `${exam.subject_code}${String(i + j + 1).padStart(3, '0')}`);
                  } else {
                    row.push('');
                    row.push('');
                  }
                }
                rows.push(row);
              }

              return rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} style={{ 
                      border: '1px solid #000', 
                      padding: '8px', 
                      textAlign: 'center',
                      fontSize: '12px'
                    }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ));
            })()}
          </tbody>
        </table>

        {/* Footer sections */}
        <div style={{ marginTop: '30px' }}>
          <div style={{ marginBottom: '15px' }}>
            <strong>USN OF ABSENTEES:</strong>
            <div style={{ border: '1px solid #000', minHeight: '30px', marginTop: '5px' }}></div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong>NO.OF ANSWER BOOKLET USED:</strong>
            <div style={{ border: '1px solid #000', display: 'inline-block', minWidth: '100px', marginLeft: '10px', padding: '5px' }}></div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong>SL.NO.OF BLANK ANSWER BOOKS RETURNED:</strong>
            <div style={{ border: '1px solid #000', minHeight: '20px', marginTop: '5px' }}></div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong>SL.NO.OF DEFECTIVE/REPLACED ANSWER BOOKS:</strong>
            <table style={{ width: '100%', border: '1px solid #000', borderCollapse: 'collapse', marginTop: '5px' }}>
              <tr>
                <td style={{ border: '1px solid #000', padding: '5px', width: '20%' }}>Defective:</td>
                <td style={{ border: '1px solid #000', padding: '5px' }}></td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '5px' }}>Replaced:</td>
                <td style={{ border: '1px solid #000', padding: '5px' }}></td>
              </tr>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
            <div>
              <div><strong>Name of the invigilator:</strong></div>
              <div><strong>Department:</strong></div>
              <div><strong>sign with date:</strong></div>
              <div><strong>Contact number:</strong></div>
            </div>
            <div>
              <strong>signature of DCS/CS</strong>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>📊 Exam Reports & Export</h2>
            <Button variant="secondary" onClick={() => navigate('/admin-dashboard')}>
              ← Back to Dashboard
            </Button>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Row>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Generate Seating Report</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={(e) => { e.preventDefault(); generateSeatingReport(); }}>
                <Form.Group className="mb-3">
                  <Form.Label>Select Exam</Form.Label>
                  <Form.Select
                    value={selectedExam}
                    onChange={(e) => setSelectedExam(e.target.value)}
                    required
                  >
                    <option value="">Choose an exam...</option>
                    {exams.map(exam => (
                      <option key={exam.id} value={exam.id}>
                        {exam.subject_code} - {exam.subject_name} ({new Date(exam.exam_date).toLocaleDateString()})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Generating...' : 'Generate Report'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {seatingData && (
          <Col md={6}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Export Options</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  <Button variant="success" onClick={() => setShowPreview(true)}>
                    👁️ Preview Report
                  </Button>
                  <Button variant="danger" onClick={exportToPDF}>
                    📄 Export as PDF
                  </Button>
                  <Button variant="info" onClick={exportToExcel}>
                    📊 Export as Excel
                  </Button>
                  <Button variant="warning" onClick={exportToImage}>
                    🖼️ Export as Image
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Preview Modal */}
      <Modal show={showPreview} onHide={() => setShowPreview(false)} size="xl" fullscreen>
        <Modal.Header closeButton>
          <Modal.Title>Seating Arrangement Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '0' }}>
          <SeatingReportPreview />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreview(false)}>
            Close
          </Button>
          <Button variant="danger" onClick={exportToPDF}>
            📄 Export PDF
          </Button>
          <Button variant="info" onClick={exportToExcel}>
            📊 Export Excel
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ExamReports;
