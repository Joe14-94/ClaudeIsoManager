
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Project, ProjectStatus, TShirtSize, Resource, Initiative, ProjectCategory, ProjectWeather, ProjectMilestone } from '../types';
import { PROJECT_STATUS_COLORS, ISO_MEASURES_DATA } from '../constants';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { Search, PlusCircle, Edit, ArrowUp, ArrowDown, Trash2, Sun, Cloud, CloudRain, CloudLightning, Flag, Calculator, AlertTriangle } from 'lucide-react';
import CalendarDatePicker from '../components/ui/CalendarDatePicker';
import CustomMultiSelect from '../components/ui/CustomMultiSelect';
import ActiveFiltersDisplay from '../components/ui/ActiveFiltersDisplay';
import Tooltip from '../components/ui/Tooltip';

type SortKey = 'projectId' | 'title' | 'status' | 'projectManagerMOA' | 'projectManagerMOE' | 'totalProgress' | 'initiative' | 'priorityScore';
type SortDirection = 'ascending' | 'descending';

const WEATHER_ICONS = {
    [ProjectWeather.SUNNY]: <Sun className="text-yellow-500" size={20} />,
    [ProjectWeather.CLOUDY]: <Cloud className="text-gray-400" size={20} />,
    [ProjectWeather.RAINY]: <CloudRain className="text-blue-400" size={20} />,
    [ProjectWeather.STORM]: <CloudLightning className="text-purple-600" size={20} />,
};

const Projects: React.FC = () => {
    const { projects, setProjects, resources, initiatives } = useData();
    const isReadOnly = false;

    const location = useLocation();
    const navigate = useNavigate();

    const [isModalOnly, setIsModalOnly] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [top30Filter, setTop30Filter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>({ key: 'projectId', direction: 'ascending' });
    
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentProject, setCurrentProject] = useState<Partial<Project> | null>(null);
    const [isoSearchTerm, setIsoSearchTerm] = useState('');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

    const handleOpenFormModal = useCallback((projectData?: Partial<Project>) => {
        if (projectData && projectData.id) { // Editing existing
            // Ensure milestones array exists
            const projectWithDefaults = {
                 ...projectData,
                 milestones: projectData.milestones || [],
                 majorRiskIds: projectData.majorRiskIds || []
            };
            setCurrentProject(projectWithDefaults as Project);
            setIsEditMode(true);
        } else { // Creating new (potentially with pre-filled data)
            if(isReadOnly) return;
            const nextIdNumber = projects.length > 0
                ? Math.max(...projects.map(p => {
                    const match = p.projectId.match(/P\d{2}-(\d{3})/);
                    return match ? parseInt(match[1], 10) : 0;
                })) + 1
                : 1;
            
            const defaultNewProject: Partial<Project> = {
                projectId: `P25-${String(nextIdNumber).padStart(3, '0')}`,
                title: '',
                status: ProjectStatus.IDENTIFIED,
                tShirtSize: TShirtSize.M,
                isTop30: false,
                category: ProjectCategory.PROJECT,
                initiativeId: initiatives[0]?.id || '',
                isoMeasures: [],
                weather: ProjectWeather.SUNNY,
                milestones: [],
                majorRiskIds: [],
                strategicImpact: 3,
                riskCoverage: 3,
                effort: 3,
                priorityScore: 3 // (3*3)/3
            };

            setCurrentProject({ ...defaultNewProject, ...(projectData || {}) });
            setIsEditMode(false);
        }
        setIsoSearchTerm('');
        setIsFormModalOpen(true);
    }, [isReadOnly, projects, initiatives]);


    useEffect(() => {
        const projectToOpenId = location.state?.openProject;
        if (projectToOpenId && !isFormModalOpen) {
            const projectToOpen = projects.find(p => p.id === projectToOpenId);
            if (projectToOpen) {
                setIsModalOnly(true);
                handleOpenFormModal(projectToOpen);
                navigate(location.pathname, { replace: true, state: {} });
            }
        }
    }, [location.state, projects, navigate, isFormModalOpen, handleOpenFormModal]);

    useEffect(() => {
        const { projectDataToEdit } = location.state || {};
        if (projectDataToEdit) {
            handleOpenFormModal(projectDataToEdit);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, handleOpenFormModal]);

    const resourceMap = useMemo(() => new Map(resources.map(r => [r.id, r.name])), [resources]);
    const initiativeMap = useMemo(() => new Map(initiatives.map(i => [i.id, i.label])), [initiatives]);
    
    const handleOpenDeleteModal = (project: Project) => {
        if (isReadOnly) return;
        setProjectToDelete(project);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setProjectToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const confirmDelete = () => {
        if (isReadOnly || !projectToDelete) return;
        setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
        handleCloseDeleteModal();
    };


    const handleCloseModal = () => {
        if (isModalOnly) {
            navigate(-1);
        } else {
            setIsFormModalOpen(false);
            setCurrentProject(null);
            setIsEditMode(false);
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentProject || isReadOnly) return;

        if (!currentProject.title || !currentProject.projectId || !currentProject.initiativeId) {
          alert("L'ID projet, le titre et l'initiative sont obligatoires.");
          return;
        }
        
        if (isEditMode && currentProject.id) {
            const updatedProject: Project = { ...currentProject, updatedAt: new Date().toISOString() } as Project;
            setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
        } else {
            const newProject: Project = {
                id: `proj-${Date.now()}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...currentProject,
            } as Project;
            setProjects(prev => [newProject, ...prev]);
        }
        handleCloseModal();
    };

    const requestSort = (key: SortKey) => {
        let direction: SortDirection = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
          direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getProjectProgress = (project: Project): number => {
        const consumed = (project.moaInternalWorkloadConsumed || 0) + (project.moaExternalWorkloadConsumed || 0) + (project.moeInternalWorkloadConsumed || 0) + (project.moeExternalWorkloadConsumed || 0);
        const engaged = (project.moaInternalWorkloadEngaged || 0) + (project.moaExternalWorkloadEngaged || 0) + (project.moeInternalWorkloadEngaged || 0) + (project.moeExternalWorkloadEngaged || 0);
        return engaged > 0 ? Math.round((consumed / engaged) * 100) : 0;
    };

    const sortedProjects = useMemo(() => {
        const uoPattern = /^([a-zA-Z]+|\d+)\.\d+\.\d+\.\d+$/;
        let sortableItems = [...projects].filter(project => {
            if (uoPattern.test(project.projectId) || project.projectId === 'TOTAL_GENERAL') {
                return false;
            }
            return (
                (statusFilter === '' || project.status === statusFilter) &&
                (top30Filter === '' || String(project.isTop30) === top30Filter) &&
                (searchTerm === '' || 
                    project.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    project.projectId.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        });

        if (sortConfig !== null) {
          sortableItems.sort((a, b) => {
            let aValue: string | number | undefined;
            let bValue: string | number | undefined;
            
            switch(sortConfig.key) {
                case 'projectManagerMOA':
                    aValue = resourceMap.get(a.projectManagerMOA || '');
                    bValue = resourceMap.get(b.projectManagerMOA || '');
                    break;
                case 'projectManagerMOE':
                    aValue = resourceMap.get(b.projectManagerMOE || '');
                    bValue = resourceMap.get(b.projectManagerMOE || '');
                    break;
                case 'totalProgress':
                    aValue = getProjectProgress(a);
                    bValue = getProjectProgress(b);
                    break;
                case 'initiative':
                    aValue = initiativeMap.get(a.initiativeId || '');
                    bValue = initiativeMap.get(b.initiativeId || '');
                    break;
                case 'priorityScore':
                    aValue = a.priorityScore || 0;
                    bValue = b.priorityScore || 0;
                    break;
                default:
                    aValue = a[sortConfig.key as keyof Project] as string;
                    bValue = b[sortConfig.key as keyof Project] as string;
            }
    
            aValue = aValue ?? (typeof aValue === 'number' ? -1 : '');
            bValue = bValue ?? (typeof bValue === 'number' ? -1 : '');

            let comparison = 0;
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                comparison = aValue - bValue;
            } else {
                comparison = String(aValue).localeCompare(String(bValue), 'fr', { numeric: true, sensitivity: 'base' });
            }

            return sortConfig.direction === 'ascending' ? comparison : -comparison;
          });
        }
        return sortableItems;
    }, [projects, statusFilter, top30Filter, searchTerm, sortConfig, resourceMap, initiativeMap]);

    const renderSortArrow = (key: SortKey) => {
        if (sortConfig?.key === key) {
            return sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
        }
        return null;
    }

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

    const handleClearAll = () => {
        setStatusFilter('');
        setTop30Filter('');
        setSearchTerm('');
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            {!isModalOnly && (
                <>
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <h1 className="text-3xl font-bold text-slate-800">Projets</h1>
                        {!isReadOnly && (
                        <button onClick={() => handleOpenFormModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <PlusCircle size={20} />
                            <span>Nouveau projet</span>
                        </button>
                        )}
                    </div>

                    <Card className="flex-grow flex flex-col min-h-0">
                        <CardHeader>
                            <div className="flex flex-col md:flex-row flex-wrap gap-4 mb-4">
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                    type="text"
                                    placeholder="Rechercher un projet..."
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <select 
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="">Tous les statuts</option>
                                    {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <select 
                                    value={top30Filter}
                                    onChange={(e) => setTop30Filter(e.target.value)}
                                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="">Tous les projets</option>
                                    <option value="true">Top 30</option>
                                    <option value="false">Hors Top 30</option>
                                </select>
                            </div>
                            <ActiveFiltersDisplay filters={activeFiltersForDisplay} onRemoveFilter={handleRemoveFilter} onClearAll={handleClearAll} />
                        </CardHeader>
                        <CardContent className="flex-grow overflow-y-auto">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-slate-500">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-100 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('projectId')}>ID {renderSortArrow('projectId')}</th>
                                        <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('title')}>Titre {renderSortArrow('title')}</th>
                                        <th scope="col" className="px-6 py-3">Météo</th>
                                        <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('initiative')}>Initiative {renderSortArrow('initiative')}</th>
                                        <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('status')}>Statut {renderSortArrow('status')}</th>
                                        <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('priorityScore')}>Score {renderSortArrow('priorityScore')}</th>
                                        <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('totalProgress')}>Avancement {renderSortArrow('totalProgress')}</th>
                                        <th scope="col" className="px-6 py-3">Top 30</th>
                                        <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedProjects.map(project => (
                                        <tr key={project.id} className="bg-white border-b hover:bg-slate-50">
                                            <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{project.projectId}</th>
                                            <td className="px-6 py-4">{project.title}</td>
                                            <td className="px-6 py-4">
                                                {project.weather ? (
                                                    <Tooltip text={project.weatherDescription || project.weather}>
                                                        {WEATHER_ICONS[project.weather]}
                                                    </Tooltip>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">{initiativeMap.get(project.initiativeId || '') || '-'}</td>
                                            <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${PROJECT_STATUS_COLORS[project.status]}`}>{project.status}</span></td>
                                            <td className="px-6 py-4">
                                                {project.priorityScore ? (
                                                    <span className={`font-bold ${project.priorityScore >= 15 ? 'text-red-600' : project.priorityScore >= 8 ? 'text-orange-500' : 'text-blue-600'}`}>
                                                        {project.priorityScore.toFixed(1)}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-4">{getProjectProgress(project)}%</td>
                                            <td className="px-6 py-4">{project.isTop30 ? 'Oui' : 'Non'}</td>
                                            <td className="px-6 py-4 text-right space-x-1">
                                                <button onClick={() => handleOpenFormModal(project)} className="p-1 text-slate-500 rounded-md hover:bg-slate-100 hover:text-blue-600" title="Modifier le projet"><Edit size={18} /></button>
                                                {!isReadOnly && (
                                                    <button onClick={() => handleOpenDeleteModal(project)} className="p-1 text-slate-500 rounded-md hover:bg-slate-100 hover:text-red-600" title="Supprimer le projet">
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                </table>
                                {sortedProjects.length === 0 && <div className="text-center py-8 text-slate-500">Aucun projet ne correspond à vos critères.</div>}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

             {isFormModalOpen && currentProject && (
                <Modal 
                    isOpen={isFormModalOpen} 
                    onClose={handleCloseModal}
                    title={isEditMode ? "Détails du projet" : "Nouveau projet"}
                >
                    <FormBody 
                        currentProject={currentProject} 
                        setCurrentProject={setCurrentProject}
                        isReadOnly={isReadOnly}
                        handleSave={handleSave}
                        handleCloseModal={handleCloseModal}
                        isoSearchTerm={isoSearchTerm}
                        setIsoSearchTerm={setIsoSearchTerm}
                    />
                </Modal>
            )}

            {isDeleteModalOpen && projectToDelete && (
                <Modal
                    isOpen={isDeleteModalOpen}
                    onClose={handleCloseDeleteModal}
                    title="Confirmer la suppression"
                >
                    <p>Êtes-vous sûr de vouloir supprimer le projet "{projectToDelete.title}" ? Cette action est irréversible.</p>
                    <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
                        <button type="button" onClick={handleCloseDeleteModal} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">
                            Annuler
                        </button>
                        <button type="button" onClick={confirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                            Supprimer
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

const FormBody: React.FC<{
    currentProject: Partial<Project>;
    setCurrentProject: React.Dispatch<React.SetStateAction<Partial<Project> | null>>;
    isReadOnly: boolean;
    handleSave: (e: React.FormEvent) => void;
    handleCloseModal: () => void;
    isoSearchTerm: string;
    setIsoSearchTerm: (term: string) => void;
}> = ({ currentProject, setCurrentProject, isReadOnly, handleSave, handleCloseModal, isoSearchTerm, setIsoSearchTerm }) => {
    const { resources, initiatives, majorRisks } = useData();

    // Styles standardisés pour les champs de saisie
    const inputClassName = "w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-colors";
    const textareaClassName = "w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-colors resize-none";
    const numberInputClassName = "w-full px-2 py-1 border border-slate-300 rounded bg-white text-slate-900 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-colors";
    const readOnlyInputClassName = "w-full px-2 py-1 border border-slate-300 rounded bg-slate-50 text-slate-700 text-sm font-semibold text-right";

    // Calculer le score de priorité dès qu'une valeur change
    useEffect(() => {
        if (currentProject) {
            const impact = currentProject.strategicImpact || 1;
            const risk = currentProject.riskCoverage || 1;
            const effort = currentProject.effort || 1;
            const calculatedScore = parseFloat(((impact * risk * 10) / (effort * 2)).toFixed(1)); // Formule arbitraire : (Impact * Risk * 10) / (Effort * 2) pour donner du poids
            
            // Avoid infinite loop
            if (currentProject.priorityScore !== calculatedScore) {
                 setCurrentProject(prev => ({...prev!, priorityScore: calculatedScore}));
            }
        }
    }, [currentProject.strategicImpact, currentProject.riskCoverage, currentProject.effort, setCurrentProject]);

    const filteredIsoOptions = useMemo(() => {
        const options = ISO_MEASURES_DATA.map(m => ({
          value: m.code,
          label: `${m.code} - ${m.title}`,
          tooltip: m.details?.measure
        }));
        if (!isoSearchTerm) return options;
        return options.filter(opt => opt.label.toLowerCase().includes(isoSearchTerm.toLowerCase()));
    }, [isoSearchTerm]);

    const handleCustomMultiSelectChange = (name: string, value: string[]) => {
        setCurrentProject(prev => ({ ...prev!, [name]: value }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const isNumber = type === 'number' || type === 'range';

        setCurrentProject(prev => {
            if (!prev) return null;
            if (isCheckbox) {
                return { ...prev, [name]: (e.target as HTMLInputElement).checked };
            }
            if (isNumber) {
                return { ...prev, [name]: value === '' ? undefined : parseFloat(value) };
            }
            return { ...prev, [name]: value };
        });
    };
    
    const handleMilestoneAdd = () => {
        setCurrentProject(prev => {
            if (!prev) return null;
            const newMilestones = [...(prev.milestones || []), { id: `ms-${Date.now()}`, label: 'Nouveau jalon', date: new Date().toISOString(), completed: false }];
            return { ...prev, milestones: newMilestones };
        });
    };

    const handleMilestoneChange = (id: string, field: keyof ProjectMilestone, value: any) => {
         setCurrentProject(prev => {
            if (!prev || !prev.milestones) return prev;
            const newMilestones = prev.milestones.map(m => m.id === id ? { ...m, [field]: value } : m);
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
    
    const { workloadTotals, budgetCalculations } = useMemo(() => {
        const p = currentProject;
        const moaIntC = p.moaInternalWorkloadConsumed || 0;
        const moaIntE = p.moaInternalWorkloadEngaged || 0;
        const moaExtC = p.moaExternalWorkloadConsumed || 0;
        const moaExtE = p.moaExternalWorkloadEngaged || 0;
        const moeIntC = p.moeInternalWorkloadConsumed || 0;
        const moeIntE = p.moeInternalWorkloadEngaged || 0;
        const moeExtC = p.moeExternalWorkloadConsumed || 0;
        const moeExtE = p.moeExternalWorkloadEngaged || 0;
        
        const totalMoaEngaged = moaIntE + moaExtE;
        const totalMoaConsumed = moaIntC + moaExtC;
        const totalMoeEngaged = moeIntE + moeExtE;
        const totalMoeConsumed = moeIntC + moeExtC;

        const totalEngaged = totalMoaEngaged + totalMoeEngaged;
        const totalConsumed = totalMoaConsumed + totalMoeConsumed;
        
        const workloadTotals = {
            moaProgress: totalMoaEngaged > 0 ? Math.round((totalMoaConsumed / totalMoaEngaged) * 100) : 0,
            moeProgress: totalMoeEngaged > 0 ? Math.round((totalMoeConsumed / totalMoeEngaged) * 100) : 0,
            totalRequested: (p.moaInternalWorkloadRequested||0) + (p.moaExternalWorkloadRequested||0) + (p.moeInternalWorkloadRequested||0) + (p.moeExternalWorkloadRequested||0),
            totalEngaged: totalEngaged,
            totalConsumed: totalConsumed,
            totalProgress: totalEngaged > 0 ? Math.round((totalConsumed / totalEngaged) * 100) : 0,
        };
        
        const budgetApproved = Number(currentProject.budgetApproved) || 0;
        const budgetCommitted = Number(currentProject.budgetCommitted) || 0;
        const completedPV = Number(currentProject.completedPV) || 0;
        const forecastedPurchaseOrders = Number(currentProject.forecastedPurchaseOrders) || 0;

        const budgetCalculations = {
            availableBudget: budgetApproved - budgetCommitted,
            budgetCommitmentRate: budgetApproved > 0 ? Math.round((budgetCommitted / budgetApproved) * 100) : 0,
            budgetCompletionRate: budgetCommitted > 0 ? Math.round((completedPV / budgetCommitted) * 100) : 0,
            forecastedAvailableBudget: budgetApproved - (budgetCommitted + forecastedPurchaseOrders),
        };

        return { workloadTotals, budgetCalculations };
    }, [currentProject]);


    return (
        <form onSubmit={handleSave} className="space-y-6">
            {/* HEADER: ID / TITRE / METEO */}
            <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div>
                        <label htmlFor="projectId" className="block text-sm font-medium text-slate-700 mb-1">ID Projet</label>
                        <input type="text" name="projectId" value={currentProject.projectId || ''} onChange={handleChange} required readOnly={isReadOnly} className={inputClassName} />
                    </div>
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Titre</label>
                        <input type="text" name="title" value={currentProject.title || ''} onChange={handleChange} required readOnly={isReadOnly} className={inputClassName} />
                    </div>
                </div>
                <div className="w-full md:w-auto bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <label className="mb-2 block text-center font-semibold text-slate-700 text-sm">Météo du projet</label>
                    <div className="flex justify-center gap-4">
                        {Object.values(ProjectWeather).map(w => (
                            <label key={w} className={`cursor-pointer p-2 rounded-md transition-all ${currentProject.weather === w ? 'bg-white shadow-md ring-2 ring-blue-400 scale-110' : 'hover:bg-white/50 opacity-50 hover:opacity-100'}`}>
                                <input 
                                    type="radio" 
                                    name="weather" 
                                    value={w} 
                                    checked={currentProject.weather === w} 
                                    onChange={() => setCurrentProject(prev => ({...prev!, weather: w}))} 
                                    className="sr-only"
                                    disabled={isReadOnly}
                                />
                                <Tooltip text={w}>{WEATHER_ICONS[w]}</Tooltip>
                            </label>
                        ))}
                    </div>
                    <textarea 
                        name="weatherDescription" 
                        placeholder="Commentaire météo (flash report)..." 
                        value={currentProject.weatherDescription || ''} 
                        onChange={handleChange} 
                        rows={2} 
                        className="mt-2 w-full text-xs p-2 border border-slate-300 rounded bg-white text-slate-900 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        readOnly={isReadOnly}
                    />
                </div>
            </div>
            
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea name="description" value={currentProject.description || ''} onChange={handleChange} rows={2} readOnly={isReadOnly} className={textareaClassName} />
            </div>

            {/* SCORING & ARBITRAGE */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
                        <Calculator size={20} /> Score de Priorité & Arbitrage
                    </h3>
                    <div className="text-2xl font-bold text-indigo-600 bg-white px-4 py-1 rounded shadow-sm border border-indigo-100">
                        Score: {currentProject.priorityScore}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="flex justify-between text-sm font-medium text-indigo-900 mb-1">Impact Stratégique <span className="font-bold">{currentProject.strategicImpact}</span></label>
                        <input type="range" name="strategicImpact" min="1" max="5" step="0.5" value={currentProject.strategicImpact || 3} onChange={handleChange} disabled={isReadOnly} className="w-full accent-indigo-600 cursor-pointer"/>
                        <div className="flex justify-between text-xs text-indigo-500 mt-1"><span>Faible</span><span>Fort</span></div>
                    </div>
                    <div>
                        <label className="flex justify-between text-sm font-medium text-indigo-900 mb-1">Couverture Risque <span className="font-bold">{currentProject.riskCoverage}</span></label>
                        <input type="range" name="riskCoverage" min="1" max="5" step="0.5" value={currentProject.riskCoverage || 3} onChange={handleChange} disabled={isReadOnly} className="w-full accent-indigo-600 cursor-pointer"/>
                         <div className="flex justify-between text-xs text-indigo-500 mt-1"><span>Faible</span><span>Forte</span></div>
                    </div>
                    <div>
                        <label className="flex justify-between text-sm font-medium text-indigo-900 mb-1">Effort de mise en œuvre <span className="font-bold">{currentProject.effort}</span></label>
                        <input type="range" name="effort" min="1" max="5" step="0.5" value={currentProject.effort || 3} onChange={handleChange} disabled={isReadOnly} className="w-full accent-indigo-600 cursor-pointer"/>
                         <div className="flex justify-between text-xs text-indigo-500 mt-1"><span>Faible</span><span>Conséquent</span></div>
                    </div>
                </div>
            </div>

            {/* CLASSIFICATION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                    <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
                    <select name="status" value={currentProject.status} onChange={handleChange} disabled={isReadOnly} className={inputClassName}>
                        {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="tShirtSize" className="block text-sm font-medium text-slate-700 mb-1">Taille</label>
                    <select name="tShirtSize" value={currentProject.tShirtSize} onChange={handleChange} disabled={isReadOnly} className={inputClassName}>
                        {Object.values(TShirtSize).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
                    <select name="category" value={currentProject.category} onChange={handleChange} disabled={isReadOnly} className={inputClassName}>
                        {Object.values(ProjectCategory).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="initiativeId" className="block text-sm font-medium text-slate-700 mb-1">Initiative de rattachement</label>
                    <select name="initiativeId" id="initiativeId" value={currentProject.initiativeId || ''} onChange={handleChange} disabled={isReadOnly} required className={inputClassName}>
                        <option value="" disabled>Sélectionner une initiative</option>
                        {initiatives.map(i => <option key={i.id} value={i.id}>{i.code} - {i.label}</option>)}
                    </select>
                </div>
                 <div className="flex items-center h-full pt-6">
                     <label htmlFor="isTop30" className="flex items-center cursor-pointer group">
                        <input
                            id="isTop30"
                            name="isTop30"
                            type="checkbox"
                            checked={currentProject.isTop30 || false}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            className="sr-only peer"
                        />
                        <div className={`w-5 h-5 border rounded flex-shrink-0 flex items-center justify-center transition-colors ${
                            isReadOnly ? 'bg-slate-100 border-slate-300 cursor-not-allowed' : 'bg-white border-slate-400 group-hover:border-blue-500'
                        } peer-checked:bg-blue-600 peer-checked:border-blue-600`}>
                            <svg className="hidden peer-checked:block w-3.5 h-3.5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                            </svg>
                        </div>
                        <span className="ml-2 text-sm font-medium text-slate-700 group-hover:text-slate-900">Projet Top30</span>
                    </label>
                </div>
            </div>
            
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mesures ISO</label>
                 <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Rechercher par code ou titre..."
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={isoSearchTerm}
                      onChange={(e) => setIsoSearchTerm(e.target.value)}
                      disabled={isReadOnly}
                    />
                </div>
                <CustomMultiSelect
                    label=""
                    name="isoMeasures"
                    options={filteredIsoOptions}
                    selectedValues={currentProject.isoMeasures || []}
                    onChange={handleCustomMultiSelectChange}
                    disabled={isReadOnly}
                    heightClass="h-32"
                />
            </div>
            
            <div>
                 <CustomMultiSelect
                    label="Couverture des Risques Majeurs"
                    name="majorRiskIds"
                    options={majorRisks.map(r => ({ value: r.id, label: r.label, tooltip: r.description }))}
                    selectedValues={currentProject.majorRiskIds || []}
                    onChange={handleCustomMultiSelectChange}
                    disabled={isReadOnly}
                    heightClass="h-32"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="projectManagerMOA" className="block text-sm font-medium text-slate-700 mb-1">Chef de projet MOA</label>
                    <select name="projectManagerMOA" value={currentProject.projectManagerMOA || ''} onChange={handleChange} disabled={isReadOnly} className={inputClassName}>
                        <option value="">Non assigné</option>
                        {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="projectManagerMOE" className="block text-sm font-medium text-slate-700 mb-1">Chef de projet MOE</label>
                    <select name="projectManagerMOE" value={currentProject.projectManagerMOE || ''} onChange={handleChange} disabled={isReadOnly} className={inputClassName}>
                        <option value="">Non assigné</option>
                        {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>
            </div>
            
            {/* DATES */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <h4 className="font-semibold text-slate-700 mb-3">Planning Général</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="projectStartDate" className="block text-sm font-medium text-slate-700 mb-1">Début Projet</label>
                        <CalendarDatePicker id="projectStartDate" name="projectStartDate" value={currentProject.projectStartDate?.split('T')[0] || ''} onChange={handleChange} readOnly={isReadOnly} />
                    </div>
                    <div>
                        <label htmlFor="projectEndDate" className="block text-sm font-medium text-slate-700 mb-1">Fin Projet</label>
                        <CalendarDatePicker id="projectEndDate" name="projectEndDate" value={currentProject.projectEndDate?.split('T')[0] || ''} onChange={handleChange} readOnly={isReadOnly} />
                    </div>
                    <div>
                        <label htmlFor="goLiveDate" className="block text-sm font-medium text-slate-700 mb-1">Mise en Service (NO)</label>
                        <CalendarDatePicker id="goLiveDate" name="goLiveDate" value={currentProject.goLiveDate?.split('T')[0] || ''} onChange={handleChange} readOnly={isReadOnly} />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-1">Clôture (NF)</label>
                        <CalendarDatePicker id="endDate" name="endDate" value={currentProject.endDate?.split('T')[0] || ''} onChange={handleChange} readOnly={isReadOnly} />
                    </div>
                </div>
            </div>
            
            {/* JALONS CLES */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-slate-700 flex items-center gap-2"><Flag size={16} /> Jalons Clés</h4>
                    {!isReadOnly && (
                        <button type="button" onClick={handleMilestoneAdd} className="text-xs flex items-center gap-1 bg-white border border-slate-300 px-2 py-1 rounded hover:bg-slate-100 text-blue-600 shadow-sm transition-colors">
                            <PlusCircle size={14} /> Ajouter un jalon
                        </button>
                    )}
                </div>
                {currentProject.milestones && currentProject.milestones.length > 0 ? (
                    <div className="space-y-2">
                        {currentProject.milestones.map((ms, idx) => (
                            <div key={ms.id} className="flex items-center gap-2 bg-white p-2 rounded border border-slate-200 shadow-sm">
                                <input 
                                    type="checkbox" 
                                    checked={ms.completed} 
                                    onChange={(e) => handleMilestoneChange(ms.id, 'completed', e.target.checked)}
                                    disabled={isReadOnly}
                                    className="w-4 h-4 accent-green-600 cursor-pointer"
                                />
                                <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <input 
                                        type="text" 
                                        value={ms.label} 
                                        onChange={(e) => handleMilestoneChange(ms.id, 'label', e.target.value)}
                                        placeholder="Nom du jalon"
                                        readOnly={isReadOnly}
                                        className="text-sm p-1 border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none bg-transparent font-medium transition-colors"
                                    />
                                    <div className="w-40"> {/* Conteneur fixe pour le datepicker */}
                                        <CalendarDatePicker 
                                            id={`ms-date-${ms.id}`} 
                                            name={`ms-date-${ms.id}`} 
                                            value={ms.date ? ms.date.split('T')[0] : ''}
                                            onChange={(e) => handleMilestoneChange(ms.id, 'date', e.target.value)}
                                            readOnly={isReadOnly}
                                        />
                                    </div>
                                </div>
                                {!isReadOnly && (
                                    <button type="button" onClick={() => handleMilestoneDelete(ms.id)} className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-slate-400 italic text-center py-2">Aucun jalon défini.</p>
                )}
            </div>
            
            {/* Charges */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-xl font-semibold text-slate-800">Charges (en J/H)</h3>
                <div className="space-y-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
                    <h4 className="text-lg font-semibold text-slate-700">Charges MOA</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <div>
                            <p className="font-medium text-slate-600 mb-2 text-sm border-b pb-1">Interne</p>
                            <div className="grid grid-cols-3 gap-3 items-end">
                                <div><label className="block text-xs text-slate-500 mb-1">Demandée</label><input type="number" name="moaInternalWorkloadRequested" value={currentProject.moaInternalWorkloadRequested || ''} onChange={handleChange} readOnly={isReadOnly} min="0" className={numberInputClassName}/></div>
                                <div><label className="block text-xs text-slate-500 mb-1">Engagée</label><input type="number" name="moaInternalWorkloadEngaged" value={currentProject.moaInternalWorkloadEngaged || ''} onChange={handleChange} readOnly={isReadOnly} min="0" className={numberInputClassName}/></div>
                                <div><label className="block text-xs text-slate-500 mb-1">Consommée</label><input type="number" name="moaInternalWorkloadConsumed" value={currentProject.moaInternalWorkloadConsumed || ''} onChange={handleChange} readOnly={isReadOnly} min="0" className={numberInputClassName}/></div>
                            </div>
                        </div>
                         <div>
                            <p className="font-medium text-slate-600 mb-2 text-sm border-b pb-1">Externe</p>
                            <div className="grid grid-cols-3 gap-3 items-end">
                                <div><label className="block text-xs text-slate-500 mb-1">Demandée</label><input type="number" name="moaExternalWorkloadRequested" value={currentProject.moaExternalWorkloadRequested || ''} onChange={handleChange} readOnly={isReadOnly} min="0" className={numberInputClassName}/></div>
                                <div><label className="block text-xs text-slate-500 mb-1">Engagée</label><input type="number" name="moaExternalWorkloadEngaged" value={currentProject.moaExternalWorkloadEngaged || ''} onChange={handleChange} readOnly={isReadOnly} min="0" className={numberInputClassName}/></div>
                                <div><label className="block text-xs text-slate-500 mb-1">Consommée</label><input type="number" name="moaExternalWorkloadConsumed" value={currentProject.moaExternalWorkloadConsumed || ''} onChange={handleChange} readOnly={isReadOnly} min="0" className={numberInputClassName}/></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
                    <h4 className="text-lg font-semibold text-slate-700">Charges MOE</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <div>
                            <p className="font-medium text-slate-600 mb-2 text-sm border-b pb-1">Interne</p>
                            <div className="grid grid-cols-3 gap-3 items-end">
                                <div><label className="block text-xs text-slate-500 mb-1">Demandée</label><input type="number" name="moeInternalWorkloadRequested" value={currentProject.moeInternalWorkloadRequested || ''} onChange={handleChange} readOnly={isReadOnly} min="0" className={numberInputClassName}/></div>
                                <div><label className="block text-xs text-slate-500 mb-1">Engagée</label><input type="number" name="moeInternalWorkloadEngaged" value={currentProject.moeInternalWorkloadEngaged || ''} onChange={handleChange} readOnly={isReadOnly} min="0" className={numberInputClassName}/></div>
                                <div><label className="block text-xs text-slate-500 mb-1">Consommée</label><input type="number" name="moeInternalWorkloadConsumed" value={currentProject.moeInternalWorkloadConsumed || ''} onChange={handleChange} readOnly={isReadOnly} min="0" className={numberInputClassName}/></div>
                            </div>
                        </div>
                         <div>
                            <p className="font-medium text-slate-600 mb-2 text-sm border-b pb-1">Externe</p>
                            <div className="grid grid-cols-3 gap-3 items-end">
                                <div><label className="block text-xs text-slate-500 mb-1">Demandée</label><input type="number" name="moeExternalWorkloadRequested" value={currentProject.moeExternalWorkloadRequested || ''} onChange={handleChange} readOnly={isReadOnly} min="0" className={numberInputClassName}/></div>
                                <div><label className="block text-xs text-slate-500 mb-1">Engagée</label><input type="number" name="moeExternalWorkloadEngaged" value={currentProject.moeExternalWorkloadEngaged || ''} onChange={handleChange} readOnly={isReadOnly} min="0" className={numberInputClassName}/></div>
                                <div><label className="block text-xs text-slate-500 mb-1">Consommée</label><input type="number" name="moeExternalWorkloadConsumed" value={currentProject.moeExternalWorkloadConsumed || ''} onChange={handleChange} readOnly={isReadOnly} min="0" className={numberInputClassName}/></div>
                            </div>
                        </div>
                    </div>
                </div>
                 
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end p-4 border border-blue-100 rounded-lg bg-blue-50/50">
                    <div className="col-span-full font-semibold text-blue-800 border-b border-blue-100 pb-1 mb-1">Total Charges Projet</div>
                    <div><label className="block text-xs text-slate-500 mb-1">Total Demandé</label><input type="text" value={workloadTotals.totalRequested} readOnly className={readOnlyInputClassName} /></div>
                    <div><label className="block text-xs text-slate-500 mb-1">Total Engagé</label><input type="text" value={workloadTotals.totalEngaged} readOnly className={readOnlyInputClassName} /></div>
                    <div><label className="block text-xs text-slate-500 mb-1">Total Consommé</label><input type="text" value={workloadTotals.totalConsumed} readOnly className={readOnlyInputClassName} /></div>
                    <div>
                         <label className="block text-xs text-slate-500 mb-1">Avancement Global</label>
                         <div className="w-full bg-white border border-slate-200 rounded-full h-8 flex items-center px-2">
                            <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${Math.min(workloadTotals.totalProgress, 100)}%` }}></div>
                            <span className="ml-2 text-xs font-bold text-slate-700">{workloadTotals.totalProgress}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Budget */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-xl font-semibold text-slate-800">Budget (€)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label htmlFor="budgetRequested" className="block text-sm font-medium text-slate-700 mb-1">Demandé</label><input type="number" name="budgetRequested" value={currentProject.budgetRequested || ''} onChange={handleChange} readOnly={isReadOnly} min="0" step="any" className={numberInputClassName}/></div>
                    <div><label htmlFor="budgetApproved" className="block text-sm font-medium text-slate-700 mb-1">Accordé</label><input type="number" name="budgetApproved" value={currentProject.budgetApproved || ''} onChange={handleChange} readOnly={isReadOnly} min="0" step="any" className={numberInputClassName}/></div>
                    <div><label htmlFor="budgetCommitted" className="block text-sm font-medium text-slate-700 mb-1">Engagé</label><input type="number" name="budgetCommitted" value={currentProject.budgetCommitted || ''} onChange={handleChange} readOnly={isReadOnly} min="0" step="any" className={numberInputClassName}/></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label htmlFor="validatedPurchaseOrders" className="block text-sm font-medium text-slate-700 mb-1">DA Validées</label><input type="number" name="validatedPurchaseOrders" value={currentProject.validatedPurchaseOrders || ''} onChange={handleChange} readOnly={isReadOnly} min="0" step="any" className={numberInputClassName}/></div>
                    <div><label htmlFor="completedPV" className="block text-sm font-medium text-slate-700 mb-1">Réalisé (PV)</label><input type="number" name="completedPV" value={currentProject.completedPV || ''} onChange={handleChange} readOnly={isReadOnly} min="0" step="any" className={numberInputClassName}/></div>
                    <div><label htmlFor="forecastedPurchaseOrders" className="block text-sm font-medium text-slate-700 mb-1">DA Prévues</label><input type="number" name="forecastedPurchaseOrders" value={currentProject.forecastedPurchaseOrders || ''} onChange={handleChange} readOnly={isReadOnly} min="0" step="any" className={numberInputClassName}/></div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border border-purple-100 rounded-lg bg-purple-50/50">
                     <div className="col-span-full font-semibold text-purple-800 border-b border-purple-100 pb-1 mb-1">Indicateurs Budgétaires</div>
                     <div><label className="block text-xs text-slate-500 mb-1">Disponible (Accordé - Engagé)</label><input type="text" value={budgetCalculations.availableBudget.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} readOnly className={readOnlyInputClassName} /></div>
                     <div><label className="block text-xs text-slate-500 mb-1">Taux d'engagement</label><input type="text" value={budgetCalculations.budgetCommitmentRate + '%'} readOnly className={readOnlyInputClassName} /></div>
                     <div><label className="block text-xs text-slate-500 mb-1">Taux de réalisation (PV/Engagé)</label><input type="text" value={budgetCalculations.budgetCompletionRate + '%'} readOnly className={readOnlyInputClassName} /></div>
                     <div><label className="block text-xs text-slate-500 mb-1">Reste à faire (Dispo - Prévu)</label><input type="text" value={budgetCalculations.forecastedAvailableBudget.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} readOnly className={`w-full px-2 py-1 border border-slate-300 rounded text-sm font-bold text-right ${budgetCalculations.forecastedAvailableBudget < 0 ? 'bg-red-50 text-red-600 border-red-300' : 'bg-slate-50 text-slate-700'}`} /></div>
                </div>
            </div>
            
            {currentProject.budgetCommitted && currentProject.budgetApproved && currentProject.budgetCommitted > currentProject.budgetApproved && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center gap-2 text-sm">
                    <AlertTriangle size={18} className="flex-shrink-0" />
                    <span className="font-medium">Attention : Le budget engagé dépasse le budget accordé !</span>
                </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 mt-6">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-transparent rounded-md hover:bg-slate-200 transition-colors">
                    {isReadOnly ? 'Fermer' : 'Annuler'}
                </button>
                {!isReadOnly && (
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 transition-colors">Enregistrer</button>
                )}
            </div>
        </form>
    );
};

export default Projects;
