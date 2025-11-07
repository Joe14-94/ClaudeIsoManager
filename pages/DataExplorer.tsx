import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useData } from '../contexts/DataContext';
import { ISO_MEASURES_DATA } from '../constants';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { LayoutGrid, FileDown, Filter, X, GripVertical, Info, ArrowUp, ArrowDown, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
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
  { key: 'orientation', label: 'Orientation', getValue: row => row.orientation ? `${row.orientation.code} - ${row.orientation.label}` : 'Pas d\'orientation liée' },
  { key: 'chantier', label: 'Chantier', getValue: row => row.chantier ? `${row.chantier.code} - ${row.chantier.label}` : 'Pas de chantier lié' },
  { key: 'objectif', label: 'Objectif', getValue: row => row.objectif ? `${row.objectif.code} - ${row.objectif.label}` : 'Pas d\'objectif lié' },
  { key: 'activite', label: 'Activité', getValue: row => row.activite ? `${row.activite.activityId} - ${row.activite.title}` : 'Pas d\'activité liée' },
  { key: 'mesure_iso', label: 'Mesure ISO', getValue: row => row.mesure_iso ? `${row.mesure_iso.code} - ${row.mesure_iso.title}` : 'Pas de mesure ISO liée' },
  { key: 'statut_activite', label: 'Statut (Activité)', getValue: row => row.activite?.status ?? PLACEHOLDER_NA },
  { key: 'priorite_activite', label: 'Priorité (Activité)', getValue: row => row.activite?.priority ?? PLACEHOLDER_NA },
  { key: 'domaine_activite', label: 'Domaine (Activité)', getValue: row => row.activite?.securityDomain ?? PLACEHOLDER_NA },
  { key: 'processus', label: 'Processus', getValue: row => row.processus?.name ?? 'Pas de processus lié' },
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
    if (columns.length === 0) return [];
    
    const columnKeys = new Set(columns.map(c => c.key));
    let baseEntities: any[] = [];
    let baseEntityType: FieldKey | null = null;
    
    const hierarchy: FieldKey[] = ['activite', 'objectif', 'chantier', 'orientation', 'mesure_iso', 'processus'];
    for(const type of hierarchy) {
        if (columnKeys.has(type) || columnKeys.has(`statut_${type}` as FieldKey) || columnKeys.has(`priorite_${type}` as FieldKey) || columnKeys.has(`domaine_${type}` as FieldKey)) {
            baseEntityType = type;
            break;
        }
    }

    if (!baseEntityType) { // If only secondary attributes like status are selected, default to activite
      if (columns.some(c => c.key.includes('activite'))) {
        baseEntityType = 'activite';
      } else {
         baseEntityType = columns[0].key; // Fallback to first selected column
      }
    }

    switch(baseEntityType) {
        case 'activite': baseEntities = activities; break;
        case 'objectif': baseEntities = objectives; break;
        case 'chantier': baseEntities = chantiers; break;
        case 'orientation': baseEntities = orientations; break;
        case 'mesure_iso': baseEntities = allIsoMeasures; break;
        case 'processus': baseEntities = securityProcesses; break;
        default: baseEntities = activities; baseEntityType = 'activite'; // Default case
    }
    
    const flatData: ProcessedRow[] = [];

    baseEntities.forEach(baseEntity => {
        let rows: ProcessedRow[] = [];
        
        if (baseEntityType === 'activite') {
            const activity = baseEntity as Activity;
            rows.push({
                activite: activity,
                processus: dataMaps.processusMap.get(activity.functionalProcessId)
            });
        } else if (baseEntityType === 'objectif') {
            rows.push({ objectif: baseEntity as Objective });
        } else if (baseEntityType === 'chantier') {
            rows.push({ chantier: baseEntity as Chantier });
        } else if (baseEntityType === 'orientation') {
            rows.push({ orientation: baseEntity as StrategicOrientation });
        } else if (baseEntityType === 'mesure_iso') {
            rows.push({ mesure_iso: baseEntity as IsoMeasure });
        } else if (baseEntityType === 'processus') {
            rows.push({ processus: baseEntity as SecurityProcess });
        }

        // Expand relationships for each base row
        const expandedRows: ProcessedRow[] = [];
        rows.forEach(row => {
            const toExpand = [row];
            if (columnKeys.has('objectif') && row.activite && row.activite.objectives.length > 0) {
                const newRows = row.activite.objectives.map(objId => ({ ...row, objectif: dataMaps.objectivesMap.get(objId) }));
                toExpand.splice(0, 1, ...newRows);
            }
            if (columnKeys.has('chantier') && toExpand.some(r => r.objectif)) {
                const newRows = toExpand.flatMap(r => {
                    if (r.objectif) {
                        return { ...r, chantier: dataMaps.chantiersMap.get(r.objectif.chantierId) };
                    }
                    return r;
                });
                toExpand.splice(0, toExpand.length, ...newRows);
            }
            if (columnKeys.has('orientation') && toExpand.some(r => r.chantier || r.objectif || r.activite)) {
                const newRows = toExpand.flatMap(r => {
                    const orientationIds = new Set<string>();
                    if (r.chantier) orientationIds.add(r.chantier.strategicOrientationId);
                    if (r.objectif) r.objectif.strategicOrientations.forEach(id => orientationIds.add(id));
                    if (r.activite) r.activite.strategicOrientations.forEach(id => orientationIds.add(id));

                    if (orientationIds.size > 0) {
                        return Array.from(orientationIds).map(id => ({ ...r, orientation: dataMaps.orientationsMap.get(id) }));
                    }
                    return r;
                });
                toExpand.splice(0, toExpand.length, ...newRows);
            }
             if (columnKeys.has('mesure_iso') && toExpand.some(r => r.activite || r.objectif)) {
                const newRows = toExpand.flatMap(r => {
                    const isoCodes = new Set<string>();
                    if (r.activite) r.activite.isoMeasures.forEach(code => isoCodes.add(code));
                    if (r.objectif?.mesures_iso) r.objectif.mesures_iso.forEach(link => isoCodes.add(link.numero_mesure));
                    
                    if (isoCodes.size > 0) {
                        return Array.from(isoCodes).map(code => ({ ...r, mesure_iso: dataMaps.isoMeasuresMap.get(code) }));
                    }
                    return r;
                });
                toExpand.splice(0, toExpand.length, ...newRows);
            }
            expandedRows.push(...toExpand);
        });

        flatData.push(...expandedRows);
    });

    return flatData;

  }, [columns, activities, objectives, chantiers, orientations, securityProcesses, allIsoMeasures, dataMaps]);

  const filteredData = useMemo(() => {
    if (Object.keys(filters).length === 0) return processedData;
    return processedData.filter(row => {
      return Object.entries(filters).every(([key, values]) => {
        if (!values || !Array.isArray(values) || values.length === 0) return true;
        const field = AVAILABLE_FIELDS.find(f => f.key === key as FieldKey);
        if (!field) return true;
        const rowValue = field.getValue(row);
        return rowValue !== undefined && values.includes(rowValue);
      });
    });
  }, [processedData, filters]);
  
  const sortedData = useMemo(() => {
    let items = [...filteredData];
    
    if (columns.length > 0) {
        const uniqueRows = new Map<string, ProcessedRow>();
        items.forEach(row => {
            const key = columns.map(c => c.getValue(row) ?? '___null___').join('||');
            if (!uniqueRows.has(key)) {
                uniqueRows.set(key, row);
            }
        });
        items = Array.from(uniqueRows.values());
    }
    
    if (sortConfig !== null) {
      const fieldToSort = AVAILABLE_FIELDS.find(f => f.key === sortConfig.key);
      if (fieldToSort) {
        items.sort((a, b) => {
          const valA = fieldToSort.getValue(a);
          const valB = fieldToSort.getValue(b);
          if (valA == null && valB == null) return 0;
          if (valA == null) return 1;
          if (valB == null) return -1;
          
          const comparison = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' });
          return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
      }
    }
    return items;
  }, [filteredData, sortConfig, columns]);

  const uniqueValuesForFilter = useMemo(() => {
    if (!filterModalField) return [];
    const values = new Set<string>();
    processedData.forEach(row => {
        const value = filterModalField.getValue(row);
        if (value) {
            values.add(value);
        }
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b, undefined, {numeric: true}));
  }, [processedData, filterModalField]);

  const requestSort = (key: FieldKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (draggedItem && !columns.find(c => c.key === draggedItem.key)) {
      setColumns([...columns, draggedItem]);
      setColumnWidths(prev => ({ ...prev, [draggedItem.key]: 200 }));
    }
    setDraggedItem(null);
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
  };

  const removeColumn = (key: FieldKey) => {
    setColumns(columns.filter(c => c.key !== key));
    setFilters(prev => {
        const newFilters = {...prev};
        delete newFilters[key];
        return newFilters;
    });
     setColumnWidths(prev => {
        const newWidths = {...prev};
        delete newWidths[key];
        return newWidths;
    });
    if (sortConfig?.key === key) {
        setSortConfig(null);
    }
  };
  
  const handleFilterToggle = (field: Field, value: string) => {
    setFilters(prev => {
      const current = prev[field.key];
      const currentAsArray = Array.isArray(current) ? current : [];

      const newValues = currentAsArray.includes(value)
        ? currentAsArray.filter(v => v !== value)
        : [...currentAsArray, value];
      return { ...prev, [field.key]: newValues };
    });
  };

  const handleExport = () => {
    if (columns.length === 0) return;
    const headers = columns.map(c => c.label).join(',');
    const rows = sortedData.map(row => 
        columns.map(col => {
            const value = col.getValue(row) || '';
            const escapedValue = `"${String(value).replace(/"/g, '""')}"`;
            return escapedValue;
        }).join(',')
    ).join('\n');
    const csvContent = `data:text/csv;charset=utf-8,\uFEFF${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'export_donnees.csv');
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

      if (newWidth > 80) { // Min width 80px
        setColumnWidths(prev => ({
          ...prev,
          [key]: newWidth,
        }));
      }
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      resizingRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.7));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Explorateur de données</h1>
        <button onClick={handleExport} disabled={columns.length === 0} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed">
          <FileDown size={18} />
          <span>Exporter en CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-4 flex-grow min-h-0">
        <div className="col-span-12 lg:col-span-3 xl:col-span-2 flex flex-col">
          <Card className="flex-grow">
            <CardHeader><CardTitle>Champs disponibles</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {AVAILABLE_FIELDS.map(field => (
                <div 
                  key={field.key} 
                  draggable 
                  onDragStart={() => setDraggedItem(field)}
                  className="p-2 border rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-grab active:cursor-grabbing flex items-center gap-2"
                >
                  <GripVertical size={16} className="text-slate-400" />
                  {field.label}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-9 xl:col-span-10 grid grid-rows-[auto_1fr] gap-4 min-h-0">
          <Card>
            <CardHeader>
              <CardTitle>Colonnes du tableau</CardTitle>
              <p className="text-sm text-slate-500 mt-1">Glissez-déposez les champs ici pour construire votre tableau.</p>
            </CardHeader>
            <CardContent
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className="min-h-[80px] p-2 border-2 border-dashed border-slate-300 rounded-md transition-colors"
            >
              <div className="flex flex-wrap gap-2">
                {columns.length === 0 && <p className="text-slate-500 text-sm p-4 text-center w-full">Déposez un champ pour commencer...</p>}
                {columns.map(col => (
                  <div key={col.key} className="flex items-center gap-1 bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-medium">
                    <span>{col.label}</span>
                    <button onClick={() => setFilterModalField(col)} className="p-0.5 rounded-full hover:bg-blue-200" title="Filtrer">
                        <Filter size={14} className={filters[col.key]?.length ? 'text-blue-700' : 'text-blue-500'} />
                    </button>
                    <button onClick={() => removeColumn(col.key)} className="p-0.5 rounded-full hover:bg-blue-200" title="Retirer">
                        <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="grid grid-rows-[auto_1fr] min-h-0">
             <CardHeader className="flex justify-between items-center">
                <CardTitle>Résultats ({sortedData.length} lignes)</CardTitle>
                <div className="flex items-center gap-1 text-slate-600">
                    <button onClick={handleZoomOut} title="Dézoomer" className="p-1 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-50" disabled={zoomLevel <= 0.7}><ZoomOut size={18} /></button>
                    <span className="text-xs font-mono w-12 text-center select-none">{Math.round(zoomLevel * 100)}%</span>
                    <button onClick={handleZoomIn} title="Zoomer" className="p-1 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-50" disabled={zoomLevel >= 1.5}><ZoomIn size={18} /></button>
                    <button onClick={handleResetZoom} title="Réinitialiser le zoom" className="p-1 rounded-md hover:bg-slate-200 transition-colors ml-2"><RotateCw size={16} /></button>
                </div>
            </CardHeader>
            <CardContent className="overflow-auto p-0">
              {columns.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 p-4">
                  <Info size={32} className="mb-2"/>
                  <p>Votre tableau apparaîtra ici une fois que vous aurez ajouté des colonnes.</p>
                </div>
              ) : (
                <table className="w-full text-left" style={{ tableLayout: 'fixed', fontSize: `${0.875 * zoomLevel}rem` }}>
                  <thead className="text-xs text-slate-700 uppercase">
                    <tr>
                      {columns.map(c => (
                        <th key={c.key} scope="col" className="sticky top-0 z-10 bg-white px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors relative group select-none border-b-2 border-slate-200" onClick={() => requestSort(c.key)} style={{ width: columnWidths[c.key], minWidth: '80px' }}>
                          <div className="flex items-center justify-between">
                            <span className="truncate pr-4">{c.label}</span>
                            {sortConfig?.key === c.key ? (
                              sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3 flex-shrink-0" /> : <ArrowDown className="h-3 w-3 flex-shrink-0" />
                            ) : <div className="h-3 w-3 flex-shrink-0"></div>}
                          </div>
                          <div 
                              onMouseDown={e => handleMouseDownForResize(e, c.key)}
                              className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize bg-blue-300 opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {sortedData.map((row, index) => (
                      <tr key={index} className="border-b hover:bg-slate-50">
                        {columns.map(col => (
                          <td key={col.key} className="px-4 py-3 align-top break-words">{col.getValue(row)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {filterModalField && (
        <Modal isOpen={!!filterModalField} onClose={() => setFilterModalField(null)} title={`Filtrer par ${filterModalField.label}`}>
          <div className="max-h-96 overflow-y-auto pr-2">
            {uniqueValuesForFilter.map(value => (
              <div key={value} className="flex items-center my-1">
                <input
                  type="checkbox"
                  id={`filter-${value}`}
                  checked={filters[filterModalField.key]?.includes(value) || false}
                  onChange={() => handleFilterToggle(filterModalField, value)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor={`filter-${value}`} className="ml-2 text-sm text-slate-700 cursor-pointer">{value}</label>
              </div>
            ))}
          </div>
           <div className="flex justify-end gap-2 pt-4 border-t mt-4">
              <button onClick={() => setFilterModalField(null)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Fermer</button>
            </div>
        </Modal>
      )}

    </div>
  );
};

export default DataExplorer;