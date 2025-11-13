
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Project, ActivityStatus, TShirtSize, Resource, Initiative } from '../types';
import { STATUS_COLORS, ISO_MEASURES_DATA } from '../constants';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { Search, PlusCircle, Edit, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CalendarDatePicker from '../components/ui/CalendarDatePicker';
import CustomMultiSelect from '../components/ui/CustomMultiSelect';
import ActiveFiltersDisplay from '../components/ui/ActiveFiltersDisplay';

type SortKey = 'projectId' | 'title' | 'status' | 'projectManagerMOA' | 'projectManagerMOE' | 'totalProgress' | 'initiative';
type SortDirection = 'ascending' | 'descending';

const Projects: React.FC = () => {
    const { projects, setProjects, resources, initiatives } = useData();
    const { userRole } = useAuth();
    const isReadOnly = userRole === 'readonly';

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

    useEffect(() => {
        const projectToOpenId = location.state?.openProject;
        if (projectToOpenId && !isFormModalOpen) {
            const projectToOpen = projects.find(p => p.id === projectToOpenId);
            if (projectToOpen) {
                setIsModalOnly(true);
                // Directly open modal instead of calling handler to avoid dependency issues
                setCurrentProject(projectToOpen);
                setIsEditMode(true);
                setIsoSearchTerm('');
                setIsFormModalOpen(true);
                navigate(location.pathname, { replace: true, state: {} });
            }
        }
    }, [location.state, projects, navigate, isFormModalOpen]);

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


    const handleOpenFormModal = (projectToEdit?: Project) => {
        if (projectToEdit) {
            setCurrentProject(projectToEdit);
            setIsEditMode(true);
        } else {
            if(isReadOnly) return;
            const nextIdNumber = projects.length > 0
                ? Math.max(...projects.map(p => {
                    const match = p.projectId.match(/P\d{2}-(\d{3})/);
                    return match ? parseInt(match[1], 10) : 0;
                })) + 1
                : 1;

            setCurrentProject({
                projectId: `P25-${String(nextIdNumber).padStart(3, '0')}`,
                title: '',
                status: ActivityStatus.NOT_STARTED,
                tShirtSize: TShirtSize.M,
                isTop30: false,
                isEPA: false,
                initiativeId: initiatives[0]?.id || '',
                isoMeasures: [],
                budgetRequested: undefined,
                budgetApproved: undefined,
                budgetCommitted: undefined,
                validatedPurchaseOrders: undefined,
                completedPV: undefined,
                forecastedPurchaseOrders: undefined,
            });
            setIsEditMode(false);
        }
        setIsoSearchTerm('');
        setIsFormModalOpen(true);
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
        const consumed = (project.internalWorkloadConsumed || 0) + (project.externalWorkloadConsumed || 0);
        const engaged = (project.internalWorkloadEngaged || 0) + (project.externalWorkloadEngaged || 0);
        return engaged > 0 ? Math.round((consumed / engaged) * 100) : 0;
    };

    const sortedProjects = useMemo(() => {
        let sortableItems = [...projects].filter(project => {
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
                                    {Object.values(ActivityStatus).map(s => <option key={s} value={s}>{s}</option>)}
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
                                        <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('initiative')}>Initiative {renderSortArrow('initiative')}</th>
                                        <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('status')}>Statut {renderSortArrow('status')}</th>
                                        <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('projectManagerMOA')}>CP MOA {renderSortArrow('projectManagerMOA')}</th>
                                        <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('projectManagerMOE')}>CP MOE {renderSortArrow('projectManagerMOE')}</th>
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
                                            <td className="px-6 py-4">{initiativeMap.get(project.initiativeId || '') || '-'}</td>
                                            <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[project.status]}`}>{project.status}</span></td>
                                            <td className="px-6 py-4">{resourceMap.get(project.projectManagerMOA || '') || '-'}</td>
                                            <td className="px-6 py-4">{resourceMap.get(project.projectManagerMOE || '') || '-'}</td>
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
    const { resources, initiatives } = useData();

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
        const isNumber = type === 'number';

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
    
    const { totalWorkload, progress, totalProgress, budgetCalculations } = useMemo(() => {
        const internalConsumed = Number(currentProject.internalWorkloadConsumed) || 0;
        const internalEngaged = Number(currentProject.internalWorkloadEngaged) || 0;
        const externalConsumed = Number(currentProject.externalWorkloadConsumed) || 0;
        const externalEngaged = Number(currentProject.externalWorkloadEngaged) || 0;

        const totalConsumed = internalConsumed + externalConsumed;
        const totalEngaged = internalEngaged + externalEngaged;
        const totalRequested = (Number(currentProject.internalWorkloadRequested) || 0) + (Number(currentProject.externalWorkloadRequested) || 0);

        const internalProgress = internalEngaged > 0 ? Math.round((internalConsumed / internalEngaged) * 100) : 0;
        const externalProgress = externalEngaged > 0 ? Math.round((externalConsumed / externalEngaged) * 100) : 0;
        const totalProgress = totalEngaged > 0 ? Math.round((totalConsumed / totalEngaged) * 100) : 0;
        
        const budgetApproved = Number(currentProject.budgetApproved) || 0;
        const budgetCommitted = Number(currentProject.budgetCommitted) || 0;
        const completedPV = Number(currentProject.completedPV) || 0;
        const forecastedPurchaseOrders = Number(currentProject.forecastedPurchaseOrders) || 0;

        const availableBudget = budgetApproved - budgetCommitted;
        const budgetCommitmentRate = budgetApproved > 0 ? Math.round((budgetCommitted / budgetApproved) * 100) : 0;
        const budgetCompletionRate = budgetCommitted > 0 ? Math.round((completedPV / budgetCommitted) * 100) : 0;
        const forecastedAvailableBudget = budgetApproved - (budgetCommitted + forecastedPurchaseOrders);

        return {
            totalWorkload: {
                requested: totalRequested,
                engaged: totalEngaged,
                consumed: totalConsumed,
            },
            progress: {
                internal: internalProgress,
                external: externalProgress,
            },
            totalProgress,
            budgetCalculations: {
                availableBudget,
                budgetCommitmentRate,
                budgetCompletionRate,
                forecastedAvailableBudget
            }
        };
    }, [currentProject]);


    return (
        <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <label htmlFor="projectId">ID Projet</label>
                <input type="text" name="projectId" value={currentProject.projectId || ''} onChange={handleChange} required readOnly={isReadOnly} />
                </div>
                <div>
                <label htmlFor="title">Titre</label>
                <input type="text" name="title" value={currentProject.title || ''} onChange={handleChange} required readOnly={isReadOnly} />
                </div>
            </div>
            
            <div>
                <label htmlFor="description">Description</label>
                <textarea name="description" value={currentProject.description || ''} onChange={handleChange} rows={3} readOnly={isReadOnly} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="status">Statut</label>
                    <select name="status" value={currentProject.status} onChange={handleChange} disabled={isReadOnly}>
                        {Object.values(ActivityStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="tShirtSize">Taille de t-shirt</label>
                    <select name="tShirtSize" value={currentProject.tShirtSize} onChange={handleChange} disabled={isReadOnly}>
                        {Object.values(TShirtSize).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="initiativeId">Initiative de rattachement</label>
                    <select name="initiativeId" id="initiativeId" value={currentProject.initiativeId || ''} onChange={handleChange} disabled={isReadOnly} required>
                        <option value="" disabled>Sélectionner une initiative</option>
                        {initiatives.map(i => <option key={i.id} value={i.id}>{i.code} - {i.label}</option>)}
                    </select>
                </div>
            </div>
            
             <div>
                <label className="block text-sm font-medium text-slate-700">Mesures ISO</label>
                 <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Rechercher par code ou titre..."
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md bg-white mb-2"
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
                />
            </div>

            <div className="pt-4 flex items-center gap-6">
                 <label htmlFor="isTop30" className="flex items-center cursor-pointer">
                    <input
                        id="isTop30"
                        name="isTop30"
                        type="checkbox"
                        checked={currentProject.isTop30 || false}
                        onChange={handleChange}
                        disabled={isReadOnly}
                        className="sr-only peer"
                    />
                    <div className={`w-4 h-4 border rounded flex-shrink-0 flex items-center justify-center transition-colors ${
                        isReadOnly ? 'bg-slate-200 border-slate-300' : 'bg-white border-slate-400'
                    } peer-checked:bg-blue-600 peer-checked:border-blue-600`}>
                        <svg className="hidden peer-checked:block w-3 h-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                        </svg>
                    </div>
                    <span className="ml-2 text-sm font-medium text-slate-700">Projet Top30</span>
                </label>
                <label htmlFor="isEPA" className="flex items-center cursor-pointer">
                    <input
                        id="isEPA"
                        name="isEPA"
                        type="checkbox"
                        checked={currentProject.isEPA || false}
                        onChange={handleChange}
                        disabled={isReadOnly}
                        className="sr-only peer"
                    />
                    <div className={`w-4 h-4 border rounded flex-shrink-0 flex items-center justify-center transition-colors ${
                        isReadOnly ? 'bg-slate-200 border-slate-300' : 'bg-white border-slate-400'
                    } peer-checked:bg-blue-600 peer-checked:border-blue-600`}>
                        <svg className="hidden peer-checked:block w-3 h-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                        </svg>
                    </div>
                    <span className="ml-2 text-sm font-medium text-slate-700">EPA</span>
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="projectManagerMOA">Chef de projet MOA</label>
                    <select name="projectManagerMOA" value={currentProject.projectManagerMOA || ''} onChange={handleChange} disabled={isReadOnly}>
                        <option value="">Non assigné</option>
                        {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="projectManagerMOE">Chef de projet MOE</label>
                    <select name="projectManagerMOE" value={currentProject.projectManagerMOE || ''} onChange={handleChange} disabled={isReadOnly}>
                        <option value="">Non assigné</option>
                        {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="projectStartDate">Date de début du projet</label>
                    <CalendarDatePicker id="projectStartDate" name="projectStartDate" value={currentProject.projectStartDate?.split('T')[0] || ''} onChange={handleChange} readOnly={isReadOnly} />
                </div>
                <div>
                    <label htmlFor="projectEndDate">Date de fin du projet</label>
                    <CalendarDatePicker id="projectEndDate" name="projectEndDate" value={currentProject.projectEndDate?.split('T')[0] || ''} onChange={handleChange} readOnly={isReadOnly} />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="goLiveDate">Date de passage en NO</label>
                    <CalendarDatePicker id="goLiveDate" name="goLiveDate" value={currentProject.goLiveDate?.split('T')[0] || ''} onChange={handleChange} readOnly={isReadOnly} />
                </div>
                <div>
                    <label htmlFor="endDate">Date de passage en NF</label>
                    <CalendarDatePicker id="endDate" name="endDate" value={currentProject.endDate?.split('T')[0] || ''} onChange={handleChange} readOnly={isReadOnly} />
                </div>
            </div>

            {/* Charges */}
            <div className="space-y-4 pt-4 border-t">
                <h3 className="text-md font-semibold text-slate-800">Charges (en J/H)</h3>
                {/* Interne */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end p-2 border rounded-md bg-slate-50">
                    <div className="col-span-4 font-medium text-slate-600">Interne</div>
                    <div><label htmlFor="internalWorkloadRequested">Demandée</label><input type="number" name="internalWorkloadRequested" value={currentProject.internalWorkloadRequested || ''} onChange={handleChange} readOnly={isReadOnly} min="0"/></div>
                    <div><label htmlFor="internalWorkloadEngaged">Engagée</label><input type="number" name="internalWorkloadEngaged" value={currentProject.internalWorkloadEngaged || ''} onChange={handleChange} readOnly={isReadOnly} min="0"/></div>
                    <div><label htmlFor="internalWorkloadConsumed">Consommée</label><input type="number" name="internalWorkloadConsumed" value={currentProject.internalWorkloadConsumed || ''} onChange={handleChange} readOnly={isReadOnly} min="0"/></div>
                    <div><label>Avancement</label><input type="text" value={`${progress.internal}%`} readOnly className="bg-slate-200" /></div>
                </div>
                 {/* Externe */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end p-2 border rounded-md bg-slate-50">
                    <div className="col-span-4 font-medium text-slate-600">Externe</div>
                    <div><label htmlFor="externalWorkloadRequested">Demandée</label><input type="number" name="externalWorkloadRequested" value={currentProject.externalWorkloadRequested || ''} onChange={handleChange} readOnly={isReadOnly} min="0"/></div>
                    <div><label htmlFor="externalWorkloadEngaged">Engagée</label><input type="number" name="externalWorkloadEngaged" value={currentProject.externalWorkloadEngaged || ''} onChange={handleChange} readOnly={isReadOnly} min="0"/></div>
                    <div><label htmlFor="externalWorkloadConsumed">Consommée</label><input type="number" name="externalWorkloadConsumed" value={currentProject.externalWorkloadConsumed || ''} onChange={handleChange} readOnly={isReadOnly} min="0"/></div>
                    <div><label>Avancement</label><input type="text" value={`${progress.external}%`} readOnly className="bg-slate-200" /></div>
                </div>
                 {/* Total */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end p-2 border rounded-md bg-blue-50">
                    <div className="col-span-4 font-semibold text-blue-800">Total</div>
                    <div><label>Demandée</label><input type="text" value={totalWorkload.requested} readOnly className="bg-slate-200" /></div>
                    <div><label>Engagée</label><input type="text" value={totalWorkload.engaged} readOnly className="bg-slate-200" /></div>
                    <div><label>Consommée</label><input type="text" value={totalWorkload.consumed} readOnly className="bg-slate-200" /></div>
                    <div><label>Avancement total</label><input type="text" value={`${totalProgress}%`} readOnly className="bg-slate-200" /></div>
                </div>
            </div>
            
            {/* Budget */}
            <div className="space-y-4 pt-4 border-t">
                <h3 className="text-md font-semibold text-slate-800">Budget (€)</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2 border rounded-md bg-slate-50">
                        <div><label htmlFor="budgetRequested">Demandé</label><input type="number" name="budgetRequested" value={currentProject.budgetRequested || ''} onChange={handleChange} readOnly={isReadOnly} min="0" step="any"/></div>
                        <div><label htmlFor="budgetApproved">Accordé</label><input type="number" name="budgetApproved" value={currentProject.budgetApproved || ''} onChange={handleChange} readOnly={isReadOnly} min="0" step="any"/></div>
                        <div><label htmlFor="budgetCommitted">Engagé</label><input type="number" name="budgetCommitted" value={currentProject.budgetCommitted || ''} onChange={handleChange} readOnly={isReadOnly} min="0" step="any"/></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2 border rounded-md bg-slate-50">
                        <div><label htmlFor="validatedPurchaseOrders">Demandes d’achat validées</label><input type="number" name="validatedPurchaseOrders" value={currentProject.validatedPurchaseOrders || ''} onChange={handleChange} readOnly={isReadOnly} min="0" step="any"/></div>
                        <div><label htmlFor="completedPV">Réalisé (PV)</label><input type="number" name="completedPV" value={currentProject.completedPV || ''} onChange={handleChange} readOnly={isReadOnly} min="0" step="any"/></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2 border rounded-md bg-blue-50">
                        <div><label>Disponible</label><input type="text" value={new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(budgetCalculations.availableBudget)} readOnly className="bg-slate-200" /></div>
                        <div><label>Taux d'engagement</label><input type="text" value={`${budgetCalculations.budgetCommitmentRate}%`} readOnly className="bg-slate-200" /></div>
                        <div><label>Taux de réalisé</label><input type="text" value={`${budgetCalculations.budgetCompletionRate}%`} readOnly className="bg-slate-200" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2 border rounded-md bg-slate-50">
                        <div><label htmlFor="forecastedPurchaseOrders">Demandes d’achat prévues</label><input type="number" name="forecastedPurchaseOrders" value={currentProject.forecastedPurchaseOrders || ''} onChange={handleChange} readOnly={isReadOnly} min="0" step="any"/></div>
                        <div><label>Disponible prévu</label><input type="text" value={new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(budgetCalculations.forecastedAvailableBudget)} readOnly className="bg-slate-200" /></div>
                    </div>
                </div>
            </div>


            <div className="flex justify-end gap-2 pt-4 border-t mt-6">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">{isReadOnly ? 'Fermer' : 'Annuler'}</button>
                {!isReadOnly && <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Enregistrer</button>}
            </div>
        </form>
    );
};

// Simple input styling for the form
const style = document.createElement('style');
style.textContent = `
    form label {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        color: #475569;
        margin-bottom: 0.25rem;
    }
    form input[type="text"], form input[type="number"], form textarea, form select {
        display: block;
        width: 100%;
        padding: 0.5rem 0.75rem;
        background-color: white;
        border: 1px solid #cbd5e1;
        border-radius: 0.375rem;
        box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    }
     form input[readonly], form textarea[readonly], form select[disabled] {
        background-color: #f1f5f9;
        cursor: not-allowed;
    }
`;
document.head.append(style);


export default Projects;