import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import PermissionsModal from '../components/auth/PermissionsModal';
import { UserRole } from '../types';
import { ShieldCheck, Shield, User } from 'lucide-react';

const AccessRightsPage: React.FC = () => {
  const { userRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  if (userRole !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleOpenModal = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleCloseModal = () => {
    setSelectedRole(null);
  };

  const roles: { role: UserRole, name: string, description: string, icon: React.ReactNode }[] = [
    { role: 'admin', name: 'Administrateur', description: 'Accès complet à toutes les fonctionnalités et configurations.', icon: <ShieldCheck className="w-8 h-8 text-red-600" /> },
    { role: 'pmo', name: 'PMO', description: 'Accès en modification aux projets, activités et gestion des données.', icon: <Shield className="w-8 h-8 text-blue-600" /> },
    { role: 'readonly', name: 'Lecture seule', description: 'Accès en consultation seule à la plupart des données.', icon: <User className="w-8 h-8 text-slate-600" /> }
  ];

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold text-slate-800">Gestion des droits d'accès</h1>
      <p className="text-slate-600">Visualisez les permissions associées à chaque profil d'utilisateur. Cliquez sur un profil pour voir le détail des autorisations.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {roles.map(({ role, name, description, icon }) => (
          <Card key={role} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleOpenModal(role)}>
            <CardHeader>
                <div className="flex items-center gap-4">
                    {icon}
                    <CardTitle>{name}</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedRole && (
        <PermissionsModal
          isOpen={!!selectedRole}
          onClose={handleCloseModal}
          role={selectedRole}
        />
      )}
    </div>
  );
};

export default AccessRightsPage;
