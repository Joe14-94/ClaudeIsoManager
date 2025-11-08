import React, { useEffect, useRef, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

const dataModelEntities = {
  Activity: { 
    color: '#ca8a04', 
    attributes: [
        { name: 'id', type: 'string' }, { name: 'activityId', type: 'string' }, { name: 'title', type: 'string' }, { name: 'status', type: 'ActivityStatus' }, { name: 'priority', type: 'Priority' }, { name: 'isoMeasures', type: 'string[]', isKey: true }, { name: 'objectives', type: 'string[]', isKey: true }, { name: 'owner', type: 'string?', isKey: true }, { name: 'functionalProcessId', type: 'string', isKey: true }, { name: 'strategicOrientations', type: 'string[]', isKey: true }
    ] 
  },
  Project: { 
    color: '#10b981', 
    attributes: [
        { name: 'id', type: 'string' }, { name: 'projectId', type: 'string' }, { name: 'title', type: 'string' }, { name: 'status', type: 'ActivityStatus' }, { name: 'initiativeId', type: 'string', isKey: true }, { name: 'isoMeasures', type: 'string[]', isKey: true }, { name: 'projectManagerMOA', type: 'string?', isKey: true }, { name: 'projectManagerMOE', type: 'string?', isKey: true }
    ] 
  },
  Objective: { 
    color: '#16a34a', 
    attributes: [
        { name: 'id', type: 'string' }, { name: 'code', type: 'string' }, { name: 'label', type: 'string' }, { name: 'chantierId', type: 'string', isKey: true }, { name: 'strategicOrientations', type: 'string[]', isKey: true }, { name: 'mesures_iso', type: 'IsoLink[]', isKey: true }
    ] 
  },
  StrategicOrientation: { 
    color: '#9333ea', 
    attributes: [
        { name: 'id', type: 'string' }, { name: 'code', type: 'string' }, { name: 'label', type: 'string' }
    ] 
  },
  Chantier: { 
    color: '#2563eb', 
    attributes: [
        { name: 'id', type: 'string' }, { name: 'code', type: 'string' }, { name: 'label', type: 'string' }, { name: 'strategicOrientationId', type: 'string', isKey: true }
    ] 
  },
  Initiative: { 
    color: '#f97316', 
    attributes: [
        { name: 'id', type: 'string' }, { name: 'code', type: 'string' }, { name: 'label', type: 'string' }, { name: 'isoMeasureIds', type: 'string[]', isKey: true }
    ] 
  },
  IsoMeasure: { 
    color: '#dc2626', 
    attributes: [
        { name: 'id', type: 'string' }, { name: 'code', type: 'string' }, { name: 'title', type: 'string' }, { name: 'chapter', type: 'IsoChapter' }
    ] 
  },
  Resource: { 
    color: '#0891b2', 
    attributes: [
        { name: 'id', type: 'string' }, { name: 'name', type: 'string' }, { name: 'entity', type: 'string' }
    ] 
  },
  SecurityProcess: { 
    color: '#db2777', 
    attributes: [
        { name: 'id', type: 'string' }, { name: 'name', type: 'string' }, { name: 'description', type: 'string' }
    ] 
  },
};

const initialLinksData = [
  { source: 'Activity', target: 'IsoMeasure', label: '[n-m]' }, { source: 'Activity', target: 'Resource', label: '[n-1]' }, { source: 'Activity', target: 'SecurityProcess', label: '[n-1]' }, { source: 'Activity', target: 'Objective', label: '[n-m]' }, { source: 'Activity', target: 'StrategicOrientation', label: '[n-m]' },
  { source: 'Project', target: 'Initiative', label: '[n-1]' }, { source: 'Project', target: 'IsoMeasure', label: '[n-m]' }, { source: 'Project', target: 'Resource', label: 'managerMOA [n-1]' }, { source: 'Project', target: 'Resource', label: 'managerMOE [n-1]' },
  { source: 'Initiative', target: 'IsoMeasure', label: '[n-m]' }, { source: 'Objective', target: 'StrategicOrientation', label: '[n-m]' }, { source: 'Chantier', target: 'StrategicOrientation', label: '[n-1]' }, { source: 'Objective', target: 'IsoMeasure', label: '[n-m]' }, { source: 'Objective', target: 'Chantier', label: '[n-1]' },
];

const NODE_WIDTH = 240;
const NODE_HEADER_HEIGHT = 40;
const NODE_ATTR_HEIGHT = 28;

const DataModelView2: React.FC = () => {
    const svgRef = useRef<SVGSVGElement>(null);
    const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

    const { nodes, links } = useMemo(() => {
        const nodes = Object.entries(dataModelEntities).map(([name, data]) => {
            const height = NODE_HEADER_HEIGHT + data.attributes.length * NODE_ATTR_HEIGHT;
            return { id: name, width: NODE_WIDTH, height, ...data };
        });
        return { nodes, links: initialLinksData };
    }, []);

    const handleZoomIn = () => {
        if (!svgRef.current || !zoomRef.current) return;
        d3.select(svgRef.current).transition().call(zoomRef.current.scaleBy, 1.2);
    };

    const handleZoomOut = () => {
        if (!svgRef.current || !zoomRef.current) return;
        d3.select(svgRef.current).transition().call(zoomRef.current.scaleBy, 0.8);
    };

    const handleResetZoom = () => {
        if (!svgRef.current || !zoomRef.current) return;
        const svg = d3.select(svgRef.current);
        const parent = svg.node()!.parentElement!;
        const { clientWidth: width, clientHeight: height } = parent;
        const initialTransform = d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8);
        svg.transition().call(zoomRef.current.transform, initialTransform);
    };

    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        const parent = svg.node()!.parentElement!;
        const width = parent.clientWidth;
        const height = parent.clientHeight;

        const g = svg.selectAll('g.main-group').data([null]).join('g').attr('class', 'main-group');
        
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.2, 3])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        zoomRef.current = zoom;
        svg.call(zoom);
        
        const initialTransform = d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8);
        svg.call(zoom.transform, initialTransform);
        
        const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
            .force('link', d3.forceLink(links).id((d: any) => d.id).distance(400).strength(0.6))
            .force('charge', d3.forceManyBody().strength(-2500))
            .force('collide', d3.forceCollide().radius(200))
            .force('center', d3.forceCenter(0, 0));

        const linkGroup = g.selectAll('.links').data([null]).join('g').attr('class', 'links');
        const nodeGroup = g.selectAll('.nodes').data([null]).join('g').attr('class', 'nodes');
        
        const link = linkGroup.selectAll('.link-group').data(links, (d:any) => `${d.source.id}-${d.target.id}-${d.label}`).join('g').attr('class', 'link-group');
        const linkPath = link.append('path').attr('stroke', '#94a3b8').attr('stroke-width', 1.5).attr('fill', 'none');
        const linkLabel = link.append('text').attr('dy', -4).attr('font-size', '9px').attr('fill', '#4b5563').append('textPath').attr('startOffset', '50%').attr('text-anchor', 'middle').text(d => d.label);
        
        linkPath.attr('id', (d, i) => `link-path-${i}`);
        linkLabel.attr('xlink:href', (d, i) => `#link-path-${i}`);

        const node = nodeGroup.selectAll('g.node-element').data(nodes, (d:any) => d.id).join('g').attr('class', 'node-element')
            .call(d3.drag<any, any>()
                .on('start', (event) => { if (!event.active) simulation.alphaTarget(0.3).restart(); event.subject.fx = event.subject.x; event.subject.fy = event.subject.y; })
                .on('drag', (event) => { event.subject.fx = event.x; event.subject.fy = event.y; })
                .on('end', (event) => { if (!event.active) simulation.alphaTarget(0); event.subject.fx = null; event.subject.fy = null; })
            );

        node.append('rect')
            .attr('width', d => d.width)
            .attr('height', d => d.height)
            .attr('rx', 6)
            .attr('fill', 'white')
            .attr('stroke', d => d.color)
            .attr('stroke-width', 2)
            .attr('class', 'shadow-md');

        node.append('rect')
            .attr('width', d => d.width)
            .attr('height', NODE_HEADER_HEIGHT - 4)
            .attr('rx', 4)
            .attr('ry', 4)
            .attr('fill', d => d.color);

        node.append('text')
            .attr('x', 10)
            .attr('y', 24)
            .text((d: any) => d.id)
            .attr('font-weight', 'bold')
            .attr('font-size', '0.9rem')
            .attr('fill', 'white');

        const attributeGroups = node.selectAll('.attribute')
            .data(d => d.attributes.map(attr => ({ ...attr, parent: d })))
            .join('g')
            .attr('class', 'attribute')
            .attr('transform', (d, i) => `translate(8, ${NODE_HEADER_HEIGHT + 10 + i * NODE_ATTR_HEIGHT})`);

        attributeGroups.append('text').text(d => d.name).attr('font-size', '0.75rem').attr('fill', '#4b5563');
        
        attributeGroups.append('text')
            .text(d => d.isKey ? '🔑' : '')
            .attr('x', d => (d.parent as any).width - 68)
            .attr('font-size', '0.75rem');

        attributeGroups.append('text').text(d => d.type).attr('x', d => (d.parent as any).width - 16).attr('text-anchor', 'end').attr('font-family', 'monospace').attr('font-size', '0.7rem').attr('fill', '#1e293b');

        const linkGroups = new Map<string, any[]>();
        links.forEach(l => {
            const key = [(l.source as any).id, (l.target as any).id].sort().join('--');
            if (!linkGroups.has(key)) linkGroups.set(key, []);
            linkGroups.get(key)!.push(l);
        });

        linkGroups.forEach(group => { group.forEach((l, i) => { l.groupIndex = i; l.groupSize = group.length; }); });

        const getIntersectionPoint = (source: any, target: any) => {
          const s = { x: source.x, y: source.y, w: source.width, h: source.height };
          const t = { x: target.x, y: target.y, w: target.width, h: target.height };

          const dx = t.x - s.x;
          const dy = t.y - s.y;
          
          if (dx === 0 && dy === 0) return { p1: s, p2: t };

          const tan = Math.abs(dy / dx);
          const tan_s = s.h / s.w;
          const tan_t = t.h / t.w;

          let p1, p2;
          if (tan < tan_s) p1 = { x: s.x + Math.sign(dx) * s.w / 2, y: s.y + Math.sign(dx) * s.w/2 * dy/dx };
          else p1 = { x: s.x + Math.sign(dy) * s.h/2 * dx/dy, y: s.y + Math.sign(dy) * s.h / 2 };
          if (tan < tan_t) p2 = { x: t.x - Math.sign(dx) * t.w / 2, y: t.y - Math.sign(dx) * t.w/2 * dy/dx };
          else p2 = { x: t.x - Math.sign(dy) * t.h/2 * dx/dy, y: t.y - Math.sign(dy) * t.h / 2 };

          return { p1, p2 };
        };

        simulation.on('tick', () => {
            node.attr('transform', d => `translate(${d.x - d.width/2}, ${d.y - d.height/2})`);
            linkPath.attr('d', d => {
                const { p1, p2 } = getIntersectionPoint(d.source, d.target);
                const midX = (p1.x + p2.x) / 2, midY = (p1.y + p2.y) / 2;
                const dx = p2.x - p1.x, dy = p2.y - p1.y;
                const norm = Math.sqrt(dx * dx + dy * dy);
                if (norm === 0) return `M ${p1.x} ${p1.y}`;
                const spacing = 30;
                const offset = (d.groupIndex - (d.groupSize - 1) / 2) * spacing;
                const controlX = midX - offset * (dy / norm), controlY = midY + offset * (dx / norm);
                return `M ${p1.x} ${p1.y} Q ${controlX} ${controlY} ${p2.x} ${p2.y}`;
            });
        });
        return () => simulation.stop();
    }, [nodes, links]);

    return (
        <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col">
            <h1 className="text-3xl font-bold text-slate-800">Modèle de données 2 (D3.js)</h1>
            <p className="text-slate-600">
                Visualisation dynamique avec positionnement optimisé des liens et gestion des superpositions. Déplacez les objets pour voir les liens s'adapter.
            </p>
            <div className="flex-grow rounded-lg border border-slate-200 bg-slate-50 overflow-hidden relative">
                <svg ref={svgRef} width="100%" height="100%"></svg>
                 <div className="absolute top-3 right-3 flex flex-col gap-1.5 bg-white p-1.5 border rounded-lg shadow-sm">
                    <button onClick={handleZoomIn} className="p-2 text-slate-600 hover:bg-slate-100 rounded-md" aria-label="Zoomer"><ZoomIn size={18} /></button>
                    <button onClick={handleZoomOut} className="p-2 text-slate-600 hover:bg-slate-100 rounded-md" aria-label="Dézoomer"><ZoomOut size={18} /></button>
                    <button onClick={handleResetZoom} className="p-2 text-slate-600 hover:bg-slate-100 rounded-md" aria-label="Réinitialiser le zoom"><RotateCw size={18} /></button>
                </div>
            </div>
        </div>
    );
};

export default DataModelView2;