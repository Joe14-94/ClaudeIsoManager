import React from 'react';
import { ReactFlow, Background, Controls, Node, Edge, MarkerType, Handle, Position, useNodesState, useEdgesState } from '@xyflow/react';

const ENTITY_NODE_TYPE = 'entityNode';

const nodeDefaults = {
  style: {
    padding: 0,
    border: 'none',
    width: 280,
    borderRadius: '0.375rem',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  },
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
};

const EntityNode = ({ data }: { data: { name: string, color: string, attributes: { name: string, type: string }[] } }) => {
  return (
    <div className="bg-white border-2 rounded-md font-sans">
      <Handle type="target" position={Position.Left} />
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
      <Handle type="source" position={Position.Right} />
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
      { name: 'description', type: 'string?' },
      { name: 'status', type: 'ActivityStatus' },
      { name: 'priority', type: 'Priority' },
      { name: 'activityType', type: 'ActivityType' },
      { name: 'isoMeasures', type: 'string[]' },
      { name: 'objectives', type: 'string[]' },
      { name: 'owner', type: 'string?' },
      { name: 'workloadInPersonDays', type: 'number?' },
      { name: 'functionalProcessId', type: 'string' },
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
  {
    id: 'Activity',
    type: ENTITY_NODE_TYPE,
    position: { x: 400, y: 300 },
    data: { name: 'Activity', ...dataModelEntities.Activity },
    ...nodeDefaults,
  },
  {
    id: 'Objective',
    type: ENTITY_NODE_TYPE,
    position: { x: 800, y: 300 },
    data: { name: 'Objective', ...dataModelEntities.Objective },
    ...nodeDefaults,
  },
  {
    id: 'Chantier',
    type: ENTITY_NODE_TYPE,
    position: { x: 1200, y: 100 },
    data: { name: 'Chantier', ...dataModelEntities.Chantier },
    ...nodeDefaults,
  },
  {
    id: 'StrategicOrientation',
    type: ENTITY_NODE_TYPE,
    position: { x: 1200, y: 500 },
    data: { name: 'StrategicOrientation', ...dataModelEntities.StrategicOrientation },
    ...nodeDefaults,
  },
  {
    id: 'IsoMeasure',
    type: ENTITY_NODE_TYPE,
    position: { x: 400, y: 0 },
    data: { name: 'IsoMeasure', ...dataModelEntities.IsoMeasure },
    ...nodeDefaults,
  },
  {
    id: 'Resource',
    type: ENTITY_NODE_TYPE,
    position: { x: 0, y: 200 },
    data: { name: 'Resource', ...dataModelEntities.Resource },
    ...nodeDefaults,
  },
  {
    id: 'SecurityProcess',
    type: ENTITY_NODE_TYPE,
    position: { x: 0, y: 400 },
    data: { name: 'SecurityProcess', ...dataModelEntities.SecurityProcess },
    ...nodeDefaults,
  },
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
  { id: 'e-activity-iso', source: 'Activity', target: 'IsoMeasure', label: 'isoMeasures [n-m]', ...edgeDefaults, className: 'nm-edge', markerEnd: nmMarker },
  { id: 'e-activity-resource', source: 'Activity', target: 'Resource', label: 'owner [n-1]', ...edgeDefaults, className: 'n1-edge', markerEnd: n1Marker },
  { id: 'e-activity-process', source: 'Activity', target: 'SecurityProcess', label: 'functionalProcessId [n-1]', ...edgeDefaults, className: 'n1-edge', markerEnd: n1Marker },
  { id: 'e-activity-objective', source: 'Activity', target: 'Objective', label: 'objectives [n-m]', ...edgeDefaults, className: 'nm-edge', markerEnd: nmMarker },
  { id: 'e-activity-orientation', source: 'Activity', target: 'StrategicOrientation', label: 'strategicOrientations [n-m]', ...edgeDefaults, className: 'nm-edge', markerEnd: nmMarker },
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


const DataModelView: React.FC = () => {
    const [nodes, , onNodesChange] = useNodesState(initialNodes);
    const [edges, , onEdgesChange] = useEdgesState(initialEdges);
    
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