import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LoginFormData, RegisterFormData } from '../features/auth/types';
import { authApi } from '../features/auth/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const userData = await authApi.getCurrentUser();
          setUser(userData);
        } catch {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (data: LoginFormData) => {
    const res = await authApi.login(data);
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser({
      id: res.id,
      username: res.username,
      email: res.email,
      fullName: res.fullName,
      avatarUrl: res.avatarUrl,
      roles: res.roles,
    });
  };

  const register = async (data: RegisterFormData) => {
    const res = await authApi.register(data);
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser({
      id: res.id,
      username: res.username,
      email: res.email,
      fullName: res.fullName,
      avatarUrl: res.avatarUrl,
      roles: res.roles,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const isAdmin = Boolean(user?.roles?.includes('ROLE_ADMIN'));

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin,
        login,
        register,
        logout,
        loading,
      }}
    >
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
