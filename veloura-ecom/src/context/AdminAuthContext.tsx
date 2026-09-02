import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminProfile } from '../types';
import { authClient } from '../services/authClient';
import { tokenStore } from '../services/httpClient';

interface AdminAuthContextType {
  admin: AdminProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const ADMIN_DATA_KEY = 'veloura_admin_data';

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminProfile | null>(() => {
    try {
      const stored = localStorage.getItem(ADMIN_DATA_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => tokenStore.getAdminToken());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const existingToken = tokenStore.getAdminToken();
    if (existingToken && !admin) {
      // Re-hydrate or verify admin session
      try {
        const stored = localStorage.getItem(ADMIN_DATA_KEY);
        if (stored) {
          setAdmin(JSON.parse(stored));
        }
      } catch {
        // ignore
      }
    }
  }, [admin]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const adminData = await authClient.adminLogin(email, password);
      const profile: AdminProfile = {
        id: adminData.id || adminData._id,
        name: adminData.name || 'Admin',
        email: adminData.email,
        role: adminData.role || 'admin',
      };
      setAdmin(profile);
      setToken(tokenStore.getAdminToken());
      localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(profile));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Invalid admin credentials.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authClient.adminLogout();
    localStorage.removeItem(ADMIN_DATA_KEY);
    setAdmin(null);
    setToken(null);
  };

  const value: AdminAuthContextType = {
    admin,
    token,
    isAuthenticated: Boolean(admin && token),
    isLoading,
    login,
    logout,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
