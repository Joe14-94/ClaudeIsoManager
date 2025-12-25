
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Project, ProjectStatus, TShirtSize, ProjectCategory, ProjectWeather } from '../types';
import { PROJECT_STATUS_COLORS } from '../constants';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { Search, PlusCircle, Edit, ArrowUp, ArrowDown, Trash2, Sun, Cloud, CloudRain, CloudLightning, ChevronDown, FilterX, Flag, Link } from 'lucide-react';
import ActiveFiltersDisplay from '../components/ui/ActiveFiltersDisplay';
import Tooltip from '../components/ui/Tooltip';
import ProjectForm from '../components/projects/ProjectForm';
import { useTableSort } from '../hooks/useTableSort';
import { analyzeCriticalPath } from '../utils/projectAnalysis';
import ExportButton from '../components/ui/ExportButton';
import { CsvColumn, dateFormatters, arrayFormatter, numberFormatters } from '../utils/csvExport';

const WEATHER_ICONS = {
    [ProjectWeather.SUNNY]: <Sun className="text-yellow-500" size={20} />,
    [ProjectWeather.CLOUDY]: <Cloud className="text-gray-400" size={20} />,
    [ProjectWeather.RAINY]: <CloudRain className="text-blue-400" size={20} />,
    [ProjectWeather.STORM]: <CloudLightning className="text-purple-600" size={20} />,
};

const CategoryFilterDropdown: React.FC<{ selectedCategories: string[]; onChange: (categories: string[]) => void; }> = ({ selectedCategories, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleCategory = (category: string) => {
        if (selectedCategories.includes(category)) onChange(selectedCategories.filter(c => c !== category));
        else onChange([...selectedCategories, category]);
    };

    return (
        <div className="relative" ref={dropdownRef}>
             <button type="button" onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full md:w-auto px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm min-w-[180px] text-slate-700">
                <span className="truncate">{selectedCategories.length === 0 ? "Toutes les catégories" : selectedCategories.length === 1 ? selectedCategories[0] : `${selectedCategories.length} catégories`}</span>
                <ChevronDown size={16} className="ml-2 text-slate-500 flex-shrink-0" />
            </button>
            {isOpen && (
                <div className="absolute z-20 mt-1 w-full md:w-64 bg-white shadow-lg rounded-md py-1 ring-1 ring-black ring-opacity-5 overflow-auto max-h-60 focus:outline-none border border-slate-200">
                    {Object.values(ProjectCategory).map((category) => (
                        <div key={category} className="flex items-center px-4 py-2 hover:bg-slate-50 cursor-pointer group" onClick={() => toggleCategory(category)}>
                            <div className={`w-4 h-4 border rounded flex-shrink-0 flex items-center justify-center transition-colors bg-white ${selectedCategories.includes(category) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'}`}>{selectedCategories.includes(category) && (<svg className="w-3 h-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" /></svg>)}</div>
                            <span className="ml-3 block text-sm text-slate-700">{category}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const Projects: React.FC = () => {
    const { projects, setProjects, resources, initiatives } = useData();
    const isReadOnly = false;
    const location = useLocation();
    const navigate = useNavigate();
    const locationState = location.state as any;

    const [isModalOnly, setIsModalOnly] = useState(false);
    const [statusFilter, setStatusFilter] = useState(locationState?.statusFilter || '');
    const [top30Filter, setTop30Filter] = useState(locationState?.top30Filter || '');
    const [categoriesFilter, setCategoriesFilter] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    const { sortConfig, requestSort } = useTableSort<Project>(projects, 'projectId');
    
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentProject, setCurrentProject] = useState<Partial<Project> | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    
    const criticalPath = useMemo(() => analyzeCriticalPath(projects), [projects]);

    const handleOpenFormModal = useCallback((projectData?: Partial<Project>) => {
        if (projectData && projectData.id) {
            const projectWithDefaults = { ...projectData, milestones: projectData.milestones || [], majorRiskIds: projectData.majorRiskIds || [], predecessorIds: projectData.predecessorIds || [] };
            setCurrentProject(projectWithDefaults as Project);
            setIsEditMode(true);
        } else {
            if(isReadOnly) return;
            const nextIdNumber = projects.length > 0 ? Math.max(...projects.map(p => { const match = p.projectId.match(/P\d{2}-(\d{3})/); return match ? parseInt(match[1], 10) : 0; })) + 1 : 1;
            const defaultNewProject: Partial<Project> = { projectId: `P25-${String(nextIdNumber).padStart(3, '0')}`, title: '', status: ProjectStatus.IDENTIFIED, tShirtSize: TShirtSize.M, isTop30: false, category: ProjectCategory.PROJECT, initiativeId: initiatives[0]?.id || '', isoMeasures: [], weather: ProjectWeather.SUNNY, milestones: [], majorRiskIds: [], predecessorIds: [], strategicImpact: 3, riskCoverage: 3, effort: 3, priorityScore: 3 };
            setCurrentProject({ ...defaultNewProject, ...(projectData || {}) });
            setIsEditMode(false);
        }
        setIsFormModalOpen(true);
    }, [isReadOnly, projects, initiatives]);

    useEffect(() => {
        const projectToOpenId = locationState?.openProject;
        if (projectToOpenId && !isFormModalOpen) {
            const projectToOpen = projects.find(p => p.id === projectToOpenId);
            if (projectToOpen) {
                setIsModalOnly(true);
                handleOpenFormModal(projectToOpen);
                const newState = { ...locationState };
                delete newState.openProject;
                navigate(location.pathname, { replace: true, state: newState });
            }
        }
    }, [locationState, projects, navigate, isFormModalOpen, handleOpenFormModal]);

    useEffect(() => {
        if (locationState?.statusFilter !== undefined) setStatusFilter(locationState.statusFilter);
        if (locationState?.top30Filter !== undefined) setTop30Filter(locationState.top30Filter);
    }, [locationState]);

    useEffect(() => {
        const { projectDataToEdit } = location.state || {};
        if (projectDataToEdit) {
            handleOpenFormModal(projectDataToEdit);
             const newState = { ...locationState };
             delete newState.projectDataToEdit;
             navigate(location.pathname, { replace: true, state: newState });
        }
    }, [location.state, navigate, handleOpenFormModal, locationState]);

    const resourceMap = useMemo(() => new Map(resources.map(r => [r.id, r.name])), [resources]);
    const initiativeMap = useMemo(() => new Map(initiatives.map(i => [i.id, i.label])), [initiatives]);
    
    const handleOpenDeleteModal = (project: Project) => { if (isReadOnly) return; setProjectToDelete(project); setIsDeleteModalOpen(true); };
    const handleCloseDeleteModal = () => { setProjectToDelete(null); setIsDeleteModalOpen(false); };
    const confirmDelete = () => { if (isReadOnly || !projectToDelete) return; setProjects(prev => prev.filter(p => p.id !== projectToDelete.id)); handleCloseDeleteModal(); };
    const handleCloseModal = () => { if (isModalOnly) navigate(-1); else { setIsFormModalOpen(false); setCurrentProject(null); setIsEditMode(false); } };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentProject || isReadOnly) return;
        if (!currentProject.title || !currentProject.projectId || !currentProject.initiativeId) { alert("L'ID projet, le titre et l'initiative sont obligatoires."); return; }
        if (isEditMode && currentProject.id) {
            const updatedProject: Project = { ...currentProject, updatedAt: new Date().toISOString() } as Project;
            setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
        } else {
            const newProject: Project = { id: `proj-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...currentProject, } as Project;
            setProjects(prev => [newProject, ...prev]);
        }
        handleCloseModal();
    };

    const getProjectProgress = (project: Project): number => {
        const consumed = (project.internalWorkloadConsumed || 0) + (project.externalWorkloadConsumed || 0);
        const engaged = (project.internalWorkloadEngaged || 0) + (project.externalWorkloadEngaged || 0);
        return engaged > 0 ? Math.round((consumed / engaged) * 100) : 0;
    };

    const sortedProjects = useMemo(() => {
        const uoPattern = /^([a-zA-Z]+|\d+)\.\d+\.\d+\.\d+$/;
        let sortableItems = [...projects].filter(project => {
            if (uoPattern.test(project.projectId) || project.projectId === 'TOTAL_GENERAL') return false;
            return (
                (statusFilter === '' || project.status === statusFilter) &&
                (top30Filter === '' || String(project.isTop30) === top30Filter) &&
                (categoriesFilter.length === 0 || categoriesFilter.includes(project.category)) &&
                (searchTerm === '' || project.title.toLowerCase().includes(searchTerm.toLowerCase()) || project.projectId.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        });

        if (sortConfig !== null) {
          sortableItems.sort((a, b) => {
            let aValue: string | number | undefined;
            let bValue: string | number | undefined;
            switch(sortConfig.key) {
                case 'projectManagerMOA': aValue = resourceMap.get(a.projectManagerMOA || ''); bValue = resourceMap.get(b.projectManagerMOA || ''); break;
                case 'projectManagerMOE': aValue = resourceMap.get(b.projectManagerMOE || ''); bValue = resourceMap.get(b.projectManagerMOE || ''); break;
                case 'totalProgress': aValue = getProjectProgress(a); bValue = getProjectProgress(b); break;
                case 'initiative': aValue = initiativeMap.get(a.initiativeId || ''); bValue = initiativeMap.get(b.initiativeId || ''); break;
                case 'priorityScore': aValue = a.priorityScore || 0; bValue = b.priorityScore || 0; break;
                default: aValue = a[sortConfig.key as keyof Project] as string; bValue = b[sortConfig.key as keyof Project] as string;
            }
            aValue = aValue ?? (typeof aValue === 'number' ? -1 : ''); bValue = bValue ?? (typeof bValue === 'number' ? -1 : '');
            let comparison = 0;
            if (typeof aValue === 'number' && typeof bValue === 'number') comparison = aValue - bValue;
            else comparison = String(aValue).localeCompare(String(bValue), 'fr', { numeric: true, sensitivity: 'base' });
            return sortConfig.direction === 'ascending' ? comparison : -comparison;
          });
        }
        return sortableItems;
    }, [projects, statusFilter, top30Filter, categoriesFilter, searchTerm, sortConfig, resourceMap, initiativeMap]);

    const renderSortArrow = (key: string) => { if (sortConfig?.key === key) return sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />; return null; }

    const activeFiltersForDisplay = useMemo(() => {
        const filters: { [key: string]: string } = {};
        if (statusFilter) filters['Statut'] = statusFilter;
        if (top30Filter) filters['Top 30'] = top30Filter === 'true' ? 'Oui' : 'Non';
        if (categoriesFilter.length > 0) filters['Catégorie'] = categoriesFilter.length === 1 ? categoriesFilter[0] : `${categoriesFilter.length} sélectionnées`;
        return filters;
    }, [statusFilter, top30Filter, categoriesFilter]);

    const handleRemoveFilter = (key: string) => { if (key === 'Statut') setStatusFilter(''); if (key === 'Top 30') setTop30Filter(''); if (key === 'Catégorie') setCategoriesFilter([]); };
    const handleClearAll = () => { setStatusFilter(''); setTop30Filter(''); setCategoriesFilter([]); setSearchTerm(''); };

    // Configuration des colonnes pour l'export CSV
    const csvColumns: CsvColumn<Project>[] = useMemo(() => [
        { header: 'ID', accessor: 'projectId' },
        { header: 'Titre', accessor: 'title' },
        { header: 'Description', accessor: 'description' },
        { header: 'Statut', accessor: 'status' },
        { header: 'Catégorie', accessor: 'category' },
        { header: 'Taille', accessor: 'tShirtSize' },
        { header: 'Top 30', accessor: (p) => p.isTop30 ? 'Oui' : 'Non' },
        { header: 'Initiative', accessor: (p) => initiativeMap.get(p.initiativeId || '') || 'N/A' },
        { header: 'Météo', accessor: 'weather' },
        { header: 'Description météo', accessor: 'weatherDescription' },
        { header: 'Chef de projet MOA', accessor: 'projectManagerMOA' },
        { header: 'Chef de projet MOE', accessor: 'projectManagerMOE' },
        { header: 'Date début', accessor: 'projectStartDate', formatter: dateFormatters.french },
        { header: 'Date fin', accessor: 'projectEndDate', formatter: dateFormatters.french },
        { header: 'Go Live', accessor: 'goLiveDate', formatter: dateFormatters.french },
        { header: 'Avancement (%)', accessor: (p) => getProjectProgress(p) },
        { header: 'Sur chemin critique', accessor: (p) => criticalPath.has(p.id) ? 'Oui' : 'Non' },
        { header: 'Mesures ISO', accessor: (p) => p.isoMeasures, formatter: arrayFormatter },
        { header: 'Impact stratégique (1-5)', accessor: 'strategicImpact' },
        { header: 'Couverture risque (1-5)', accessor: 'riskCoverage' },
        { header: 'Effort (1-5)', accessor: 'effort' },
        { header: 'Score priorité', accessor: 'priorityScore', formatter: (v) => v ? numberFormatters.decimal(v, 1) : '' },
        { header: 'Charge interne demandée', accessor: 'internalWorkloadRequested', formatter: (v) => v ? String(v) : '' },
        { header: 'Charge interne engagée', accessor: 'internalWorkloadEngaged', formatter: (v) => v ? String(v) : '' },
        { header: 'Charge interne consommée', accessor: 'internalWorkloadConsumed', formatter: (v) => v ? String(v) : '' },
        { header: 'Charge externe demandée', accessor: 'externalWorkloadRequested', formatter: (v) => v ? String(v) : '' },
        { header: 'Charge externe engagée', accessor: 'externalWorkloadEngaged', formatter: (v) => v ? String(v) : '' },
        { header: 'Charge externe consommée', accessor: 'externalWorkloadConsumed', formatter: (v) => v ? String(v) : '' },
        { header: 'Budget demandé', accessor: 'budgetRequested', formatter: (v) => v ? numberFormatters.currency(v) : '' },
        { header: 'Budget approuvé', accessor: 'budgetApproved', formatter: (v) => v ? numberFormatters.currency(v) : '' },
        { header: 'Budget engagé', accessor: 'budgetCommitted', formatter: (v) => v ? numberFormatters.currency(v) : '' },
        { header: 'Bons de commande validés', accessor: 'validatedPurchaseOrders', formatter: (v) => v ? numberFormatters.currency(v) : '' },
        { header: 'PV complétés', accessor: 'completedPV', formatter: (v) => v ? numberFormatters.currency(v) : '' },
        { header: 'Bons de commande prévisionnels', accessor: 'forecastedPurchaseOrders', formatter: (v) => v ? numberFormatters.currency(v) : '' },
        { header: 'Créé le', accessor: 'createdAt', formatter: dateFormatters.frenchWithTime },
        { header: 'Modifié le', accessor: 'updatedAt', formatter: dateFormatters.frenchWithTime },
    ], [initiativeMap, criticalPath]);

    return (
        <div className="space-y-6 h-full flex flex-col">
            {!isModalOnly && (
                <>
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <h1 className="text-3xl font-bold text-slate-800">Projets</h1>
                        <div className="flex items-center gap-2">
                            <ExportButton
                                data={sortedProjects}
                                columns={csvColumns}
                                filename={`projets-${new Date().toISOString().split('T')[0]}.csv`}
                                label="Exporter"
                            />
                            {!isReadOnly && (
                                <button
                                    onClick={() => handleOpenFormModal()}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <PlusCircle size={20} />
                                    <span>Nouveau projet</span>
                                </button>
                            )}
                        </div>
                    </div>
                    <Card className="flex-grow flex flex-col min-h-0">
                        <CardHeader>
                            <div className="flex flex-col md:flex-row flex-wrap gap-4 mb-4">
                                <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} /><input type="text" placeholder="Rechercher un projet..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div>
                                <CategoryFilterDropdown selectedCategories={categoriesFilter} onChange={setCategoriesFilter} />
                                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"><option value="">Tous les statuts</option>{Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}</select>
                                <select value={top30Filter} onChange={(e) => setTop30Filter(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"><option value="">Tous les projets</option><option value="true">Top 30</option><option value="false">Hors Top 30</option></select>
                            </div>
                            <div className="flex justify-between items-center"><ActiveFiltersDisplay filters={activeFiltersForDisplay} onRemoveFilter={handleRemoveFilter} onClearAll={handleClearAll} />{searchTerm && (<div className="text-sm text-slate-500">{sortedProjects.length} résultat(s)</div>)}</div>
                        </CardHeader>
                        <CardContent className="flex-grow overflow-y-auto">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-slate-500">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-100 sticky top-0 z-10">
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
                                    {sortedProjects.map(project => {
                                        const isCritical = criticalPath.has(project.id);
                                        const hasDependencies = project.predecessorIds && project.predecessorIds.length > 0;
                                        return (
                                        <tr key={project.id} className={`border-b hover:bg-slate-50 ${isCritical ? 'bg-red-50/30' : 'bg-white'}`}>
                                            <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap flex items-center gap-2">{project.projectId}<div className="flex gap-1">{hasDependencies && (<Tooltip text="Ce projet a des dépendances"><Link size={14} className="text-slate-400" /></Tooltip>)}{isCritical && (<Tooltip text="Chemin Critique : Tout retard sur ce projet impactera la date de fin globale"><Flag size={14} className="text-red-500 fill-red-500" /></Tooltip>)}</div></th>
                                            <td className="px-6 py-4">{project.title}</td>
                                            <td className="px-6 py-4">{project.weather ? (<Tooltip text={project.weatherDescription || project.weather}>{WEATHER_ICONS[project.weather]}</Tooltip>) : (<span className="text-slate-400">-</span>)}</td>
                                            <td className="px-6 py-4">{initiativeMap.get(project.initiativeId || '') || '-'}</td>
                                            <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${PROJECT_STATUS_COLORS[project.status]}`}>{project.status}</span></td>
                                            <td className="px-6 py-4">{project.priorityScore ? (<span className={`font-bold ${project.priorityScore >= 15 ? 'text-red-600' : project.priorityScore >= 8 ? 'text-orange-500' : 'text-blue-600'}`}>{project.priorityScore.toFixed(1)}</span>) : '-'}</td>
                                            <td className="px-6 py-4">{getProjectProgress(project)}%</td>
                                            <td className="px-6 py-4">{project.isTop30 ? 'Oui' : 'Non'}</td>
                                            <td className="px-6 py-4 text-right space-x-1">
                                                <button onClick={() => handleOpenFormModal(project)} className="p-1 text-slate-500 rounded-md hover:bg-slate-100 hover:text-blue-600" title="Modifier le projet"><Edit size={18} /></button>
                                                {!isReadOnly && (<button onClick={() => handleOpenDeleteModal(project)} className="p-1 text-slate-500 rounded-md hover:bg-slate-100 hover:text-red-600" title="Supprimer le projet"><Trash2 size={18} /></button>)}
                                            </td>
                                        </tr>
                                    )})}
                                </tbody>
                                </table>
                                {sortedProjects.length === 0 && <div className="text-center py-8 text-slate-500">Aucun projet ne correspond à vos critères.</div>}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
             {isFormModalOpen && currentProject && (
                <Modal isOpen={isFormModalOpen} onClose={handleCloseModal} title={isEditMode ? "Détails du projet" : "Nouveau projet"}>
                    <ProjectForm currentProject={currentProject} setCurrentProject={setCurrentProject} isReadOnly={isReadOnly} handleSave={handleSave} handleCloseModal={handleCloseModal}/>
                </Modal>
            )}
            {isDeleteModalOpen && projectToDelete && (
                <Modal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} title="Confirmer la suppression">
                    <p>Êtes-vous sûr de vouloir supprimer le projet "{projectToDelete.title}" ? Cette action est irréversible.</p>
                    <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
                        <button type="button" onClick={handleCloseDeleteModal} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">Annuler</button>
                        <button type="button" onClick={confirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Supprimer</button>
                    </div>
                </Modal>
            )}
        </div>
    );
};
export default Projects;
