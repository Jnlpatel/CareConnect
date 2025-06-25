// client/src/pages/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import {
  Container, Navbar, Nav, Spinner, Alert
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import UsersTab from '../components/admin/UsersTab';
import ServicesTab from '../components/admin/ServicesTab';
import AppointmentsTab from '../components/admin/AppointmentsTab';

export default function AdminPanel() {
  const [tab, setTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();

  // Fetch functions
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/users');
      setUsers(data);
    } catch (e) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };
  const fetchServices = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/services');
      setServices(data);
    } catch (e) {
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/appointments');
      setAppointments(data);
    } catch (e) {
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setError('');
    if (tab === 'users') fetchUsers();
    else if (tab === 'services') fetchServices();
    else fetchAppointments();
  }, [tab]);

  return (
    <>
      <Navbar bg="light" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand>CareConnect Admin</Navbar.Brand>
          <Nav activeKey={tab} onSelect={setTab} className="ms-auto">
            <Nav.Link eventKey="users">Users</Nav.Link>
            <Nav.Link eventKey="services">Services</Nav.Link>
            <Nav.Link eventKey="appointments">Appointments</Nav.Link>
            <Nav.Link onClick={() => { localStorage.clear(); navigate('/login'); }}>
              Logout
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <Container className="py-4">
        {error && <Alert variant="danger">{error}</Alert>}
        {loading
          ? <div className="text-center"><Spinner animation="border" /></div>
          : tab === 'users'
            ? <UsersTab users={users} reload={fetchUsers} />
            : tab === 'services'
              ? <ServicesTab services={services} reload={fetchServices} />
              : <AppointmentsTab appointments={appointments} reload={fetchAppointments} />
        }
      </Container>
    </>
  );
}
