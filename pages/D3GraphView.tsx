
import React, { useRef, useEffect, useMemo, useState } from 'react';
// FIX: Replace monolithic d3 import with specific named imports to resolve type errors.
import { select, zoom, hierarchy, tree, linkHorizontal, zoomIdentity, HierarchyPointNode } from 'd3';
import { useData } from '../contexts/DataContext';
import { ISO_MEASURES_DATA } from '../constants';
import { Activity, Chantier, IsoMeasure, Objective, StrategicOrientation } from '../types';
import { ChevronDown, ChevronRight, ArrowLeftRight } from 'lucide-react';
import Modal from '../components/ui/Modal';
import { DOMAIN_COLORS, STATUS_COLORS, PRIORITY_COLORS } from '../constants';

interface D3Node {
    id: string;
    name: string;
    type: 'root' | 'orientation' | 'chantier' | 'objective' | 'activity' | 'isoMeasure';
    children?: D3Node[];
    _children?: D3Node[];
    data: Partial<StrategicOrientation | Chantier | Objective | Activity | IsoMeasure>;
}

// Couleurs pastelles pour les nœuds
const nodeColors: { [key: string]: string } = {
  orientation: '#e9d5ff', // purple-200
  chantier: '#bfdbfe',    // blue-200
  objective: '#bbf7d0',   // green-200
  activity: '#fde68a',    // amber-200
  isoMeasure: '#fecaca',  // red-200
  root: '#cbd5e1',        // slate-300
};

const buildStrategicTreeData = (
    visibility: Record<string, boolean>,
    activities: Activity[],
    objectives: Objective[],
    orientations: StrategicOrientation[],
    chantiers: Chantier[]
): D3Node => {
    const isoMap = new Map(ISO_MEASURES_DATA.map(m => [m.code, { ...m, id: m.code }]));

    const activityNodes = new Map(activities.map(a => {
        const isoChildren: D3Node[] = a.isoMeasures
            .map(code => isoMap.get(code))
            .filter((m): m is IsoMeasure => !!m)
            .map(m => ({ id: `iso-${m.code}`, name: m.code, type: 'isoMeasure', data: m }));
        
        return [a.id, { id: `act-${a.id}`, name: a.activityId, type: 'activity', data: a, children: isoChildren }];
    }));

    const objectiveNodes = new Map(objectives.map(o => ([o.id, { id: `obj-${o.id}`, name: o.code, type: 'objective', data: o, children: [] as D3Node[] }])));

    activities.forEach(a => {
        a.objectives.forEach(objId => {
            if (objectiveNodes.has(objId) && activityNodes.has(a.id)) {
                objectiveNodes.get(objId)!.children!.push(JSON.parse(JSON.stringify(activityNodes.get(a.id)!)));
            }
        });
    });

    const chantierNodes = new Map(chantiers.map(c => ([c.id, { id: `ch-${c.id}`, name: c.code, type: 'chantier', data: c, children: [] as D3Node[] }])));

    objectives.forEach(o => {
        if (o.chantierId && chantierNodes.has(o.chantierId) && objectiveNodes.has(o.id)) {
            chantierNodes.get(o.chantierId)!.children!.push(JSON.parse(JSON.stringify(objectiveNodes.get(o.id)!)));
        }
    });
    
    const orientationNodes: D3Node[] = orientations
        .filter(o => visibility[o.id])
        .map(o => {
            const oNode: D3Node = { id: `so-${o.id}`, name: o.code, type: 'orientation', data: o, children: [] };
            chantiers.forEach(c => {
                if (c.strategicOrientationId === o.id && chantierNodes.has(c.id)) {
                    oNode.children!.push(JSON.parse(JSON.stringify(chantierNodes.get(c.id)!)));
                }
            });
            return oNode;
        });

    return {
        id: 'root-strategic',
        name: "Vue stratégique",
        type: 'root',
        children: orientationNodes,
        data: {}
    };
};

const buildIsoTreeData = (
    visibility: Record<string, boolean>,
    activities: Activity[],
    objectives: Objective[],
    orientations: StrategicOrientation[],
    chantiers: Chantier[]
): D3Node => {
    const root: D3Node = {
        id: 'root-iso',
        name: "Vue par mesure ISO 27002",
        type: 'root',
        data: {},
        children: []
    };

    const allMeasures: IsoMeasure[] = ISO_MEASURES_DATA.map(m => ({ ...m, id: m.code }));
    const visibleMeasures = allMeasures.filter(m => visibility[m.code]);

    const objectiveMap = new Map(objectives.map(o => [o.id, o]));
    const orientationMap = new Map(orientations.map(o => [o.id, o]));
    const chantierMap = new Map(chantiers.map(c => [c.id, c]));

    root.children = visibleMeasures.map(measure => {
        const isoNode: D3Node = {
            id: `iso-${measure.code}`,
            name: measure.code,
            type: 'isoMeasure',
            data: measure,
            children: []
        };

        const relatedActivities = activities.filter(a => a.isoMeasures.includes(measure.code));
        const activityChildren = new Map<string, D3Node>();

        relatedActivities.forEach(activity => {
            if (activityChildren.has(activity.id)) return;

            const activityNode: D3Node = {
                id: `${isoNode.id}_act-${activity.id}`,
                name: activity.activityId,
                type: 'activity',
                data: activity,
                children: []
            };

            const objectiveChildren = new Map<string, D3Node>();
            activity.objectives.forEach(objId => {
                if (objectiveChildren.has(objId)) return;
                
                const objective = objectiveMap.get(objId);
                if (objective) {
                    const objectiveNode: D3Node = {
                        id: `${activityNode.id}_obj-${objective.id}`,
                        name: objective.code,
                        type: 'objective',
                        data: objective,
                        children: []
                    };
                    
                    const finalChildren = new Map<string, D3Node>();
                    
                    objective.strategicOrientations.forEach(soId => {
                        if(finalChildren.has(`so-${soId}`)) return;
                        const orientation = orientationMap.get(soId);
                        if(orientation) {
                            finalChildren.set(`so-${soId}`, {
                                id: `${objectiveNode.id}_so-${orientation.id}`,
                                name: orientation.code,
                                type: 'orientation',
                                data: orientation
                            });
                        }
                    });

                    const chantier = chantierMap.get(objective.chantierId);
                    if (chantier && !finalChildren.has(`ch-${chantier.id}`)) {
                        finalChildren.set(`ch-${chantier.id}`, {
                            id: `${objectiveNode.id}_ch-${chantier.id}`,
                            name: chantier.code,
                            type: 'chantier',
                            data: chantier
                        });
                    }

                    objectiveNode.children = Array.from(finalChildren.values());
                    if (objectiveNode.children.length > 0) {
                      objectiveChildren.set(objId, objectiveNode);
                    }
                }
            });

            activityNode.children = Array.from(objectiveChildren.values());
            if (activityNode.children.length > 0) {
              activityChildren.set(activity.id, activityNode);
            }
        });

        isoNode.children = Array.from(activityChildren.values());
        
        return isoNode;
    });

    return root;
};


const DetailItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="mb-4">
        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{label}</h4>
        <div className="text-slate-800 mt-1">{children}</div>
    </div>
);

const NodeDetails: React.FC<{ node: D3Node, orientationsData: StrategicOrientation[] }> = ({ node, orientationsData }) => {
    const { type, data } = node;

    switch (type) {
        case 'orientation': {
            const item = data as StrategicOrientation;
            return (
                <div>
                    <DetailItem label="Code">{item.code}</DetailItem>
                    <DetailItem label="Description">{item.description || 'Non fournie'}</DetailItem>
                </div>
            );
        }
        case 'chantier': {
            const item = data as Chantier;
            const orientation = orientationsData.find(o => o.id === item.strategicOrientationId);
            return (
                <div>
                    <DetailItem label="Code">{item.code}</DetailItem>
                    <DetailItem label="Description">{item.description || 'Non fournie'}</DetailItem>
                    {orientation && <DetailItem label="Orientation stratégique">{orientation.code} - {orientation.label}</DetailItem>}
                </div>
            );
        }
        case 'objective': {
            const item = data as Objective;
            return (
                <div>
                    <DetailItem label="Code">{item.code}</DetailItem>
                    <DetailItem label="Description">{item.description || 'Non fournie'}</DetailItem>
                    <DetailItem label="Date cible">{item.targetDate ? new Date(item.targetDate).toLocaleDateString() : 'N/A'}</DetailItem>
                    <DetailItem label="Orientations stratégiques">
                        <div className="flex flex-wrap gap-2">
                        {item.strategicOrientations?.map(soId => {
                            const orientation = orientationsData.find(o => o.id === soId);
                            return <span key={soId} className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">{orientation?.code || soId}</span>
                        })}
                        </div>
                    </DetailItem>
                    {item.mesures_iso && item.mesures_iso.length > 0 && (
                        <DetailItem label="Mesures ISO associées">
                            <div className="space-y-3">
                                {item.mesures_iso.map((mesure, index) => (
                                    <div key={index} className="bg-slate-100 p-3 rounded-md border border-slate-200">
                                        <p className="font-semibold text-sm text-slate-700">
                                            <span className="font-mono bg-slate-200 px-1.5 py-0.5 rounded mr-2">{mesure.numero_mesure}</span>
                                            {mesure.domaine}
                                        </p>
                                        {mesure.titre && <p className="text-sm font-medium text-slate-600 mt-1">{mesure.titre}</p>}
                                        <p className="text-sm text-slate-600 mt-1">{mesure.description}</p>
                                        {mesure.niveau_application && <p className="text-xs text-slate-500 mt-2">Niveau d'application: {mesure.niveau_application}</p>}
                                    </div>
                                ))}
                            </div>
                        </DetailItem>
                    )}
                </div>
            );
        }
        case 'activity': {
            const item = data as Activity;
            return (
                <div>
                    <DetailItem label="ID activité">{item.activityId}</DetailItem>
                    <DetailItem label="Description">{item.description || 'Non fournie'}</DetailItem>
                    <DetailItem label="Statut">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[item.status]}`}>{item.status}</span>
                    </DetailItem>
                     <DetailItem label="Priorité">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${PRIORITY_COLORS[item.priority]}`}>{item.priority}</span>
                    </DetailItem>
                    <DetailItem label="Domaine de sécurité">
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
        case 'isoMeasure': {
            const item = data as IsoMeasure;
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


const D3GraphView: React.FC = () => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const { activities, objectives, orientations, chantiers } = useData();
    
    const [viewMode, setViewMode] = useState<'strategic' | 'iso'>('strategic');
    const [orientationVisibility, setOrientationVisibility] = useState<Record<string, boolean>>(
        () => orientations.reduce((acc, o) => ({ ...acc, [o.id]: true }), {})
    );
    const [isoMeasureVisibility, setIsoMeasureVisibility] = useState<Record<string, boolean>>(
        () => ISO_MEASURES_DATA.reduce((acc, m) => ({ ...acc, [m.code]: true }), {})
    );
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [isIsoFilterMenuOpen, setIsIsoFilterMenuOpen] = useState(false);
    const [selectedNode, setSelectedNode] = useState<D3Node | null>(null);

    const handleOrientationVisibilityChange = (orientationId: string) => {
        setOrientationVisibility(prev => ({ ...prev, [orientationId]: !prev[orientationId] }));
    };
    const handleSelectAllOrientations = () => {
        setOrientationVisibility(orientations.reduce((acc, o) => ({ ...acc, [o.id]: true }), {}));
    };
    const handleDeselectAllOrientations = () => {
        setOrientationVisibility(orientations.reduce((acc, o) => ({ ...acc, [o.id]: false }), {}));
    };

    const handleIsoVisibilityChange = (isoCode: string) => {
        setIsoMeasureVisibility(prev => ({ ...prev, [isoCode]: !prev[isoCode] }));
    };
    const handleSelectAllIso = () => {
        setIsoMeasureVisibility(ISO_MEASURES_DATA.reduce((acc, m) => ({ ...acc, [m.code]: true }), {}));
    };
    const handleDeselectAllIso = () => {
        setIsoMeasureVisibility(ISO_MEASURES_DATA.reduce((acc, m) => ({ ...acc, [m.code]: false }), {}));
    };

    const treeData = useMemo(() => {
        if (viewMode === 'iso') {
            return buildIsoTreeData(isoMeasureVisibility, activities, objectives, orientations, chantiers);
        }
        return buildStrategicTreeData(orientationVisibility, activities, objectives, orientations, chantiers);
    }, [viewMode, orientationVisibility, isoMeasureVisibility, activities, objectives, orientations, chantiers]);

    useEffect(() => {
        if (!treeData || !svgRef.current || !containerRef.current || !tooltipRef.current) return;

        const container = containerRef.current;
        const svg = select(svgRef.current);
        const tooltip = select(tooltipRef.current);

        svg.selectAll('*').remove();

        const { height: containerHeight } = container.getBoundingClientRect();
        const margin = { top: 20, right: 150, bottom: 30, left: 40 };

        const g = svg.append("g");

        const zoomBehavior = zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 3])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });
        
        svg.call(zoomBehavior);

        const root = hierarchy<D3Node>(treeData, d => d.children);
        (root as any).x0 = 0;
        (root as any).y0 = 0;

        root.descendants().forEach((d: any, i) => {
            d.id = d.data.id || `node-${i}`;
            if (d.depth >= 0) {
                d._children = d.children;
                 if (d.depth > 0) {
                    d.children = null;
                 }
            }
        });

        const update = (source: HierarchyPointNode<D3Node> | any) => {
            const duration = 250;
            const treeLayout = tree<D3Node>().nodeSize([30, 150]);
            treeLayout(root);

            const nodes = root.descendants();
            const links = root.links();
            
            let i = 0;
            const node = g.selectAll('g.node')
                .data(nodes, (d: any) => d.id || (d.id = ++i));

            const nodeEnter = node.enter().append('g')
                .attr('class', 'node')
                .attr('transform', `translate(${source.y0},${source.x0})`)
                .on('mouseover', (event, d: any) => {
                    tooltip.style('opacity', 0.9).html(d.data.data.title || d.data.data.label || d.data.name);
                })
                .on('mousemove', (event) => {
                    const tooltipNode = tooltip.node();
                    if (!tooltipNode) return;

                    const { offsetWidth: tooltipWidth, offsetHeight: tooltipHeight } = tooltipNode;
                    const { pageX, pageY } = event;
                    const offset = 15;

                    // Position bottom-right of cursor
                    let x = pageX + offset;
                    let y = pageY + offset;

                    // Adjust if it overflows viewport
                    if (x + tooltipWidth > window.innerWidth) {
                        x = pageX - tooltipWidth - offset; // switch to left
                    }
                    if (y + tooltipHeight > window.innerHeight) {
                        y = pageY - tooltipHeight - offset; // switch to top
                    }

                    tooltip.style('left', `${x}px`).style('top', `${y}px`);
                })
                .on('mouseout', () => {
                    tooltip.style('opacity', 0);
                });


            const circle = nodeEnter.append('circle')
                .attr('class', 'node')
                .attr('r', 1e-6)
                .style('stroke', d => nodeColors[(d.data as D3Node).type] || '#ccc')
                .style('stroke-width', '2px')
                .on('click', click);
                

            nodeEnter.append('text')
                .attr('dy', '.35em')
                .attr('x', d => d.children || (d as any)._children ? -13 : 13)
                .attr('text-anchor', d => d.children || (d as any)._children ? 'end' : 'start')
                .text(d => d.data.name)
                .style('cursor', 'pointer')
                .on('click', (event, d: any) => {
                    setSelectedNode(d.data);
                });

            const nodeUpdate = nodeEnter.merge(node as any);

            nodeUpdate.transition()
                .duration(duration)
                .attr('transform', d => `translate(${d.y},${d.x})`);

            nodeUpdate.select('circle.node')
                .attr('r', 8) // Slightly larger nodes for visibility with pastel colors
                .style('fill', d => (d as any)._children ? nodeColors[(d.data as D3Node).type] : '#fff')
                .attr('cursor', d => d.children || (d as any)._children ? 'pointer' : 'default');

            const nodeExit = node.exit().transition()
                .duration(duration)
                .attr('transform', `translate(${source.y},${source.x})`)
                .remove();

            nodeExit.select('circle').attr('r', 1e-6);
            nodeExit.select('text').style('fill-opacity', 1e-6);

            const link = g.selectAll('path.link')
                .data(links, (d: any) => d.target.id);

            const linkEnter = link.enter().insert('path', 'g')
                .attr('class', 'link')
                .attr('d', () => {
                    const o: [number, number] = [(source as any).y0, (source as any).x0];
                    return linkHorizontal()({ source: o, target: o }) as any;
                });

            const linkUpdate = linkEnter.merge(link as any);

            linkUpdate.transition()
                .duration(duration)
                .attr('d', d => linkHorizontal()({ source: [d.source.y, d.source.x], target: [d.target.y, d.target.x] }) as any);

            link.exit().transition()
                .duration(duration)
                .attr('d', () => {
                    const o: [number, number] = [source.y, source.x];
                    return linkHorizontal()({ source: o, target: o }) as any;
                })
                .remove();

            nodes.forEach((d: any) => {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }

        function click(event: MouseEvent, d: any) {
            if (!d.children && !d._children) return;

            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
            update(d);
        }
        
        update(root as any);
        
        const initialTransform = zoomIdentity.translate(margin.left, containerHeight / 2).scale(0.8);
        svg.call(zoomBehavior.transform, initialTransform);

    }, [treeData]);

    const getModalTitle = (node: D3Node | null): string => {
        if (!node || !node.type || node.type === 'root') return node?.name || '';
        
        let typeLabel = '';
        let code = '';
        let title = '';

        switch(node.type) {
            case 'orientation':
                typeLabel = 'Orientation';
                code = (node.data as StrategicOrientation).code || '';
                title = (node.data as StrategicOrientation).label || '';
                break;
            case 'chantier':
                typeLabel = 'Chantier';
                code = (node.data as Chantier).code || '';
                title = (node.data as Chantier).label || '';
                break;
            case 'objective':
                typeLabel = 'Objectif';
                code = (node.data as Objective).code || '';
                title = (node.data as Objective).label || '';
                break;
            case 'activity':
                typeLabel = 'Activité';
                code = (node.data as Activity).activityId || '';
                title = (node.data as Activity).title || '';
                break;
            case 'isoMeasure':
                typeLabel = 'Mesure ISO';
                code = (node.data as IsoMeasure).code || '';
                title = (node.data as IsoMeasure).title || '';
                break;
        }

        return `${typeLabel} : ${code} - ${title}`;
    }


    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 mb-4">
                <h1 className="text-2xl font-bold text-slate-800">Vue arborescente (D3.js)</h1>
                <p className="text-slate-600">Explorez les relations hiérarchiques de la stratégie. Cliquez sur un cercle pour déplier/replier, et sur un texte pour voir les détails.</p>
            </div>
            
            <div className="absolute top-16 right-4 z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                 <button
                    onClick={() => setViewMode(prev => prev === 'strategic' ? 'iso' : 'strategic')}
                    className="px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-center"
                    title="Changer de vue"
                >
                    <ArrowLeftRight size={16} className="mr-2" />
                    <span className="truncate">{viewMode === 'strategic' ? 'Vue par mesure ISO' : 'Vue stratégique'}</span>
                </button>
                
                {viewMode === 'strategic' ? (
                    <div className='relative'>
                        <button
                            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-center"
                        >
                            <span className="truncate">Filtrer les orientations</span>
                            {isFilterMenuOpen ? <ChevronDown size={16} className="ml-2" /> : <ChevronRight size={16} className="ml-2" />}
                        </button>
                        {isFilterMenuOpen && (
                            <div className="absolute top-full right-0 mt-2 w-72 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-slate-200">
                                <h4 className="font-semibold text-sm mb-2 text-slate-700">Afficher les orientations</h4>
                                <div className="max-h-60 overflow-y-auto pr-2">
                                    {orientations.map(o => (
                                        <div key={o.id} className="flex items-center space-x-2 my-1">
                                            <input
                                                type="checkbox"
                                                id={`vis-${o.id}`}
                                                checked={orientationVisibility[o.id] ?? false}
                                                onChange={() => handleOrientationVisibilityChange(o.id)}
                                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            />
                                            <label htmlFor={`vis-${o.id}`} className="text-sm text-slate-600 pr-2 cursor-pointer select-none">
                                                {o.code} - {o.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200">
                                    <button onClick={handleSelectAllOrientations} className="text-xs font-medium text-blue-600 hover:underline">Tout cocher</button>
                                    <button onClick={handleDeselectAllOrientations} className="text-xs font-medium text-blue-600 hover:underline">Tout décocher</button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                     <div className='relative'>
                        <button
                            onClick={() => setIsIsoFilterMenuOpen(!isIsoFilterMenuOpen)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-center"
                        >
                            <span className="truncate">Filtrer les mesures ISO</span>
                            {isIsoFilterMenuOpen ? <ChevronDown size={16} className="ml-2" /> : <ChevronRight size={16} className="ml-2" />}
                        </button>
                        {isIsoFilterMenuOpen && (
                            <div className="absolute top-full right-0 mt-2 w-80 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-slate-200">
                                <h4 className="font-semibold text-sm mb-2 text-slate-700">Afficher les mesures ISO</h4>
                                <div className="max-h-60 overflow-y-auto pr-2">
                                    {ISO_MEASURES_DATA.map(m => (
                                        <div key={m.code} className="flex items-center space-x-2 my-1">
                                            <input
                                                type="checkbox"
                                                id={`vis-iso-${m.code}`}
                                                checked={isoMeasureVisibility[m.code] ?? false}
                                                onChange={() => handleIsoVisibilityChange(m.code)}
                                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            />
                                            <label htmlFor={`vis-iso-${m.code}`} className="text-sm text-slate-600 pr-2 cursor-pointer select-none">
                                                {m.code} - {m.title}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200">
                                    <button onClick={handleSelectAllIso} className="text-xs font-medium text-blue-600 hover:underline">Tout cocher</button>
                                    <button onClick={handleDeselectAllIso} className="text-xs font-medium text-blue-600 hover:underline">Tout décocher</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div ref={tooltipRef} className="d3-tooltip"></div>
            <div ref={containerRef} className="flex-grow w-full h-full bg-white rounded-lg border border-slate-200 d3-graph overflow-hidden cursor-move">
                <svg ref={svgRef} width="100%" height="100%"></svg>
            </div>
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

export default D3GraphView;
