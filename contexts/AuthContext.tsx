import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/storage';
import { UserRole } from '../types';

interface AuthContextType {
  userRole: UserRole | null;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  changePassword: (roleToChange: UserRole, adminConfirmation: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_PASSWORD_KEY = 'admin_password';
const READONLY_PASSWORD_KEY = 'readonly_password';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Stocker les mots de passe en state pour permettre leur modification.
  const [adminPassword, setAdminPassword] = useState<string>(() => 
    loadFromLocalStorage(ADMIN_PASSWORD_KEY, 'adminISO27002!')
  );
  const [readonlyPassword, setReadonlyPassword] = useState<string>(() => 
    loadFromLocalStorage(READONLY_PASSWORD_KEY, 'lectureISO27002!')
  );
  
  // Persister les changements de mot de passe
  useEffect(() => {
    saveToLocalStorage(ADMIN_PASSWORD_KEY, adminPassword);
  }, [adminPassword]);

  useEffect(() => {
    saveToLocalStorage(READONLY_PASSWORD_KEY, readonlyPassword);
  }, [readonlyPassword]);

  useEffect(() => {
    try {
      const sessionRole = sessionStorage.getItem('user_role') as UserRole | null;
      if (sessionRole) {
        setUserRole(sessionRole);
      }
    } catch (error) {
      console.error("Impossible d'accéder au sessionStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (password: string): Promise<boolean> => {
    const trimmedPassword = password.trim();
    if (trimmedPassword === adminPassword) {
      setUserRole('admin');
      sessionStorage.setItem('user_role', 'admin');
      return true;
    }
    if (trimmedPassword === readonlyPassword) {
      setUserRole('readonly');
      sessionStorage.setItem('user_role', 'readonly');
      return true;
    }
    return false;
  };

  const logout = () => {
    setUserRole(null);
    sessionStorage.removeItem('user_role');
  };

  const changePassword = async (roleToChange: UserRole, adminConfirmation: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    if (userRole !== 'admin') {
      return { success: false, message: "Seul un administrateur peut changer les mots de passe." };
    }

    if (adminConfirmation.trim() !== adminPassword) {
      return { success: false, message: "Votre mot de passe administrateur est incorrect." };
    }

    if (roleToChange === 'admin') {
      setAdminPassword(newPassword);
    } else if (roleToChange === 'readonly') {
      setReadonlyPassword(newPassword);
    } else {
        return { success: false, message: "Rôle invalide." };
    }
    
    return { success: true, message: "Mot de passe changé avec succès." };
  };

  const value = {
    userRole,
    login,
    logout,
    isLoading,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};