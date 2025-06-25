// client/src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';

const RegisterPage = () => {
  const [role, setRole] = useState('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [sex, setSex] = useState('');
  const [gender, setGender] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = { name, email, password, role };
    if (role === 'patient') {
      payload.dateOfBirth = dateOfBirth;
      payload.sex = sex;
      payload.gender = gender;
    } else {
      payload.specialty = specialty;
    }
    try {
      const { data } = await API.post('/auth/register', payload);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate(`/${data.user.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Container fluid className="vh-100 d-flex align-items-center justify-content-center bg-light">
      <Card style={{ maxWidth: 500, width: '100%' }} className="p-4 shadow">
        <Card.Title className="text-center mb-4">CareConnect Register</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formRole">
            <Form.Label>Role</Form.Label>
            <Form.Select value={role} onChange={e => setRole(e.target.value)}>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </Form.Group>

          {role === 'patient' && (
            <>
              <Form.Group className="mb-3" controlId="formSex">
                <Form.Label>Sex</Form.Label>
                <Form.Select
                  required
                  value={sex}
                  onChange={e => setSex(e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>
             
            </>
          )}

          {role === 'doctor' && (
            <Form.Group className="mb-3" controlId="formSpecialty">
              <Form.Label>Specialty</Form.Label>
              <Form.Control
                type="text"
                required
                value={specialty}
                onChange={e => setSpecialty(e.target.value)}
              />
            </Form.Group>
          )}

          <Button variant="success" type="submit" className="w-100">Register</Button>
        </Form>
        <div className="text-center mt-3">
          <small>
            Already have an account? <Link to="/login">Login here</Link>
          </small>
        </div>
      </Card>
    </Container>
  );
};

export default RegisterPage;
