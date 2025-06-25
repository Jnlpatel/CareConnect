// client/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './pages/LandingPage';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyProfile from './pages/MyProfile';
import PatientDashboard from './pages/PatientDashboard';
import ServicesList from './pages/ServicesList';
import BookingFlow from './pages/BookingFlow';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorServices from './pages/DoctorServices';
import DoctorAvailability from './pages/DoctorAvailability';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';

function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Patient routes */}
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute role="patient">
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/services"
        element={
          <ProtectedRoute role="patient">
            <ServicesList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/book/:serviceId"
        element={
          <ProtectedRoute role="patient">
            <BookingFlow />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/profile"
        element={
          <ProtectedRoute role="patient">
            <MyProfile />
          </ProtectedRoute>
        }
      />

      {/* Doctor routes */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute role="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/services"
        element={
          <ProtectedRoute role="doctor">
            <DoctorServices />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/availability"
        element={
          <ProtectedRoute role="doctor">
            <DoctorAvailability />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/profile"
        element={
          <ProtectedRoute role="doctor">
            <MyProfile />
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
           <AdminRoute>
            <AdminPanel />
          </AdminRoute>
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
