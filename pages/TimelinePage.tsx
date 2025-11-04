import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import ActivityTimeline from '../components/charts/ActivityTimeline';
import { useData } from '../contexts/DataContext';
import { SecurityDomain, ActivityStatus, Priority } from '../types';
import { ZoomIn, ZoomOut, RotateCw, FilterX } from 'lucide-react';

const TimelinePage: React.FC = () => {
  const { activities } = useData();
  const navigate = useNavigate();

  const [domainFilter, setDomainFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      return (
        (domainFilter === '' || activity.securityDomain === domainFilter) &&
        (statusFilter === '' || activity.status === statusFilter) &&
        (priorityFilter === '' || activity.priority === priorityFilter)
      );
    });
  }, [activities, domainFilter, statusFilter, priorityFilter]);

  const handleResetFilters = () => {
    setDomainFilter('');
    setStatusFilter('');
    setPriorityFilter('');
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev * 1.5, 8)); // Max zoom
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev / 1.5, 0.25)); // Min zoom
  const handleZoomReset = () => setZoomLevel(1);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <h1 className="text-3xl font-bold text-slate-800">Timeline des activités</h1>
      <p className="text-slate-600">
        Vue chronologique des activités planifiées. Filtrez, zoomez et cliquez sur une activité pour voir ses détails.
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
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                aria-label="Filtrer par domaine"
              >
                <option value="">Tous les domaines</option>
                {Object.values(SecurityDomain).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
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
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                aria-label="Filtrer par priorité"
              >
                <option value="">Toutes les priorités</option>
                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <button onClick={handleResetFilters} className="flex items-center gap-2 px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm">
                <FilterX size={16} />
                <span>Réinitialiser</span>
              </button>
            </div>
        </CardHeader>
        <CardContent className="flex-grow h-0 overflow-auto">
          <ActivityTimeline 
            activities={filteredActivities} 
            zoomLevel={zoomLevel}
            onActivityClick={(activityId) => navigate('/activities', { state: { openActivity: activityId } })}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TimelinePage;
