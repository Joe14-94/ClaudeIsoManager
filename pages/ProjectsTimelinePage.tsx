import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import ProjectTimeline from '../components/charts/ProjectTimeline';
import { useData } from '../contexts/DataContext';
import { ActivityStatus } from '../types';
import { ZoomIn, ZoomOut, RotateCw, FilterX } from 'lucide-react';
import ActiveFiltersDisplay from '../components/ui/ActiveFiltersDisplay';

const ProjectsTimelinePage: React.FC = () => {
  const { projects } = useData();
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [statusFilter, setStatusFilter] = useState('');
  const [top30Filter, setTop30Filter] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      return (
        (statusFilter === '' || project.status === statusFilter) &&
        (top30Filter === '' || String(project.isTop30) === top30Filter)
      );
    });
  }, [projects, statusFilter, top30Filter]);

  const handleResetFilters = () => {
    setStatusFilter('');
    setTop30Filter('');
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev * 1.5, 8));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev / 1.5, 0.25));
  const handleZoomReset = () => setZoomLevel(1);

  const activeFiltersForDisplay = useMemo(() => {
    const filters: { [key: string]: string } = {};
    if (statusFilter) filters['Statut'] = statusFilter;
    if (top30Filter) filters['Top 30'] = top30Filter === 'true' ? 'Oui' : 'Non';
    return filters;
  }, [statusFilter, top30Filter]);

  const handleRemoveFilter = (key: string) => {
    if (key === 'Statut') setStatusFilter('');
    if (key === 'Top 30') setTop30Filter('');
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <h1 className="text-3xl font-bold text-slate-800">Timeline des projets</h1>
      <p className="text-slate-600">
        Vue chronologique des projets planifiés. Filtrez, zoomez et cliquez sur un projet pour voir ses détails.
      </p>
      <Card className="flex-grow flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
             <CardTitle>Chronologie complète</CardTitle>
             <div className="flex items-center gap-2">
                <button onClick={handleZoomOut} title="Dézoomer" className="p-2 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"><ZoomOut size={18} /></button>
                <button onClick={handleZoomIn} title="Zoomer" className="p-2 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"><ZoomIn size={18} /></button>
                <button onClick={handleZoomReset} title="Réinitialiser le zoom" className="p-2 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"><RotateCw size={18} /></button>
             </div>
          </div>
          <div className="flex flex-col md:flex-row flex-wrap gap-4 mt-4 pt-4 border-t border-slate-200">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                aria-label="Filtrer par statut"
              >
                <option value="">Tous les statuts</option>
                {Object.values(ActivityStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select 
                value={top30Filter}
                onChange={(e) => setTop30Filter(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                aria-label="Filtrer par Top 30"
              >
                <option value="">Tous les projets</option>
                <option value="true">Top 30</option>
                <option value="false">Hors Top 30</option>
              </select>
              <button onClick={handleResetFilters} className="flex items-center gap-2 px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm">
                <FilterX size={16} />
                <span>Réinitialiser</span>
              </button>
            </div>
            <div className="mt-4">
              <ActiveFiltersDisplay filters={activeFiltersForDisplay} onRemoveFilter={handleRemoveFilter} onClearAll={handleResetFilters} />
            </div>
        </CardHeader>
        <CardContent ref={scrollContainerRef} className="flex-grow h-0 overflow-auto">
          <ProjectTimeline 
            projects={filteredProjects} 
            zoomLevel={zoomLevel}
            onProjectClick={(projectId) => navigate('/projets', { state: { openProject: projectId } })}
            scrollContainerRef={scrollContainerRef}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectsTimelinePage;