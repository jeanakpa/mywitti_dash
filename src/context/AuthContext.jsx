import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem('admin'));
    if (admin && admin.token) {
      setUser({
        name: admin.name,
        email: admin.email,
        role: admin.role,
      });
      setToken(admin.token);
    }
    setLoading(false);
  }, []);

  const login = (adminData) => {
    setUser({
      name: adminData.name,
      email: adminData.email,
      role: adminData.role,
    });
    setToken(adminData.token);
    localStorage.setItem('admin', JSON.stringify(adminData));
    localStorage.setItem('isAuthenticated', 'true');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('admin');
    localStorage.removeItem('isAuthenticated');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 