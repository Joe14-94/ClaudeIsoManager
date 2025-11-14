import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  PropsWithChildren,
} from 'react';
import { UserRole } from '../types';
import { hashPassword } from '../utils/auth';

interface AuthContextType {
  userRole: UserRole | null;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  changePassword: (
    roleToChange: UserRole,
    adminConfirmation: string,
    newPassword: string
  ) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---------------------------------------------------------------------
// ⚠️ ATTENTION :
// Tout ce qui est ici est visible et modifiable par un utilisateur
// (DevTools, code source). C'est une sécurité "maquette / UX" seulement.
// ---------------------------------------------------------------------

// Sels par rôle (peuvent rester en clair, ils servent à éviter les rainbow tables)
const ADMIN_SALT = 'iso-manager-admin-salt';
const PMO_SALT = 'iso-manager-pmo-salt';

// Hashes des mots de passe par rôle.
// Mots de passe originaux :
// admin:    'adminISO27002!'
// pmo:      'pmoISO27002$'
const ADMIN_PASSWORD_HASH = '033cef560eb8f419eaf9f64a975bdc0ab033a7a7118fb2332ed65de51e970c72';
const PMO_PASSWORD_HASH = 'a5a8a8e6bfa3b297795095b8d98fc0a57bd567a600f9405596504168a812ead2';

// ---------------------------------------------------------------------
// NOTE : pour générer ces valeurs, un utilitaire interne peut être utilisé :
/*
  const h = await hashPassword('nouveau_mot_de_passe', SEL_CORRESPONDANT);
  console.log(h); // → à coller dans la constante appropriée
*/
// ---------------------------------------------------------------------

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restauration du rôle depuis la session
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
    if (!trimmedPassword) return false;

    // On dérive le mot de passe avec le sel du rôle et on compare au hash stocké.
    const [adminHash, pmoHash] = await Promise.all([
      hashPassword(trimmedPassword, ADMIN_SALT),
      hashPassword(trimmedPassword, PMO_SALT),
    ]);
    
    const isAdmin = adminHash === ADMIN_PASSWORD_HASH;
    if (isAdmin) {
      setUserRole('admin');
      sessionStorage.setItem('user_role', 'admin');
      return true;
    }

    const isPmo = pmoHash === PMO_PASSWORD_HASH;
    if (isPmo) {
      setUserRole('pmo');
      sessionStorage.setItem('user_role', 'pmo');
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUserRole(null);
    sessionStorage.removeItem('user_role');
  };

  const changePassword = async (
    roleToChange: UserRole,
    adminConfirmation: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    // Garde-fou fonctionnel
    if (userRole !== 'admin') {
      return {
        success: false,
        message: 'Seul un administrateur peut changer les mots de passe.',
      };
    }

    const adminHash = await hashPassword(adminConfirmation.trim(), ADMIN_SALT);
    if (adminHash !== ADMIN_PASSWORD_HASH) {
      return {
        success: false,
        message: 'Votre mot de passe administrateur est incorrect.',
      };
    }

    // Simulation de changement : on calcule le nouveau hash et on l'affiche.
    // Il faut ensuite remplacer manuellement la constante correspondante
    // (ADMIN_PASSWORD_HASH / PMO_PASSWORD_HASH)
    // dans ce fichier.
    let salt: string;
    let roleLabel: string;
    switch (roleToChange) {
      case 'admin':
        salt = ADMIN_SALT;
        roleLabel = 'admin';
        break;
      case 'pmo':
        salt = PMO_SALT;
        roleLabel = 'pmo';
        break;
    }

    const newHash = await hashPassword(newPassword.trim(), salt);

    console.log(
      `SIMULATION DE CHANGEMENT DE MOT DE PASSE POUR LE RÔLE '${roleLabel}'`
    );
    console.log(
      'Copiez le hash suivant et remplacez la constante correspondante dans `AuthContext.tsx` :'
    );
    console.log(`Nouveau hash pour ${roleLabel}: ${newHash}`);

    return {
      success: true,
      message:
        `Le nouveau hash pour le rôle '${roleLabel}' a été généré et affiché dans la console. ` +
        "Le changement n'est pas persistant tant que vous ne mettez pas à jour le code.",
    };
  };

  const value: AuthContextType = {
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