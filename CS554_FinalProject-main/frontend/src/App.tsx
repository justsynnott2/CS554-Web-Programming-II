import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Workouts from './pages/Workouts';
import Meals from './pages/Meals';
import Progress from './pages/Progress';
import Feed from './pages/Feed';
import './App.css';

const ProtectedRoute: React.FC<{children: React.ReactElement}> = ({children}) => {
  const {isAuthenticated, loading} = useAuth();
  if (loading){
    return (
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '24px', color: '#667eea'}}>Loading...</div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{children: React.ReactElement}> = ({children}) => {
  const {isAuthenticated, loading} = useAuth();

  if (loading){
    return (
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '24px', color: '#667eea'}}>Loading...</div>
    );
  }
  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/workouts" element={<ProtectedRoute><Workouts /></ProtectedRoute>} />
          <Route path="/meals" element={<ProtectedRoute><Meals /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
          <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', textAlign: 'center'}}><h1 style={{fontSize: '72px', margin: 0}}>404</h1><p style={{fontSize: '24px', color: '#666'}}>Page Not Found</p><a href='/dashboard' style={{marginTop: '20px', color: '#667eea'}}>Go to Dashboard</a></div>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
