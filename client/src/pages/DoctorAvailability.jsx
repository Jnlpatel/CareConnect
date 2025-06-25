import React, { useState, useEffect } from 'react';
import {
  Container, Navbar, Nav,
  Card, Form, Button,
  Table, Alert, Row, Col, Spinner
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

const DoctorAvailability = () => {
  const [addDate, setAddDate] = useState('');
  const [startTime, setStart] = useState('');
  const [endTime, setEnd] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [allSlots, setAllSlots] = useState([]);
  const [slots, setSlots] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load all slots on mount
  useEffect(() => {
    API.get('/availability/doctor')
      .then(res => {
        const data = res.data;
        console.log('All slots:', data);
        setAllSlots(data);
        setSlots(data.slice(0, 10));
      })
      .finally(() => setLoading(false));
  }, []);

  // Update displayed slots when filter changes
  useEffect(() => {
    if (filterDate) {
      API.get(`/availability/doctor?date=${filterDate}`)
        .then(res => setSlots(res.data));
    } else {
      setSlots(allSlots.slice(0, 10));
    }
  }, [filterDate, allSlots]);

  const addSlot = async () => {
    await API.post('/availability', { date: addDate, startTime, endTime });
    setMsg('✅ Slot added');
    setAddDate(''); setStart(''); setEnd('');
    // reload all slots
    const res = await API.get('/availability/doctor');
    setAllSlots(res.data);
  };

  const removeSlot = async id => {
    await API.delete(`/availability/${id}`);
    setAllSlots(prev => prev.filter(s => s._id !== id));
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <>
      <Navbar bg="light" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand>CareConnect</Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link onClick={() => navigate('/doctor/dashboard')}>Dashboard</Nav.Link>
            <Nav.Link onClick={() => navigate('/doctor/availability')}>Availability</Nav.Link>
            <Nav.Link onClick={() => navigate('/doctor/services')}>Services</Nav.Link>
            <Nav.Link onClick={logout}>Logout</Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <Container className="py-4">
        <Row className="align-items-center mb-4">
            <Col>
              <h2 className="m-0">Manage Your Availability</h2>
              
            </Col>
            <Col className="text-end">
              <Button variant="secondary" onClick={() => navigate(-1)}>
                ← Back
              </Button>
            </Col>
          </Row>
        {msg && <Alert variant="success" onClose={() => setMsg('')} dismissible>{msg}</Alert>}
        <Row className="g-4">
          {/* Add Slot Card */}
          <Col lg={6}>
            <Card className="h-100 shadow-sm">
              <Card.Header as="h5">Add Availability Slot</Card.Header>
              <Card.Body>
                <Form>
                  <Row className="gy-3">
                    <Col sm={12}>
                      <Form.Group controlId="addDate">
                        <Form.Label>Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={addDate}
                          onChange={e => setAddDate(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col sm={6}>
                      <Form.Group controlId="addStart">
                        <Form.Label>Start Time</Form.Label>
                        <Form.Control
                          type="time"
                          value={startTime}
                          onChange={e => setStart(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col sm={6}>
                      <Form.Group controlId="addEnd">
                        <Form.Label>End Time</Form.Label>
                        <Form.Control
                          type="time"
                          value={endTime}
                          onChange={e => setEnd(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col sm={12} className="text-end">
                      <Button
                        variant="primary"
                        onClick={addSlot}
                        disabled={!addDate || !startTime || !endTime}
                      >
                        Add Slot
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Slots List Card */}
          <Col lg={6}>
            <Card className="h-100 shadow-sm">
              <Card.Header as="h5">Your Slots</Card.Header>
              <Card.Body>
                <Form.Group className="d-flex mb-3" controlId="filterDate">
                  <Form.Control
                    type="date"
                    value={filterDate}
                    onChange={e => setFilterDate(e.target.value)}
                  />
                  <Button
                    className="ms-2"
                    onClick={() => { /* filter applied via useEffect */ }}
                  >
                    Filter
                  </Button>
                </Form.Group>

                {loading ? (
                  <div className="d-flex justify-content-center p-4">
                    <Spinner animation="border" />
                  </div>
                ) : slots.length === 0 ? (
                  <p className="text-center text-muted">No slots to display.</p>
                ) : (
                  <Table striped hover responsive className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Booked?</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slots.map(s => (
                        <tr key={s._id}>
                          <td>{s.date.split('T')[0]}</td>
                          <td>{s.startTime}</td>
                          <td>{s.endTime}</td>
                          <td>{s.isBooked ? 'Yes' : 'No'}</td>
                          <td>
                            {!s.isBooked && (
                              <Button variant="danger" size="sm" onClick={() => removeSlot(s._id)}>
                                Delete
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default DoctorAvailability;
