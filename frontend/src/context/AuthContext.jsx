import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('rdcafe_token');
    const saved = localStorage.getItem('rdcafe_user');
    if (token && saved) {
      try { setUser(JSON.parse(saved)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('rdcafe_token', token);
    localStorage.setItem('rdcafe_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('rdcafe_token');
    localStorage.removeItem('rdcafe_user');
    setUser(null);
  };

  const updateUser = (userData) => {
    localStorage.setItem('rdcafe_user', JSON.stringify(userData));
    setUser(userData);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAdmin, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
