import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import AuthPage from './components/auth/AuthPage';
import Dashboard from './pages/Dashboard';
import WidgetBuilder from './pages/WidgetBuilder';
import WidgetList from './pages/WidgetList';
import Analytics from './pages/Analytics';
import Users from './pages/Users'; // ADD THIS IMPORT

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return children;
};

// Main app content
const AppContent = () => {
  return (
    <Router>
      <ProtectedRoute>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/widgets" element={<WidgetList />} />
            <Route path="/widgets/new" element={<WidgetBuilder />} />
            <Route path="/widgets/edit/:siteKey" element={<WidgetBuilder />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/users" element={<Users />} /> {/* ADD THIS ROUTE */}
          </Routes>
        </Layout>
      </ProtectedRoute>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;