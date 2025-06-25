// client/src/components/admin/AppointmentsTab.jsx
import React, { useState } from 'react';
import { Table, Form, Button } from 'react-bootstrap';
import API from '../../utils/api';

export default function AppointmentsTab({ appointments, reload }) {
  const [search, setSearch] = useState('');

  const filtered = appointments.filter(a =>
    a.patientId?.name.toLowerCase().includes(search.toLowerCase()) ||
    a.doctorId?.userId?.name.toLowerCase().includes(search.toLowerCase())
  );

  const deleteAppt = async id => {
    await API.delete(`/appointments/${id}`);
    reload();
  };
  const changeStatus = async (id, status) => {
    await API.put(`/appointments/${id}/status`, { status });
    reload();
  };

  return (
    <>
      <Form.Control
        placeholder="Search appointments..."
        className="mb-3"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <Table striped hover responsive>
        <thead>
          <tr>
            <th>ID</th><th>Doctor</th><th>Patient</th><th>Service</th>
            <th>Date</th><th>Time</th><th>Status</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(a => {
            const dt = new Date(a.dateTime);
            return (
              <tr key={a._id}>
                <td>{a._id}</td>
                <td>{a.doctorId?.userId?.name}</td>
                <td>{a.patientId?.name}</td>
                <td>{a.serviceId?.name}</td>
                <td>{dt.toLocaleDateString()}</td>
                <td>{dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td>
                  <Form.Select
                    size="sm"
                    value={a.status}
                    onChange={e => changeStatus(a._id, e.target.value)}
                  >
                    <option value="booked">Booked</option>
                    <option value="completed">Completed</option>
                    <option value="canceled">Canceled</option>
                  </Form.Select>
                </td>
                <td>
                  <Button size="sm" variant="danger" onClick={() => deleteAppt(a._id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}
