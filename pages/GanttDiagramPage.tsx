
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import AdvancedGanttChart from '../components/gantt/AdvancedGanttChart';
import Card, { CardContent } from '../components/ui/Card';

const GanttDiagramPage: React.FC = () => {
  const { projects, resources } = useData();
  const navigate = useNavigate();
  
  // Filtrer uniquement les projets qui ont des dates et qui ne sont pas des projets techniques
  const validProjects = projects.filter(p => 
    p.projectId !== 'TOTAL_GENERAL' && 
    p.projectStartDate && 
    p.projectEndDate
  );

  const handleProjectClick = (projectId: string) => {
    navigate('/projets', { state: { openProject: projectId } });
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Diagramme de Gantt</h1>
          <p className="text-slate-600 mt-1">
            Visualisation détaillée du planning des projets, tâches et dépendances.
          </p>
        </div>
      </div>
      
      <Card className="flex-grow flex flex-col min-h-0 overflow-hidden">
        <CardContent className="p-0 h-full flex flex-col">
          {validProjects.length > 0 ? (
             <AdvancedGanttChart 
                projects={validProjects} 
                resources={resources} 
                onProjectClick={handleProjectClick}
             />
          ) : (
             <div className="flex items-center justify-center h-full text-slate-500">
                Aucun projet avec des dates valides à afficher.
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GanttDiagramPage;
