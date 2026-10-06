import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  currentUser: UserAccount | null;
  activeRole: UserRole;
  isLoggedIn: boolean;
  allUsers: UserAccount[];
  pendingUsers: UserAccount[];
  pendingCount: number;
  setRole: (role: UserRole) => void;
  switchUser: (userId: string) => void;
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
  loginAs: (role: UserRole) => void;
  refreshUsers: () => Promise<void>;
}

const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'stud-101',
    name: 'Alex Rivera',
    email: 'alex.rivera@university.edu',
    role: 'student',
    department: 'Computer Science & Engineering',
    status: 'active',
    identifier: 'CS-2025-042',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2025-08-15'
  },
  {
    id: 'fac-201',
    name: 'Dr. Alan Turing',
    email: 'alan.turing@university.edu',
    role: 'faculty',
    department: 'Computer Science & Engineering',
    status: 'active',
    identifier: 'FAC-CS-001',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2024-01-10'
  },
  {
    id: 'adm-301',
    name: 'Dean Margaret Hamilton',
    email: 'm.hamilton@university.edu',
    role: 'admin',
    department: 'Academic Administration',
    status: 'active',
    identifier: 'ADM-EXEC-01',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2023-06-01'
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('aegis_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.status === 'active') return parsed;
      } catch (e) {}
    }
    // Default logged in user for immediate preview: Alex Rivera (student)
    return DEFAULT_USERS[0];
  });

  const [allUsers, setAllUsers] = useState<UserAccount[]>(DEFAULT_USERS);

  const refreshUsers = async () => {
    try {
      const users = await api.getUsers();
      setAllUsers(users);
      // If current user was updated (e.g. approved), update current user state
      if (currentUser) {
        const updatedSelf = users.find(u => u.id === currentUser.id);
        if (updatedSelf) {
          setCurrentUser(updatedSelf);
        }
      }
    } catch (err) {
      console.warn('Failed to load users from backend:', err);
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('aegis_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('aegis_user');
    }
  }, [currentUser]);

  const activeRole: UserRole = currentUser?.role || 'student';
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
      return { success: false, error: result.error, status: result.status, user: result.user };
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

  const setRole = (role: UserRole) => {
    const matched = allUsers.find(u => u.role === role && u.status === 'active') ||
                    DEFAULT_USERS.find(u => u.role === role);
    if (matched) {
      setCurrentUser(matched);
    } else if (currentUser) {
      setCurrentUser({ ...currentUser, role });
    }
  };

  const switchUser = (userId: string) => {
    const found = allUsers.find(u => u.id === userId);
    if (found) setCurrentUser(found);
  };

  const loginAs = (role: UserRole) => {
    setRole(role);
  };

  const logout = () => {
    setCurrentUser(null);
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
        setRole,
        switchUser,
        login,
        register,
        approveUser,
        createUser,
        logout,
        loginAs,
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
