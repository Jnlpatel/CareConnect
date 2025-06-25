// client/src/pages/DoctorDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Container, Navbar, Nav,
  Row, Col, Card, Badge,
  Table, Button, Form, Spinner
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [notes, setNotes]               = useState({});
  const [loading, setLoading]           = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    API.get('/appointments/doctor')
      .then(res => setAppointments(res.data))
      .finally(() => setLoading(false));
  }, []);

  const complete = async (id) => {
    await API.put(`/appointments/${id}/complete`, { notes: notes[id] || '' });
    setAppointments(a =>
      a.map(app => (app._id === id ? { ...app, status: 'completed' } : app))
    );
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // split upcoming vs past
  const now = new Date();
  const upcoming = appointments.filter(a => new Date(a.dateTime) >= now && a.status === 'booked');
  const past     = appointments.filter(a => new Date(a.dateTime) < now || a.status === 'completed');

  return (
    <>
      <Navbar bg="light" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand>CareConnect</Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/doctor/profile">Profile</Nav.Link>
            <Nav.Link as={Link} to="/doctor/availability">Availability</Nav.Link>
            <Nav.Link as={Link} to="/doctor/services">Services</Nav.Link>
            <Nav.Link onClick={logout}>Logout</Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <Container fluid className="mt-4">
        <h3>Welcome, Dr. {user.name}</h3>

        {/* Statistics Cards */}
        <Row className="mt-3 g-3">
          <Col md={4}>
            <Card className="text-center">
              <Card.Body>
                <Card.Title>Today's Appointments</Card.Title>
                <h2><Badge bg="primary">{appointments.length}</Badge></h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center">
              <Card.Body>
                <Card.Title>Upcoming</Card.Title>
                <h2><Badge bg="warning">{upcoming.length}</Badge></h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center">
              <Card.Body>
                <Card.Title>Completed</Card.Title>
                <h2><Badge bg="success">{past.filter(a => a.status === 'completed').length}</Badge></h2>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Main Tables */}
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: 200 }}>
            <Spinner animation="border" />
          </div>
        ) : (
          <>
            {/* Upcoming Appointments */}
            <Card className="mt-4">
              <Card.Header as="h5">Upcoming Appointments</Card.Header>
              <Card.Body className="p-0">
                {upcoming.length === 0 ? (
                  <p className="text-center py-3">No upcoming appointments.</p>
                ) : (
                  <Table hover responsive className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Time</th>
                        <th>Patient</th>
                        <th>Service</th>
                        <th>Status</th>
                        <th>Notes</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcoming.map(a => {
                        const dt = new Date(a.dateTime);
                        return (
                          <tr key={a._id}>
                            <td>{dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                            <td>{a.patientId?.name}</td>
                            <td>{a.serviceId?.name}</td>
                            <td>
                              <Badge bg="info">{a.status}</Badge>
                            </td>
                            <td className="p-1">
                              <Form.Control
                                size="sm"
                                type="text"
                                placeholder="Add notes…"
                                value={notes[a._id] || ''}
                                onChange={e =>
                                  setNotes({ ...notes, [a._id]: e.target.value })
                                }
                              />
                            </td>
                            <td className="p-1">
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => complete(a._id)}
                              >
                                Complete
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>

            {/* Past Appointments */}
            <Card className="mt-4 mb-5">
              <Card.Header as="h5">Past Appointments</Card.Header>
              <Card.Body className="p-0">
                {past.length === 0 ? (
                  <p className="text-center py-3">No past appointments.</p>
                ) : (
                  <Table hover responsive className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Patient</th>
                        <th>Service</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {past.map(a => {
                        const dt = new Date(a.dateTime);
                        return (
                          <tr key={a._id}>
                            <td>{dt.toLocaleDateString()}</td>
                            <td>{dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                            <td>{a.patientId?.name}</td>
                            <td>{a.serviceId?.name}</td>
                            <td>
                              <Badge bg={a.status === 'completed' ? 'success' : 'secondary'}>
                                {a.status}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </>
        )}
      </Container>
    </>
  );
};

export default DoctorDashboard;
