import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ListChecks, Network, ShieldCheck, Target, TrendingUp, Users, Database, FileUp, FileDown, Workflow, GitMerge, ClipboardCheck, LogOut, KeyRound, DatabaseZap, GanttChart, LayoutGrid, Flag, ClipboardList, ChevronUp, ChevronDown, Coins, Timer, GitBranch, ChevronsLeft, ChevronsRight, UserCog } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ChangePasswordModal from '../auth/ChangePasswordModal';
import { APP_VERSION } from '../../config';
import { useSidebar } from '../../contexts/SidebarContext';
import Tooltip from '../ui/Tooltip';
import { useData } from '../../contexts/DataContext';

interface NavItemProps {
  to: string;
  // FIX: To resolve the TypeScript error with React.cloneElement, the `icon` prop's type is updated to explicitly include `size` and `className` properties. This ensures that TypeScript recognizes these as valid props when cloning the element.
  icon: React.ReactElement<{ size?: number | string; className?: string }>;
  label: string;
  isCollapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isCollapsed }) => {
    const { closeMobileSidebar } = useSidebar();
    const navItemClasses = "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors";
    const activeClasses = "bg-slate-200 text-slate-900";
    const inactiveClasses = "text-slate-600 hover:bg-slate-200 hover:text-slate-900";
    const getNavLinkClass = ({ isActive }: { isActive: boolean }) => 
        `${navItemClasses} ${isActive ? activeClasses : inactiveClasses} ${isCollapsed ? 'justify-center' : ''}`;

    const navLinkContent = (
        <NavLink to={to} className={getNavLinkClass} onClick={closeMobileSidebar}>
            {React.cloneElement(icon, { size: 18, className: isCollapsed ? '' : 'mr-3' })}
            {!isCollapsed && <span className="flex-1 truncate">{label}</span>}
        </NavLink>
    );

    return isCollapsed ? <Tooltip text={label}>{navLinkContent}</Tooltip> : navLinkContent;
};


const Sidebar: React.FC = () => {
  const { logout, userRole } = useAuth();
  const { 
    activities,
    objectives,
    orientations,
    resources,
    chantiers,
    securityProcesses,
    projects,
    initiatives,
    dashboardLayouts
  } = useData();
  const navigate = useNavigate();
  const { isCollapsed, toggleSidebar, isMobileOpen, closeMobileSidebar } = useSidebar();
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  
  const [isProjetsOpen, setIsProjetsOpen] = useState(false);
  const [isActivitesOpen, setIsActivitesOpen] = useState(false);
  const [isReferentielsOpen, setIsReferentielsOpen] = useState(false);
  const [isDonneesOpen, setIsDonneesOpen] = useState(false);
  const [isDroitsAccesOpen, setIsDroitsAccesOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    closeMobileSidebar();
  };
  
  const handleExport = () => {
    const allData = {
      activities,
      objectives,
      orientations,
      resources,
      chantiers,
      securityProcesses,
      projects,
      initiatives,
      dashboardLayouts
    };
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iso-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    closeMobileSidebar();
  };
  
  const navItemClasses = "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors w-full";
  const inactiveClasses = "text-slate-600 hover:bg-slate-200 hover:text-slate-900";

  return (
    <>
      {isMobileOpen && (
          <div 
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={closeMobileSidebar}
              aria-hidden="true"
          />
      )}
      <aside className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200 flex flex-col p-4 transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} ${isCollapsed ? 'md:w-20' : 'md:w-64'} w-64`}>
        <div className={`flex items-center gap-2 px-4 pb-4 border-b border-slate-200 ${isCollapsed ? 'md:justify-center' : ''}`}>
          <div className="p-2 bg-slate-800 text-white rounded-lg">
            <ShieldCheck size={24} />
          </div>
          <span className={`${isCollapsed ? 'md:hidden' : ''}`}><h1 className="text-xl font-bold text-slate-800">ISO Manager</h1></span>
        </div>

        <nav className="flex-1 flex flex-col gap-y-1 mt-4 overflow-y-auto">
            {(userRole === 'admin' || userRole === 'pmo') && (
                <NavItem to="/dashboard" icon={<LayoutDashboard />} label="Tableau de bord" isCollapsed={isCollapsed} />
            )}
            
            {(userRole === 'admin' || userRole === 'pmo') && (
            <div className="py-2">
              <div className={`flex justify-between items-center px-4 mb-2 ${isCollapsed ? 'md:hidden' : ''}`}>
                    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">PROJETS</h2>
                    <button onClick={() => setIsProjetsOpen(!isProjetsOpen)} className="text-slate-400 hover:text-slate-600">
                        {isProjetsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
              </div>
              <div className={`${isCollapsed ? 'md:hidden' : ''} ${isProjetsOpen ? 'block' : 'hidden'}`}>
                <div className='space-y-1'>
                    <NavItem to="/projects-dashboard" icon={<LayoutDashboard/>} label="Tableau de bord" isCollapsed={isCollapsed} />
                    <NavItem to="/projets" icon={<ClipboardList/>} label="Projets" isCollapsed={isCollapsed} />
                    <NavItem to="/projects-explorer" icon={<LayoutGrid/>} label="Explorateur" isCollapsed={isCollapsed} />
                    <NavItem to="/projects-timeline" icon={<GanttChart/>} label="Timeline" isCollapsed={isCollapsed} />
                    <NavItem to="/projects-budget" icon={<Coins/>} label="Budget" isCollapsed={isCollapsed} />
                    <NavItem to="/projects-workload" icon={<Timer/>} label="Charges J/H" isCollapsed={isCollapsed} />
                </div>
              </div>
            </div>
            )}

            {(userRole === 'admin' || userRole === 'pmo') && (
            <div className="py-2">
              <div className={`flex justify-between items-center px-4 mb-2 ${isCollapsed ? 'md:hidden' : ''}`}>
                  <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ACTIVITÉS</h2>
                  <button onClick={() => setIsActivitesOpen(!isActivitesOpen)} className="text-slate-400 hover:text-slate-600">
                    {isActivitesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              <div className={`${isCollapsed ? 'md:hidden' : ''} ${isActivitesOpen ? 'block' : 'hidden'}`}>
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
              </div>
            </div>
            )}

            <div className="py-2">
              <div className={`flex justify-between items-center px-4 mb-2 ${isCollapsed ? 'md:hidden' : ''}`}>
                    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">RÉFÉRENTIELS</h2>
                    <button onClick={() => setIsReferentielsOpen(!isReferentielsOpen)} className="text-slate-400 hover:text-slate-600">
                        {isReferentielsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
              <div className={`${isCollapsed ? 'md:hidden' : ''} ${isReferentielsOpen ? 'block' : 'hidden'}`}>
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
              </div>
            </div>

            <div className="py-2">
              <div className={`flex justify-between items-center px-4 mb-2 ${isCollapsed ? 'md:hidden' : ''}`}>
                    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">DONNÉES</h2>
                    <button onClick={() => setIsDonneesOpen(!isDonneesOpen)} className="text-slate-400 hover:text-slate-600">
                        {isDonneesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
              <div className={`${isCollapsed ? 'md:hidden' : ''} ${isDonneesOpen ? 'block' : 'hidden'}`}>
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
              </div>
            </div>

            {userRole === 'admin' && (
                <div className="py-2">
                <div className={`flex justify-between items-center px-4 mb-2 ${isCollapsed ? 'md:hidden' : ''}`}>
                        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">DROITS D'ACCÈS</h2>
                        <button onClick={() => setIsDroitsAccesOpen(!isDroitsAccesOpen)} className="text-slate-400 hover:text-slate-600">
                            {isDroitsAccesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                    </div>
                <div className={`${isCollapsed ? 'md:hidden' : ''} ${isDroitsAccesOpen ? 'block' : 'hidden'}`}>
                    <div className='space-y-1'>
                        <NavItem to="/droits-acces" icon={<UserCog />} label="Droits d'accès" isCollapsed={isCollapsed} />
                    </div>
                </div>
                </div>
            )}
        </nav>

        <div className="mt-auto space-y-2">
            <div className="hidden md:block">
              <button
                  onClick={toggleSidebar}
                  className="w-full flex items-center justify-center p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  title={isCollapsed ? "Développer le menu" : "Réduire le menu"}
              >
                  {isCollapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
              </button>
            </div>
        
           {(userRole === 'admin' || userRole === 'pmo') && (
            <Tooltip text="Sauvegarder les données">
                <button onClick={handleExport} className={`${navItemClasses} ${inactiveClasses} ${isCollapsed ? 'justify-center' : ''}`}>
                    <FileDown size={18} className={isCollapsed ? '' : 'mr-3'} />
                    {!isCollapsed && <span className="flex-1 truncate">Sauvegarder</span>}
                </button>
            </Tooltip>
           )}

           {userRole === 'admin' && (
            <Tooltip text="Changer le mot de passe">
                <button onClick={() => { setIsChangePasswordModalOpen(true); closeMobileSidebar(); }} className={`${navItemClasses} ${inactiveClasses} ${isCollapsed ? 'justify-center' : ''}`}>
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

          <div className={`${isCollapsed ? 'md:hidden' : ''}`}>
            <div className="px-4 text-xs text-slate-400">
                <p>&copy; 2025 ISO Manager</p>
                <p>Version {APP_VERSION}</p>
            </div>
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