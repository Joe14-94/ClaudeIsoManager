import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { UserRole } from '../../types';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { changePassword } = useAuth();
  const [adminConfirmation, setAdminConfirmation] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [roleToChange, setRoleToChange] = useState<UserRole>('admin');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [showAdminConfirmation, setShowAdminConfirmation] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (newPassword !== confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setIsLoading(true);
    const result = await changePassword(roleToChange, adminConfirmation, newPassword);
    setIsLoading(false);

    if (result.success) {
      setSuccessMessage(result.message);
      setAdminConfirmation('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        handleClose();
      }, 2000);
    } else {
      setError(result.message);
    }
  };
  
  const handleClose = () => {
    // Réinitialiser l'état local avant de fermer
    setAdminConfirmation('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMessage('');
    setRoleToChange('admin');
    setShowAdminConfirmation(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Changer un mot de passe">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Compte à modifier</label>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
            <label htmlFor="role-admin" className="flex items-center cursor-pointer">
              <input id="role-admin" name="role" type="radio" value="admin" checked={roleToChange === 'admin'} onChange={() => setRoleToChange('admin')} className="sr-only peer"/>
              <span className="w-4 h-4 rounded-full border-2 bg-white border-slate-400 grid place-items-center transition-colors peer-checked:border-blue-600 peer-focus:ring-2 peer-focus:ring-blue-500">
                <span className="w-2 h-2 rounded-full bg-blue-600 transform scale-0 peer-checked:scale-100 transition-transform"></span>
              </span>
              <span className="ml-2 text-sm text-slate-900">Administrateur</span>
            </label>
             <label htmlFor="role-pmo" className="flex items-center cursor-pointer">
              <input id="role-pmo" name="role" type="radio" value="pmo" checked={roleToChange === 'pmo'} onChange={() => setRoleToChange('pmo')} className="sr-only peer"/>
               <span className="w-4 h-4 rounded-full border-2 bg-white border-slate-400 grid place-items-center transition-colors peer-checked:border-blue-600 peer-focus:ring-2 peer-focus:ring-blue-500">
                <span className="w-2 h-2 rounded-full bg-blue-600 transform scale-0 peer-checked:scale-100 transition-transform"></span>
              </span>
              <span className="ml-2 text-sm text-slate-900">PMO</span>
            </label>
          </div>
        </div>
        
        <div>
          <label htmlFor="adminConfirmation" className="block text-sm font-medium text-slate-700">Votre mot de passe administrateur (pour confirmation)</label>
          <div className="relative mt-1">
            <input type={showAdminConfirmation ? 'text' : 'password'} name="adminConfirmation" id="adminConfirmation" value={adminConfirmation} onChange={e => setAdminConfirmation(e.target.value)} required className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm pr-10" />
            <button type="button" onClick={() => setShowAdminConfirmation(!showAdminConfirmation)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700" aria-label={showAdminConfirmation ? "Cacher le mot de passe" : "Afficher le mot de passe"}>
              {showAdminConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700">Nouveau mot de passe pour le compte '{roleToChange === 'admin' ? 'Administrateur' : roleToChange === 'pmo' ? 'PMO' : 'Lecture seule'}'</label>
          <div className="relative mt-1">
            <input type={showNewPassword ? 'text' : 'password'} name="newPassword" id="newPassword" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm pr-10" />
            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700" aria-label={showNewPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}>
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">Confirmer le nouveau mot de passe</label>
          <div className="relative mt-1">
            <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm pr-10" />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700" aria-label={showConfirmPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}>
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

        <div className="flex justify-end gap-2 pt-4 border-t mt-6">
          <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">Annuler</button>
          <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400">
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangePasswordModal;