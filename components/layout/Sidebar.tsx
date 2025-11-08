import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ListChecks, Network, ShieldCheck, Target, TrendingUp, Users, Database, FileUp, FileDown, Workflow, GitMerge, ClipboardCheck, LogOut, KeyRound, DatabaseZap, GanttChart, LayoutGrid, Flag, ClipboardList, ChevronUp, ChevronDown, Coins, Timer, GitBranch, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ChangePasswordModal from '../auth/ChangePasswordModal';
import { APP_VERSION } from '../../config';
import { useSidebar } from '../../contexts/SidebarContext';
import Tooltip from '../ui/Tooltip';

interface NavItemProps {
  to: string;
  // FIX: To resolve the TypeScript error with React.cloneElement, the `icon` prop's type is updated to explicitly include `size` and `className` properties. This ensures that TypeScript recognizes these as valid props when cloning the element.
  icon: React.ReactElement<{ size?: number | string; className?: string }>;
  label: string;
  isCollapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isCollapsed }) => {
    const navItemClasses = "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors";
    const activeClasses = "bg-slate-200 text-slate-900";
    const inactiveClasses = "text-slate-600 hover:bg-slate-200 hover:text-slate-900";
    const getNavLinkClass = ({ isActive }: { isActive: boolean }) => 
        `${navItemClasses} ${isActive ? activeClasses : inactiveClasses} ${isCollapsed ? 'justify-center' : ''}`;

    const navLinkContent = (
        <NavLink to={to} className={getNavLinkClass}>
            {React.cloneElement(icon, { size: 18, className: isCollapsed ? '' : 'mr-3' })}
            {!isCollapsed && <span className="flex-1 truncate">{label}</span>}
        </NavLink>
    );

    return isCollapsed ? <Tooltip text={label}>{navLinkContent}</Tooltip> : navLinkContent;
};


const Sidebar: React.FC = () => {
  const { logout, userRole } = useAuth();
  const navigate = useNavigate();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  
  const [isProjetsOpen, setIsProjetsOpen] = useState(true);
  const [isActivitesOpen, setIsActivitesOpen] = useState(true);
  const [isReferentielsOpen, setIsReferentielsOpen] = useState(false);
  const [isDonneesOpen, setIsDonneesOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const navItemClasses = "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors w-full";
  const inactiveClasses = "text-slate-600 hover:bg-slate-200 hover:text-slate-900";

  return (
    <>
      <aside className={`flex-shrink-0 bg-white border-r border-slate-200 flex flex-col p-4 relative transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`flex items-center gap-2 px-4 pb-4 border-b border-slate-200 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="p-2 bg-slate-800 text-white rounded-lg">
            <ShieldCheck size={isCollapsed ? 24 : 24} />
          </div>
          {!isCollapsed && <h1 className="text-xl font-bold text-slate-800">ISO Manager</h1>}
        </div>

        <nav className="flex-1 flex flex-col gap-y-1 mt-4 overflow-y-auto">
            {(userRole === 'admin' || userRole === 'pmo') && (
                <NavItem to="/dashboard" icon={<LayoutDashboard />} label="Tableau de bord" isCollapsed={isCollapsed} />
            )}
            
            {(userRole === 'admin' || userRole === 'pmo') && (
            <div className="py-2">
              {!isCollapsed && (
                <div className="flex justify-between items-center px-4 mb-2">
                    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">PROJETS</h2>
                    <button onClick={() => setIsProjetsOpen(!isProjetsOpen)} className="text-slate-400 hover:text-slate-600">
                        {isProjetsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                </div>
              )}
              {(!isCollapsed && isProjetsOpen) && (
                <div className='space-y-1'>
                    <NavItem to="/projects-dashboard" icon={<LayoutDashboard/>} label="Tableau de bord" isCollapsed={isCollapsed} />
                    <NavItem to="/projets" icon={<ClipboardList/>} label="Projets" isCollapsed={isCollapsed} />
                    <NavItem to="/projects-explorer" icon={<LayoutGrid/>} label="Explorateur" isCollapsed={isCollapsed} />
                    <NavItem to="/projects-timeline" icon={<GanttChart/>} label="Timeline" isCollapsed={isCollapsed} />
                    <NavItem to="/projects-budget" icon={<Coins/>} label="Budget" isCollapsed={isCollapsed} />
                    <NavItem to="/projects-workload" icon={<Timer/>} label="Charges J/H" isCollapsed={isCollapsed} />
                </div>
              )}
            </div>
            )}

            {(userRole === 'admin' || userRole === 'pmo') && (
            <div className="py-2">
              {!isCollapsed && (
                <div className="flex justify-between items-center px-4 mb-2">
                  <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ACTIVITÉS</h2>
                  <button onClick={() => setIsActivitesOpen(!isActivitesOpen)} className="text-slate-400 hover:text-slate-600">
                    {isActivitesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              )}
              {(!isCollapsed && isActivitesOpen) && (
                <div className='space-y-1'>
                  <NavItem to="/activities-dashboard" icon={<LayoutDashboard />} label="Tableau de bord" isCollapsed={isCollapsed} />
                  <NavItem to="/activities" icon={<ListChecks />} label="Activités" isCollapsed={isCollapsed} />
                  <NavItem to="/explorer" icon={<LayoutGrid />} label="Explorateur" isCollapsed={isCollapsed} />
                  <NavItem to="/timeline" icon={<GanttChart />} label="Timeline" isCollapsed={isCollapsed} />
                  {userRole === 'admin' && (
                    <>
                      <NavItem to="/graph" icon={<Network />} label="Vue arborescente" isCollapsed={isCollapsed} />
                      <NavItem to="/d3-graph" icon={<GitMerge />} label="Vue D3.js" isCollapsed={isCollapsed} />
                    </>
                  )}
                </div>
              )}
            </div>
            )}

            <div className="py-2">
              {!isCollapsed && (
                  <div className="flex justify-between items-center px-4 mb-2">
                    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">RÉFÉRENTIELS</h2>
                    <button onClick={() => setIsReferentielsOpen(!isReferentielsOpen)} className="text-slate-400 hover:text-slate-600">
                        {isReferentielsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
              )}
              {(!isCollapsed && isReferentielsOpen) && (
                <div className='space-y-1'>
                    {userRole === 'admin' && (
                      <>
                        <NavItem to="/iso27002" icon={<ShieldCheck />} label="ISO 27002" isCollapsed={isCollapsed} />
                        <NavItem to="/initiatives" icon={<Flag />} label="Initiatives" isCollapsed={isCollapsed} />
                        <NavItem to="/orientations" icon={<TrendingUp />} label="Orientations" isCollapsed={isCollapsed} />
                        <NavItem to="/chantiers" icon={<Workflow />} label="Chantiers" isCollapsed={isCollapsed} />
                        <NavItem to="/objectives" icon={<Target />} label="Objectifs" isCollapsed={isCollapsed} />
                        <NavItem to="/processes" icon={<ClipboardCheck />} label="Processus" isCollapsed={isCollapsed} />
                      </>
                    )}
                    <NavItem to="/resources" icon={<Users />} label="Ressources" isCollapsed={isCollapsed} />
                </div>
              )}
            </div>

            <div className="py-2">
              {!isCollapsed && (
                  <div className="flex justify-between items-center px-4 mb-2">
                    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">DONNÉES</h2>
                    <button onClick={() => setIsDonneesOpen(!isDonneesOpen)} className="text-slate-400 hover:text-slate-600">
                        {isDonneesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
              )}
              {(!isCollapsed && isDonneesOpen) && (
                <div className='space-y-1'>
                    {(userRole === 'admin' || userRole === 'pmo') && (
                      <NavItem to="/data-management" icon={<Database />} label="Gestion des données" isCollapsed={isCollapsed} />
                    )}
                    {userRole === 'admin' && (
                      <>
                        <NavItem to="/data-model" icon={<DatabaseZap />} label="Modèle de données" isCollapsed={isCollapsed} />
                        <NavItem to="/data-model-2" icon={<GitBranch />} label="Modèle de données 2" isCollapsed={isCollapsed} />
                      </>
                    )}
                </div>
              )}
            </div>
        </nav>

        <div className="mt-auto space-y-2">
            <button
                onClick={toggleSidebar}
                className="w-full flex items-center justify-center p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title={isCollapsed ? "Développer le menu" : "Réduire le menu"}
            >
                {isCollapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
            </button>
        
           {userRole === 'admin' && (
            <Tooltip text="Changer le mot de passe">
                <button onClick={() => setIsChangePasswordModalOpen(true)} className={`${navItemClasses} ${inactiveClasses} ${isCollapsed ? 'justify-center' : ''}`}>
                    <KeyRound size={18} className={isCollapsed ? '' : 'mr-3'} />
                    {!isCollapsed && <span className="flex-1 truncate">Changer le mot de passe</span>}
                </button>
            </Tooltip>
           )}
           <Tooltip text="Se déconnecter">
                <button onClick={handleLogout} className={`${navItemClasses} ${inactiveClasses} ${isCollapsed ? 'justify-center' : ''}`}>
                    <LogOut size={18} className={isCollapsed ? '' : 'mr-3'} />
                    {!isCollapsed && <span className="flex-1 truncate">Se déconnecter</span>}
                </button>
           </Tooltip>

          {!isCollapsed && (
            <div className="px-4 text-xs text-slate-400">
                <p>&copy; 2025 ISO Manager</p>
                <p>Version {APP_VERSION}</p>
            </div>
          )}
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