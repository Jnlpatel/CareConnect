// client/src/pages/MyProfile.jsx
import React, { useState, useEffect } from 'react';
import {
  Container, Navbar, Nav, Card, Form, Button,
  Row, Col, Alert, Spinner, Image
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';

export default function MyProfile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data } = await API.get('/users/me');
        const { user, profile } = data;
        setUser(user);
        setFormData({
          name: user.name || '',
          phone: user.phone || '',
          profileImage: user.profileImage || '',
          // patient
          dateOfBirth: profile?.dateOfBirth?.slice(0,10) || '',
          sex: profile?.sex || '',
          gender: profile?.gender || '',
          insuranceInfo: profile?.insuranceInfo || '',
          bloodType: profile?.bloodType || '',
          medicalNotes: profile?.medicalNotes || '',
          // doctor
          specialty: profile?.specialty || '',
          bio: profile?.bio || '',
          experience: profile?.experience || '',
          qualifications: profile?.qualifications?.join(', ') || ''
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        profileImage: formData.profileImage
      };
      if (user.role === 'patient') {
        Object.assign(payload, {
          dateOfBirth: formData.dateOfBirth,
          sex: formData.sex,
          gender: formData.gender,
          insuranceInfo: formData.insuranceInfo,
          bloodType: formData.bloodType,
          medicalNotes: formData.medicalNotes
        });
      } else {
        Object.assign(payload, {
          specialty: formData.specialty,
          bio: formData.bio,
          experience: formData.experience,
          qualifications: formData.qualifications.split(',').map(q => q.trim())
        });
      }
      await API.put('/users/me', payload);
      setMessage('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;

  return (
    <>
      <Navbar bg="light" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand as={Link} to="/">CareConnect</Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link as={Link} to={user.role === 'doctor' ? '/doctor/profile' : '/patient/profile'}>
              Profile
            </Nav.Link>
            <Nav.Link as={Link} to={user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'}>
              Dashboard
            </Nav.Link>
            <Nav.Link onClick={() => { localStorage.clear(); navigate('/login'); }}>
              Logout
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <Container className="py-4">
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="shadow-sm">
              <Card.Header as="h4" className="bg-white">My Profile</Card.Header>
              <Card.Body>
                {message && <Alert variant="success" dismissible onClose={() => setMessage('')}>{message}</Alert>}
                <Form onSubmit={handleSubmit}>
                  {/* Top section with image & name */}
                  <Row className="align-items-center mb-4">
                    
                    <Col sm={12}>
                      <Form.Group controlId="name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    
                    </Col>
                  </Row>

                  {/* Role-specific fields */}
                  {user.role === 'patient' ? (
                    <>
                      <Row className="mb-3">
                        <Col md={6}>
                          <Form.Group controlId="dateOfBirth">
                            <Form.Label>Date of Birth</Form.Label>
                            <Form.Control
                              type="date"
                              name="dateOfBirth"
                              value={formData.dateOfBirth}
                              onChange={handleChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group controlId="sex">
                            <Form.Label>Sex</Form.Label>
                            <Form.Select
                              name="sex"
                              value={formData.sex}
                              onChange={handleChange}
                            >
                              <option value="">Select…</option>
                              <option>Male</option>
                              <option>Female</option>
                              <option>Other</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row className="mb-3">
                        <Col md={6}>
                          <Form.Group controlId="gender">
                            <Form.Label>Gender Identity</Form.Label>
                            <Form.Control
                              name="gender"
                              value={formData.gender}
                              onChange={handleChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group controlId="insuranceInfo">
                            <Form.Label>Insurance Info</Form.Label>
                            <Form.Control
                              name="insuranceInfo"
                              value={formData.insuranceInfo}
                              onChange={handleChange}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row className="mb-3">
                        <Col md={6}>
                          <Form.Group controlId="bloodType">
                            <Form.Label>Blood Type</Form.Label>
                            <Form.Control
                              name="bloodType"
                              value={formData.bloodType}
                              onChange={handleChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group controlId="medicalNotes">
                            <Form.Label>Medical Notes</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={2}
                              name="medicalNotes"
                              value={formData.medicalNotes}
                              onChange={handleChange}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </>
                  ) : (
                    <>
                      <Form.Group controlId="specialty" className="mb-3">
                        <Form.Label>Specialty</Form.Label>
                        <Form.Control
                          name="specialty"
                          value={formData.specialty}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                      <Form.Group controlId="bio" className="mb-3">
                        <Form.Label>Bio</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                        />
                      </Form.Group>
                      <Row className="mb-3">
                        <Col md={6}>
                          <Form.Group controlId="experience">
                            <Form.Label>Experience</Form.Label>
                            <Form.Control
                              name="experience"
                              value={formData.experience}
                              onChange={handleChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group controlId="qualifications">
                            <Form.Label>Qualifications</Form.Label>
                            <Form.Control
                              name="qualifications"
                              value={formData.qualifications}
                              onChange={handleChange}
                              placeholder="Comma separated"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </>
                  )}

                  <div className="text-end">
                    <Button variant="primary" type="submit">Save Changes</Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}
