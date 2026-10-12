import { useMemo, useState } from 'react';
import { AuthContext } from './authContextValue';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('expense_tracker_token'));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('expense_tracker_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (newToken, newUser) => {
    localStorage.setItem('expense_tracker_token', newToken);
    localStorage.setItem('expense_tracker_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('expense_tracker_token');
    localStorage.removeItem('expense_tracker_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    localStorage.setItem('expense_tracker_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated: Boolean(token),
    login,
    logout,
    updateUser,
  }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
