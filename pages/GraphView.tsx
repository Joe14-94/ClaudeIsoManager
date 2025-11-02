import React, { useMemo, useState, useCallback, Fragment } from 'react';
import { ReactFlow, MiniMap, Controls, Background, BackgroundVariant, Node, Edge, Position } from '@xyflow/react';
import { useData } from '../contexts/DataContext';
import { ISO_MEASURES_DATA } from '../constants';
import { Activity, Chantier, IsoMeasure, Objective, StrategicOrientation } from '../types';
import { ChevronDown, ChevronRight, ArrowLeftRight } from 'lucide-react';
import Modal from '../components/ui/Modal';
import { DOMAIN_COLORS, STATUS_COLORS, PRIORITY_COLORS } from '../constants';

const nodeDefaults = {
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
  style: {
    borderRadius: '0.5rem',
    borderWidth: '2px',
    fontSize: '11px',
    padding: '8px 12px',
    width: 250,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
};

const nodeStyles: { [key: string]: React.CSSProperties } = {
  orientations: { backgroundColor: '#f3e8ff', borderColor: '#9333ea' },
  chantiers: { backgroundColor: '#e0f2fe', borderColor: '#0284c7' },
  objectives: { backgroundColor: '#d1fae5', borderColor: '#059669' },
  activities: { backgroundColor: '#fef3c7', borderColor: '#d97706' },
  isoMeasures: { backgroundColor: '#fee2e2', borderColor: '#dc2626' },
  root: { backgroundColor: '#f1f5f9', borderColor: '#475569', width: 300 },
};

const nodeTypeLabels: { [key: string]: string } = {
  orientations: 'Orientations',
  chantiers: 'Chantiers',
  objectives: 'Objectifs',
  activities: 'Activités',
  isoMeasures: 'Mesures ISO',
};


const DetailItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="mb-4">
        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{label}</h4>
        <div className="text-slate-800 mt-1">{children}</div>
    </div>
);

const NodeDetails: React.FC<{ node: Node | null, orientationsData: StrategicOrientation[] }> = ({ node, orientationsData }) => {
    if (!node) return null;
    const { type, data } = node;

    switch (type) {
        case 'orientations': {
            const item = data as unknown as StrategicOrientation;
            return (
                <div>
                    <DetailItem label="Code">{item.code}</DetailItem>
                    <DetailItem label="Description">{item.description || 'Non fournie'}</DetailItem>
                </div>
            );
        }
        case 'chantiers': {
            const item = data as unknown as Chantier;
            const orientation = orientationsData.find(o => o.id === item.strategicOrientationId);
            return (
                <div>
                    <DetailItem label="Code">{item.code}</DetailItem>
                    <DetailItem label="Description">{item.description || 'Non fournie'}</DetailItem>
                    {orientation && <DetailItem label="Orientation Stratégique">{orientation.code} - {orientation.label}</DetailItem>}
                </div>
            );
        }
        case 'objectives': {
            const item = data as unknown as Objective;
            return (
                <div>
                    <DetailItem label="Code">{item.code}</DetailItem>
                    <DetailItem label="Description">{item.description || 'Non fournie'}</DetailItem>
                    <DetailItem label="Date Cible">{item.targetDate ? new Date(item.targetDate).toLocaleDateString() : 'N/A'}</DetailItem>
                    <DetailItem label="Orientations Stratégiques">
                        <div className="flex flex-wrap gap-2">
                        {item.strategicOrientations?.map(soId => {
                            const orientation = orientationsData.find(o => o.id === soId);
                            return <span key={soId} className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">{orientation?.code || soId}</span>
                        })}
                        </div>
                    </DetailItem>
                </div>
            );
        }
        case 'activities': {
            const item = data as unknown as Activity;
            return (
                <div>
                    <DetailItem label="ID Activité">{item.activityId}</DetailItem>
                    <DetailItem label="Description">{item.description || 'Non fournie'}</DetailItem>
                    <DetailItem label="Statut">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[item.status]}`}>{item.status}</span>
                    </DetailItem>
                     <DetailItem label="Priorité">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${PRIORITY_COLORS[item.priority]}`}>{item.priority}</span>
                    </DetailItem>
                    <DetailItem label="Domaine de Sécurité">
                         <span className={`px-2 py-1 text-xs font-medium rounded-full border ${DOMAIN_COLORS[item.securityDomain]}`}>{item.securityDomain}</span>
                    </DetailItem>
                    <DetailItem label="Mesures ISO">
                        <div className="flex flex-wrap gap-1">
                        {item.isoMeasures.map(code => <span key={code} className="px-2 py-0.5 text-xs font-mono bg-red-100 text-red-800 rounded">{code}</span>)}
                        </div>
                    </DetailItem>
                </div>
            );
        }
        case 'isoMeasures': {
            const item = data as unknown as IsoMeasure;
            return (
                <div>
                    <DetailItem label="Code">{item.code}</DetailItem>
                    <DetailItem label="Chapitre">{item.chapter}</DetailItem>
                    <DetailItem label="Description">{item.description || 'Non fournie'}</DetailItem>
                </div>
            );
        }
        default:
            return <p>Pas de détails disponibles pour ce type de nœud.</p>;
    }
};

const GraphView: React.FC = () => {
    const { activities, objectives, orientations, chantiers } = useData();
    const [nodeVisibility, setNodeVisibility] = useState({
        orientations: true,
        chantiers: true,
        objectives: true,
        activities: true,
        isoMeasures: true,
    });
    const [viewMode, setViewMode] = useState<'strategic' | 'iso'>('strategic');
    const [orientationVisibility, setOrientationVisibility] = useState<Record<string, boolean>>(
        () => orientations.reduce((acc, o) => ({ ...acc, [o.id]: true }), {})
    );
     const [isoMeasureVisibility, setIsoMeasureVisibility] = useState<Record<string, boolean>>(
        () => ISO_MEASURES_DATA.reduce((acc, m) => ({ ...acc, [m.code]: true }), {})
    );
    const [isOrientationFilterOpen, setIsOrientationFilterOpen] = useState(false);
    const [isIsoFilterOpen, setIsIsoFilterOpen] = useState(false);
    const [isNodeTypeFilterOpen, setIsNodeTypeFilterOpen] = useState(false);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    const handleVisibilityChange = useCallback((type: string) => {
        setNodeVisibility(prev => ({ ...prev, [type]: !prev[type] }));
    }, []);

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    }, []);

    const { nodes, edges } = useMemo(() => {
        const allNodes: Node[] = [];
        const allEdges: Edge[] = [];
        const yCounters = { orientations: 0, chantiers: 0, objectives: 0, activities: 0, isoMeasures: 0 };
        const ySpacing = { orientations: 70, chantiers: 60, objectives: 45, activities: 80, isoMeasures: 50 };

        if (viewMode === 'strategic') {
            const columnX = { orientations: 0, chantiers: 350, objectives: 700, activities: 1100, isoMeasures: 1500 };
            const isoMeasuresMap = new Map(ISO_MEASURES_DATA.map(m => [m.code, { ...m, id: m.code }]));

            const visibleOrientations = orientations.filter(o => orientationVisibility[o.id]);
            visibleOrientations.forEach(o => {
                allNodes.push({ id: `so-${o.id}`, data: { label: `${o.code} - ${o.label}`, ...o }, position: { x: columnX.orientations, y: yCounters.orientations }, ...nodeDefaults, style: { ...nodeDefaults.style, ...nodeStyles.orientations }, type: 'orientations' });
                yCounters.orientations += ySpacing.orientations;
            });
            const visibleOrientationIds = new Set(visibleOrientations.map(o => o.id));

            chantiers.forEach(c => {
                if (visibleOrientationIds.has(c.strategicOrientationId)) {
                    allNodes.push({ id: `ch-${c.id}`, data: { label: `${c.code} - ${c.label}`, ...c }, position: { x: columnX.chantiers, y: yCounters.chantiers }, ...nodeDefaults, style: { ...nodeDefaults.style, ...nodeStyles.chantiers }, type: 'chantiers' });
                    yCounters.chantiers += ySpacing.chantiers;
                    allEdges.push({ id: `e-so-${c.strategicOrientationId}-ch-${c.id}`, source: `so-${c.strategicOrientationId}`, target: `ch-${c.id}`, type: 'smoothstep' });
                }
            });
            const chantierCodeMap = new Map(chantiers.map(ch => [ch.code, ch.id]));

            objectives.forEach(o => {
                const objCodeParts = o.code.split('.');
                let isLinked = false;
                if (objCodeParts.length >= 3) {
                    const chantierCodeGuess = `${objCodeParts[0]}.${parseInt(objCodeParts[1])}.${parseInt(objCodeParts[2])}`;
                    if (chantierCodeMap.has(chantierCodeGuess)) {
                        const parentChantierId = chantierCodeMap.get(chantierCodeGuess)!;
                        const parentChantier = chantiers.find(c => c.id === parentChantierId);
                        if (parentChantier && visibleOrientationIds.has(parentChantier.strategicOrientationId)) {
                            isLinked = true;
                            allEdges.push({ id: `e-ch-${parentChantierId}-obj-${o.id}`, source: `ch-${parentChantierId}`, target: `obj-${o.id}`, type: 'smoothstep' });
                        }
                    }
                }
                if (o.strategicOrientations.some(soId => visibleOrientationIds.has(soId))) {
                    isLinked = true;
                    o.strategicOrientations.forEach(soId => {
                        if (visibleOrientationIds.has(soId)) {
                             allEdges.push({ id: `e-so-${soId}-obj-${o.id}`, source: `so-${soId}`, target: `obj-${o.id}`, type: 'smoothstep' });
                        }
                    });
                }
                 if(isLinked) {
                    allNodes.push({ id: `obj-${o.id}`, data: { label: `${o.code} - ${o.label}`, ...o }, position: { x: columnX.objectives, y: yCounters.objectives }, ...nodeDefaults, style: { ...nodeDefaults.style, ...nodeStyles.objectives }, type: 'objectives' });
                    yCounters.objectives += ySpacing.objectives;
                }
            });

            activities.forEach(a => {
                allNodes.push({ id: `act-${a.id}`, data: { label: `${a.activityId} - ${a.title}`, ...a }, position: { x: columnX.activities, y: yCounters.activities }, ...nodeDefaults, style: { ...nodeDefaults.style, ...nodeStyles.activities }, type: 'activities' });
                yCounters.activities += ySpacing.activities;
                a.objectives.forEach(objId => allEdges.push({ id: `e-obj-${objId}-act-${a.id}`, source: `obj-${objId}`, target: `act-${a.id}`, type: 'smoothstep' }));
                a.strategicOrientations.forEach(soId => {
                    if (visibleOrientationIds.has(soId)) {
                        allEdges.push({ id: `e-so-${soId}-act-${a.id}`, source: `so-${soId}`, target: `act-${a.id}`, type: 'smoothstep' });
                    }
                });
            });

            const usedIsoCodes = new Set(activities.flatMap(a => a.isoMeasures));
            isoMeasuresMap.forEach((m) => {
                if (usedIsoCodes.has(m.code)) {
                    allNodes.push({ id: `iso-${m.id}`, data: { label: `${m.code} - ${m.title}`, ...m }, position: { x: columnX.isoMeasures, y: yCounters.isoMeasures }, ...nodeDefaults, style: { ...nodeDefaults.style, ...nodeStyles.isoMeasures }, type: 'isoMeasures' });
                    yCounters.isoMeasures += ySpacing.isoMeasures;
                }
            });
            activities.forEach(a => {
                a.isoMeasures.forEach(isoCode => allEdges.push({ id: `e-act-${a.id}-iso-${isoCode}`, source: `act-${a.id}`, target: `iso-${isoCode}`, type: 'smoothstep' }));
            });
        } else { // ISO view
            const columnX = { isoMeasures: 0, activities: 400, objectives: 800, chantiers: 1200, orientations: 1600 };
            
            const visibleMeasures = ISO_MEASURES_DATA.filter(m => isoMeasureVisibility[m.code]);
            const visibleMeasureCodes = new Set(visibleMeasures.map(m => m.code));

            visibleMeasures.forEach(m => {
                allNodes.push({ id: `iso-${m.code}`, data: { label: `${m.code} - ${m.title}`, ...m }, position: { x: columnX.isoMeasures, y: yCounters.isoMeasures }, ...nodeDefaults, style: { ...nodeDefaults.style, ...nodeStyles.isoMeasures }, type: 'isoMeasures' });
                yCounters.isoMeasures += ySpacing.isoMeasures;
            });

            const relatedActivities = new Map<string, Activity>();
            activities.forEach(a => {
                if (a.isoMeasures.some(code => visibleMeasureCodes.has(code))) {
                    relatedActivities.set(a.id, a);
                }
            });

            relatedActivities.forEach(a => {
                allNodes.push({ id: `act-${a.id}`, data: { label: `${a.activityId} - ${a.title}`, ...a }, position: { x: columnX.activities, y: yCounters.activities }, ...nodeDefaults, style: { ...nodeDefaults.style, ...nodeStyles.activities }, type: 'activities' });
                yCounters.activities += ySpacing.activities;
                a.isoMeasures.forEach(isoCode => {
                     if(visibleMeasureCodes.has(isoCode)) {
                         allEdges.push({ id: `e-act-${a.id}-iso-${isoCode}`, source: `iso-${isoCode}`, target: `act-${a.id}`, type: 'smoothstep', sourceHandle: 'right', targetHandle: 'left' });
                     }
                });
            });

            const relatedObjectives = new Map<string, Objective>();
            relatedActivities.forEach(a => {
                a.objectives.forEach(objId => {
                    const obj = objectives.find(o => o.id === objId);
                    if (obj) relatedObjectives.set(objId, obj);
                });
            });

            relatedObjectives.forEach(o => {
                allNodes.push({ id: `obj-${o.id}`, data: { label: `${o.code} - ${o.label}`, ...o }, position: { x: columnX.objectives, y: yCounters.objectives }, ...nodeDefaults, style: { ...nodeDefaults.style, ...nodeStyles.objectives }, type: 'objectives' });
                yCounters.objectives += ySpacing.objectives;
                activities.forEach(a => {
                    if (a.objectives.includes(o.id) && relatedActivities.has(a.id)) {
                        allEdges.push({ id: `e-obj-${o.id}-act-${a.id}`, source: `obj-${o.id}`, target: `act-${a.id}`, type: 'smoothstep' });
                    }
                });
            });

            const relatedChantiers = new Map<string, Chantier>();
            const relatedOrientations = new Map<string, StrategicOrientation>();
            const chantierCodeMap = new Map(chantiers.map(ch => [ch.code, ch]));

            relatedObjectives.forEach(o => {
                const objCodeParts = o.code.split('.');
                if (objCodeParts.length >= 3) {
                    const chantierCodeGuess = `${objCodeParts[0]}.${parseInt(objCodeParts[1])}.${parseInt(objCodeParts[2])}`;
                    const chantier = chantierCodeMap.get(chantierCodeGuess);
                    if(chantier) {
                         relatedChantiers.set(chantier.id, chantier);
                         allEdges.push({ id: `e-ch-${chantier.id}-obj-${o.id}`, source: `ch-${chantier.id}`, target: `obj-${o.id}`, type: 'smoothstep' });
                    }
                }
                o.strategicOrientations.forEach(soId => {
                    const orientation = orientations.find(o => o.id === soId);
                    if (orientation) {
                        relatedOrientations.set(soId, orientation);
                        allEdges.push({ id: `e-so-${soId}-obj-${o.id}`, source: `so-${soId}`, target: `obj-${o.id}`, type: 'smoothstep' });
                    }
                });
            });
            
            relatedChantiers.forEach(c => {
                 allNodes.push({ id: `ch-${c.id}`, data: { label: `${c.code} - ${c.label}`, ...c }, position: { x: columnX.chantiers, y: yCounters.chantiers }, ...nodeDefaults, style: { ...nodeDefaults.style, ...nodeStyles.chantiers }, type: 'chantiers' });
                 yCounters.chantiers += ySpacing.chantiers;
                 const orientation = orientations.find(o => o.id === c.strategicOrientationId);
                 if (orientation) {
                    relatedOrientations.set(orientation.id, orientation);
                    allEdges.push({ id: `e-so-${orientation.id}-ch-${c.id}`, source: `so-${orientation.id}`, target: `ch-${c.id}`, type: 'smoothstep' });
                 }
            });

             relatedOrientations.forEach(o => {
                allNodes.push({ id: `so-${o.id}`, data: { label: `${o.code} - ${o.label}`, ...o }, position: { x: columnX.orientations, y: yCounters.orientations }, ...nodeDefaults, style: { ...nodeDefaults.style, ...nodeStyles.orientations }, type: 'orientations' });
                yCounters.orientations += ySpacing.orientations;
            });
        }

        const uniqueEdges = [...new Map(allEdges.map(item => [item.id, item])).values()];
        const visibleNodes = allNodes.filter(node => nodeVisibility[node.type as keyof typeof nodeVisibility]);
        const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
        const visibleEdges = uniqueEdges.filter(edge => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target));
        
        return { nodes: visibleNodes, edges: visibleEdges };
    }, [viewMode, nodeVisibility, orientationVisibility, isoMeasureVisibility, activities, objectives, orientations, chantiers]);
    
    const getModalTitle = (node: Node | null): string => {
        if (!node) return '';
        let typeLabel = nodeTypeLabels[node.type as string] || 'Élément';
        return `${typeLabel} : ${node.data.label}`;
    };

  return (
    <div className="h-[calc(100vh-4rem)] w-full flex flex-col">
       <div className="mb-4">
            <h1 className="text-3xl font-bold text-slate-800">Vue arborescente</h1>
            <p className="text-slate-600">Explorez les relations hiérarchiques. Cliquez sur un élément pour voir les détails.</p>
       </div>
        <div className="absolute top-20 right-4 z-10 flex items-center gap-2">
            <button
                onClick={() => setViewMode(prev => prev === 'strategic' ? 'iso' : 'strategic')}
                className="px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center"
                title="Changer de vue"
            >
                <ArrowLeftRight size={16} className="mr-2" />
                {viewMode === 'strategic' ? 'Vue par mesure ISO' : 'Vue stratégique'}
            </button>

            {viewMode === 'strategic' ? (
                 <div className="relative">
                    <button onClick={() => setIsOrientationFilterOpen(!isOrientationFilterOpen)} className="px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center">
                        Filtrer les orientations {isOrientationFilterOpen ? <ChevronDown size={16} className="ml-1" /> : <ChevronRight size={16} className="ml-1" />}
                    </button>
                    {isOrientationFilterOpen && (
                         <div className="absolute top-full right-0 mt-2 w-80 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-slate-200">
                            <h4 className="font-semibold text-sm mb-2 text-slate-700">Afficher les orientations</h4>
                            <div className="max-h-60 overflow-y-auto pr-2">
                                {orientations.map(o => (
                                    <div key={o.id} className="flex items-center space-x-2 my-1">
                                        <input type="checkbox" id={`vis-so-${o.id}`} checked={orientationVisibility[o.id] ?? false} onChange={() => setOrientationVisibility(p => ({...p, [o.id]: !p[o.id]}))} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                        <label htmlFor={`vis-so-${o.id}`} className="text-sm text-slate-600 select-none">{o.code} - {o.label}</label>
                                    </div>
                                ))}
                            </div>
                         </div>
                    )}
                 </div>
            ): (
                 <div className="relative">
                    <button onClick={() => setIsIsoFilterOpen(!isIsoFilterOpen)} className="px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center">
                        Filtrer les mesures ISO {isIsoFilterOpen ? <ChevronDown size={16} className="ml-1" /> : <ChevronRight size={16} className="ml-1" />}
                    </button>
                    {isIsoFilterOpen && (
                         <div className="absolute top-full right-0 mt-2 w-96 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-slate-200">
                            <h4 className="font-semibold text-sm mb-2 text-slate-700">Afficher les mesures ISO</h4>
                            <div className="max-h-60 overflow-y-auto pr-2">
                                {ISO_MEASURES_DATA.map(m => (
                                    <div key={m.code} className="flex items-center space-x-2 my-1">
                                        <input type="checkbox" id={`vis-iso-${m.code}`} checked={isoMeasureVisibility[m.code] ?? false} onChange={() => setIsoMeasureVisibility(p => ({...p, [m.code]: !p[m.code]}))} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                        <label htmlFor={`vis-iso-${m.code}`} className="text-sm text-slate-600 select-none">{m.code} - {m.title}</label>
                                    </div>
                                ))}
                            </div>
                         </div>
                    )}
                 </div>
            )}

            <div className="relative">
                <button onClick={() => setIsNodeTypeFilterOpen(!isNodeTypeFilterOpen)} className="px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center">
                    Afficher les objets {isNodeTypeFilterOpen ? <ChevronDown size={16} className="ml-1" /> : <ChevronRight size={16} className="ml-1" />}
                </button>
                {isNodeTypeFilterOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-slate-200">
                        {Object.entries(nodeTypeLabels).map(([type, label]) => (
                            <div key={type} className="flex items-center space-x-2 my-1">
                            <input
                                type="checkbox"
                                id={`vis-${type}`}
                                checked={nodeVisibility[type as keyof typeof nodeVisibility]}
                                onChange={() => handleVisibilityChange(type)}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <label htmlFor={`vis-${type}`} className="text-sm text-slate-600 pr-2 cursor-pointer select-none">
                                {label}
                            </label>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={onNodeClick}
        fitView
        className="bg-white rounded-lg border border-slate-200"
      >
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
      </ReactFlow>
      {selectedNode && (
        <Modal 
            isOpen={!!selectedNode} 
            onClose={() => setSelectedNode(null)} 
            title={getModalTitle(selectedNode)}
            position="right"
        >
            <NodeDetails node={selectedNode} orientationsData={orientations} />
        </Modal>
    )}
    </div>
  );
};

export default GraphView;
