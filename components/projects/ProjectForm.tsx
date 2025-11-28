
import React, { useMemo, useState, useEffect } from 'react';
import { Project, ProjectStatus, TShirtSize, ProjectCategory, ProjectWeather, ProjectMilestone, MilestoneHistoryEntry, ProjectTask } from '../../types';
import { ISO_MEASURES_DATA } from '../../constants';
import { useData } from '../../contexts/DataContext';
import { Search, PlusCircle, Trash2, Flag, Calculator, Info, Link, ListTree, Calendar, ChevronRight, ChevronDown, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CalendarDatePicker from '../ui/CalendarDatePicker';
import CustomMultiSelect from '../ui/CustomMultiSelect';
import Tooltip from '../ui/Tooltip';
import { hasCycle } from '../../utils/projectAnalysis';

interface ProjectFormProps {
    currentProject: Partial<Project>;
    setCurrentProject: React.Dispatch<React.SetStateAction<Partial<Project> | null>>;
    isReadOnly: boolean;
    handleSave: (e: React.FormEvent) => void;
    handleCloseModal: () => void;
}

const WEATHER_ICONS = {
    [ProjectWeather.SUNNY]: '☀️',
    [ProjectWeather.CLOUDY]: '☁️',
    [ProjectWeather.RAINY]: '🌧️',
    [ProjectWeather.STORM]: '⛈️',
};

const BetaBadge = () => (
  <span className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-full align-middle">BETA</span>
);

// --- Composant Éditeur WBS (Work Breakdown Structure) ---

interface WbsEditorProps {
    tasks: ProjectTask[];
    onChange: (newTasks: ProjectTask[]) => void;
    isReadOnly: boolean;
    resources: any[];
}

const WbsEditor: React.FC<WbsEditorProps> = ({ tasks, onChange, isReadOnly, resources }) => {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const toggleExpand = (id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const updateTaskRecursive = (list: ProjectTask[], id: string, updates: Partial<ProjectTask>): ProjectTask[] => {
        return list.map(t => {
            if (t.id === id) return { ...t, ...updates };
            if (t.children) return { ...t, children: updateTaskRecursive(t.children, id, updates) };
            return t;
        });
    };

    const addTaskRecursive = (list: ProjectTask[], parentId: string | null, newTask: ProjectTask): ProjectTask[] => {
        if (parentId === null) {
            return [...list, newTask];
        }
        return list.map(t => {
            if (t.id === parentId) {
                return { ...t, children: [...(t.children || []), newTask] };
            }
            if (t.children) {
                return { ...t, children: addTaskRecursive(t.children, parentId, newTask) };
            }
            return t;
        });
    };

    const deleteTaskRecursive = (list: ProjectTask[], id: string): ProjectTask[] => {
        return list.filter(t => t.id !== id).map(t => ({
            ...t,
            children: t.children ? deleteTaskRecursive(t.children, id) : undefined
        }));
    };

    const handleUpdate = (id: string, field: keyof ProjectTask, value: any) => {
        const newTasks = updateTaskRecursive(tasks, id, { [field]: value });
        onChange(newTasks);
    };

    const handleDelete = (id: string) => {
        if (confirm("Supprimer cette tâche et ses sous-tâches ?")) {
            const newTasks = deleteTaskRecursive(tasks, id);
            onChange(newTasks);
        }
    };

    const handleAdd = (parentId: string | null) => {
        const newTask: ProjectTask = {
            id: `t-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: parentId ? "Nouvelle tâche" : "Nouvelle phase",
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
            progress: 0,
            status: 'A faire' as any, // Casting simple pour éviter d'importer l'enum ici si non nécessaire
            children: []
        };
        const newTasks = addTaskRecursive(tasks, parentId, newTask);
        if (parentId) setExpanded(prev => ({ ...prev, [parentId]: true }));
        onChange(newTasks);
    };

    const renderRow = (task: ProjectTask, level: number, parentIndexString: string) => {
        const hasChildren = task.children && task.children.length > 0;
        const isExpanded = expanded[task.id] ?? true; // Par défaut étendu

        return (
            <React.Fragment key={task.id}>
                <div className={`flex items-center gap-2 py-1 border-b border-slate-100 hover:bg-slate-50 ${level === 0 ? 'bg-slate-50/50' : ''}`}>
                    {/* Indentation & Expand */}
                    <div className="flex items-center w-48 pl-2 flex-shrink-0">
                         <div style={{ width: level * 16 }}></div>
                         <button 
                            type="button"
                            onClick={() => toggleExpand(task.id)} 
                            className={`p-1 mr-1 rounded hover:bg-slate-200 ${!hasChildren ? 'invisible' : ''}`}
                         >
                             {isExpanded ? <ChevronDown size={12}/> : <ChevronRight size={12}/>}
                         </button>
                         <input 
                            type="text" 
                            value={task.name} 
                            onChange={(e) => handleUpdate(task.id, 'name', e.target.value)}
                            className={`w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 rounded px-1 py-0.5 text-sm ${level === 0 ? 'font-semibold text-slate-800' : 'text-slate-600'}`}
                            readOnly={isReadOnly}
                         />
                    </div>

                    {/* Dates */}
                    <div className="w-32 flex-shrink-0">
                        <input 
                            type="date" 
                            value={task.startDate ? task.startDate.split('T')[0] : ''}
                            onChange={(e) => handleUpdate(task.id, 'startDate', e.target.value + 'T00:00:00Z')}
                            className="w-full text-xs border border-transparent hover:border-slate-300 rounded px-1 bg-transparent text-slate-600"
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="w-32 flex-shrink-0">
                        <input 
                            type="date" 
                            value={task.endDate ? task.endDate.split('T')[0] : ''}
                            onChange={(e) => handleUpdate(task.id, 'endDate', e.target.value + 'T00:00:00Z')}
                            className="w-full text-xs border border-transparent hover:border-slate-300 rounded px-1 bg-transparent text-slate-600"
                            readOnly={isReadOnly}
                        />
                    </div>

                    {/* Progress */}
                    <div className="w-20 flex-shrink-0 flex items-center">
                        <input 
                            type="number" 
                            min="0" max="100"
                            value={task.progress}
                            onChange={(e) => handleUpdate(task.id, 'progress', parseInt(e.target.value))}
                            className="w-12 text-xs border border-transparent hover:border-slate-300 rounded px-1 bg-transparent text-right text-slate-600"
                            readOnly={isReadOnly}
                        />
                        <span className="text-xs text-slate-400 ml-1">%</span>
                    </div>
                    
                    {/* Assignee */}
                    <div className="w-32 flex-shrink-0">
                        <select 
                            value={task.assigneeId || ''} 
                            onChange={(e) => handleUpdate(task.id, 'assigneeId', e.target.value)}
                            className="w-full text-xs border border-transparent hover:border-slate-300 rounded px-1 bg-transparent text-slate-600 truncate"
                            disabled={isReadOnly}
                        >
                            <option value="">Non assigné</option>
                            {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>

                    {/* Actions */}
                    {!isReadOnly && (
                        <div className="flex items-center gap-1 ml-auto pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Tooltip text="Ajouter une sous-tâche">
                                <button type="button" onClick={() => handleAdd(task.id)} className="p-1 text-blue-600 hover:bg-blue-100 rounded"><Plus size={14}/></button>
                             </Tooltip>
                             <Tooltip text="Supprimer">
                                <button type="button" onClick={() => handleDelete(task.id)} className="p-1 text-red-600 hover:bg-red-100 rounded"><Trash2 size={14}/></button>
                             </Tooltip>
                        </div>
                    )}
                </div>
                {hasChildren && isExpanded && (
                    <div>
                        {task.children!.map((child, idx) => renderRow(child, level + 1, `${parentIndexString}.${idx + 1}`))}
                    </div>
                )}
            </React.Fragment>
        );
    };

    return (
        <div className="border border-slate-200 rounded-md overflow-hidden flex flex-col">
             <div className="flex items-center bg-slate-100 py-2 px-2 text-xs font-semibold text-slate-600 border-b border-slate-200">
                <div className="w-48 pl-2">Nom</div>
                <div className="w-32">Début</div>
                <div className="w-32">Fin</div>
                <div className="w-20">Avanc.</div>
                <div className="w-32">Responsable</div>
                <div className="ml-auto"></div>
            </div>
            <div className="bg-white max-h-80 overflow-y-auto">
                {tasks.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm italic">
                        Aucune tâche définie. Commencez par ajouter une phase.
                    </div>
                ) : (
                    tasks.map((task, idx) => (
                        <div key={task.id} className="group">
                            {renderRow(task, 0, `${idx + 1}`)}
                        </div>
                    ))
                )}
            </div>
            {!isReadOnly && (
                <div className="p-2 bg-slate-50 border-t border-slate-200">
                    <button 
                        type="button" 
                        onClick={() => handleAdd(null)}
                        className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:bg-blue-100 px-3 py-1.5 rounded transition-colors w-fit"
                    >
                        <PlusCircle size={16} />
                        Ajouter une phase principale
                    </button>
                </div>
            )}
        </div>
    );
};


const ProjectForm: React.FC<ProjectFormProps> = ({ currentProject, setCurrentProject, isReadOnly, handleSave, handleCloseModal }) => {
    const { resources, initiatives, majorRisks, projects } = useData();
    const [isoSearchTerm, setIsoSearchTerm] = useState('');
    const navigate = useNavigate();

    const inputClassName = "w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-colors";
    const textareaClassName = "w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-colors resize-none";
    const numberInputClassName = "w-full px-2 py-1 border border-slate-300 rounded bg-white text-slate-900 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-colors";
    const readOnlyInputClassName = "w-full px-2 py-1 border border-slate-300 rounded bg-slate-50 text-slate-700 text-sm font-semibold text-right";

    useEffect(() => {
        if (currentProject) {
            const impact = currentProject.strategicImpact || 1;
            const risk = currentProject.riskCoverage || 1;
            const effort = currentProject.effort || 1;
            const calculatedScore = parseFloat(((impact * risk * 10) / (effort * 2)).toFixed(1));
            if (currentProject.priorityScore !== calculatedScore) {
                 setCurrentProject(prev => prev ? ({...prev, priorityScore: calculatedScore}) : null);
            }
        }
    }, [currentProject?.strategicImpact, currentProject?.riskCoverage, currentProject?.effort, setCurrentProject]);

    const filteredIsoOptions = useMemo(() => {
        const options = ISO_MEASURES_DATA.map(m => ({
          value: m.code,
          label: `${m.code} - ${m.title}`,
          tooltip: m.details?.measure
        }));
        if (!isoSearchTerm) return options;
        return options.filter(opt => opt.label.toLowerCase().includes(isoSearchTerm.toLowerCase()));
    }, [isoSearchTerm]);
    
    const predecessorOptions = useMemo(() => {
        return projects
            .filter(p => {
                if (p.id === currentProject.id) return false;
                if (p.projectId === 'TOTAL_GENERAL') return false;
                return true; 
            })
            .map(p => ({
                value: p.id,
                label: `${p.projectId} - ${p.title}`,
                tooltip: p.status
            }));
    }, [projects, currentProject.id]);

    const handleCustomMultiSelectChange = (name: string, value: string[]) => {
        if (name === 'predecessorIds' && currentProject.id) {
            const hasCyclicDependency = value.some(targetId => hasCycle(projects, targetId, currentProject.id!));
            if (hasCyclicDependency) {
                alert("Impossible d'ajouter cette dépendance : cela créerait une boucle infinie (cycle).");
                return;
            }
        }
        setCurrentProject(prev => prev ? ({ ...prev, [name]: value }) : null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const isNumber = type === 'number' || type === 'range';
        setCurrentProject(prev => {
            if (!prev) return null;
            if (isCheckbox) return { ...prev, [name]: (e.target as HTMLInputElement).checked };
            if (isNumber) return { ...prev, [name]: value === '' ? undefined : parseFloat(value) };
            return { ...prev, [name]: value };
        });
    };
    
    const handleTasksChange = (newTasks: ProjectTask[]) => {
        setCurrentProject(prev => {
            if (!prev) return null;
            
            // Calcul automatique des dates du projet basées sur les tâches
            // Trouver la date min et max parmi toutes les tâches
            let minStart = prev.projectStartDate ? new Date(prev.projectStartDate).getTime() : Infinity;
            let maxEnd = prev.projectEndDate ? new Date(prev.projectEndDate).getTime() : 0;
            let hasTasks = false;

            const traverse = (list: ProjectTask[]) => {
                list.forEach(t => {
                    hasTasks = true;
                    const s = new Date(t.startDate).getTime();
                    const e = new Date(t.endDate).getTime();
                    if (s < minStart) minStart = s;
                    if (e > maxEnd) maxEnd = e;
                    if (t.children) traverse(t.children);
                });
            };
            traverse(newTasks);
            
            let updates: Partial<Project> = { tasks: newTasks };
            
            if (hasTasks && minStart !== Infinity && maxEnd !== 0) {
                // Optionnel : Mise à jour auto des dates du projet si on veut que le projet s'adapte aux tâches
                // updates.projectStartDate = new Date(minStart).toISOString();
                // updates.projectEndDate = new Date(maxEnd).toISOString();
            }

            return { ...prev, ...updates };
        });
    };

    const handleMilestoneAdd = () => {
        setCurrentProject(prev => {
            if (!prev) return null;
            const newMilestone: ProjectMilestone = { 
                id: `ms-${Date.now()}`, 
                label: 'Nouveau jalon', 
                date: new Date().toISOString(), 
                initialDate: new Date().toISOString(),
                completed: false,
                dependencyIds: [],
                history: []
            };
            const newMilestones = [...(prev.milestones || []), newMilestone];
            return { ...prev, milestones: newMilestones };
        });
    };

    const handleMilestoneChange = (id: string, field: keyof ProjectMilestone, value: any) => {
         setCurrentProject(prev => {
            if (!prev || !prev.milestones) return prev;
            const newMilestones = prev.milestones.map(m => {
                if (m.id === id) {
                    if (field === 'date') {
                        // Si la date change, on historise l'ancienne
                        const oldDate = m.date;
                        if (oldDate !== value) {
                            const historyEntry: MilestoneHistoryEntry = {
                                updatedAt: new Date().toISOString(),
                                previousDate: oldDate,
                                newDate: value
                            };
                            return { ...m, date: value, history: [...(m.history || []), historyEntry] };
                        }
                    }
                    return { ...m, [field]: value };
                }
                return m;
            });
            return { ...prev, milestones: newMilestones };
        });
    };

    const handleMilestoneDelete = (id: string) => {
        setCurrentProject(prev => {
            if (!prev || !prev.milestones) return prev;
            const newMilestones = prev.milestones.filter(m => m.id !== id);
            return { ...prev, milestones: newMilestones };
        });
    };
    
    const getMilestoneOptions = (currentMilestoneId: string) => {
        return (currentProject.milestones || [])
            .filter(m => m.id !== currentMilestoneId)
            .map(m => ({ value: m.id, label: m.label, tooltip: `Date: ${new Date(m.date).toLocaleDateString()}` }));
    };
    
    const { workloadTotals, budgetCalculations } = useMemo(() => {
        const p = currentProject;
        if (!p) return { workloadTotals: { totalRequested: 0, totalEngaged: 0, totalConsumed: 0, totalProgress: 0 }, budgetCalculations: { availableBudget: 0, budgetCommitmentRate: 0, budgetCompletionRate: 0, forecastedAvailableBudget: 0 }};

        const totalEngaged = (p.internalWorkloadEngaged || 0) + (p.externalWorkloadEngaged || 0);
        const totalConsumed = (p.internalWorkloadConsumed || 0) + (p.externalWorkloadConsumed || 0);
        
        const workloadTotals = {
            totalRequested: (p.internalWorkloadRequested||0) + (p.externalWorkloadRequested||0),
            totalEngaged: totalEngaged,
            totalConsumed: totalConsumed,
            totalProgress: totalEngaged > 0 ? Math.round((totalConsumed / totalEngaged) * 100) : 0,
        };
        
        const budgetApproved = Number(p.budgetApproved) || 0;
        const budgetCommitted = Number(p.budgetCommitted) || 0;
        const completedPV = Number(p.completedPV) || 0;
        const forecastedPurchaseOrders = Number(p.forecastedPurchaseOrders) || 0;

        const budgetCalculations = {
            availableBudget: budgetApproved - budgetCommitted,
            budgetCommitmentRate: budgetApproved > 0 ? Math.round((budgetCommitted / budgetApproved) * 100) : 0,
            budgetCompletionRate: budgetCommitted > 0 ? Math.round((completedPV / budgetCommitted) * 100) : 0,
            forecastedAvailableBudget: budgetApproved - (budgetCommitted + forecastedPurchaseOrders),
        };
        return { workloadTotals, budgetCalculations };
    }, [currentProject]);

    if (!currentProject) return null;

    return (
        <form onSubmit={handleSave} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div><label htmlFor="projectId" className="block text-sm font-medium text-slate-700 mb-1">ID projet</label><input type="text" name="projectId" value={currentProject.projectId || ''} onChange={handleChange} required readOnly={isReadOnly} className={inputClassName} /></div>
                    <div><label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Titre</label><input type="text" name="title" value={currentProject.title || ''} onChange={handleChange} required readOnly={isReadOnly} className={inputClassName} /></div>
                </div>
                <div className="w-full md:w-auto bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <label className="mb-2 block text-center font-semibold text-slate-700 text-sm">Météo du projet</label>
                    <div className="flex justify-center gap-4">
                        {Object.values(ProjectWeather).map(w => (
                            <label key={w} className={`cursor-pointer p-2 rounded-md transition-all ${currentProject.weather === w ? 'bg-white shadow-md ring-2 ring-blue-400 scale-110' : 'hover:bg-white/50 opacity-50 hover:opacity-100'}`}>
                                <input type="radio" name="weather" value={w} checked={currentProject.weather === w} onChange={() => setCurrentProject(prev => prev ? ({...prev, weather: w}) : null)} className="sr-only" disabled={isReadOnly}/>
                                <Tooltip text={w}><span className="text-2xl">{WEATHER_ICONS[w]}</span></Tooltip>
                            </label>
                        ))}
                    </div>
                    <textarea name="weatherDescription" placeholder="Commentaire météo..." value={currentProject.weatherDescription || ''} onChange={handleChange} rows={2} className="mt-2 w-full text-xs p-2 border border-slate-300 rounded bg-white text-slate-900 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none" readOnly={isReadOnly}/>
                </div>
            </div>
            
            <div><label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description</label><textarea name="description" value={currentProject.description || ''} onChange={handleChange} rows={2} readOnly={isReadOnly} className={textareaClassName} /></div>
            
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-800">Score de priorité & arbitrage <BetaBadge /></h3>
               <Tooltip text="Guide d'évaluation (Échelle 1 à 5) :&#10;• Impact : Alignement stratégique&#10;• Risque : Efficacité de réduction des risques&#10;• Effort : Complexité et coût"><Info size={18} className="text-slate-500 cursor-help" /></Tooltip>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-indigo-900 flex items-center gap-2"><Calculator size={20} /> Score de priorité & arbitrage</h3>
                    <div className="text-2xl font-bold text-indigo-600 bg-white px-4 py-1 rounded shadow-sm border border-indigo-100">Score: {currentProject.priorityScore}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div><label className="flex justify-between text-sm font-medium text-indigo-900 mb-1">Impact stratégique <span className="font-bold">{currentProject.strategicImpact}</span></label><input type="range" name="strategicImpact" min="1" max="5" step="0.5" value={currentProject.strategicImpact || 3} onChange={handleChange} disabled={isReadOnly} className="w-full accent-indigo-600 cursor-pointer"/><div className="flex justify-between text-xs text-indigo-500 mt-1"><span>Faible</span><span>Fort</span></div></div>
                    <div><label className="flex justify-between text-sm font-medium text-indigo-900 mb-1">Couverture du risque <span className="font-bold">{currentProject.riskCoverage}</span></label><input type="range" name="riskCoverage" min="1" max="5" step="0.5" value={currentProject.riskCoverage || 3} onChange={handleChange} disabled={isReadOnly} className="w-full accent-indigo-600 cursor-pointer"/><div className="flex justify-between text-xs text-indigo-500 mt-1"><span>Faible</span><span>Forte</span></div></div>
                    <div><label className="flex justify-between text-sm font-medium text-indigo-900 mb-1">Effort de mise en œuvre <span className="font-bold">{currentProject.effort}</span></label><input type="range" name="effort" min="1" max="5" step="0.5" value={currentProject.effort || 3} onChange={handleChange} disabled={isReadOnly} className="w-full accent-indigo-600 cursor-pointer"/><div className="flex justify-between text-xs text-indigo-500 mt-1"><span>Faible</span><span>Conséquent</span></div></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div><label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">Statut</label><select name="status" value={currentProject.status} onChange={handleChange} disabled={isReadOnly} className={inputClassName}>{Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                <div><label htmlFor="tShirtSize" className="block text-sm font-medium text-slate-700 mb-1">Taille</label><select name="tShirtSize" value={currentProject.tShirtSize} onChange={handleChange} disabled={isReadOnly} className={inputClassName}>{Object.values(TShirtSize).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                 <div><label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label><select name="category" value={currentProject.category} onChange={handleChange} disabled={isReadOnly} className={inputClassName}>{Object.values(ProjectCategory).map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label htmlFor="initiativeId" className="block text-sm font-medium text-slate-700 mb-1">Initiative de rattachement</label><select name="initiativeId" id="initiativeId" value={currentProject.initiativeId || ''} onChange={handleChange} disabled={isReadOnly} required className={inputClassName}><option value="" disabled>Sélectionner une initiative</option>{initiatives.map(i => <option key={i.id} value={i.id}>{i.code} - {i.label}</option>)}</select></div>
                 <div className="flex items-center h-full pt-6">
                     <label htmlFor="isTop30" className="flex items-center cursor-pointer group">
                        <input id="isTop30" name="isTop30" type="checkbox" checked={currentProject.isTop30 || false} onChange={handleChange} disabled={isReadOnly} className="sr-only peer"/>
                        <div className={`w-5 h-5 border rounded flex-shrink-0 flex items-center justify-center transition-colors ${isReadOnly ? 'bg-slate-100 border-slate-300 cursor-not-allowed' : 'bg-white border-slate-400 group-hover:border-blue-500'} peer-checked:bg-blue-600 peer-checked:border-blue-600`}><svg className="hidden peer-checked:block w-3.5 h-3.5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" /></svg></div>
                        <span className="ml-2 text-sm font-medium text-slate-700 group-hover:text-slate-900">Projet Top30</span>
                    </label>
                </div>
            </div>
            
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mesures ISO</label>
                 <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="Rechercher par code ou titre..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={isoSearchTerm} onChange={(e) => setIsoSearchTerm(e.target.value)} disabled={isReadOnly}/>
                </div>
                <CustomMultiSelect label="" name="isoMeasures" options={filteredIsoOptions} selectedValues={currentProject.isoMeasures || []} onChange={handleCustomMultiSelectChange} disabled={isReadOnly} heightClass="h-32"/>
            </div>
            
            <div>
                <div className="mb-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Couverture des risques majeurs <BetaBadge /></label>
                     <CustomMultiSelect label="" name="majorRiskIds" options={majorRisks.map(r => ({ value: r.id, label: r.label, tooltip: r.description }))} selectedValues={currentProject.majorRiskIds || []} onChange={handleCustomMultiSelectChange} disabled={isReadOnly} heightClass="h-32"/>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label htmlFor="projectManagerMOA" className="block text-sm font-medium text-slate-700 mb-1">Chef de projet MOA</label><select name="projectManagerMOA" value={currentProject.projectManagerMOA || ''} onChange={handleChange} disabled={isReadOnly} className={inputClassName}><option value="">Non assigné</option>{resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
                <div><label htmlFor="projectManagerMOE" className="block text-sm font-medium text-slate-700 mb-1">Chef de projet MOE</label><select name="projectManagerMOE" value={currentProject.projectManagerMOE || ''} onChange={handleChange} disabled={isReadOnly} className={inputClassName}><option value="">Non assigné</option>{resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
            </div>
            
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-700">Planning & Dépendances</h4>
                     <Tooltip text="Les dépendances 'Fin à Début' indiquent que ce projet ne peut commencer que lorsque ses prédécesseurs sont terminés."><Info size={16} className="text-slate-400 cursor-help" /></Tooltip>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label htmlFor="projectStartDate" className="block text-sm font-medium text-slate-700 mb-1">Début projet</label><CalendarDatePicker id="projectStartDate" name="projectStartDate" value={currentProject.projectStartDate?.split('T')[0] || ''} onChange={handleChange} readOnly={isReadOnly} /></div>
                    <div><label htmlFor="projectEndDate" className="block text-sm font-medium text-slate-700 mb-1">Fin projet</label><CalendarDatePicker id="projectEndDate" name="projectEndDate" value={currentProject.projectEndDate?.split('T')[0] || ''} onChange={handleChange} readOnly={isReadOnly} /></div>
                    <div><label htmlFor="goLiveDate" className="block text-sm font-medium text-slate-700 mb-1">Mise en service (NO)</label><CalendarDatePicker id="goLiveDate" name="goLiveDate" value={currentProject.goLiveDate?.split('T')[0] || ''} onChange={handleChange} readOnly={isReadOnly} /></div>
                    <div><label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-1">Clôture (NF)</label><CalendarDatePicker id="endDate" name="endDate" value={currentProject.endDate?.split('T')[0] || ''} onChange={handleChange} readOnly={isReadOnly} /></div>
                    
                    <div className="col-span-1 md:col-span-2 mt-2 pt-2 border-t border-slate-200">
                        <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2"><Link size={16} className="text-slate-500" /> Dépendances (Prédécesseurs)</label>
                        <CustomMultiSelect label="" name="predecessorIds" options={predecessorOptions} selectedValues={currentProject.predecessorIds || []} onChange={handleCustomMultiSelectChange} disabled={isReadOnly} heightClass="h-32"/>
                         <p className="text-xs text-slate-500 mt-1 italic">Sélectionnez les projets qui doivent être terminés avant que celui-ci ne puisse commencer (Relation Fin-Début).</p>
                    </div>
                </div>
            </div>
            
            {/* Structure du Projet (Tasks / WBS) */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-slate-700 flex items-center gap-2"><ListTree size={16} /> Structure du projet (Phases & Tâches)</h4>
                     {!isReadOnly && currentProject.id && (
                        <button type="button" onClick={() => { handleCloseModal(); navigate('/projects-gantt'); }} className="text-xs flex items-center gap-1 bg-white border border-slate-300 px-2 py-1 rounded hover:bg-slate-100 text-blue-600 shadow-sm transition-colors">
                            <Calendar size={14} /> Vue Gantt complète
                        </button>
                     )}
                </div>
                
                <WbsEditor 
                    tasks={currentProject.tasks || []} 
                    onChange={handleTasksChange} 
                    isReadOnly={isReadOnly}
                    resources={resources}
                />
            </div>

            
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-slate-700 flex items-center gap-2"><Flag size={16} /> Jalons clés <BetaBadge /></h4>
                    {!isReadOnly && ( <button type="button" onClick={handleMilestoneAdd} className="text-xs flex items-center gap-1 bg-white border border-slate-300 px-2 py-1 rounded hover:bg-slate-100 text-blue-600 shadow-sm transition-colors"><PlusCircle size={14} /> Ajouter un jalon</button> )}
                </div>
                {currentProject.milestones && currentProject.milestones.length > 0 ? (
                    <div className="space-y-3">
                        {currentProject.milestones.map((ms, idx) => (
                            <div key={ms.id} className="flex flex-col gap-2 bg-white p-3 rounded border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <label className="flex items-center cursor-pointer"><input type="checkbox" checked={ms.completed} onChange={(e) => handleMilestoneChange(ms.id, 'completed', e.target.checked)} disabled={isReadOnly} className="sr-only"/>
                                        <div className={`w-4 h-4 border rounded flex-shrink-0 flex items-center justify-center transition-colors bg-white ${ms.completed ? 'bg-green-600 border-green-600' : 'border-slate-300 hover:border-green-500'} ${isReadOnly ? 'cursor-not-allowed opacity-60' : ''}`}>{ms.completed && (<svg className="w-3 h-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" /></svg>)}</div>
                                    </label>
                                    <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <input type="text" value={ms.label} onChange={(e) => handleMilestoneChange(ms.id, 'label', e.target.value)} placeholder="Nom du jalon" readOnly={isReadOnly} className="text-sm p-1 border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none bg-transparent font-medium transition-colors"/>
                                        <div className="w-40"><CalendarDatePicker id={`ms-date-${ms.id}`} name={`ms-date-${ms.id}`} value={ms.date ? ms.date.split('T')[0] : ''} onChange={(e) => handleMilestoneChange(ms.id, 'date', e.target.value)} readOnly={isReadOnly}/></div>
                                    </div>
                                    {!isReadOnly && (<button type="button" onClick={() => handleMilestoneDelete(ms.id)} className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"><Trash2 size={16} /></button>)}
                                </div>
                                {/* Dépendances du jalon */}
                                <div className="pl-6 text-xs text-slate-500">
                                    <CustomMultiSelect 
                                        label="Dépendances (Jalons précédents)" 
                                        name="milestoneDependencies" 
                                        options={getMilestoneOptions(ms.id)} 
                                        selectedValues={ms.dependencyIds || []} 
                                        onChange={(name, value) => handleMilestoneChange(ms.id, 'dependencyIds', value)}
                                        disabled={isReadOnly}
                                        heightClass="h-20"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (<p className="text-xs text-slate-400 italic text-center py-2">Aucun jalon défini.</p>)}
            </div>
            
            <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-xl font-semibold text-slate-800">Charges (en J/H)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
                    <div><h4 className="text-sm font-bold text-slate-700 mb-2 border-b border-slate-200 pb-1">Charge Interne</h4><div className="space-y-3"><div><label className="block text-xs text-slate-500 mb-1">Demandée</label><input type="number" name="internalWorkloadRequested" value={currentProject.internalWorkloadRequested || ''} onChange={handleChange} readOnly={isReadOnly} min="0" className={numberInputClassName}/></div><div><label className="block text-xs text-slate-500 mb-1">Engagée</label><input type="number" name="internalWorkloadEngaged" value={currentProject.internalWorkloadEngaged || ''} onChange={handleChange} readOnly={isReadOnly} min="0" className={numberInputClassName}/></div><div><label className="block text-xs text-slate-500 mb-1">Consommée</label><input type="number" name="internalWorkloadConsumed" value={currentProject.internalWorkloadConsumed || ''} onChange={handleChange} readOnly={isReadOnly} min="0" className={numberInputClassName}/></div></div></div>
                     <div><h4 className="text-sm font-bold text-slate-700 mb-2 border-b border-slate-200 pb-1">Charge Externe</h4><div className="space-y-3"><div><label className="block text-xs text-slate-500 mb-1">Demandée</label><input type="number" name="externalWorkloadRequested" value={currentProject.externalWorkloadRequested || ''} onChange={handleChange} readOnly={isReadOnly} min="0" className={numberInputClassName}/></div><div><label className="block text-xs text-slate-500 mb-1">Engagée</label><input type="number" name="externalWorkloadEngaged" value={currentProject.externalWorkloadEngaged || ''} onChange={handleChange} readOnly={isReadOnly} min="0" className={numberInputClassName}/></div><div><label className="block text-xs text-slate-500 mb-1">Consommée</label><input type="number" name="externalWorkloadConsumed" value={currentProject.externalWorkloadConsumed || ''} onChange={handleChange} readOnly={isReadOnly} min="0" className={numberInputClassName}/></div></div></div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end p-4 border border-blue-100 rounded-lg bg-blue-50/50">
                    <div className="col-span-full font-semibold text-blue-800 border-b border-blue-100 pb-1 mb-1">Total charges projet</div>
                    <div><label className="block text-xs text-slate-500 mb-1">Total demandé</label><input type="text" value={workloadTotals.totalRequested} readOnly className={readOnlyInputClassName} /></div>
                    <div><label className="block text-xs text-slate-500 mb-1">Total engagé</label><input type="text" value={workloadTotals.totalEngaged} readOnly className={readOnlyInputClassName} /></div>
                    <div><label className="block text-xs text-slate-500 mb-1">Total consommé</label><input type="text" value={workloadTotals.totalConsumed} readOnly className={readOnlyInputClassName} /></div>
                    <div><label className="block text-xs text-slate-500 mb-1">Avancement global</label><div className="w-full bg-white border border-slate-200 rounded-full h-8 flex items-center px-2"><div className="bg-blue-600 h-3 rounded-full" style={{ width: `${Math.min(workloadTotals.totalProgress, 100)}%` }}></div><span className="ml-2 text-xs font-bold text-slate-700">{workloadTotals.totalProgress}%</span></div></div>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-xl font-semibold text-slate-800">Budget (€)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label htmlFor="budgetRequested" className="block text-sm font-medium text-slate-700 mb-1">Demandé</label><input type="number" name="budgetRequested" value={currentProject.budgetRequested || ''} onChange={handleChange} readOnly={isReadOnly} min="0" step="any" className={numberInputClassName}/></div>
                    <div><label htmlFor="budgetApproved" className="block text-sm font-medium text-slate-700 mb-1">Accordé</label><input type="number" name="budgetApproved" value={currentProject.budgetApproved || ''} onChange={handleChange} readOnly={isReadOnly} min="0" step="any" className={numberInputClassName}/></div>
                    <div><label htmlFor="budgetCommitted" className="block text-sm font-medium text-slate-700 mb-1">Engagé</label><input type="number" name="budgetCommitted" value={currentProject.budgetCommitted || ''} onChange={handleChange} readOnly={isReadOnly} min="0" step="any" className={numberInputClassName}/></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label htmlFor="validatedPurchaseOrders" className="block text-sm font-medium text-slate-700 mb-1">DA validées</label><input type="number" name="validatedPurchaseOrders" value={currentProject.validatedPurchaseOrders || ''} onChange={handleChange} readOnly={isReadOnly} min="0" step="any" className={numberInputClassName}/></div>
                    <div><label htmlFor="completedPV" className="block text-sm font-medium text-slate-700 mb-1">Réalisé (PV)</label><input type="number" name="completedPV" value={currentProject.completedPV || ''} onChange={handleChange} readOnly={isReadOnly} min="0" step="any" className={numberInputClassName}/></div>
                    <div><label htmlFor="forecastedPurchaseOrders" className="block text-sm font-medium text-slate-700 mb-1">DA prévues</label><input type="number" name="forecastedPurchaseOrders" value={currentProject.forecastedPurchaseOrders || ''} onChange={handleChange} readOnly={isReadOnly} min="0" step="any" className={numberInputClassName}/></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border border-purple-100 rounded-lg bg-purple-50/50">
                     <div className="col-span-full font-semibold text-purple-800 border-b border-purple-100 pb-1 mb-1">Indicateurs budgétaires</div>
                     <div><label className="block text-xs text-slate-500 mb-1">Disponible (Accordé - Engagé)</label><input type="text" value={budgetCalculations.availableBudget.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} readOnly className={readOnlyInputClassName} /></div>
                     <div><label className="block text-xs text-slate-500 mb-1">Taux d'engagement</label><input type="text" value={budgetCalculations.budgetCommitmentRate + '%'} readOnly className={readOnlyInputClassName} /></div>
                     <div><label className="block text-xs text-slate-500 mb-1">Taux de réalisation (PV/Engagé)</label><input type="text" value={budgetCalculations.budgetCompletionRate + '%'} readOnly className={readOnlyInputClassName} /></div>
                     <div><label className="block text-xs text-slate-500 mb-1">Reste à faire (Dispo - Prévu)</label><input type="text" value={budgetCalculations.forecastedAvailableBudget.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} readOnly className={`w-full px-2 py-1 border border-slate-300 rounded text-sm font-bold text-right ${budgetCalculations.forecastedAvailableBudget < 0 ? 'bg-red-50 text-red-600 border-red-300' : 'bg-slate-50 text-slate-700'}`} /></div>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 mt-6">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-transparent rounded-md hover:bg-slate-200 transition-colors">{isReadOnly ? 'Fermer' : 'Annuler'}</button>
                {!isReadOnly && (<button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 transition-colors">Enregistrer</button>)}
            </div>
        </form>
    );
};

export default ProjectForm;
