import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserProfile } from '../types';
import { auth, signInWithGoogle, logoutFirebase, getCalendarAccessToken, setCalendarAccessToken } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  switchUser: (uid: string) => void;
  updateCurrentUserProfile: (data: Partial<UserProfile>) => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  calendarConnected: boolean;
  canAccessFinancials: boolean;
  canApproveProposals: boolean;
  canManageUsers: boolean;
  canEditSettings: boolean;
  canConductFieldInspections: boolean;
}

const DEFAULT_USERS: UserProfile[] = [
  {
    uid: 'user-admin',
    name: 'Eng. Luiz Felipe Bertacini',
    email: 'eng.luizfelipebertacini@gmail.com',
    role: 'admin',
    cargo: 'Sócio-Diretor / Responsável Técnico',
    crea: 'CREA-SP 5069874123',
    phone: '(11) 98765-4321',
    active: true,
    googleConnected: true,
  },
  {
    uid: 'user-socio',
    name: 'Eng. Carlos Eduardo Bertacini',
    email: 'carlos.bertacini@engenharia.com',
    role: 'socio',
    cargo: 'Sócio / Gestor de Operações',
    crea: 'CREA-SP 5061234567',
    phone: '(11) 97654-3210',
    active: true,
    googleConnected: false,
  },
  {
    uid: 'user-operacional',
    name: 'Mariana Silveira',
    email: 'mariana.operacional@bertacini.com.br',
    role: 'operacional',
    cargo: 'Coordenadora Administrativa & Comercial',
    phone: '(11) 96543-2109',
    active: true,
    googleConnected: false,
  },
  {
    uid: 'user-engenheiro',
    name: 'Eng. Rodrigo Alencar',
    email: 'rodrigo.engenharia@bertacini.com.br',
    role: 'engenheiro',
    cargo: 'Engenheiro Diagnóstico Pleno',
    crea: 'CREA-SP 5078901234',
    phone: '(11) 95432-1098',
    active: true,
    googleConnected: false,
  },
  {
    uid: 'user-financeiro',
    name: 'Beatriz Fontes',
    email: 'financeiro@bertacini.com.br',
    role: 'financeiro',
    cargo: 'Analista Financeiro & Controladoria',
    phone: '(11) 94321-0987',
    active: true,
    googleConnected: false,
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('bertacini_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const savedUid = localStorage.getItem('bertacini_active_user_uid');
    const found = availableUsers.find(u => u.uid === savedUid);
    return found || availableUsers[0];
  });

  const [calendarConnected, setCalendarConnected] = useState<boolean>(() => {
    return !!getCalendarAccessToken();
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Update current user if matches or enrich
        setCurrentUser(prev => ({
          ...prev,
          email: user.email || prev.email,
          name: user.displayName || prev.name,
          avatarUrl: user.photoURL || undefined,
          googleConnected: true,
        }));
        setCalendarConnected(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const switchUser = (uid: string) => {
    const target = availableUsers.find(u => u.uid === uid);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem('bertacini_active_user_uid', uid);
    }
  };

  const updateCurrentUserProfile = (data: Partial<UserProfile>) => {
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    const newUsers = availableUsers.map(u => u.uid === currentUser.uid ? updated : u);
    setAvailableUsers(newUsers);
    localStorage.setItem('bertacini_users', JSON.stringify(newUsers));
  };

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithGoogle();
      if (res) {
        setCalendarAccessToken(res.accessToken);
        setCalendarConnected(!!res.accessToken);
        updateCurrentUserProfile({
          googleConnected: true,
          email: res.user.email || currentUser.email,
          name: res.user.displayName || currentUser.name,
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const logout = async () => {
    await logoutFirebase();
    setCalendarAccessToken(null);
    setCalendarConnected(false);
  };

  // Permission flags based on role
  const isAdm = currentUser.role === 'admin';
  const isSocio = currentUser.role === 'socio';
  const isOp = currentUser.role === 'operacional';
  const isEng = currentUser.role === 'engenheiro';
  const isFin = currentUser.role === 'financeiro';

  const canAccessFinancials = isAdm || isSocio || isFin;
  const canApproveProposals = isAdm || isSocio;
  const canManageUsers = isAdm;
  const canEditSettings = isAdm || isSocio;
  const canConductFieldInspections = isAdm || isSocio || isEng;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        availableUsers,
        switchUser,
        updateCurrentUserProfile,
        loginWithGoogle,
        logout,
        calendarConnected,
        canAccessFinancials,
        canApproveProposals,
        canManageUsers,
        canEditSettings,
        canConductFieldInspections,
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
