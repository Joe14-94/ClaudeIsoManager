import React, { useState } from 'react';
// FIX: The project appears to use react-router-dom v5. The imports for 'NavLink' and 'useNavigate' are for v6. Updating to v6 equivalents to fix build errors.
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ListChecks, Network, ShieldCheck, Target, TrendingUp, Users, Database, FileUp, FileDown, Workflow, GitMerge, ClipboardCheck, LogOut, KeyRound, DatabaseZap, GanttChart, LayoutGrid, Flag, ClipboardList } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ChangePasswordModal from '../auth/ChangePasswordModal';
import { APP_VERSION } from '../../config';

const Sidebar: React.FC = () => {
  const { logout, userRole } = useAuth();
  // FIX: Switched from useHistory to useNavigate for v6 compatibility.
  const navigate = useNavigate();
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  const navItemClasses = "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors";
  const activeClasses = "bg-slate-200 text-slate-900";
  const inactiveClasses = "text-slate-600 hover:bg-slate-200 hover:text-slate-900";

  // FIX: Replaced static classes with NavLink className function for v6 compatibility.
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => 
    `${navItemClasses} ${isActive ? activeClasses : inactiveClasses}`;


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col p-4">
        <div className="flex items-center gap-2 px-4 pb-4 border-b border-slate-200">
          <div className="p-2 bg-slate-800 text-white rounded-lg">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-800">ISO Manager</h1>
        </div>
        <nav className="flex-1 flex flex-col gap-y-4 mt-4">
          <div className='space-y-1'>
              {/* FIX: Updated NavLink to use a className function instead of `activeClassName` for v6 compatibility. */}
              <NavLink to="/dashboard" className={getNavLinkClass}>
                <LayoutDashboard size={18} className="mr-3" />
                Tableau de bord
              </NavLink>
               <NavLink to="/projets" className={getNavLinkClass}>
                <ClipboardList size={18} className="mr-3" />
                Projets
              </NavLink>
              <NavLink to="/activities" className={getNavLinkClass}>
                <ListChecks size={18} className="mr-3" />
                Activités
              </NavLink>
              <NavLink to="/explorer" className={getNavLinkClass}>
                <LayoutGrid size={18} className="mr-3" />
                Explorateur
              </NavLink>
              <NavLink to="/timeline" className={getNavLinkClass}>
                <GanttChart size={18} className="mr-3" />
                Timeline
              </NavLink>
              <NavLink to="/graph" className={getNavLinkClass}>
                <Network size={18} className="mr-3" />
                Vue arborescente
              </NavLink>
              <NavLink to="/d3-graph" className={getNavLinkClass}>
                <GitMerge size={18} className="mr-3" />
                Vue D3.js
              </NavLink>
          </div>

          <div>
              <h2 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Référentiels</h2>
              <div className='space-y-1'>
                  <NavLink to="/iso27002" className={getNavLinkClass}>
                      <ShieldCheck size={18} className="mr-3" />
                      ISO 27002
                  </NavLink>
                  <NavLink to="/initiatives" className={getNavLinkClass}>
                      <Flag size={18} className="mr-3" />
                      Initiatives
                  </NavLink>
                  <NavLink to="/orientations" className={getNavLinkClass}>
                      <TrendingUp size={18} className="mr-3" />
                      Orientations
                  </NavLink>
                  <NavLink to="/chantiers" className={getNavLinkClass}>
                      <Workflow size={18} className="mr-3" />
                      Chantiers
                  </NavLink>
                  <NavLink to="/objectives" className={getNavLinkClass}>
                      <Target size={18} className="mr-3" />
                      Objectifs
                  </NavLink>
                  <NavLink to="/processes" className={getNavLinkClass}>
                      <ClipboardCheck size={18} className="mr-3" />
                      Processus
                  </NavLink>
                   <NavLink to="/resources" className={getNavLinkClass}>
                      <Users size={18} className="mr-3" />
                      Ressources
                  </NavLink>
              </div>
          </div>

          <div>
              <h2 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Données</h2>
              <div className='space-y-1'>
                  <NavLink to="/data-management" className={getNavLinkClass}>
                      <Database size={18} className="mr-3" />
                      Gestion des données
                  </NavLink>
                  <NavLink to="/data-model" className={getNavLinkClass}>
                      <DatabaseZap size={18} className="mr-3" />
                      Modèle de données
                  </NavLink>
              </div>
          </div>
        </nav>
         <div className="mt-auto space-y-2">
           {userRole === 'admin' && (
             <button onClick={() => setIsChangePasswordModalOpen(true)} className={`${navItemClasses} w-full ${inactiveClasses}`}>
              <KeyRound size={18} className="mr-3" />
              Changer le mot de passe
            </button>
           )}
           <button onClick={handleLogout} className={`${navItemClasses} w-full ${inactiveClasses}`}>
            <LogOut size={18} className="mr-3" />
            Se déconnecter
          </button>
          <div className="px-4 text-xs text-slate-400">
            <p>&copy; 2025 ISO Manager</p>
            <p>Version {APP_VERSION}</p>
          </div>
        </div>
      </aside>
      {userRole === 'admin' && (
        <ChangePasswordModal 
          isOpen={isChangePasswordModalOpen}
          onClose={() => setIsChangePasswordModalOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;