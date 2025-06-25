// client/src/pages/PatientDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, Table, Button, Row, Col } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    API.get('/appointments/patient').then(res => setAppointments(res.data));
  }, []);

  const cancel = async (id) => {
    await API.put(`/appointments/${id}/cancel`);
    setAppointments(appts =>
      appts.map(a => a._id === id ? { ...a, status: 'canceled' } : a)
    );
  };

  const now = new Date();
  const upcoming = appointments.filter(a => new Date(a.dateTime) >= now && a.status === 'booked');
  const past     = appointments.filter(a => new Date(a.dateTime) < now || a.status === 'completed');

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
            <Nav.Link as={Link} to="/patient/profile">Profile</Nav.Link>
            <Nav.Link as={Link} to="/patient/services">Services</Nav.Link>
            <Nav.Link as={Link} to="/patient/dashboard">Dashboard</Nav.Link>
            <Nav.Link onClick={logout}>Logout</Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <h3>Welcome, {user.name}</h3>
        <Row className="mt-4">
          <Col md={6}>
            <h5>Upcoming Appointments</h5>
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>Date</th><th>Time</th><th>Doctor</th><th>Service</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map(a => {
                  const dt = new Date(a.dateTime);
                  return (
                    <tr key={a._id}>
                      <td>{dt.toLocaleDateString()}</td>
                      <td>{dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>{a.doctorId?.userId?.name}</td>
                      <td>{a.serviceId?.name}</td>
                      <td>
                        <Button variant="danger" size="sm" onClick={() => cancel(a._id)}>
                          Cancel
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <Button as={Link} to="/patient/services" variant="success">Book New Appointment</Button>
          </Col>

          <Col md={6}>
            <h5>Past Appointments</h5>
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>Date</th><th>Time</th><th>Doctor</th><th>Service</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {past.map(a => {
                  const dt = new Date(a.dateTime);
                  return (
                    <tr key={a._id}>
                      <td>{dt.toLocaleDateString()}</td>
                      <td>{dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>{a.doctorId?.userId?.name}</td>
                      <td>{a.serviceId?.name}</td>
                      <td>{a.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default PatientDashboard;
