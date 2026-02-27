// FE-BR-003: Auth context — provides current user state and login/logout actions.
// Using a simple mock implementation; swap login() body with real API call in production.

import React, { createContext, useContext, useState } from 'react';
import type { AuthUser } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  login: () => void;   // mock: sets demo candidate user
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Mock candidate used for demo when no real auth is configured
const MOCK_CANDIDATE: AuthUser = {
  id: 'cand-001',
  name: 'Demo Candidate',
  email: 'demo@uctalent.io',
  role: 'candidate',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = () => setUser(MOCK_CANDIDATE);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
