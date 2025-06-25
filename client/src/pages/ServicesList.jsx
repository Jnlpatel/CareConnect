// client/src/pages/ServicesList.jsx
import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, Form, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import API from '../utils/api';

const ServicesList = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    API.get('/services').then(res => setServices(res.data));
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    API.get(`/services?search=${search}`).then(res => setServices(res.data));
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <>
      <Navbar bg="light" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand>CareConnect</Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link as={Link} to={user.role === 'doctor' ? '/doctor/profile' : '/patient/profile'}>
              Profile
            </Nav.Link>
            <Nav.Link as={Link} to={user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'}>
              Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to={user.role === 'doctor' ? '/doctor/services' : '/patient/services'}>
              Services
            </Nav.Link>
            <Nav.Link onClick={logout}>Logout</Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Form onSubmit={handleSearch} className="d-flex mb-4">
          <Form.Control
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Button type="submit" variant="primary" className="ms-2">Search</Button>
        </Form>

        <Row xs={1} md={2} lg={3} className="g-4">
          {services.map(s => (
            <Col key={s._id}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>{s.name}</Card.Title>
                  <Card.Text>
                    Doctor: {s.doctorId?.userId?.name}<br/>
                    Duration: {s.duration} min<br/>
                    Price: ${s.price}
                  </Card.Text>
                  <Button as={Link} to={`/patient/book/${s._id}`} variant="success">
                    Book Now
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default ServicesList;
