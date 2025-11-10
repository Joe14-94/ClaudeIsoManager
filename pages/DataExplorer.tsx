import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useData } from '../contexts/DataContext';
import { ISO_MEASURES_DATA } from '../constants';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { LayoutGrid, FileDown, Filter, X, GripVertical, Info, ArrowUp, ArrowDown, ZoomIn, ZoomOut, RotateCw, Search } from 'lucide-react';
import { Activity, Chantier, IsoMeasure, Objective, StrategicOrientation, SecurityProcess } from '../types';

type FieldKey = 'orientation' | 'chantier' | 'objectif' | 'activite' | 'mesure_iso' | 'statut_activite' | 'priorite_activite' | 'domaine_activite' | 'processus';

interface Field {
  key: FieldKey;
  label: string;
  getValue: (row: ProcessedRow) => string | undefined;
}

interface ProcessedRow {
    activite?: Activity;
    objectif?: Objective;
    chantier?: Chantier;
    orientation?: StrategicOrientation;
    mesure_iso?: IsoMeasure;
    processus?: SecurityProcess;
}

const PLACEHOLDER_NA = 'Non applicable';

const AVAILABLE_FIELDS: Field[] = [
  { key: 'orientation', label: 'Orientation', getValue: row => row.orientation ? `${row.orientation.code} - ${row.orientation.label}` : undefined },
  { key: 'chantier', label: 'Chantier', getValue: row => row.chantier ? `${row.chantier.code} - ${row.chantier.label}` : undefined },
  { key: 'objectif', label: 'Objectif', getValue: row => row.objectif ? `${row.objectif.code} - ${row.objectif.label}` : undefined },
  { key: 'activite', label: 'Activité', getValue: row => row.activite ? `${row.activite.activityId} - ${row.activite.title}` : undefined },
  { key: 'mesure_iso', label: 'Mesure ISO', getValue: row => row.mesure_iso ? `${row.mesure_iso.code} - ${row.mesure_iso.title}` : undefined },
  { key: 'statut_activite', label: 'Statut (Activité)', getValue: row => row.activite?.status ?? (row.activite ? PLACEHOLDER_NA : undefined) },
  { key: 'priorite_activite', label: 'Priorité (Activité)', getValue: row => row.activite?.priority ?? (row.activite ? PLACEHOLDER_NA : undefined) },
  { key: 'domaine_activite', label: 'Domaine (Activité)', getValue: row => row.activite?.securityDomain ?? (row.activite ? PLACEHOLDER_NA : undefined) },
  { key: 'processus', label: 'Processus', getValue: row => row.processus?.name ?? undefined },
];

const DATA_EXPLORER_STATE_KEY = 'dataExplorerState';

const loadState = () => {
    try {
        const savedState = sessionStorage.getItem(DATA_EXPLORER_STATE_KEY);
        if (savedState) {
            const parsed = JSON.parse(savedState);
            if (parsed.columnKeys) {
                parsed.columns = parsed.columnKeys
                    .map((key: FieldKey) => AVAILABLE_FIELDS.find(f => f.key === key))
                    .filter(Boolean);
            }
            return parsed;
        }
    } catch (e) {
        console.error("Failed to load data explorer state", e);
    }
    return {};
};


const DataExplorer: React.FC = () => {
  const { activities, objectives, chantiers, orientations, securityProcesses } = useData();
  
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
            filters,
            sortConfig,
            columnWidths,
            zoomLevel,
        };
        sessionStorage.setItem(DATA_EXPLORER_STATE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
        console.error("Failed to save data explorer state", e);
    }
  }, [columns, filters, sortConfig, columnWidths, zoomLevel]);

  const allIsoMeasures = useMemo(() => ISO_MEASURES_DATA.map(m => ({...m, id: m.code}) as IsoMeasure), []);
  
  const dataMaps = useMemo(() => ({
    objectivesMap: new Map(objectives.map(o => [o.id, o])),
    chantiersMap: new Map(chantiers.map(c => [c.id, c])),
    orientationsMap: new Map(orientations.map(o => [o.id, o])),
    processusMap: new Map(securityProcesses.map(p => [p.id, p])),
    isoMeasuresMap: new Map(allIsoMeasures.map(m => [m.code, m])),
  }), [objectives, chantiers, orientations, securityProcesses, allIsoMeasures]);

 const processedData = useMemo<ProcessedRow[]>(() => {
    const rows: ProcessedRow[] = [];
    const { objectivesMap, chantiersMap, orientationsMap, processusMap, isoMeasuresMap } = dataMaps;

    const addedIds = {
        activities: new Set<string>(),
        objectives: new Set<string>(),
        chantiers: new Set<string>(),
        orientations: new Set<string>(),
        isoMeasures: new Set<string>(),
        processes: new Set<string>(),
    };

    activities.forEach(activite => {
        addedIds.activities.add(activite.id);
        const processus = processusMap.get(activite.functionalProcessId);
        if (processus) addedIds.processes.add(processus.id);
        
        const linkedObjectives = activite.objectives.length > 0 ? activite.objectives.map(id => objectivesMap.get(id)).filter((o): o is Objective => !!o) : [undefined];
        const linkedIsos = activite.isoMeasures.length > 0 ? activite.isoMeasures.map(code => isoMeasuresMap.get(code)).filter((m): m is IsoMeasure => !!m) : [undefined];

        linkedObjectives.forEach(objectif => {
            if (objectif) addedIds.objectives.add(objectif.id);
            const chantier = objectif ? chantiersMap.get(objectif.chantierId) : undefined;
            if (chantier) addedIds.chantiers.add(chantier.id);
            
            const allOrientationIds = new Set<string>();
            if (chantier) allOrientationIds.add(chantier.strategicOrientationId);
            if (objectif) objectif.strategicOrientations.forEach(id => allOrientationIds.add(id));
            activite.strategicOrientations.forEach(id => allOrientationIds.add(id));
            
            const linkedOrientations = allOrientationIds.size > 0 ? Array.from(allOrientationIds).map(id => orientationsMap.get(id)).filter((o): o is StrategicOrientation => !!o) : [undefined];
              
            linkedOrientations.forEach(orientation => {
                if (orientation) addedIds.orientations.add(orientation.id);
                linkedIsos.forEach(mesure_iso => {
                    if (mesure_iso) addedIds.isoMeasures.add(mesure_iso.id);
                    rows.push({ activite, processus, objectif, chantier, orientation, mesure_iso });
                });
            });
        });
    });

    objectives.forEach(objectif => {
        if (addedIds.objectives.has(objectif.id)) return;
        addedIds.objectives.add(objectif.id);
        const chantier = chantiersMap.get(objectif.chantierId);
        if (chantier) addedIds.chantiers.add(chantier.id);
        const orientationIds = new Set<string>();
        if (chantier) orientationIds.add(chantier.strategicOrientationId);
        objectif.strategicOrientations.forEach(id => orientationIds.add(id));
        const linkedOrientations = Array.from(orientationIds).map(id => orientationsMap.get(id)).filter((o): o is StrategicOrientation => !!o);
        if (linkedOrientations.length > 0) {
            linkedOrientations.forEach(orientation => {
                if (orientation) addedIds.orientations.add(orientation.id);
                rows.push({ objectif, chantier, orientation });
            });
        } else {
            rows.push({ objectif, chantier });
        }
    });

    chantiers.forEach(chantier => {
        if (addedIds.chantiers.has(chantier.id)) return;
        addedIds.chantiers.add(chantier.id);
        const orientation = orientationsMap.get(chantier.strategicOrientationId);
        if (orientation) addedIds.orientations.add(orientation.id);
        rows.push({ chantier, orientation });
    });

    orientations.forEach(o => { if (!addedIds.orientations.has(o.id)) rows.push({ orientation: o }); });
    allIsoMeasures.forEach(m => { if (!addedIds.isoMeasures.has(m.id)) rows.push({ mesure_iso: m }); });
    securityProcesses.forEach(p => { if (!addedIds.processes.has(p.id)) rows.push({ processus: p }); });

    return rows;
}, [activities, objectives, chantiers, orientations, securityProcesses, allIsoMeasures, dataMaps]);

  const requestSort = useCallback((key: FieldKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
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
            if (!values || !Array.isArray(values)) return true;
            if (values.length === 0) return false;

            const field = AVAILABLE_FIELDS.find(f => f.key === key as FieldKey);
            if (!field) return true;
            
            const rowValue = field.getValue(row);
            if(rowValue === undefined) {
                return false;
            }
            
            return values.includes(rowValue);
        });
    });
}, [processedData, filters]);
  
 const finalTableData = useMemo(() => {
    if (columns.length === 0) return [];

    const uniqueCombinations = new Map<string, ProcessedRow>();
    
    filteredData.forEach(row => {
        const key = columns.map(c => c.getValue(row) ?? 'null').join('||');
        
        const isAllNull = columns.every(c => c.getValue(row) === undefined);

        if (!isAllNull && !uniqueCombinations.has(key)) {
            uniqueCombinations.set(key, row);
        }
    });
    
    let items = Array.from(uniqueCombinations.values());

    if (sortConfig !== null) {
      const fieldToSort = AVAILABLE_FIELDS.find(f => f.key === sortConfig.key);
      if (fieldToSort) {
        items.sort((a, b) => {
          const valA = fieldToSort.getValue(a);
          const valB = fieldToSort.getValue(b);
          
          if (valA === undefined && valB === undefined) return 0;
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
        if (value !== undefined) {
            values.add(value);
        }
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b, 'fr', {numeric: true}));
  }, [processedData, filterModalField]);

  const openFilterModal = useCallback((field: Field) => {
    setFilterModalField(field);
  }, []);

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
        const rows = finalTableData.map(row => 
            columns.map(col => {
                const value = col.getValue(row) || '';
                return `"${String(value).replace(/"/g, '""')}"`;
            }).join(',')
        ).join('\n');
        const csvContent = `data:text/csv;charset=utf-8,\uFEFF${headers}\n${rows}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'export_donnees_activites.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
  
    const handleMouseDownForResize = useCallback((e: React.MouseEvent, key: string) => {
        e.stopPropagation();
        const thElement = (e.target as HTMLElement).closest('th');
        if (thElement) {
        resizingRef.current = {
            key,
            startX: e.clientX,
            startWidth: thElement.offsetWidth,
        };
        setIsResizing(true);
        }
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
        if (!isResizing || !resizingRef.current) return;
        const { key, startX, startWidth } = resizingRef.current;
        const newWidth = startWidth + (e.clientX - startX);
        if (newWidth > 80) {
            setColumnWidths(prev => ({ ...prev, [key]: newWidth }));
        }
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
            <h1 className="text-3xl font-bold text-slate-800">Explorateur de données activités</h1>
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
                <CardHeader><CardTitle>Colonnes du tableau</CardTitle><p className="text-sm text-slate-500 mt-1">Cochez des champs pour les ajouter. Glissez-déposez les pastilles pour réordonner.</p></CardHeader>
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
                                    className="p-1" // Wrapper invisible pour agrandir la zone de survol
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

interface FilterModalProps {
    field: Field;
    allValues: string[];
    filters: Partial<Record<FieldKey, string[]>>;
    setFilters: React.Dispatch<React.SetStateAction<Partial<Record<FieldKey, string[]>>>>;
    onClose: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ field, allValues, filters, setFilters, onClose }) => {
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

export default DataExplorer;