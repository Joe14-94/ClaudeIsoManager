import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useData } from '../contexts/DataContext';
import { ISO_MEASURES_DATA } from '../constants';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { LayoutGrid, FileDown, Filter, X, GripVertical, Info, ArrowUp, ArrowDown, ZoomIn, ZoomOut, RotateCw, Search } from 'lucide-react';
import { Project, Initiative, Resource, IsoMeasure } from '../types';

const formatCurrency = (value?: number) => {
    if (value === undefined || value === null || isNaN(value)) return 'N/A';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

const getProjectProgress = (project: Project): number => {
    const consumed = (project.internalWorkloadConsumed || 0) + (project.externalWorkloadConsumed || 0);
    const engaged = (project.internalWorkloadEngaged || 0) + (project.externalWorkloadEngaged || 0);
    return engaged > 0 ? Math.round((consumed / engaged) * 100) : 0;
};

type FieldKey = 'projectId' | 'title' | 'status' | 'tShirtSize' | 'isTop30' | 'initiative' | 'projectManagerMOA' | 'projectManagerMOE' | 'projectStartDate' | 'projectEndDate' | 'goLiveDate' | 'endDate' | 'isoMeasure' | 'internalWorkloadRequested' | 'internalWorkloadEngaged' | 'internalWorkloadConsumed' | 'externalWorkloadRequested' | 'externalWorkloadEngaged' | 'externalWorkloadConsumed' | 'totalProgress' | 'budgetRequested' | 'budgetApproved' | 'budgetCommitted' | 'validatedPurchaseOrders' | 'completedPV' | 'forecastedPurchaseOrders' | 'availableBudget' | 'budgetCommitmentRate' | 'budgetCompletionRate';

interface Field {
  key: FieldKey;
  label: string;
  getValue: (row: ProcessedProjectRow) => string | number | undefined;
}

interface ProcessedProjectRow {
    project: Project;
    initiative?: Initiative;
    managerMOA?: Resource;
    managerMOE?: Resource;
    isoMeasure?: IsoMeasure;
}

const AVAILABLE_FIELDS: Field[] = [
    { key: 'projectId', label: 'ID Projet', getValue: row => row.project.projectId },
    { key: 'title', label: 'Titre', getValue: row => row.project.title },
    { key: 'status', label: 'Statut', getValue: row => row.project.status },
    { key: 'tShirtSize', label: 'Taille', getValue: row => row.project.tShirtSize },
    { key: 'isTop30', label: 'Top 30', getValue: row => row.project.isTop30 ? 'Oui' : 'Non' },
    { key: 'initiative', label: 'Initiative', getValue: row => row.initiative ? `${row.initiative.code} - ${row.initiative.label}` : undefined },
    { key: 'projectManagerMOA', label: 'CP MOA', getValue: row => row.managerMOA?.name },
    { key: 'projectManagerMOE', label: 'CP MOE', getValue: row => row.managerMOE?.name },
    { key: 'projectStartDate', label: 'Date Début', getValue: row => row.project.projectStartDate ? new Date(row.project.projectStartDate).toLocaleDateString('fr-CA') : undefined },
    { key: 'projectEndDate', label: 'Date Fin', getValue: row => row.project.projectEndDate ? new Date(row.project.projectEndDate).toLocaleDateString('fr-CA') : undefined },
    { key: 'isoMeasure', label: 'Mesure ISO', getValue: row => row.isoMeasure ? `${row.isoMeasure.code} - ${row.isoMeasure.title}` : undefined },
    { key: 'internalWorkloadRequested', label: 'Charge Int. Demandée', getValue: row => row.project.internalWorkloadRequested },
    { key: 'internalWorkloadEngaged', label: 'Charge Int. Engagée', getValue: row => row.project.internalWorkloadEngaged },
    { key: 'internalWorkloadConsumed', label: 'Charge Int. Consommée', getValue: row => row.project.internalWorkloadConsumed },
    { key: 'externalWorkloadRequested', label: 'Charge Ext. Demandée', getValue: row => row.project.externalWorkloadRequested },
    { key: 'externalWorkloadEngaged', label: 'Charge Ext. Engagée', getValue: row => row.project.externalWorkloadEngaged },
    { key: 'externalWorkloadConsumed', label: 'Charge Ext. Consommée', getValue: row => row.project.externalWorkloadConsumed },
    { key: 'totalProgress', label: 'Avancement (%)', getValue: row => getProjectProgress(row.project) },
    { key: 'budgetRequested', label: 'Budget Demandé (€)', getValue: row => formatCurrency(row.project.budgetRequested) },
    { key: 'budgetApproved', label: 'Budget Accordé (€)', getValue: row => formatCurrency(row.project.budgetApproved) },
    { key: 'budgetCommitted', label: 'Budget Engagé (€)', getValue: row => formatCurrency(row.project.budgetCommitted) },
];

const PROJECT_EXPLORER_STATE_KEY = 'projectExplorerState';

const loadState = () => {
    try {
        const savedState = sessionStorage.getItem(PROJECT_EXPLORER_STATE_KEY);
        if (savedState) {
            const parsed = JSON.parse(savedState);
            if (parsed.columnKeys) {
                parsed.columns = parsed.columnKeys
                    .map((key: FieldKey) => AVAILABLE_FIELDS.find(f => f.key === key))
                    .filter(Boolean);
            }
            return parsed;
        }
    } catch (e) { console.error("Failed to load project explorer state", e); }
    return {};
};

const ProjectsExplorer: React.FC = () => {
    const { projects, initiatives, resources } = useData();
    
    const [columns, setColumns] = useState<Field[]>(() => loadState().columns || []);
    const [filters, setFilters] = useState<Partial<Record<FieldKey, string[]>>>(() => loadState().filters || {});
    const [filterModalField, setFilterModalField] = useState<Field | null>(null);
    const [draggedItem, setDraggedItem] = useState<Field | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: FieldKey; direction: 'asc' | 'desc' } | null>(() => loadState().sortConfig || null);
    
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => loadState().columnWidths || {});
    const [isResizing, setIsResizing] = useState(false);
    const resizingRef = useRef<{ key: string; startX: number; startWidth: number } | null>(null);
    const [zoomLevel, setZoomLevel] = useState<number>(() => loadState().zoomLevel || 1);

    useEffect(() => {
        try {
            const stateToSave = {
                columnKeys: columns.map(c => c.key),
                filters, sortConfig, columnWidths, zoomLevel,
            };
            sessionStorage.setItem(PROJECT_EXPLORER_STATE_KEY, JSON.stringify(stateToSave));
        } catch (e) { console.error("Failed to save project explorer state", e); }
    }, [columns, filters, sortConfig, columnWidths, zoomLevel]);

    const allIsoMeasures = useMemo(() => ISO_MEASURES_DATA.map(m => ({...m, id: m.code}) as IsoMeasure), []);
    
    const dataMaps = useMemo(() => ({
        initiativesMap: new Map(initiatives.map(i => [i.id, i])),
        resourceMap: new Map(resources.map(r => [r.id, r])),
        isoMeasuresMap: new Map(allIsoMeasures.map(m => [m.code, m])),
    }), [initiatives, resources, allIsoMeasures]);

    const processedData = useMemo<ProcessedProjectRow[]>(() => {
        const rows: ProcessedProjectRow[] = [];
        const { initiativesMap, resourceMap, isoMeasuresMap } = dataMaps;

        projects.forEach(project => {
            const initiative = initiativesMap.get(project.initiativeId);
            const managerMOA = resourceMap.get(project.projectManagerMOA || '');
            const managerMOE = resourceMap.get(project.projectManagerMOE || '');
            
            if (project.isoMeasures && project.isoMeasures.length > 0) {
                project.isoMeasures.forEach(isoCode => {
                    const isoMeasure = isoMeasuresMap.get(isoCode);
                    rows.push({ project, initiative, managerMOA, managerMOE, isoMeasure });
                });
            } else {
                rows.push({ project, initiative, managerMOA, managerMOE });
            }
        });
        return rows;
    }, [projects, dataMaps]);

    const requestSort = useCallback((key: FieldKey) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    }, [sortConfig]);
    
    useEffect(() => {
        if (columns.length > 0 && (!sortConfig || !columns.find(c => c.key === sortConfig.key))) {
            requestSort(columns[0].key);
        } else if (columns.length === 0) {
            setSortConfig(null);
        }
    }, [columns, sortConfig, requestSort]);

    const filteredData = useMemo(() => {
        if (Object.keys(filters).length === 0) return processedData;
        return processedData.filter(row => {
            return Object.entries(filters).every(([key, values]) => {
                if (!Array.isArray(values)) return true;
                if (values.length === 0) return false;

                const field = AVAILABLE_FIELDS.find(f => f.key === key as FieldKey);
                if (!field) return true;
                const rowValue = field.getValue(row);
                return rowValue !== undefined && values.includes(String(rowValue));
            });
        });
    }, [processedData, filters]);
    
    const finalTableData = useMemo(() => {
        if (columns.length === 0) return [];
        const uniqueCombinations = new Map<string, ProcessedProjectRow>();
        
        filteredData.forEach(row => {
            const key = columns.map(c => c.getValue(row) ?? 'null').join('||');
            if (!uniqueCombinations.has(key)) uniqueCombinations.set(key, row);
        });
        
        let items = Array.from(uniqueCombinations.values());

        if (sortConfig) {
            const fieldToSort = AVAILABLE_FIELDS.find(f => f.key === sortConfig.key);
            if (fieldToSort) {
                items.sort((a, b) => {
                    const valA = fieldToSort.getValue(a);
                    const valB = fieldToSort.getValue(b);
                    if (valA === undefined) return 1;
                    if (valB === undefined) return -1;
                    const comparison = String(valA).localeCompare(String(valB), 'fr', { numeric: true, sensitivity: 'base' });
                    return sortConfig.direction === 'asc' ? comparison : -comparison;
                });
            }
        }
        return items;
    }, [filteredData, columns, sortConfig]);

    const uniqueValuesForFilter = useMemo(() => {
        if (!filterModalField) return [];
        const values = new Set<string>();
        processedData.forEach(row => {
            const value = filterModalField.getValue(row);
            if (value !== undefined) values.add(String(value));
        });
        return Array.from(values).sort((a, b) => a.localeCompare(b, 'fr', {numeric: true}));
    }, [processedData, filterModalField]);

    const openFilterModal = useCallback((field: Field) => setFilterModalField(field), []);

    useEffect(() => {
        if (filterModalField && filters[filterModalField.key] === undefined) {
            setFilters(prev => ({ ...prev, [filterModalField.key]: uniqueValuesForFilter }));
        }
    }, [filterModalField, filters, uniqueValuesForFilter]);
    
    const handleColumnToggle = (field: Field) => {
        setColumns(prev => {
            const isSelected = prev.some(c => c.key === field.key);
            if (isSelected) {
                return prev.filter(c => c.key !== field.key);
            } else {
                return [...prev, field];
            }
        });
    };
    
    const removeColumn = (key: FieldKey) => {
        setColumns(columns.filter(c => c.key !== key));
    };
    
    const handleReorderStart = (e: React.DragEvent<HTMLDivElement>, field: Field) => {
        setDraggedItem(field);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handlePillDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        if (!draggedItem) return;

        const targetElement = e.currentTarget as HTMLDivElement;
        const rect = targetElement.getBoundingClientRect();
        const midpoint = rect.left + rect.width / 2;
        
        const newIndex = e.clientX < midpoint ? index : index + 1;
        
        if (newIndex !== dragOverIndex) {
            setDragOverIndex(newIndex);
        }
    };

    const handleReorderDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!draggedItem || dragOverIndex === null) {
            setDraggedItem(null);
            setDragOverIndex(null);
            return;
        }
        
        const dragIndex = columns.findIndex(c => c.key === draggedItem.key);
        if (dragIndex === -1) return;

        const newColumns = [...columns];
        const [removed] = newColumns.splice(dragIndex, 1);
        
        const dropIndex = dragIndex < dragOverIndex ? dragOverIndex - 1 : dragOverIndex;
        
        if (dragIndex !== dropIndex) {
            newColumns.splice(dropIndex, 0, removed);
            setColumns(newColumns);
        }
        
        setDraggedItem(null);
        setDragOverIndex(null);
    };

    const handleReorderEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDraggedItem(null);
        setDragOverIndex(null);
    };

    const handleExport = () => {
        if (columns.length === 0) return;
        const headers = columns.map(c => c.label).join(',');
        const rows = finalTableData.map(row => columns.map(col => `"${String(col.getValue(row) || '').replace(/"/g, '""')}"`).join(',')).join('\n');
        const csvContent = `data:text/csv;charset=utf-8,\uFEFF${headers}\n${rows}`;
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csvContent));
        link.setAttribute('download', 'export_projets.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleMouseDownForResize = useCallback((e: React.MouseEvent, key: string) => {
        e.stopPropagation();
        const thElement = (e.target as HTMLElement).closest('th');
        if (thElement) {
            resizingRef.current = { key, startX: e.clientX, startWidth: thElement.offsetWidth };
            setIsResizing(true);
        }
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || !resizingRef.current) return;
            const { key, startX, startWidth } = resizingRef.current;
            const newWidth = startWidth + (e.clientX - startX);
            if (newWidth > 80) setColumnWidths(prev => ({ ...prev, [key]: newWidth }));
        };
        const handleMouseUp = () => { setIsResizing(false); resizingRef.current = null; };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
    }, [isResizing]);

    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 1.5));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.7));
    const handleResetZoom = () => setZoomLevel(1);

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800">Explorateur de données projets</h1>
                <button onClick={handleExport} disabled={columns.length === 0} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400">
                    <FileDown size={18} /><span>Exporter en CSV</span>
                </button>
            </div>

            <div className="grid grid-cols-12 gap-4 flex-grow min-h-0">
                <div className="col-span-12 lg:col-span-3 xl:col-span-2 flex flex-col">
                    <Card className="flex-grow flex flex-col min-h-0">
                        <CardHeader><CardTitle>Champs disponibles</CardTitle></CardHeader>
                        <CardContent className="flex-grow overflow-y-auto">
                           <div className="space-y-1">
                            {AVAILABLE_FIELDS.map(field => (
                                <label key={field.key} className="flex items-center p-2 rounded-md hover:bg-slate-100 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={columns.some(c => c.key === field.key)}
                                        onChange={() => handleColumnToggle(field)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-4 h-4 bg-white border border-slate-400 rounded flex-shrink-0 flex items-center justify-center peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors">
                                       <svg className="hidden peer-checked:block w-3 h-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" /></svg>
                                    </div>
                                    <span className="ml-3 text-sm text-slate-700">{field.label}</span>
                                </label>
                            ))}
                           </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="col-span-12 lg:col-span-9 xl:col-span-10 grid grid-rows-[auto_1fr] gap-4 min-h-0">
                    <Card>
                        <CardHeader><CardTitle>Colonnes du tableau</CardTitle><p className="text-sm text-slate-500 mt-1">Cochez des champs pour les ajouter. Glissez-déposez les pastilles pour les réordonner.</p></CardHeader>
                        <CardContent 
                            className="min-h-[80px] p-2 border-2 border-dashed border-slate-200 rounded-md"
                            onDrop={handleReorderDrop}
                            onDragLeave={() => setDragOverIndex(null)}
                             onDragOver={(e) => { e.preventDefault(); if (draggedItem) { setDragOverIndex(columns.length); }}}
                        >
                            <div className="flex flex-wrap items-center">
                                {columns.length === 0 && !draggedItem && <p className="text-slate-500 text-sm p-4 text-center w-full">Sélectionnez un champ pour commencer...</p>}
                                
                                {columns.map((col, index) => (
                                    <React.Fragment key={col.key}>
                                        {dragOverIndex === index && <div className="w-2 h-10 bg-blue-500 rounded-full" />}
                                        <div 
                                            className="p-1"
                                            onDragOver={e => handlePillDragOver(e, index)}
                                        >
                                            <div 
                                                draggable 
                                                onDragStart={e => handleReorderStart(e, col)}
                                                onDragEnd={handleReorderEnd}
                                                className={`flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-full px-3 py-1 text-sm font-medium cursor-grab active:cursor-grabbing ${draggedItem?.key === col.key ? 'opacity-50' : ''}`}
                                            >
                                                <GripVertical size={14} className="text-slate-400" />
                                                <span>{col.label}</span>
                                                <button onClick={() => openFilterModal(col)} className="p-0.5 rounded-full hover:bg-slate-200" title="Filtrer"><Filter size={14} /></button>
                                                <button onClick={() => removeColumn(col.key)} className="p-0.5 rounded-full hover:bg-slate-200" title="Retirer"><X size={14} /></button>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                ))}
                                 {dragOverIndex === columns.length && <div className="w-2 h-10 bg-blue-500 rounded-full" />}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="grid grid-rows-[auto_1fr] min-h-0">
                        <CardHeader className="flex justify-between items-center">
                            <CardTitle>Résultats ({finalTableData.length} lignes)</CardTitle>
                            <div className="flex items-center gap-1 text-slate-600">
                                <button onClick={handleZoomOut} title="Dézoomer" className="p-1 rounded-md hover:bg-slate-200 disabled:opacity-50" disabled={zoomLevel <= 0.7}><ZoomOut size={18} /></button>
                                <span className="text-xs font-mono w-12 text-center select-none">{Math.round(zoomLevel * 100)}%</span>
                                <button onClick={handleZoomIn} title="Zoomer" className="p-1 rounded-md hover:bg-slate-200 disabled:opacity-50" disabled={zoomLevel >= 1.5}><ZoomIn size={18} /></button>
                                <button onClick={handleResetZoom} title="Réinitialiser" className="p-1 rounded-md hover:bg-slate-200 ml-2"><RotateCw size={16} /></button>
                            </div>
                        </CardHeader>
                        <CardContent className="overflow-auto p-0">
                            {columns.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-500 p-4"><Info size={32} className="mb-2"/><p>Votre tableau apparaîtra ici.</p></div>
                            ) : (
                                <table className="w-full text-left" style={{ tableLayout: 'fixed', fontSize: `${0.875 * zoomLevel}rem` }}>
                                    <thead className="text-xs text-slate-700 uppercase"><tr className="bg-white">
                                        {columns.map(c => (
                                            <th key={c.key} scope="col" className="sticky top-0 z-10 bg-white px-4 py-3 cursor-pointer hover:bg-slate-50 group select-none border-b-2" onClick={() => requestSort(c.key)} style={{ width: columnWidths[c.key], minWidth: '80px' }}>
                                                <div className="flex items-center justify-between"><span className="truncate pr-4">{c.label}</span>{sortConfig?.key === c.key ? (sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <div className="h-3 w-3"></div>}</div>
                                                <div onMouseDown={e => handleMouseDownForResize(e, c.key)} className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize bg-blue-300 opacity-0 group-hover:opacity-100"/>
                                            </th>
                                        ))}
                                    </tr></thead>
                                    <tbody className="bg-white">
                                        {finalTableData.map((row, index) => (
                                            <tr key={index} className="border-b hover:bg-slate-50">
                                                {columns.map(col => <td key={col.key} className="px-4 py-3 align-top break-words">{String(col.getValue(row) ?? '')}</td>)}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
            
            {filterModalField && <FilterModal field={filterModalField} allValues={uniqueValuesForFilter} filters={filters} setFilters={setFilters} onClose={() => setFilterModalField(null)} />}
        </div>
    );
};

const FilterModal: React.FC<{ field: Field; allValues: string[]; filters: Partial<Record<FieldKey, string[]>>; setFilters: React.Dispatch<React.SetStateAction<Partial<Record<FieldKey, string[]>>>>; onClose: () => void; }> = ({ field, allValues, filters, setFilters, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const handleToggle = (value: string) => setFilters(prev => ({ ...prev, [field.key]: (prev[field.key] || []).includes(value) ? (prev[field.key] || []).filter(v => v !== value) : [...(prev[field.key] || []), value] }));
    const handleSelectAll = () => setFilters(prev => ({ ...prev, [field.key]: allValues }));
    const handleDeselectAll = () => setFilters(prev => ({ ...prev, [field.key]: [] }));
    const displayedValues = useMemo(() => searchTerm ? allValues.filter(v => v.toLowerCase().includes(searchTerm.toLowerCase())) : allValues, [allValues, searchTerm]);

    return (
        <Modal isOpen={true} onClose={onClose} title={`Filtrer par ${field.label}`}>
            <div className="flex flex-col space-y-4">
                <div className="relative"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white" /></div>
                <div className="flex items-center gap-4"><button onClick={handleSelectAll} className="text-sm text-blue-600 hover:underline">Tout cocher</button><button onClick={handleDeselectAll} className="text-sm text-blue-600 hover:underline">Tout décocher</button></div>
                <div className="max-h-80 overflow-y-auto pr-2 border rounded-md p-2 space-y-1">
                    {displayedValues.map(value => (
                        <label key={value} className="flex items-center p-1.5 rounded-md hover:bg-slate-50 cursor-pointer"><input type="checkbox" checked={filters[field.key]?.includes(value) || false} onChange={() => handleToggle(value)} className="sr-only peer" /><div className="w-4 h-4 bg-white border rounded flex-shrink-0 flex items-center justify-center peer-checked:bg-blue-600 peer-checked:border-blue-600"><svg className="hidden peer-checked:block w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div><span className="ml-2 text-sm text-slate-700">{value}</span></label>
                    ))}
                </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t mt-4"><button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Fermer</button></div>
        </Modal>
    );
};

export default ProjectsExplorer;