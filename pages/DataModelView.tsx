import React, { useEffect } from 'react';
import { ReactFlow, Background, Controls, Node, Edge, MarkerType, Handle, Position, useNodesState, useEdgesState } from '@xyflow/react';

const ENTITY_NODE_TYPE = 'entityNode';

const nodeDefaults = {
  style: {
    padding: 0,
    border: 'none',
    width: 280,
    background: 'transparent',
  },
};

const EntityNode = ({ data }: { data: { name: string, color: string, attributes: { name: string, type: string }[] } }) => {
  const handleStyle = { background: '#94a3b8', width: '8px', height: '8px', border: '1px solid white' };
  
  return (
    <div className="bg-white border-2 rounded-md font-sans shadow-md" style={{ borderColor: data.color }}>
        <Handle type="source" position={Position.Top} id="top" style={handleStyle} />
        <Handle type="target" position={Position.Top} id="top" style={handleStyle} />
        <Handle type="source" position={Position.Right} id="right" style={handleStyle} />
        <Handle type="target" position={Position.Right} id="right" style={handleStyle} />
        <Handle type="source" position={Position.Bottom} id="bottom" style={handleStyle} />
        <Handle type="target" position={Position.Bottom} id="bottom" style={handleStyle} />
        <Handle type="source" position={Position.Left} id="left" style={handleStyle} />
        <Handle type="target" position={Position.Left} id="left" style={handleStyle} />

        <div className="p-2 font-bold text-lg text-white rounded-t-sm" style={{ backgroundColor: data.color }}>
            {data.name}
        </div>
        <div className="p-3 space-y-1 text-xs">
            {data.attributes.map(attr => (
            <div key={attr.name} className="flex justify-between items-center border-b border-slate-100 py-1 last:border-b-0">
                <span className="text-slate-600 font-medium">{attr.name}</span>
                <span className="font-mono text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded-sm">{attr.type}</span>
            </div>
            ))}
        </div>
    </div>
  );
};

const nodeTypes = {
  [ENTITY_NODE_TYPE]: EntityNode,
};

const dataModelEntities = {
  Activity: {
    color: '#ca8a04', // yellow-600
    attributes: [
      { name: 'id', type: 'string' },
      { name: 'activityId', type: 'string' },
      { name: 'title', type: 'string' },
      { name: 'status', type: 'ActivityStatus' },
      { name: 'priority', type: 'Priority' },
      { name: 'isoMeasures', type: 'string[]' },
      { name: 'objectives', type: 'string[]' },
      { name: 'owner', type: 'string?' },
      { name: 'functionalProcessId', type: 'string' },
    ],
  },
  Project: {
    color: '#10b981', // emerald-500
    attributes: [
      { name: 'id', type: 'string' },
      { name: 'projectId', type: 'string' },
      { name: 'title', type: 'string' },
      { name: 'status', type: 'ActivityStatus' },
      { name: 'initiativeId', type: 'string' },
      { name: 'isoMeasures', type: 'string[]' },
      { name: 'projectManagerMOA', type: 'string?' },
      { name: 'projectManagerMOE', type: 'string?' },
    ],
  },
  Objective: {
    color: '#16a34a', // green-600
    attributes: [
      { name: 'id', type: 'string' },
      { name: 'code', type: 'string' },
      { name: 'label', type: 'string' },
      { name: 'chantierId', type: 'string' },
      { name: 'strategicOrientations', type: 'string[]' },
      { name: 'mesures_iso', type: 'IsoLink[]' },
    ],
  },
  StrategicOrientation: {
    color: '#9333ea', // purple-600
    attributes: [
      { name: 'id', type: 'string' },
      { name: 'code', type: 'string' },
      { name: 'label', type: 'string' },
    ],
  },
  Chantier: {
    color: '#2563eb', // blue-600
    attributes: [
      { name: 'id', type: 'string' },
      { name: 'code', type: 'string' },
      { name: 'label', type: 'string' },
      { name: 'strategicOrientationId', type: 'string' },
    ],
  },
  Initiative: {
    color: '#f97316', // orange-500
    attributes: [
      { name: 'id', type: 'string' },
      { name: 'code', type: 'string' },
      { name: 'label', type: 'string' },
      { name: 'isoMeasureIds', type: 'string[]' },
    ],
  },
  IsoMeasure: {
    color: '#dc2626', // red-600
    attributes: [
      { name: 'id', type: 'string' },
      { name: 'code', type: 'string' },
      { name: 'title', type: 'string' },
      { name: 'chapter', type: 'IsoChapter' },
    ],
  },
  Resource: {
    color: '#0891b2', // cyan-600
    attributes: [
      { name: 'id', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'entity', type: 'string' },
    ],
  },
  SecurityProcess: {
    color: '#db2777', // pink-600
    attributes: [
      { name: 'id', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'description', type: 'string' },
    ],
  },
};

const initialNodes: Node[] = [
  { id: 'Resource', type: ENTITY_NODE_TYPE, position: { x: 0, y: 200 }, data: { name: 'Resource', ...dataModelEntities.Resource }, ...nodeDefaults },
  { id: 'SecurityProcess', type: ENTITY_NODE_TYPE, position: { x: 0, y: 500 }, data: { name: 'SecurityProcess', ...dataModelEntities.SecurityProcess }, ...nodeDefaults },
  { id: 'Activity', type: ENTITY_NODE_TYPE, position: { x: 400, y: 100 }, data: { name: 'Activity', ...dataModelEntities.Activity }, ...nodeDefaults },
  { id: 'Project', type: ENTITY_NODE_TYPE, position: { x: 400, y: 400 }, data: { name: 'Project', ...dataModelEntities.Project }, ...nodeDefaults },
  { id: 'IsoMeasure', type: ENTITY_NODE_TYPE, position: { x: 800, y: -100 }, data: { name: 'IsoMeasure', ...dataModelEntities.IsoMeasure }, ...nodeDefaults },
  { id: 'Objective', type: ENTITY_NODE_TYPE, position: { x: 800, y: 200 }, data: { name: 'Objective', ...dataModelEntities.Objective }, ...nodeDefaults },
  { id: 'Initiative', type: ENTITY_NODE_TYPE, position: { x: 800, y: 500 }, data: { name: 'Initiative', ...dataModelEntities.Initiative }, ...nodeDefaults },
  { id: 'Chantier', type: ENTITY_NODE_TYPE, position: { x: 1200, y: 100 }, data: { name: 'Chantier', ...dataModelEntities.Chantier }, ...nodeDefaults },
  { id: 'StrategicOrientation', type: ENTITY_NODE_TYPE, position: { x: 1200, y: 400 }, data: { name: 'StrategicOrientation', ...dataModelEntities.StrategicOrientation }, ...nodeDefaults },
];

const edgeDefaults = {
    type: 'smoothstep',
    labelStyle: { fill: '#334155', fontWeight: 600 },
    labelBgStyle: { fill: 'rgba(248, 250, 252, 0.8)' },
    labelBgPadding: [6, 8] as [number, number],
    labelBgBorderRadius: 4,
};

const nmMarker = { type: MarkerType.ArrowClosed };
const n1Marker = { type: MarkerType.ArrowClosed };


const initialEdges: Edge[] = [
  // Activity Edges
  { id: 'e-activity-iso', source: 'Activity', target: 'IsoMeasure', label: 'isoMeasures [n-m]', ...edgeDefaults, className: 'nm-edge', markerEnd: nmMarker },
  { id: 'e-activity-resource', source: 'Activity', target: 'Resource', label: 'owner [n-1]', ...edgeDefaults, className: 'n1-edge', markerEnd: n1Marker },
  { id: 'e-activity-process', source: 'Activity', target: 'SecurityProcess', label: 'functionalProcessId [n-1]', ...edgeDefaults, className: 'n1-edge', markerEnd: n1Marker },
  { id: 'e-activity-objective', source: 'Activity', target: 'Objective', label: 'objectives [n-m]', ...edgeDefaults, className: 'nm-edge', markerEnd: nmMarker },
  { id: 'e-activity-orientation', source: 'Activity', target: 'StrategicOrientation', label: 'strategicOrientations [n-m]', ...edgeDefaults, className: 'nm-edge', markerEnd: nmMarker },
  
  // Project Edges
  { id: 'e-project-initiative', source: 'Project', target: 'Initiative', label: 'initiativeId [n-1]', ...edgeDefaults, className: 'n1-edge', markerEnd: n1Marker },
  { id: 'e-project-iso', source: 'Project', target: 'IsoMeasure', label: 'isoMeasures [n-m]', ...edgeDefaults, className: 'nm-edge', markerEnd: nmMarker },
  { id: 'e-project-resource-moa', source: 'Project', target: 'Resource', label: 'managerMOA [n-1]', ...edgeDefaults, className: 'n1-edge', markerEnd: n1Marker },
  { id: 'e-project-resource-moe', source: 'Project', target: 'Resource', label: 'managerMOE [n-1]', ...edgeDefaults, className: 'n1-edge', markerEnd: n1Marker },

  // Initiative Edges
  { id: 'e-initiative-iso', source: 'Initiative', target: 'IsoMeasure', label: 'isoMeasureIds [n-m]', ...edgeDefaults, className: 'nm-edge', markerEnd: nmMarker },

  // Other Edges
  { id: 'e-objective-orientation', source: 'Objective', target: 'StrategicOrientation', label: 'strategicOrientations [n-m]', ...edgeDefaults, className: 'nm-edge', markerEnd: nmMarker },
  { id: 'e-chantier-orientation', source: 'Chantier', target: 'StrategicOrientation', label: 'strategicOrientationId [n-1]', ...edgeDefaults, className: 'n1-edge', markerEnd: n1Marker },
  { id: 'e-objective-iso', source: 'Objective', target: 'IsoMeasure', label: 'mesures_iso [n-m]', ...edgeDefaults, className: 'nm-edge', markerEnd: nmMarker },
  {
    id: 'e-objective-chantier',
    source: 'Objective',
    target: 'Chantier',
    label: 'chantierId [n-1]',
    ...edgeDefaults,
    className: 'n1-edge',
    markerEnd: n1Marker,
  },
];

const getOptimalHandles = (sourceNode: Node, targetNode: Node) => {
    const sourcePos = (sourceNode as any).positionAbsolute || sourceNode.position;
    const targetPos = (targetNode as any).positionAbsolute || targetNode.position;

    if (!sourceNode.width || !sourceNode.height || !targetNode.width || !targetNode.height) {
        return { sourceHandle: null, targetHandle: null };
    }

    const sourceCenter = { x: sourcePos.x + sourceNode.width / 2, y: sourcePos.y + sourceNode.height / 2 };
    const targetCenter = { x: targetPos.x + targetNode.width / 2, y: targetPos.y + targetNode.height / 2 };

    const dx = targetCenter.x - sourceCenter.x;
    const dy = targetCenter.y - sourceCenter.y;
    
    if (Math.abs(dy) * sourceNode.width > Math.abs(dx) * sourceNode.height) {
        if (dy > 0) {
            return { sourceHandle: 'bottom', targetHandle: 'top' };
        } else {
            return { sourceHandle: 'top', targetHandle: 'bottom' };
        }
    } else {
        if (dx > 0) {
            return { sourceHandle: 'right', targetHandle: 'left' };
        } else {
            return { sourceHandle: 'left', targetHandle: 'right' };
        }
    }
};


const DataModelView: React.FC = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    
    useEffect(() => {
        const nodeMap = new Map(nodes.map((node) => [node.id, node]));

        if (nodes.some((node) => !node.width || !node.height)) {
            return;
        }

        setEdges((currentEdges) => {
            const edgeGroups = new Map<string, string[]>();
            currentEdges.forEach(edge => {
                const key = [edge.source, edge.target].sort().join('--');
                if (!edgeGroups.has(key)) {
                    edgeGroups.set(key, []);
                }
                edgeGroups.get(key)!.push(edge.id);
            });

            return currentEdges.map((edge) => {
                const sourceNode = nodeMap.get(edge.source);
                const targetNode = nodeMap.get(edge.target);

                if (!sourceNode || !targetNode) {
                    return edge;
                }
                
                const { sourceHandle, targetHandle } = getOptimalHandles(sourceNode, targetNode);

                const key = [edge.source, edge.target].sort().join('--');
                const group = edgeGroups.get(key) || [];
                let offset = 0;

                if (group.length > 1) {
                    group.sort((a, b) => a.localeCompare(b));
                    const groupSize = group.length;
                    const edgeIndex = group.indexOf(edge.id);
                    if (edgeIndex !== -1) {
                         const spacing = 30;
                         offset = (edgeIndex - (groupSize - 1) / 2) * spacing;
                    }
                }
                
                return {
                    ...edge,
                    sourceHandle,
                    targetHandle,
                    pathOptions: { 
                        offset,
                        borderRadius: 15,
                    }
                };
            });
        });
    }, [nodes, setEdges]);

    return (
        <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col">
            <h1 className="text-3xl font-bold text-slate-800">Modèle de données</h1>
            <p className="text-slate-600">
                Visualisation des objets principaux de l'application, de leurs attributs et de leurs relations.
            </p>
            <div className="flex-grow rounded-lg border border-slate-200 bg-slate-50">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    proOptions={{ hideAttribution: true }}
                    elevateEdgesOnSelect={true}
                >
                    <Background />
                    <Controls />
                </ReactFlow>
            </div>
        </div>
    );
};

export default DataModelView;