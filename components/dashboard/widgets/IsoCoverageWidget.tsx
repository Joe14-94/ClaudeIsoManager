
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardContent, CardHeader, CardTitle } from '../../ui/Card';
import Tooltip from '../../ui/Tooltip';
import { ISO_MEASURES_DATA } from '../../../constants';
import { IsoMeasure } from '../../../types';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';
import Modal from '../../ui/Modal';
import { ArrowRight, ClipboardList, ListChecks } from 'lucide-react';

interface IsoCoverageWidgetProps {
    isEditMode?: boolean;
    width?: number;
    height?: number;
}

const IsoCoverageWidget: React.FC<IsoCoverageWidgetProps> = ({ isEditMode, width = 0 }) => {
    const { activities, projects } = useData();
    const { userRole } = useAuth();
    const navigate = useNavigate();
    const [selectedIsoMeasure, setSelectedIsoMeasure] = useState<Omit<IsoMeasure, 'id'> | null>(null);

    const allMeasuresMap = useMemo(() => new Map(ISO_MEASURES_DATA.map(m => [m.code, m])), []);

    const handleMeasureClick = (measureCode: string) => {
        if (isEditMode) return;
        const measure = allMeasuresMap.get(measureCode);
        if (measure) setSelectedIsoMeasure(measure);
    };

    const handleNavigateToProject = (e: React.MouseEvent, projectId: string) => {
        e.stopPropagation();
        // Close modal before navigation to prevent state issues
        setSelectedIsoMeasure(null);
        navigate('/projets', { state: { openProject: projectId } });
    };

    const handleNavigateToActivity = (e: React.MouseEvent, activityId: string) => {
        e.stopPropagation();
        // Close modal before navigation to prevent state issues
        setSelectedIsoMeasure(null);
        navigate('/activities', { state: { openActivity: activityId } });
    };

    const coverageMatrix = useMemo(() => {
        const matrix: { [key: string]: { activityCount: number; projectCount: number; } } = {};
        ISO_MEASURES_DATA.forEach(measure => {
            matrix[measure.code] = {
                activityCount: activities.filter(a => a.isoMeasures.includes(measure.code)).length,
                projectCount: projects.filter(p => (p.isoMeasures || []).includes(measure.code)).length,
            };
        });
        return matrix;
    }, [activities, projects]);

    const measuresByChapter = useMemo(() => {
        return ISO_MEASURES_DATA.reduce<Record<string, Omit<IsoMeasure, 'id'>[]>>((acc, measure) => {
            if (!acc[measure.chapter]) acc[measure.chapter] = [];
            acc[measure.chapter].push(measure);
            return acc;
        }, {} as Record<string, Omit<IsoMeasure, 'id'>[]>);
    }, []);

    const getCoverageClasses = (measureCode: string): string => {
        const data = coverageMatrix[measureCode];
        if (!data) return 'bg-slate-200 hover:bg-slate-300';
        const hasActivities = data.activityCount > 0;
        const hasProjects = data.projectCount > 0;
        if (hasActivities && hasProjects) return 'bg-[linear-gradient(to_right,theme(colors.yellow.400)_50%,theme(colors.sky.400)_50%)] hover:opacity-80';
        if (hasActivities) return 'bg-yellow-400 hover:bg-yellow-500';
        if (hasProjects) return 'bg-sky-400 hover:bg-sky-500';
        return 'bg-slate-200 hover:bg-slate-300';
    };

    const boxSize = Math.max(20, Math.floor(width / 30));
    const chapterTitleFontSize = Math.max(14, width / 60);
    const boxCodeFontSize = boxSize / 3;

    // Calcul des éléments liés pour la modale
    const linkedProjects = useMemo(() => {
        if (!selectedIsoMeasure) return [];
        return projects.filter(p => (p.isoMeasures || []).includes(selectedIsoMeasure.code));
    }, [selectedIsoMeasure, projects]);

    const linkedActivities = useMemo(() => {
        if (!selectedIsoMeasure) return [];
        return activities.filter(a => a.isoMeasures.includes(selectedIsoMeasure.code));
    }, [selectedIsoMeasure, activities]);


    return (
        <div className="h-full w-full flex flex-col">
            <CardHeader className="non-draggable">
                <CardTitle>Matrice de couverture ISO 27002</CardTitle>
                <p className="text-sm text-slate-500 mt-1">Survolez une case pour voir le détail, cliquez pour voir les éléments liés.</p>
            </CardHeader>
            <CardContent className="flex-grow overflow-auto">
                {Object.entries(measuresByChapter).map(([chapter, measures]) => (
                    <div key={chapter} className="mb-4">
                        <h4 className="text-md font-semibold text-slate-700 mb-2 non-draggable" style={{ fontSize: `${chapterTitleFontSize}px` }}>{chapter}</h4>
                        <div className="flex flex-wrap gap-1">
                            {(measures as Omit<IsoMeasure, 'id'>[]).slice().sort((a,b) => a.code.localeCompare(b.code, 'en', { numeric: true })).map((measure) => (
                                <Tooltip key={measure.code} text={`${measure.code}: ${measure.title} (Activités: ${coverageMatrix[measure.code]?.activityCount || 0}, Projets: ${coverageMatrix[measure.code]?.projectCount || 0})`}>
                                <div 
                                    style={{ width: `${boxSize}px`, height: `${boxSize}px` }}
                                    className={`flex items-center justify-center rounded font-mono transition-all duration-200 ${getCoverageClasses(measure.code)} ${!isEditMode ? 'cursor-pointer' : ''}`}
                                    onClick={() => handleMeasureClick(measure.code)}
                                >
                                    <span className="text-black/70 mix-blend-hard-light font-medium" style={{ fontSize: `${boxCodeFontSize}px` }}>{measure.code.split('.')[1]}</span>
                                </div>
                                </Tooltip>
                            ))}
                        </div>
                    </div>
                ))}
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 non-draggable">
                    <div className="flex items-center"><span className="w-4 h-4 rounded bg-slate-200 mr-2"></span>Non couvert</div>
                    <div className="flex items-center"><span className="w-4 h-4 rounded bg-yellow-400 mr-2"></span>Activités</div>
                    <div className="flex items-center"><span className="w-4 h-4 rounded bg-sky-400 mr-2"></span>Projets</div>
                    <div className="flex items-center"><span className="w-4 h-4 rounded mr-2" style={{ background: 'linear-gradient(to right, #facc15 50%, #38bdf8 50%)' }}></span>Les deux</div>
                </div>
            </CardContent>
            
            {selectedIsoMeasure && (
                 <Modal
                    isOpen={!!selectedIsoMeasure}
                    onClose={() => setSelectedIsoMeasure(null)}
                    title={`${selectedIsoMeasure.code} - ${selectedIsoMeasure.title}`}
                >
                    <div className="space-y-6">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <h3 className="text-sm font-bold text-slate-800 mb-1 uppercase tracking-wider">Mesure de sécurité</h3>
                            <p className="text-sm text-slate-600 mb-4">{selectedIsoMeasure.details?.measure}</p>
                            
                            <h3 className="text-sm font-bold text-slate-800 mb-1 uppercase tracking-wider">Objectif</h3>
                            <p className="text-sm text-slate-600">{selectedIsoMeasure.details?.objective}</p>
                        </div>

                        <div>
                            <h3 className="text-md font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                <ClipboardList size={18} className="text-blue-600"/>
                                Projets liés ({linkedProjects.length})
                            </h3>
                            {linkedProjects.length > 0 ? (
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {linkedProjects.map(project => (
                                        <div 
                                            key={project.id} 
                                            onClick={(e) => handleNavigateToProject(e, project.id)}
                                            className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-md hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors group"
                                        >
                                            <div>
                                                <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 mr-2">{project.projectId}</span>
                                                <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">{project.title}</span>
                                            </div>
                                            <ArrowRight size={16} className="text-slate-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 italic pl-1">Aucun projet associé à cette mesure.</p>
                            )}
                        </div>

                        <div>
                            <h3 className="text-md font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                <ListChecks size={18} className="text-yellow-600"/>
                                Activités liées ({linkedActivities.length})
                            </h3>
                            {linkedActivities.length > 0 ? (
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {linkedActivities.map(activity => (
                                        <div 
                                            key={activity.id} 
                                            onClick={(e) => handleNavigateToActivity(e, activity.id)}
                                            className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-md hover:bg-yellow-50 hover:border-yellow-300 cursor-pointer transition-colors group"
                                        >
                                            <div>
                                                <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 mr-2">{activity.activityId}</span>
                                                <span className="text-sm font-medium text-slate-700 group-hover:text-yellow-700">{activity.title}</span>
                                            </div>
                                            <ArrowRight size={16} className="text-slate-400 group-hover:text-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 italic pl-1">Aucune activité associée à cette mesure.</p>
                            )}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
export default IsoCoverageWidget;
