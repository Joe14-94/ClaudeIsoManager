

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Project, IsoMeasure } from '../types';
import { ISO_MEASURES_DATA } from '../constants';
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/storage';
import { Trash2, BarChart3, Donut, LineChart as LineChartIcon, AreaChart, ScatterChart, Disc as BubbleChartIcon, LayoutPanelTop, Download, Aperture } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DynamicChartRenderer from '../components/charts/creator/DynamicChartRenderer';

type ChartType = 'bar' | 'pie' | 'line' | 'area' | 'scatter' | 'bubble' | 'treemap' | 'sunburst';
type DimensionField = 'status' | 'tShirtSize' | 'projectManagerMOA' | 'projectManagerMOE' | 'initiativeId' | 'isTop30' | 'category' | 'projectStartDate' | 'projectEndDate' | 'goLiveDate' | 'endDate' | 'projectId' | 'projectTitle' | 'isoMeasure';
type DimensionField2 = DimensionField | 'none';
type MeasureField = 'count' | 'budgetRequested' | 'budgetApproved' | 'budgetCommitted' | 'validatedPurchaseOrders' | 'completedPV' | 'forecastedPurchaseOrders' | 'moaInternalWorkloadRequested' | 'moaInternalWorkloadEngaged' | 'moaInternalWorkloadConsumed' | 'moaExternalWorkloadRequested' | 'moaExternalWorkloadEngaged' | 'moaExternalWorkloadConsumed' | 'moeInternalWorkloadRequested' | 'moeInternalWorkloadEngaged' | 'moeInternalWorkloadConsumed' | 'moeExternalWorkloadRequested' | 'moeExternalWorkloadEngaged' | 'moeExternalWorkloadConsumed' | 'totalWorkloadRequested' | 'totalWorkloadEngaged' | 'totalWorkloadConsumed';
type AggregationType = 'sum' | 'average';
type ColorPalette = 'vibrant' | 'professional' | 'pastel' | 'monochromatic';
type SortOrder = 'value-desc' | 'value-asc' | 'label-asc' | 'label-desc';
type TopNValue = 5 | 10 | 'all';

interface SavedConfig {
    name: string;
    chartType: ChartType;
    dimension: DimensionField;
    dimension2: DimensionField2;
    measure: MeasureField;
    measureX: MeasureField;
    measureY: MeasureField;
    sizeMeasure: MeasureField;
    aggregation: AggregationType;
    colorPalette: ColorPalette;
    sortOrder: SortOrder;
    topN: TopNValue;
    chartTitle: string;
}

const dimensionOptions: { value: DimensionField, label: string, isDate?: boolean }[] = [
    { value: 'status', label: 'Statut' },
    { value: 'tShirtSize', label: 'Taille (T-shirt)' },
    { value: 'category', label: 'Catégorie' },
    { value: 'projectManagerMOA', label: 'Chef de projet MOA' },
    { value: 'projectManagerMOE', label: 'Chef de projet MOE' },
    { value: 'initiativeId', label: 'Initiative' },
    { value: 'isoMeasure', label: 'Mesure ISO' },
    { value: 'isTop30', label: 'Projet Top 30' },
    { value: 'projectId', label: 'Projet (ID)' },
    { value: 'projectTitle', label: 'Titre du projet' },
    { value: 'projectStartDate', label: 'Date de début du projet', isDate: true },
    { value: 'projectEndDate', label: 'Date de fin du projet', isDate: true },
    { value: 'goLiveDate', label: 'Date de passage en NO', isDate: true },
    { value: 'endDate', label: 'Date de passage en NF', isDate: true },
];

const measureOptions: { value: MeasureField, label: string }[] = [
    { value: 'count', label: 'Nombre de projets' },
    { value: 'budgetRequested', label: 'Budget demandé' },
    { value: 'budgetApproved', label: 'Budget accordé' },
    { value: 'budgetCommitted', label: 'Budget engagé' },
    { value: 'validatedPurchaseOrders', label: 'DA validées' },
    { value: 'completedPV', label: 'Réalisé (PV)' },
    { value: 'forecastedPurchaseOrders', label: 'DA prévues' },
    { value: 'moaInternalWorkloadRequested', label: 'Charge MOA Int. Demandée' },
    { value: 'moaInternalWorkloadEngaged', label: 'Charge MOA Int. Engagée' },
    { value: 'moaInternalWorkloadConsumed', label: 'Charge MOA Int. Consommée' },
    { value: 'moaExternalWorkloadRequested', label: 'Charge MOA Ext. Demandée' },
    { value: 'moaExternalWorkloadEngaged', label: 'Charge MOA Ext. Engagée' },
    { value: 'moaExternalWorkloadConsumed', label: 'Charge MOA Ext. Consommée' },
    { value: 'moeInternalWorkloadRequested', label: 'Charge MOE Int. Demandée' },
    { value: 'moeInternalWorkloadEngaged', label: 'Charge MOE Int. Engagée' },
    { value: 'moeInternalWorkloadConsumed', label: 'Charge MOE Int. Consommée' },
    { value: 'moeExternalWorkloadRequested', label: 'Charge MOE Ext. Demandée' },
    { value: 'moeExternalWorkloadEngaged', label: 'Charge MOE Ext. Engagée' },
    { value: 'moeExternalWorkloadConsumed', label: 'Charge MOE Ext. Consommée' },
    { value: 'totalWorkloadRequested', label: 'Charge totale demandée' },
    { value: 'totalWorkloadEngaged', label: 'Charge totale engagée' },
    { value: 'totalWorkloadConsumed', label: 'Charge totale consommée' },
];

const aggregationOptions: { value: AggregationType, label: string }[] = [
    { value: 'sum', label: 'Somme' },
    { value: 'average', label: 'Moyenne' },
];

const colorPaletteOptions: { value: ColorPalette, label: string }[] = [
    { value: 'vibrant', label: 'Vibrant' },
    { value: 'professional', label: 'Bleus professionnels' },
    { value: 'pastel', label: 'Tons pastel' },
    { value: 'monochromatic', label: 'Monochromatique' },
];

const GRAPH_CREATOR_CONFIGS_KEY = 'graphCreatorConfigs';

const ChartTypeButton: React.FC<{ icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void, disabled?: boolean }> = ({ icon, label, isActive, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors w-20 h-20 text-center ${isActive ? 'bg-blue-600 text-white' : 'bg-white hover:bg-slate-100 text-slate-700'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        {icon}
        <span className="text-xs mt-1">{label}</span>
    </button>
);

const GraphCreatorPage: React.FC = () => {
    const { projects, resources, initiatives } = useData();
    const navigate = useNavigate();
    const allIsoMeasures = useMemo(() => ISO_MEASURES_DATA.map(m => ({...m, id: m.code}) as unknown as IsoMeasure), []);

    const [panelSize, setPanelSize] = useState(() => loadFromLocalStorage('graphCreatorPanelSize', 384));
    const handleRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<'chart' | 'data'>('chart');
    const exportDropdownRef = useRef<HTMLDivElement>(null);
    const [isExportOpen, setIsExportOpen] = useState(false);
    
    // Config state
    const [chartType, setChartType] = useState<ChartType>('bar');
    const [dimension, setDimension] = useState<DimensionField>('status');
    const [dimension2, setDimension2] = useState<DimensionField2>('none');
    const [measure, setMeasure] = useState<MeasureField>('count');
    const [measureX, setMeasureX] = useState<MeasureField>('moeInternalWorkloadEngaged');
    const [measureY, setMeasureY] = useState<MeasureField>('budgetCommitted');
    const [sizeMeasure, setSizeMeasure] = useState<MeasureField>('budgetApproved');
    const [aggregation, setAggregation] = useState<AggregationType>('sum');
    const [colorPalette, setColorPalette] = useState<ColorPalette>('vibrant');
    const [sortOrder, setSortOrder] = useState<SortOrder>('value-desc');
    const [topN, setTopN] = useState<TopNValue>('all');
    const [chartTitleInput, setChartTitleInput] = useState('Créateur de graphiques');
    const [hiddenLabels, setHiddenLabels] = useState<string[]>([]);
    
    // Save/Load state
    const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>([]);
    const [configName, setConfigName] = useState('');

    useEffect(() => {
        const loadedConfigs = loadFromLocalStorage<SavedConfig[]>(GRAPH_CREATOR_CONFIGS_KEY, []);
        setSavedConfigs(loadedConfigs);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
                setIsExportOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const isDateDimension = useMemo(() => dimensionOptions.find(d => d.value === dimension)?.isDate, [dimension]);

    const dataMaps = useMemo(() => ({
        resources: new Map(resources.map(r => [r.id, r.name])),
        initiatives: new Map(initiatives.map(i => [i.id, i.label])),
        projects: new Map(projects.map(p => [p.projectId, p.title])),
        isoMeasures: new Map(allIsoMeasures.map(m => [m.code, m.title])),
    }), [resources, initiatives, projects, allIsoMeasures]);

    const processedData = useMemo(() => {
        if (!dimension) return [];

        const getMeasureValue = (project: Project, field: MeasureField) => {
            switch (field) {
                case 'count': return 1;
                case 'budgetRequested': return project.budgetRequested || 0;
                case 'budgetApproved': return project.budgetApproved || 0;
                case 'budgetCommitted': return project.budgetCommitted || 0;
                case 'validatedPurchaseOrders': return project.validatedPurchaseOrders || 0;
                case 'completedPV': return project.completedPV || 0;
                case 'forecastedPurchaseOrders': return project.forecastedPurchaseOrders || 0;
                case 'moaInternalWorkloadRequested': return project.moaInternalWorkloadRequested || 0;
                case 'moaInternalWorkloadEngaged': return project.moaInternalWorkloadEngaged || 0;
                case 'moaInternalWorkloadConsumed': return project.moaInternalWorkloadConsumed || 0;
                case 'moaExternalWorkloadRequested': return project.moaExternalWorkloadRequested || 0;
                case 'moaExternalWorkloadEngaged': return project.moaExternalWorkloadEngaged || 0;
                case 'moaExternalWorkloadConsumed': return project.moaExternalWorkloadConsumed || 0;
                case 'moeInternalWorkloadRequested': return project.moeInternalWorkloadRequested || 0;
                case 'moeInternalWorkloadEngaged': return project.moeInternalWorkloadEngaged || 0;
                case 'moeInternalWorkloadConsumed': return project.moeInternalWorkloadConsumed || 0;
                case 'moeExternalWorkloadRequested': return project.moeExternalWorkloadRequested || 0;
                case 'moeExternalWorkloadEngaged': return project.moeExternalWorkloadEngaged || 0;
                case 'moeExternalWorkloadConsumed': return project.moeExternalWorkloadConsumed || 0;
                case 'totalWorkloadRequested': return (project.moaInternalWorkloadRequested || 0) + (project.moaExternalWorkloadRequested || 0) + (project.moeInternalWorkloadRequested || 0) + (project.moeExternalWorkloadRequested || 0);
                case 'totalWorkloadEngaged': return (project.moaInternalWorkloadEngaged || 0) + (project.moaExternalWorkloadEngaged || 0) + (project.moeInternalWorkloadEngaged || 0) + (project.moeExternalWorkloadEngaged || 0);
                case 'totalWorkloadConsumed': return (project.moaInternalWorkloadConsumed || 0) + (project.moaExternalWorkloadConsumed || 0) + (project.moeInternalWorkloadConsumed || 0) + (project.moeExternalWorkloadConsumed || 0);
                default: return 0;
            }
        };
        
        const getDimensionLabel = (project: Project, field: DimensionField, isoCode?: string): string => {
            if (field === 'isoMeasure') {
                if (!isoCode) return 'Non applicable';
                return dataMaps.isoMeasures.get(isoCode) ? `${isoCode} - ${dataMaps.isoMeasures.get(isoCode)}` : isoCode;
            }
            const value = project[field as keyof Project];
            switch (field) {
                case 'projectManagerMOA':
                case 'projectManagerMOE':
                    return dataMaps.resources.get(value as string) || 'Non assigné';
                case 'initiativeId':
                    return dataMaps.initiatives.get(value as string) || 'Non assigné';
                case 'isTop30':
                    return value ? 'Oui' : 'Non';
                case 'projectStartDate':
                case 'projectEndDate':
                case 'goLiveDate':
                case 'endDate':
                     if (!value) return 'Date non définie';
                     const date = new Date(value as string);
                     return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM for grouping
                case 'projectTitle':
                    return project.title;
                default:
                    return String(value) || 'Non défini';
            }
        };

        if (chartType === 'scatter' || chartType === 'bubble') {
            return projects.map(p => ({
                label: p[dimension as keyof Project] as string || p.projectId,
                xValue: getMeasureValue(p, measureX),
                yValue: getMeasureValue(p, measureY),
                sizeValue: chartType === 'bubble' ? getMeasureValue(p, sizeMeasure) : 10,
                rawItems: [p]
            }));
        }
        
        const needsFlattening = dimension === 'isoMeasure' || dimension2 === 'isoMeasure';
        let baseData: { project: Project; isoMeasure?: string }[] = [];

        if (needsFlattening) {
            projects.forEach(p => {
                if (p.isoMeasures && p.isoMeasures.length > 0) {
                    p.isoMeasures.forEach(iso => {
                        baseData.push({ project: p, isoMeasure: iso });
                    });
                } else {
                    baseData.push({ project: p, isoMeasure: 'Non spécifié' });
                }
            });
        } else {
            baseData = projects.map(p => ({ project: p }));
        }
        
        if (chartType === 'treemap' || chartType === 'sunburst') {
            const root: { name: string, children: any[] } = { name: "root", children: [] };
            const groups: { [key: string]: { name: string, children: any[] } } = {};

            baseData.forEach(item => {
                const { project, isoMeasure } = item;
                const dim1Value = getDimensionLabel(project, dimension, dimension === 'isoMeasure' ? isoMeasure : undefined);
                
                if (!groups[dim1Value]) {
                    groups[dim1Value] = { name: dim1Value, children: [] };
                    root.children.push(groups[dim1Value]);
                }

                if (dimension2 !== 'none') {
                     const dim2Value = getDimensionLabel(project, dimension2 as DimensionField, dimension2 === 'isoMeasure' ? isoMeasure : undefined);
                     let subGroup = groups[dim1Value].children.find(c => c.name === dim2Value);
                     if (!subGroup) {
                         subGroup = { name: dim2Value, children: [] };
                         groups[dim1Value].children.push(subGroup);
                     }
                     subGroup.children.push({ name: project.projectId, value: getMeasureValue(project, measure), rawItems: [project] });
                } else {
                     groups[dim1Value].children.push({ name: project.projectId, value: getMeasureValue(project, measure), rawItems: [project] });
                }
            });
            return root;
        }

        if (isDateDimension) {
            const timeData: { [key: string]: { values: number[], rawItems: Project[] } } = {};
            baseData.forEach(item => {
                const { project } = item;
                const label = getDimensionLabel(project, dimension);
                if (label !== 'Date non définie') {
                    if (!timeData[label]) {
                        timeData[label] = { values: [], rawItems: [] };
                    }
                    timeData[label].values.push(getMeasureValue(project, measure));
                    timeData[label].rawItems.push(project);
                }
            });
            return Object.entries(timeData)
                .map(([dateStr, data]) => {
                    let value: number;
                    if (measure === 'count') {
                        value = new Set(data.rawItems.map(p => p.id)).size;
                    } else if (aggregation === 'sum') {
                        value = data.values.reduce((sum, val) => sum + val, 0);
                    } else { // average
                        value = data.values.length > 0 ? data.values.reduce((sum, val) => sum + val, 0) / data.values.length : 0;
                    }
                    return { date: new Date(dateStr), value, rawItems: data.rawItems };
                })
                .sort((a, b) => a.date.getTime() - b.date.getTime());
        }

        const groupedData: { [key: string]: { values: number[], rawItems: Project[] } } = {};
        baseData.forEach(item => {
            const { project, isoMeasure } = item;
            const label = getDimensionLabel(project, dimension, dimension === 'isoMeasure' ? isoMeasure : undefined);
            if (!groupedData[label]) {
                groupedData[label] = { values: [], rawItems: [] };
            }
            groupedData[label].values.push(getMeasureValue(project, measure));
            groupedData[label].rawItems.push(project);
        });

        let aggregated = Object.entries(groupedData).map(([label, data]) => {
            let value: number;
            if (measure === 'count') {
                value = new Set(data.rawItems.map(p => p.id)).size;
            } else if (aggregation === 'sum') {
                value = data.values.reduce((sum, val) => sum + val, 0);
            } else { // average
                value = data.values.length > 0 ? data.values.reduce((sum, val) => sum + val, 0) / data.values.length : 0;
            }
            return { label, value, rawItems: data.rawItems };
        });

        // Sort
        switch (sortOrder) {
            case 'value-desc': aggregated.sort((a, b) => b.value - a.value); break;
            case 'value-asc': aggregated.sort((a, b) => a.value - b.value); break;
            case 'label-asc': aggregated.sort((a, b) => a.label.localeCompare(b.label)); break;
            case 'label-desc': aggregated.sort((a, b) => b.label.localeCompare(a.label)); break;
        }

        // Top N
        if (topN !== 'all') {
            const topData = aggregated.slice(0, topN);
            if (aggregated.length > topN) {
                const otherValue = aggregated.slice(topN).reduce((sum, d) => sum + d.value, 0);
                const otherRawItems = aggregated.slice(topN).flatMap(d => d.rawItems);
                topData.push({ label: 'Autres', value: otherValue, rawItems: otherRawItems });
            }
            aggregated = topData;
        }
        
        return aggregated;
    }, [projects, chartType, dimension, dimension2, measure, measureX, measureY, sizeMeasure, aggregation, sortOrder, topN, dataMaps, isDateDimension]);
    
    useEffect(() => {
        const measureLabel = measureOptions.find(m => m.value === measure)?.label || '';
        const dimensionLabel = dimensionOptions.find(d => d.value === dimension)?.label || '';
        let title = '';

        if (chartType === 'scatter' || chartType === 'bubble') {
            const measureXLabel = measureOptions.find(m => m.value === measureX)?.label || '';
            const measureYLabel = measureOptions.find(m => m.value === measureY)?.label || '';
            title = `Corrélation entre ${measureXLabel} et ${measureYLabel} par ${dimensionLabel}`;
        } else if (chartType === 'treemap' || chartType === 'sunburst') {
            const dimension2Label = dimensionOptions.find(d => d.value === dimension2)?.label || '';
            title = `${measureLabel} par ${dimensionLabel}` + (dimension2 !== 'none' ? ` et ${dimension2Label}` : '');
        } else if (measure === 'count') {
            title = `Nombre de projets par ${dimensionLabel}`;
        } else {
            const aggregationLabel = aggregationOptions.find(a => a.value === aggregation)?.label || '';
            title = `${aggregationLabel} de "${measureLabel}" par ${dimensionLabel}`;
        }
        setChartTitleInput(title);
    }, [chartType, dimension, dimension2, measure, measureX, measureY, aggregation]);

    const handleChartTypeChange = (newType: ChartType) => {
        setChartType(newType);
        if (newType === 'line' || newType === 'area') {
            if (!isDateDimension) setDimension('projectStartDate');
        } else if (isDateDimension) {
            setDimension('status');
        }
    };

    const handleSaveConfig = () => {
        if (!configName.trim() || savedConfigs.some(c => c.name === configName.trim())) {
            alert("Veuillez donner un nom unique à votre configuration.");
            return;
        }
        const newConfig: SavedConfig = { name: configName.trim(), chartType, dimension, dimension2, measure, measureX, measureY, sizeMeasure, aggregation, colorPalette, sortOrder, topN, chartTitle: chartTitleInput };
        const newConfigs = [...savedConfigs, newConfig];
        setSavedConfigs(newConfigs);
        saveToLocalStorage(GRAPH_CREATOR_CONFIGS_KEY, newConfigs);
        setConfigName('');
    };

    const handleLoadConfig = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const config = savedConfigs.find(c => c.name === e.target.value);
        if (config) {
            // FIX: Corrected default value for measureX to be a valid `MeasureField` type.
            setChartType(config.chartType); setDimension(config.dimension); setDimension2(config.dimension2 || 'none'); setMeasure(config.measure); setMeasureX(config.measureX || 'moaInternalWorkloadConsumed'); setMeasureY(config.measureY || 'budgetCommitted'); setSizeMeasure(config.sizeMeasure || 'budgetApproved'); setAggregation(config.aggregation); setColorPalette(config.colorPalette); setSortOrder(config.sortOrder || 'value-desc'); setTopN(config.topN || 'all'); setChartTitleInput(config.chartTitle || '');
        }
        e.target.value = "";
    };
    
    const handleDeleteConfig = (name: string) => {
        const newConfigs = savedConfigs.filter(c => c.name !== name);
        setSavedConfigs(newConfigs);
        saveToLocalStorage(GRAPH_CREATOR_CONFIGS_KEY, newConfigs);
    };
    
    useEffect(() => {
        const handle = handleRef.current;
        if (!handle) return;
        const handleMouseMove = (e: MouseEvent) => {
            const newSize = e.clientX;
            if (newSize > 250 && newSize < window.innerWidth - 400) setPanelSize(newSize);
        };
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        const handleMouseDown = (e: MouseEvent) => {
            e.preventDefault();
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        };
        handle.addEventListener('mousedown', handleMouseDown);
        return () => {
            handle.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    useEffect(() => { saveToLocalStorage('graphCreatorPanelSize', panelSize); }, [panelSize]);
    
    useEffect(() => { setHiddenLabels([]); }, [chartType, dimension, dimension2, measure, measureX, measureY, sizeMeasure, aggregation]);

    const exportToSvg = () => {
        const svgElement = document.querySelector('#chart-container svg');
        if (svgElement) {
            const serializer = new XMLSerializer();
            const source = '<?xml version="1.0" standalone="no"?>\r\n' + serializer.serializeToString(svgElement);
            const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${chartTitleInput.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.svg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        setIsExportOpen(false);
    };

    const exportToPng = () => {
        const svgElement = document.querySelector('#chart-container svg');
        if (!svgElement) return;

        const serializer = new XMLSerializer();
        const source = '<?xml version="1.0" standalone="no"?>\r\n' + serializer.serializeToString(svgElement);
        const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        const image = new Image();
        image.onload = () => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            const margin = 20;
            const scale = 2; // for higher resolution
            canvas.width = (svgElement.clientWidth + margin * 2) * scale;
            canvas.height = (svgElement.clientHeight + margin * 2) * scale;
            
            if (context) {
                context.scale(scale, scale);
                context.fillStyle = 'white';
                context.fillRect(0, 0, canvas.width / scale, canvas.height / scale);
                context.drawImage(image, margin, margin, svgElement.clientWidth, svgElement.clientHeight);

                const pngUrl = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = `${chartTitleInput.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
                link.href = pngUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            URL.revokeObjectURL(url);
        };
        image.onerror = (e) => {
            console.error("Error loading SVG image for PNG conversion.", e);
            URL.revokeObjectURL(url);
        };
        image.src = url;
        setIsExportOpen(false);
    };

    return (
        <div className="flex flex-col h-full space-y-4">
            <h1 className="text-3xl font-bold text-slate-800">Créateur de graphiques</h1>
            <div className="flex flex-grow min-h-0">
                <div style={{ width: `${panelSize}px` }} className="flex-shrink-0 h-full overflow-y-auto pr-4">
                     <Card className="h-full">
                        <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div>
                                <label className="block text-sm text-slate-600 mb-2">Type de graphique</label>
                                <div className="grid grid-cols-4 gap-2">
                                    <ChartTypeButton icon={<BarChart3 size={24} />} label="Barres" isActive={chartType === 'bar'} onClick={() => handleChartTypeChange('bar')} />
                                    <ChartTypeButton icon={<Donut size={24} />} label="Donut" isActive={chartType === 'pie'} onClick={() => handleChartTypeChange('pie')} />
                                    <ChartTypeButton icon={<LineChartIcon size={24} />} label="Ligne" isActive={chartType === 'line'} onClick={() => handleChartTypeChange('line')} />
                                    <ChartTypeButton icon={<AreaChart size={24} />} label="Aire" isActive={chartType === 'area'} onClick={() => handleChartTypeChange('area')} />
                                    <ChartTypeButton icon={<ScatterChart size={24} />} label="Points" isActive={chartType === 'scatter'} onClick={() => handleChartTypeChange('scatter')} />
                                    <ChartTypeButton icon={<BubbleChartIcon size={24} />} label="Bulles" isActive={chartType === 'bubble'} onClick={() => handleChartTypeChange('bubble')} />
                                    <ChartTypeButton icon={<LayoutPanelTop size={24} />} label="Treemap" isActive={chartType === 'treemap'} onClick={() => handleChartTypeChange('treemap')} />
                                    <ChartTypeButton icon={<Aperture size={24} />} label="Soleil" isActive={chartType === 'sunburst'} onClick={() => handleChartTypeChange('sunburst')} />
                                </div>
                            </div>
                            {(chartType === 'bar' || chartType === 'pie' || chartType === 'line' || chartType === 'area') && (
                                <>
                                    <ConfigSelect label="Dimension (Axe X / Groupes)" value={dimension} onChange={e => setDimension(e.target.value as DimensionField)} options={dimensionOptions.filter(o => o.value !== 'projectId' && (chartType === 'line' || chartType === 'area' ? o.isDate : !o.isDate))} />
                                    <ConfigSelect label="Mesure (Axe Y / Taille)" value={measure} onChange={e => setMeasure(e.target.value as MeasureField)} options={measureOptions} />
                                    {measure !== 'count' && !isDateDimension && <ConfigSelect label="Agrégation" value={aggregation} onChange={e => setAggregation(e.target.value as AggregationType)} options={aggregationOptions} />}
                                </>
                            )}
                            {(chartType === 'scatter' || chartType === 'bubble') && (
                                <>
                                    <ConfigSelect label="Groupement par" value={dimension} onChange={e => setDimension(e.target.value as DimensionField)} options={dimensionOptions.filter(o => !o.isDate)} />
                                    <ConfigSelect label="Mesure (Axe X)" value={measureX} onChange={e => setMeasureX(e.target.value as MeasureField)} options={measureOptions.filter(o => o.value !== 'count')} />
                                    <ConfigSelect label="Mesure (Axe Y)" value={measureY} onChange={e => setMeasureY(e.target.value as MeasureField)} options={measureOptions.filter(o => o.value !== 'count')} />
                                    {chartType === 'bubble' && <ConfigSelect label="Mesure (Taille des bulles)" value={sizeMeasure} onChange={e => setSizeMeasure(e.target.value as MeasureField)} options={measureOptions.filter(o => o.value !== 'count')} />}
                                </>
                            )}
                            {(chartType === 'treemap' || chartType === 'sunburst') && (
                                <>
                                    <ConfigSelect label="1er niveau de groupement" value={dimension} onChange={e => setDimension(e.target.value as DimensionField)} options={dimensionOptions.filter(o => !o.isDate && o.value !== 'projectId')} />
                                    <ConfigSelect label="2ème niveau de groupement" value={dimension2} onChange={e => setDimension2(e.target.value as DimensionField2)} options={[{ value: 'none', label: 'Aucun' }, ...dimensionOptions.filter(o => !o.isDate && o.value !== 'projectId' && o.value !== dimension)]} />
                                    <ConfigSelect label="Mesure (Taille)" value={measure} onChange={e => setMeasure(e.target.value as MeasureField)} options={measureOptions.filter(o => o.value !== 'count')} />
                                </>
                            )}
                            <div className="pt-2 border-t">
                                <h4 className="text-sm font-semibold text-slate-800 mb-2">Options</h4>
                                <ConfigSelect label="Palette de couleurs" value={colorPalette} onChange={e => setColorPalette(e.target.value as ColorPalette)} options={colorPaletteOptions} />
                                {(chartType === 'bar' || chartType === 'pie') && (
                                    <>
                                        <ConfigSelect label="Tri" value={sortOrder} onChange={e => setSortOrder(e.target.value as SortOrder)} options={[{ value: 'value-desc', label: 'Valeur (décroissant)' }, { value: 'value-asc', label: 'Valeur (croissant)' }, { value: 'label-asc', label: 'Libellé (A-Z)' }, { value: 'label-desc', label: 'Libellé (Z-A)' }]} />
                                        <ConfigSelect label="Afficher le Top" value={String(topN)} onChange={e => setTopN(e.target.value === 'all' ? 'all' : Number(e.target.value) as TopNValue)} options={[{ value: 'all', label: 'Tout afficher' }, { value: '5', label: 'Top 5' }, { value: '10', label: 'Top 10' }]} />
                                    </>
                                )}
                            </div>
                            <div className="pt-4 border-t">
                                <h4 className="text-sm font-semibold text-slate-800 mb-2">Sauvegarder / Charger</h4>
                                <div className="space-y-3 p-3 bg-white rounded-md border border-slate-200">
                                    <div className="flex gap-2">
                                        <input type="text" value={configName} onChange={e => setConfigName(e.target.value)} placeholder="Nom de la vue" className="flex-grow p-2 border border-slate-300 rounded-md text-sm bg-white" />
                                        <button onClick={handleSaveConfig} className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">Sauver</button>
                                    </div>
                                    {savedConfigs.length > 0 && (
                                        <div>
                                            <select onChange={handleLoadConfig} defaultValue="" className="w-full p-2 border border-slate-300 rounded-md bg-white text-sm">
                                                <option value="" disabled>Charger une vue...</option>
                                                {savedConfigs.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                            </select>
                                            <div className="mt-2 max-h-24 overflow-y-auto space-y-1 pr-1">
                                                {savedConfigs.map(c => (
                                                    <div key={c.name} className="flex justify-between items-center text-xs p-2 bg-white border border-slate-200 rounded hover:bg-slate-50">
                                                        <span className="truncate pr-2">{c.name}</span>
                                                        <button onClick={() => handleDeleteConfig(c.name)} className="p-1 hover:bg-red-100 rounded-full text-red-500 flex-shrink-0"><Trash2 size={12} /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div ref={handleRef} className="w-2 h-full cursor-col-resize flex-shrink-0 bg-slate-200 hover:bg-blue-500 transition-colors"></div>
                <div className="flex-grow h-full flex flex-col pl-4 min-w-0">
                    <Card className="h-full flex flex-col">
                        <CardHeader className="flex justify-between items-start">
                            <CardTitle className="flex-grow pr-4">{chartTitleInput}</CardTitle>
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <div className="flex items-center bg-slate-100 rounded-md p-0.5">
                                    <TabButton label="Graphique" isActive={activeTab === 'chart'} onClick={() => setActiveTab('chart')} />
                                    <TabButton label="Données" isActive={activeTab === 'data'} onClick={() => setActiveTab('data')} />
                                </div>
                                <div className="relative" ref={exportDropdownRef}>
                                    <button onClick={() => setIsExportOpen(prev => !prev)} className="flex items-center gap-2 px-3 py-1.5 bg-slate-600 text-white rounded-md hover:bg-slate-700 text-sm">
                                        <Download size={16} />
                                        Exporter
                                    </button>
                                    {isExportOpen && (
                                        <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border border-slate-200 z-10">
                                            <ul className="py-1">
                                                <li>
                                                    <button onClick={exportToSvg} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">En SVG</button>
                                                </li>
                                                <li>
                                                    <button onClick={exportToPng} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">En PNG</button>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow min-h-0 flex items-center justify-center bg-slate-50" id="chart-container">
                             {activeTab === 'chart' && (
                                <DynamicChartRenderer
                                    chartType={chartType}
                                    data={processedData}
                                    config={{
                                        measure,
                                        measureXLabel: measureOptions.find(m => m.value === measureX)?.label,
                                        measureYLabel: measureOptions.find(m => m.value === measureY)?.label,
                                        sizeMeasureLabel: measureOptions.find(m => m.value === sizeMeasure)?.label,
                                    }}
                                    colorPalette={colorPalette}
                                    onChartElementClick={(data) => console.log('Chart element clicked:', data)}
                                    hiddenLabels={hiddenLabels}
                                    setHiddenLabels={setHiddenLabels}
                                />
                            )}
                            {activeTab === 'data' && (
                                <DataTable data={processedData} chartType={chartType} />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

// FIX: Change `data` prop type to `any` to accept both arrays and objects. Handle data structure internally.
const DataTable: React.FC<{ data: any, chartType: ChartType }> = ({ data, chartType }) => {
    
    const { headers, rows } = useMemo(() => {
        if (!data) return { headers: [], rows: [] };

        if (chartType === 'treemap' || chartType === 'sunburst') {
            const flattenData = (node: any, prefix = ''): { path: string, value: string }[] => {
                if (!node) return [];
                const currentLabel = prefix ? `${prefix} > ${node.name}` : node.name;
                if (node.children && node.children.length > 0) {
                    return node.children.flatMap((child: any) => flattenData(child, currentLabel));
                } else if (node.value !== undefined) {
                    return [{ path: currentLabel, value: node.value.toLocaleString('fr-FR') }];
                }
                return [];
            };

            const flatData = data.children ? data.children.flatMap((child: any) => flattenData(child)) : [];
            return { 
                headers: ['Chemin', 'Valeur'],
                rows: flatData.map(d => [d.path, d.value])
            };
        }

        if (!Array.isArray(data)) return { headers: [], rows: [] };

        let tableHeaders: string[] = [];
        let tableRows: (string|number)[][] = [];

        switch (chartType) {
            case 'bar':
            case 'pie':
                tableHeaders = ['Label', 'Valeur'];
                tableRows = data.map(d => [d.label, d.value.toLocaleString('fr-FR')]);
                break;
            case 'line':
            case 'area':
                tableHeaders = ['Date', 'Valeur'];
                tableRows = data.map(d => [d.date.toLocaleDateString('fr-CA'), d.value.toLocaleString('fr-FR')]);
                break;
            case 'scatter':
            case 'bubble':
                tableHeaders = ['Label', 'Valeur X', 'Valeur Y', 'Taille'];
                tableRows = data.map(d => [d.label, d.xValue.toLocaleString('fr-FR'), d.yValue.toLocaleString('fr-FR'), d.sizeValue.toLocaleString('fr-FR')]);
                break;
            default:
                if (data.length > 0 && data[0] && typeof data[0] === 'object') {
                    tableHeaders = Object.keys(data[0]).filter(k => k !== 'rawItems');
                    tableRows = data.map(row => tableHeaders.map(header => row[header.toLowerCase()]));
                }
        }
        return { headers: tableHeaders, rows: tableRows };

    }, [data, chartType]);

    if (rows.length === 0) return <p>Aucune donnée à afficher.</p>;

    return (
        <div className="w-full h-full overflow-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-700 uppercase bg-slate-200 sticky top-0">
                    <tr>
                        {headers.map(header => <th key={header} scope="col" className="px-4 py-2">{header}</th>)}
                    </tr>
                </thead>
                <tbody className="bg-white">
                    {rows.map((row, i) => (
                        <tr key={i} className="border-b hover:bg-slate-50">
                            {row.map((cell, j) => <td key={j} className="px-4 py-2">{cell}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


const ConfigSelect: React.FC<{ label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: {value: string, label: string}[], disabled?: boolean }> = ({label, value, onChange, options, disabled}) => (
    <div><label className="block text-sm text-slate-600 mb-1">{label}</label><select value={value} onChange={onChange} disabled={disabled} className="w-full p-2 border border-slate-300 rounded-md bg-white text-sm disabled:bg-slate-100 disabled:cursor-not-allowed">{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
);

const TabButton: React.FC<{ label: string, isActive: boolean, onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`px-3 py-1 text-sm font-medium rounded ${isActive ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:bg-slate-200'}`}>{label}</button>
);

export default GraphCreatorPage;