import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Table, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

const DoctorServices = () => {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', duration: '', price: '' });
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/services/doctor').then(res => setServices(res.data));
  }, []);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const create = async () => {
    const { data } = await API.post('/services', {
      ...form,
      duration: parseInt(form.duration),
      price: parseFloat(form.price)
    });
    setServices(s => [...s, data]);
    setForm({ name: '', description: '', duration: '', price: '' });
    setMsg('Service created');
  };

  const startEdit = s => {
    setEditing(s._id);
    setForm({
      name: s.name,
      description: s.description,
      duration: s.duration.toString(),
      price: s.price.toString()
    });
  };

  const update = async () => {
    const { data } = await API.put(`/services/${editing}`, {
      ...form,
      duration: parseInt(form.duration),
      price: parseFloat(form.price)
    });
    setServices(s => s.map(x => x._id === editing ? data : x));
    setEditing(null);
    setForm({ name: '', description: '', duration: '', price: '' });
    setMsg('Service updated');
  };

  const remove = async id => {
    await API.delete(`/services/${id}`);
    setServices(s => s.filter(x => x._id !== id));
  };

  return (
    <Container className="py-4">
      {/* Back Button */}
      <Button variant="secondary" className="mb-3" onClick={() => navigate(-1)}>
        ← Back
      </Button>

      <Card className="p-4 mb-4">
        <Card.Title>Manage Services</Card.Title>
        {msg && <Alert variant="success">{msg}</Alert>}
        <Row className="g-2">
          <Col md>
            <Form.Control
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
            />
          </Col>
          <Col md>
            <Form.Control
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
            />
          </Col>
          <Col md="auto">
            <Form.Control
              name="duration"
              placeholder="Duration"
              type="number"
              value={form.duration}
              onChange={handleChange}
            />
          </Col>
          <Col md="auto">
            <Form.Control
              name="price"
              placeholder="Price"
              type="number"
              step="0.01"
              value={form.price}
              onChange={handleChange}
            />
          </Col>
          <Col md="auto">
            {editing ? (
              <>
                <Button variant="primary" onClick={update}>Update</Button>{' '}
                <Button variant="secondary" onClick={() => { setEditing(null); setForm({ name:'',description:'',duration:'',price:'' }); }}>Cancel</Button>
              </>
            ) : (
              <Button variant="success" onClick={create}>Add</Button>
            )}
          </Col>
        </Row>
      </Card>

      <Table striped hover responsive>
        <thead>
          <tr>
            <th>Name</th><th>Description</th><th>Duration</th><th>Price</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map(s => (
            <tr key={s._id}>
              <td>{s.name}</td>
              <td>{s.description}</td>
              <td>{s.duration} min</td>
              <td>${s.price}</td>
              <td>
                <Button size="sm" variant="warning" onClick={() => startEdit(s)}>Edit</Button>{' '}
                <Button size="sm" variant="danger" onClick={() => remove(s._id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default DoctorServices;
