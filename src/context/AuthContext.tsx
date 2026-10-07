import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserRole } from '../types';
import { api } from '../services/api';
import { SEED_USERS } from '../services/localStore';

interface AuthContextType {
  currentUser: UserAccount | null;
  activeRole: UserRole | null;
  isLoggedIn: boolean;
  allUsers: UserAccount[];
  pendingUsers: UserAccount[];
  pendingCount: number;
  login: (email: string, password?: string) => Promise<{ success: boolean; user?: UserAccount; error?: string; status?: string }>;
  register: (userData: {
    name: string;
    email: string;
    password?: string;
    role: 'student' | 'faculty' | 'admin';
    department: string;
    identifier?: string;
  }) => Promise<{ success: boolean; message?: string; user?: UserAccount; error?: string }>;
  approveUser: (userId: string, action: 'approve' | 'reject', notes?: string) => Promise<UserAccount>;
  createUser: (userData: any) => Promise<UserAccount>;
  logout: () => void;
  refreshUsers: () => Promise<void>;
}

const SESSION_KEY = 'smartproctor_session_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.status === 'active') {
          return parsed;
        }
      }
    } catch (e) {}
    // Normal real-world flow: start logged out so user enters their credentials!
    return null;
  });

  const [allUsers, setAllUsers] = useState<UserAccount[]>(SEED_USERS);

  const refreshUsers = async () => {
    try {
      const users = await api.getUsers();
      if (users && users.length > 0) {
        setAllUsers(users);
        if (currentUser) {
          const updatedSelf = users.find(u => u.id === currentUser.id);
          if (updatedSelf) {
            setCurrentUser(updatedSelf);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to refresh users:', err);
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [currentUser]);

  const activeRole: UserRole | null = currentUser?.role || null;
  const isLoggedIn = currentUser !== null;
  const pendingUsers = allUsers.filter(u => u.status === 'pending');
  const pendingCount = pendingUsers.length;

  const login = async (email: string, password?: string) => {
    try {
      const result = await api.login({ email, password });
      if (result.success && result.user) {
        setCurrentUser(result.user);
        await refreshUsers();
        return { success: true, user: result.user };
      }
      return {
        success: false,
        error: result.error || 'Authentication failed. Please verify credentials.',
        status: result.status,
        user: result.user
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password?: string;
    role: 'student' | 'faculty' | 'admin';
    department: string;
    identifier?: string;
  }) => {
    try {
      const result = await api.register(userData);
      await refreshUsers();
      return result;
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const approveUser = async (userId: string, action: 'approve' | 'reject', notes?: string) => {
    const updated = await api.approveUser(userId, action, notes);
    await refreshUsers();
    return updated;
  };

  const createUser = async (userData: any) => {
    const created = await api.createUser(userData);
    await refreshUsers();
    return created;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeRole,
        isLoggedIn,
        allUsers,
        pendingUsers,
        pendingCount,
        login,
        register,
        approveUser,
        createUser,
        logout,
        refreshUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
