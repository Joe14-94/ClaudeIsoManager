
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListChecks, Network, ShieldCheck, Target, TrendingUp, Users, Database, FileUp, FileDown, Workflow, GitMerge, ClipboardCheck } from 'lucide-react';

const Sidebar: React.FC = () => {
  const navItemClasses = "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors";
  const activeClasses = "bg-slate-200 text-slate-900";
  const inactiveClasses = "text-slate-600 hover:bg-slate-200 hover:text-slate-900";

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => 
    `${navItemClasses} ${isActive ? activeClasses : inactiveClasses}`;

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col p-4">
      <div className="flex items-center gap-2 px-4 pb-4 border-b border-slate-200">
        <div className="p-2 bg-slate-800 text-white rounded-lg">
          <ShieldCheck size={24} />
        </div>
        <h1 className="text-xl font-bold text-slate-800">ISO Manager</h1>
      </div>
      <nav className="flex-1 flex flex-col gap-y-4 mt-4">
        <div className='space-y-1'>
            <NavLink to="/dashboard" className={getNavLinkClass}>
              <LayoutDashboard size={18} className="mr-3" />
              Tableau de bord
            </NavLink>
            <NavLink to="/activities" className={getNavLinkClass}>
              <ListChecks size={18} className="mr-3" />
              Activités
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
                <NavLink to="/orientations" className={getNavLinkClass}>
                    <TrendingUp size={18} className="mr-3" />
                    Orientations
                </NavLink>
                <NavLink to="/objectives" className={getNavLinkClass}>
                    <Target size={18} className="mr-3" />
                    Objectifs
                </NavLink>
                <NavLink to="/chantiers" className={getNavLinkClass}>
                    <Workflow size={18} className="mr-3" />
                    Chantiers
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
            </div>
        </div>
      </nav>
       <div className="mt-auto px-4 text-xs text-slate-400">
        <p>&copy; 2025 ISO Manager</p>
        <p>Version 1.0.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;