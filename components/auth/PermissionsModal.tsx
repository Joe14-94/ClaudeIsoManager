import React from 'react';
import Modal from '../ui/Modal';
import { UserRole } from '../../types';
import { CheckCircle2, Eye, XCircle } from 'lucide-react';

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
}

type PermissionLevel = 'Modification' | 'Lecture' | 'Aucun accès';

const featurePermissions: { feature: string; admin: PermissionLevel; pmo: PermissionLevel; readonly: PermissionLevel; description?: string }[] = [
    { feature: 'Tableaux de bord', admin: 'Modification', pmo: 'Modification', readonly: 'Lecture', description: 'Accès aux dashboards général, projets et activités.' },
    { feature: 'Gestion des Projets', admin: 'Modification', pmo: 'Modification', readonly: 'Lecture', description: 'Créer, modifier et supprimer des projets.' },
    { feature: 'Gestion des Activités', admin: 'Modification', pmo: 'Modification', readonly: 'Lecture', description: 'Créer, modifier et supprimer des activités.' },
    { feature: 'Vues Projets', admin: 'Modification', pmo: 'Modification', readonly: 'Lecture', description: 'Explorateur, Timeline, Budget, Charges.' },
    { feature: 'Vues Activités', admin: 'Modification', pmo: 'Modification', readonly: 'Lecture', description: 'Explorateur et Timeline des activités.' },
    { feature: 'Vues Graphes & Modèles', admin: 'Modification', pmo: 'Aucun accès', readonly: 'Aucun accès', description: 'Vues Arborescente, D3 et Modèles de données.' },
    { feature: 'Référentiel: Ressources', admin: 'Modification', pmo: 'Modification', readonly: 'Lecture', description: 'Gestion des ressources humaines.' },
    { feature: 'Autres Référentiels', admin: 'Modification', pmo: 'Aucun accès', readonly: 'Aucun accès', description: 'ISO 27002, Initiatives, Orientations, Chantiers, Objectifs, Processus.' },
    { feature: 'Gestion des Données', admin: 'Modification', pmo: 'Modification', readonly: 'Aucun accès', description: 'Import, export et sauvegarde des données.' },
    { feature: 'Gestion Mots de passe', admin: 'Modification', pmo: 'Aucun accès', readonly: 'Aucun accès', description: 'Modifier les mots de passe des comptes.' },
    { feature: 'Gestion Droits d\'accès', admin: 'Modification', pmo: 'Aucun accès', readonly: 'Aucun accès', description: 'Visualiser cette page.' },
];


const PermissionIcon: React.FC<{ level: PermissionLevel }> = ({ level }) => {
    switch (level) {
        case 'Modification':
            return <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />;
        case 'Lecture':
            return <Eye className="w-5 h-5 text-blue-600 flex-shrink-0" />;
        case 'Aucun accès':
            return <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />;
        default:
            return null;
    }
}

const PermissionsModal: React.FC<PermissionsModalProps> = ({ isOpen, onClose, role }) => {
  const roleName = role === 'admin' ? 'Administrateur' : role === 'pmo' ? 'PMO' : 'Lecture seule';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Permissions pour le profil : ${roleName}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100">
            <tr>
              <th scope="col" className="px-6 py-3">Fonctionnalité</th>
              <th scope="col" className="px-6 py-3 text-center">Permission</th>
            </tr>
          </thead>
          <tbody>
            {featurePermissions.map(({ feature, description, ...levels }) => {
                const permissionLevel = levels[role];
                if (!permissionLevel) return null;

                return (
                  <tr key={feature} className="bg-white border-b hover:bg-slate-50">
                    <td scope="row" className="px-6 py-4 font-medium text-slate-800">
                      <div>{feature}</div>
                      {description && <div className="text-xs text-slate-500 font-normal">{description}</div>}
                    </td>
                    <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <PermissionIcon level={permissionLevel} />
                            <span className="font-medium">{permissionLevel}</span>
                        </div>
                    </td>
                  </tr>
                );
            })}
          </tbody>
        </table>
      </div>
       <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">
                Fermer
            </button>
        </div>
    </Modal>
  );
};

export default PermissionsModal;
