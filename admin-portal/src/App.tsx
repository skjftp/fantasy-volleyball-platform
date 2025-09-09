import { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import './App.css';

interface Admin {
  uid: string;
  username: string;
  role: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing admin session
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const adminData = localStorage.getItem('admin_data');
        
        if (token && adminData) {
          const parsedAdmin = JSON.parse(adminData);
          
          // Validate token by testing an admin endpoint
          const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://fantasy-volleyball-backend-107958119805.us-central1.run.app/api';
          const response = await fetch(`${apiUrl}/matches`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            setAdmin(parsedAdmin);
            setIsAuthenticated(true);
          } else {
            // Token invalid, clear session
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_data');
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_data');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const handleLogin = (_token: string, adminData: Admin) => {
    setAdmin(adminData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_data');
    setAdmin(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-white">Loading Admin Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {!isAuthenticated ? (
        <AdminLogin onLogin={handleLogin} />
      ) : (
        <AdminDashboard admin={admin!} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;