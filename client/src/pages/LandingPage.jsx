import React from 'react';

import { Navbar, Nav, Container, Row, Col, Button, Card, Form } from 'react-bootstrap';
import { FaStethoscope, FaCalendarCheck, FaUserMd, FaComments } from 'react-icons/fa';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <>
      {/* Navbar */}
      <Navbar expand="lg" className="landing-navbar" variant="light">
        <Container>
          <Navbar.Brand href="#home">CareConnect</Navbar.Brand>
          <Navbar.Toggle aria-controls="landing-nav" />
          <Navbar.Collapse id="landing-nav">
            <Nav className="ms-auto">
              <Nav.Link href="#features">Features</Nav.Link>
              <Nav.Link href="#how-it-works">How It Works</Nav.Link>
              <Nav.Link href="/login" className="btn btn-primary ms-2 text-white">Login</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="hero-text">
              <h1>Seamless Healthcare Booking</h1>
              <p>Book appointments with top doctors, manage your schedule, and stay informed—all in one place.</p>
              <Button variant="primary" href="/register">Get Started</Button>
            </Col>
            <Col md={6} className="hero-img">
              <img src="./banner.png" alt="Healthcare" />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section id="features" className="py-5">
        <Container>
          <h2 className="text-center mb-4">Key Features</h2>
          <Row>
            <Col md={3} className="feature-card">
              <FaStethoscope className="feature-icon" />
              <h5>Doctor Directory</h5>
              <p>Browse specialists by specialty and location.</p>
            </Col>
            <Col md={3} className="feature-card">
              <FaCalendarCheck className="feature-icon" />
              <h5>Easy Scheduling</h5>
              <p>View available slots and book in seconds.</p>
            </Col>
            <Col md={3} className="feature-card">
              <FaUserMd className="feature-icon" />
              <h5>Consultation Notes</h5>
              <p>Doctors can record and share visit notes.</p>
            </Col>
            <Col md={3} className="feature-card">
              <FaComments className="feature-icon" />
              <h5>In-App Messaging</h5>
              <p>Communicate securely with your provider.</p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-5 bg-light">
        <Container>
          <h2 className="text-center mb-4">How It Works</h2>
          <Row>
            <Col md={4} className="text-center">
              <Card className="p-3">
                <h3>1</h3>
                <p>Create an account and set up your profile.</p>
              </Card>
            </Col>
            <Col md={4} className="text-center">
              <Card className="p-3">
                <h3>2</h3>
                <p>Select a service and choose a time slot.</p>
              </Card>
            </Col>
            <Col md={4} className="text-center">
              <Card className="p-3">
                <h3>3</h3>
                <p>Receive confirmation and reminders.</p>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

     

      {/* Footer */}
      <footer className="py-3 bg-dark text-white">
        <Container className="text-center">
          &copy; {new Date().getFullYear()} CareConnect. All rights reserved.
        </Container>
      </footer>
    </>
  );
}