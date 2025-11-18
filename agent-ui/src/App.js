import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginForm from './components/LoginForm';
import Dashboard from './pages/Dashboard';
import Queue from './pages/Queue';
import ChatInterface from './pages/ChatInterface';
import ChatSession from './pages/ChatSession';

// Create a protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <LoginForm /> : <Navigate to="/dashboard" replace />} />
      <Route 
        path="/*" 
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="queue" element={<Queue />} />
        <Route path="chats" element={<ChatInterface />} />
        <Route path="chat/:sessionId" element={<ChatSession />} />
      </Route>
    </Routes>
  );
};

const App = () => {
  console.log('🎯 App component rendering');
    
  return (
    <AuthProvider>
      <Router basename="/agent">
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;