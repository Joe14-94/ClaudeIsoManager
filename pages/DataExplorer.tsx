import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useData } from '../contexts/DataContext';
import { ISO_MEASURES_DATA } from '../constants';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { LayoutGrid, FileDown, Filter, X, GripVertical, Info, ArrowUp, ArrowDown, ZoomIn, ZoomOut, RotateCw, Search, FileSpreadsheet, FileText } from 'lucide-react';
import { Activity, Chantier, IsoMeasure, Objective, StrategicOrientation, SecurityProcess } from '../types';
import ActiveFiltersDisplay from '../components/ui/ActiveFiltersDisplay';
import Tooltip from '../components/ui/Tooltip';

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

    // 1. Add all base entities to ensure they are represented
    orientations.forEach(o => rows.push({ orientation: o }));
    chantiers.forEach(c => rows.push({ chantier: c }));
    objectives.forEach(o => rows.push({ objectif: o }));
    allIsoMeasures.forEach(m => rows.push({ mesure_iso: m }));
    securityProcesses.forEach(p => rows.push({ processus: p }));
    // Activities will be the starting point for linked rows, so they are implicitly included.
    
    // 2. Build comprehensive linked rows starting from activities
    activities.forEach(activite => {
        const processus = processusMap.get(activite.functionalProcessId);
        
        const linkedObjectives = activite.objectives.length > 0 ? activite.objectives.map(id => objectivesMap.get(id)).filter((o): o is Objective => !!o) : [undefined];
        const linkedIsos = activite.isoMeasures.length > 0 ? activite.isoMeasures.map(code => isoMeasuresMap.get(code)).filter((m): m is IsoMeasure => !!m) : [undefined];

        linkedObjectives.forEach(objectif => {
            const chantier = objectif ? chantiersMap.get(objectif.chantierId) : undefined;
            
            const allOrientationIds = new Set<string>();
            if (chantier) allOrientationIds.add(chantier.strategicOrientationId);
            if (objectif) objectif.strategicOrientations.forEach(id => allOrientationIds.add(id));
            activite.strategicOrientations.forEach(id => allOrientationIds.add(id));
            
            const linkedOrientations = allOrientationIds.size > 0 ? Array.from(allOrientationIds).map(id => orientationsMap.get(id)).filter((o): o is StrategicOrientation => !!o) : [undefined];
              
            linkedOrientations.forEach(orientation => {
                linkedIsos.forEach(mesure_iso => {
                    rows.push({ activite, processus, objectif, chantier, orientation, mesure_iso });
                });
            });
        });
    });

    // 3. Add direct Processus <-> Mesure ISO links
    securityProcesses.forEach(processus => {
      if (processus.isoMeasureIds && processus.isoMeasureIds.length > 0) {
        processus.isoMeasureIds.forEach(isoCode => {
          const mesure_iso = isoMeasuresMap.get(isoCode);
          if (mesure_iso) {
            rows.push({ processus, mesure_iso });
          }
        });
      }
    });

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
            // FIX: Added Array.isArray check and ensure rowValue is a string for .includes()
            if (!Array.isArray(values)) return true;
            if (values.length === 0) return false;

            const field = AVAILABLE_FIELDS.find(f => f.key === key as FieldKey);
            if (!field) return true;
            
            const rowValue = field.getValue(row);
            if(rowValue === undefined) {
                // If a row doesn't have a value for a filtered field, it should not be included if the filter is active.
                return false;
            }
            
            return values.includes(String(rowValue));
        });
    });
}, [processedData, filters]);
  
 const finalTableData = useMemo(() => {
    if (columns.length === 0) return [];

    // 1. Gather all unique combinations.
    const uniqueCombinations = new Map<string, ProcessedRow>();
    filteredData.forEach(row => {
        const key = columns.map(c => c.getValue(row) ?? 'null').join('||');
        const isAllNull = columns.every(c => c.getValue(row) === undefined);

        if (!isAllNull && !uniqueCombinations.has(key)) {
            uniqueCombinations.set(key, row);
        }
    });

    const combinationEntries = Array.from(uniqueCombinations.entries());

    // 2. Filter out rows that are subsets of other, more complete, rows.
    const filteredEntries = combinationEntries.filter(([key]) => {
        const values = key.split('||');
        
        const isSubset = combinationEntries.some(([otherKey]) => {
            if (key === otherKey) return false; // Not a subset of itself
            
            const otherValues = otherKey.split('||');
            
            let matchesAllDefinedValues = true;
            let isStrictSuperset = false;
            
            for (let i = 0; i < values.length; i++) {
                if (values[i] !== 'null') { // If current row has a value
                    if (values[i] !== otherValues[i]) { // The other row must have the same value
                        matchesAllDefinedValues = false;
                        break;
                    }
                } else { // If current row has a null
                    if (otherValues[i] !== 'null') { // And the other row has a value here
                        isStrictSuperset = true;
                    }
                }
            }
            
            return matchesAllDefinedValues && isStrictSuperset;
        });
        
        return !isSubset;
    });

    let items = filteredEntries.map(([, row]) => row);

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
            values.add(String(value));
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

    const handleExportExcel = () => {
        if (columns.length === 0 || finalTableData.length === 0) return;

        // Create Excel export with only selected columns
        const XLSX = (window as any).XLSX || require('xlsx');

        // Create headers from selected columns
        const headers = columns.map(col => col.label);

        // Create rows with data from selected columns
        const rows = finalTableData.map(row =>
            columns.map(col => {
                const value = col.getValue(row);
                return value !== undefined ? String(value) : '';
            })
        );

        // Combine headers and data
        const wsData = [headers, ...rows];

        // Create worksheet and workbook
        const worksheet = XLSX.utils.aoa_to_sheet(wsData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Activités');

        // Generate filename with date
        const filename = `export_donnees_activites_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, filename);
    };

    const handleExportPDF = () => {
        if (columns.length === 0 || finalTableData.length === 0) return;

        const jsPDF = (window as any).jsPDF || require('jspdf');
        const autoTable = (window as any).autoTable || require('jspdf-autotable');

        const doc = new jsPDF({ orientation: 'landscape' });

        // Add title
        doc.setFontSize(18);
        doc.text('Rapport des Activités', 14, 20);

        // Add export date
        doc.setFontSize(10);
        doc.text(`Date d'export: ${new Date().toLocaleDateString('fr-FR')}`, 14, 28);

        // Create table with selected columns
        const headers = columns.map(col => col.label);
        const rows = finalTableData.map(row =>
            columns.map(col => {
                const value = col.getValue(row);
                return value !== undefined ? String(value) : '-';
            })
        );

        autoTable(doc, {
            head: [headers],
            body: rows,
            startY: 35,
            theme: 'striped',
            headStyles: { fillColor: [66, 139, 202], fontSize: 8 },
            bodyStyles: { fontSize: 7 },
            styles: { cellPadding: 1.5 },
            margin: { top: 35 },
        });

        // Add footer
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.text(
                `Page ${i} sur ${pageCount} | Total: ${finalTableData.length} activités`,
                doc.internal.pageSize.getWidth() / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        const filename = `export_donnees_activites_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
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

    const activeFiltersForDisplay = useMemo(() => {
        const displayFilters: { [key: string]: string } = {};
        Object.entries(filters).forEach(([key, values]) => {
            // FIX: Added Array.isArray check to fix "Property 'length' does not exist on type 'unknown'" error.
            if (Array.isArray(values) && values.length > 0) {
                const field = AVAILABLE_FIELDS.find(f => f.key === key);
                if (field) {
                    displayFilters[field.label] = values.length > 1 ? `${values.length} sélectionnés` : values[0];
                }
            }
        });
        return displayFilters;
    }, [filters]);

    const handleRemoveFilter = (label: string) => {
        const field = AVAILABLE_FIELDS.find(f => f.label === label);
        if (field) {
            setFilters(prev => {
                const newFilters = { ...prev };
                delete newFilters[field.key];
                return newFilters;
            });
        }
    };
    
    const handleClearAll = () => setFilters({});

    return (
        <div className="flex flex-col h-full space-y-4">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-slate-800">Explorateur de données activités</h1>
            <div className="flex gap-2">
                <button onClick={handleExport} disabled={columns.length === 0} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors">
                    <FileDown size={18} /><span>CSV</span>
                </button>
                <button onClick={handleExportExcel} disabled={columns.length === 0} className="relative flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-400 transition-colors">
                    <span className="absolute -top-2 -right-2 bg-yellow-400 text-green-900 text-xs font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">NEW</span>
                    <FileSpreadsheet size={18} /><span>Excel</span>
                </button>
                <button onClick={handleExportPDF} disabled={columns.length === 0} className="relative flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-slate-400 transition-colors">
                    <span className="absolute -top-2 -right-2 bg-yellow-400 text-orange-900 text-xs font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">NEW</span>
                    <FileText size={18} /><span>PDF</span>
                </button>
            </div>
        </div>

        <div className="grid grid-cols-12 gap-4 flex-grow min-h-0">
            <div className="col-span-12 lg:col-span-3 xl:col-span-2 flex flex-col">
            <Card className="flex-grow flex flex-col min-h-0">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Champs disponibles
                      <Tooltip text="Cochez les champs que vous souhaitez voir apparaître comme colonnes dans votre tableau de résultats.">
                        <Info size={16} className="text-slate-400 cursor-help" />
                      </Tooltip>
                    </CardTitle>
                </CardHeader>
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
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Colonnes du tableau
                        <Tooltip text="Glissez-déposez les pastilles pour réordonner les colonnes. Utilisez les icônes sur chaque pastille pour filtrer ou retirer la colonne.">
                            <Info size={16} className="text-slate-400 cursor-help" />
                        </Tooltip>
                    </CardTitle>
                    <p className="text-sm text-slate-500 mt-1">Cochez des champs pour les ajouter. Glissez-déposez les pastilles pour réordonner.</p>
                </CardHeader>
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
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Résultats ({finalTableData.length} lignes)</CardTitle>
                        <div className="flex items-center gap-1 text-slate-600">
                            <button onClick={handleZoomOut} title="Dézoomer" className="p-1 rounded-md hover:bg-slate-200 disabled:opacity-50" disabled={zoomLevel <= 0.7}><ZoomOut size={18} /></button>
                            <span className="text-xs font-mono w-12 text-center select-none">{Math.round(zoomLevel * 100)}%</span>
                            <button onClick={handleZoomIn} title="Zoomer" className="p-1 rounded-md hover:bg-slate-200 disabled:opacity-50" disabled={zoomLevel >= 1.5}><ZoomIn size={18} /></button>
                            <button onClick={handleResetZoom} title="Réinitialiser" className="p-1 rounded-md hover:bg-slate-200 ml-2"><RotateCw size={16} /></button>
                        </div>
                    </div>
                    <div className="mt-2">
                        <ActiveFiltersDisplay filters={activeFiltersForDisplay} onRemoveFilter={handleRemoveFilter} onClearAll={handleClearAll} />
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