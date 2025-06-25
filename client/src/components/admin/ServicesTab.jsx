// client/src/components/admin/ServicesTab.jsx
import React, { useState, useEffect } from 'react';
import { Table, Form, Button, Modal } from 'react-bootstrap';
import API from '../../utils/api';

export default function ServicesTab({ services, reload }) {
  const [search, setSearch] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    doctorId: '', name: '', description: '', duration: '', price: ''
  });

  useEffect(() => {
    API.get('/doctors').then(res => {
        console.log(res.data);
        setDoctors(res.data);
    });
  }, []);

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );
  const deleteSvc = async id => {
    await API.delete(`/services/${id}`);
    reload();
  };

  const addSvc = async () => {
    await API.post('/services', {
      ...form,
      duration: parseInt(form.duration, 10),
      price: parseFloat(form.price)
    });
    setShow(false);
    reload();
  };

  return (
    <>
      <div className="d-flex mb-3">
        <Form.Control
          placeholder="Search services..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Button className="ms-2" onClick={() => setShow(true)}>
          + Add Service
        </Button>
      </div>

      <Table striped hover responsive>
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Doctor</th>
            <th>Duration</th><th>Price</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(s => (
            <tr key={s._id}>
              <td>{s._id}</td>
              <td>{s.name}</td>
              <td>{s.doctorId?.userId?.name}</td>
              <td>{s.duration} min</td>
              <td>${s.price.toFixed(2)}</td>
              <td>
                <Button
                  size="sm"
                  variant="warning"
                  onClick={() => {
                    setForm({
                      _id: s._id,
                      doctorId: s.doctorId._id,
                      name: s.name,
                      description: s.description,
                      duration: s.duration,
                      price: s.price
                    });
                    setShow(true);
                  }}
                >
                  Edit
                </Button>{' '}
                <Button size="sm" variant="danger" onClick={() => deleteSvc(s._id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{form._id ? 'Edit' : 'Add'} Service</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Select
              className="mb-2"
              value={form.doctorId}
              onChange={e => setForm({ ...form, doctorId: e.target.value })}
            >
              <option value="">Select doctor</option>
              {doctors.map(d => (
                <option key={d._id} value={d._id}>  {d.userId?.name ?? ' '}</option>
              ))}
            </Form.Select>
            <Form.Control
              className="mb-2"
              placeholder="Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
            <Form.Control
              className="mb-2"
              placeholder="Description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
            <Form.Control
              className="mb-2"
              type="number"
              placeholder="Duration"
              value={form.duration}
              onChange={e => setForm({ ...form, duration: e.target.value })}
            />
            <Form.Control
              className="mb-2"
              type="number"
              step="0.01"
              placeholder="Price"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>Cancel</Button>
          <Button variant="primary" onClick={async () => {
            if (form._id) {
               await API.put(`/services/${form._id}`, {
                    doctorId:    form.doctorId,
                    name:        form.name,
                    description: form.description,
                    duration:    parseInt(form.duration, 10),
                    price:       parseFloat(form.price)
                });
            } else {
              await addSvc();
            }
            setShow(false);
            reload();
          }}>
            {form._id ? 'Update' : 'Add'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
