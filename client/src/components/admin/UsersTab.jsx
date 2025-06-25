// client/src/components/admin/UsersTab.jsx
import React, { useState } from 'react';
import { Table, Form, Button, Modal } from 'react-bootstrap';
import API from '../../utils/api';

export default function UsersTab({ users, reload }) {
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'patient', specialty: '' });
  const [showEdit, setShowEdit] = useState(false);
  const [editUser, setEditUser] = useState({ _id: '', name: '', email: '', phone: '', role: 'patient', specialty: '' });

  const deleteUser = async id => {
    try {
      await API.delete(`/users/${id}`);
      reload();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const changeRole = async (id, role) => {
    try {
      await API.put(`/users/${id}`, { role });
      reload();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const openEditModal = user => {
    setEditUser({
      _id: user._id,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'patient',
      specialty: user.role === 'doctor' ? (user.specialty || '') : ''
    });
    setShowEdit(true);
  };

  const saveEdit = async () => {
    try {
      const payload = {
        name: editUser.name,
        email: editUser.email,
        role: editUser.role,
        phone: editUser.phone
      };
      if (editUser.role === 'doctor') payload.specialty = editUser.specialty;

      await API.put(`/users/${editUser._id}`, payload);
      setShowEdit(false);
      reload();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update user');
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="d-flex mb-3">
        <Form.Control
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Button className="ms-2" onClick={() => setShowAdd(true)}>
          + Add User
        </Button>
      </div>

      <Table striped hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(u => (
            <tr key={u._id}>
              <td>{u._id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <Form.Select
                  size="sm"
                  value={u.role}
                  onChange={e => changeRole(u._id, e.target.value)}
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </td>
              <td>
                <Button size="sm" variant="warning" onClick={() => openEditModal(u)}>
                  Edit
                </Button>{' '}
                <Button size="sm" variant="danger" onClick={() => deleteUser(u._id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add User Modal (existing) */}
      <Modal show={showAdd} onHide={() => setShowAdd(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
           <Form>
            <Form.Control
              className="mb-2"
              placeholder="Name"
              value={newUser.name}
              onChange={e => setNewUser({ ...newUser, name: e.target.value })}
            />
            <Form.Control
              className="mb-2"
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={e => setNewUser({ ...newUser, email: e.target.value })}
            />
            <Form.Control
              className="mb-2"
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={e => setNewUser({ ...newUser, password: e.target.value })}
            />
            <Form.Select
              className="mb-2"
              value={newUser.role}
              onChange={e => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </Form.Select>
            {newUser.role === 'doctor' && (
              <Form.Control
                className="mb-2"
                placeholder="Specialty"
                value={newUser.specialty}
                onChange={e => setNewUser({ ...newUser, specialty: e.target.value })}
              />
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
         <Button variant="secondary" onClick={() => setShowAdd(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={async () => {
              try {
                await API.post('/users', newUser);
                setShowAdd(false);
                setNewUser({ name:'', email:'', password:'', role:'patient', specialty:'' });
                reload();
              } catch (err) {
                console.error(err);
                alert(err.response?.data?.message || 'Failed to add user');
              }
            }}
          >
            Create
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit User Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control
              className="mb-2"
              placeholder="Name"
              value={editUser.name}
              onChange={e => setEditUser({ ...editUser, name: e.target.value })}
            />
            <Form.Control
              className="mb-2"
              type="email"
              placeholder="Email"
              value={editUser.email}
              onChange={e => setEditUser({ ...editUser, email: e.target.value })}
            />
            <Form.Select
              className="mb-2"
              value={editUser.role}
              onChange={e => setEditUser({ ...editUser, role: e.target.value })}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </Form.Select>
            
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdit(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveEdit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
