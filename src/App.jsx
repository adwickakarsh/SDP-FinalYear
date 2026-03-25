// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router';

// Make sure to import the new Navbar!
import Navbar from './components/Navbar'; 

import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard'; 
import AdminDashboard from './components/AdminDashboard'; 

const DashboardWrapper = () => {
  const { id } = useParams();
  return <Dashboard patientId={id} />;
};

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-[#0B1120]">
        
        {/* Global Dynamic Navbar placed here! */}
        <Navbar />

        {/* Add top padding so the navbar doesn't cover up the page content */}
        <div className="pt-20"> 
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />

            <Route path="/dashboard/:id" element={
              <ProtectedRoute allowedRoles={['patient', 'admin']}>
                <DashboardWrapper />
              </ProtectedRoute>
            } />

            <Route path="/admin-portal" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const currentRole = localStorage.getItem('userRole');
  if (allowedRoles.includes(currentRole)) return children;
  return <Navigate to="/auth" replace />;
};

export default App;