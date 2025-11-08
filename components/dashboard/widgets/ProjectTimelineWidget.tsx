import React, { useState, useRef } from 'react';
import { CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { useData } from '../../../contexts/DataContext';
import ProjectTimeline from '../../charts/ProjectTimeline';
import { useNavigate } from 'react-router-dom';
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

const ProjectTimelineWidget: React.FC = () => {
  const { projects } = useData();
  const navigate = useNavigate();
  const [zoomLevel, setZoomLevel] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev * 1.5, 8));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev / 1.5, 0.25));
  const handleZoomReset = () => setZoomLevel(1);

  return (
    <div className="h-full w-full flex flex-col">
      <CardHeader className="non-draggable flex justify-between items-center">
        <CardTitle>Timeline des projets</CardTitle>
        <div className="flex items-center gap-1">
            <button onClick={handleZoomOut} title="Dézoomer" className="p-1 rounded-md hover:bg-slate-100 text-slate-500"><ZoomOut size={16} /></button>
            <button onClick={handleZoomIn} title="Zoomer" className="p-1 rounded-md hover:bg-slate-100 text-slate-500"><ZoomIn size={16} /></button>
            <button onClick={handleZoomReset} title="Réinitialiser" className="p-1 rounded-md hover:bg-slate-100 text-slate-500"><RotateCw size={14} /></button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto" ref={scrollContainerRef}>
        <ProjectTimeline 
            projects={projects} 
            zoomLevel={zoomLevel}
            onProjectClick={(projectId) => navigate('/projets', { state: { openProject: projectId } })}
            scrollContainerRef={scrollContainerRef}
        />
      </CardContent>
    </div>
  );
};

export default ProjectTimelineWidget;
