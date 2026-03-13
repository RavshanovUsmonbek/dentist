import { createContext, useContext, useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      adminApi.getMe()
        .then((response) => {
          if (response.success) {
            setUser(response.data);
          }
        })
        .catch(() => {
          localStorage.removeItem('adminToken');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const response = await adminApi.login(username, password);
    if (response.success && response.token) {
      localStorage.setItem('adminToken', response.token);
      setUser(response.user);
      return true;
    }
    throw new Error(response.error || 'Login failed');
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
