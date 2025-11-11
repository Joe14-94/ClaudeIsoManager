import React, { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { useData } from '../../../contexts/DataContext';
import { CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Objective, Chantier } from '../../../types';

const StrategicAlignmentWidget: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { activities, orientations, objectives, chantiers } = useData();

  const alignmentData: { code: string, fullLabel: string, workload: number }[] = useMemo(() => {
    const data: { [key: string]: { code: string, fullLabel: string, workload: number } } = {};
    // FIX: Explicitly type the Map to help TypeScript infer the correct type for its values.
    const orientationMap = new Map<string, { code: string; fullLabel: string; }>(orientations.map(o => [o.id, { code: o.code, fullLabel: `${o.code} - ${o.label}` }]));
    const objectiveMap = new Map<string, Objective>(objectives.map(o => [o.id, o]));
    const chantierMap = new Map<string, Chantier>(chantiers.map(c => [c.id, c]));

    activities.forEach(activity => {
      if (activity.workloadInPersonDays && activity.workloadInPersonDays > 0) {
        
        const allOrientationIds = new Set<string>();
        if (activity.strategicOrientations) activity.strategicOrientations.forEach(soId => allOrientationIds.add(soId));
        if (activity.objectives) {
            activity.objectives.forEach(objId => {
                const objective = objectiveMap.get(objId);
                if (objective) {
                    if (objective.strategicOrientations) objective.strategicOrientations.forEach(soId => allOrientationIds.add(soId));
                    const chantier = chantierMap.get(objective.chantierId);
                    if (chantier) allOrientationIds.add(chantier.strategicOrientationId);
                }
            });
        }
        
        allOrientationIds.forEach(orientationId => {
          const orientationDetails = orientationMap.get(orientationId);
          if (!orientationDetails) return;

          if (!data[orientationId]) {
            data[orientationId] = { code: orientationDetails.code, fullLabel: orientationDetails.fullLabel, workload: 0 };
          }
          data[orientationId].workload += activity.workloadInPersonDays!;
        });
      }
    });

    return Object.values(data).sort((a, b) => b.workload - a.workload);
  }, [activities, orientations, objectives, chantiers]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || alignmentData.length === 0) {
      if (svgRef.current) d3.select(svgRef.current).selectAll('*').remove();
      return;
    }

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    const tooltip = d3.select('body').selectAll('.d3-tooltip').data([null]).join('div').attr('class', 'd3-tooltip');

    const drawChart = () => {
      svg.selectAll('*').remove();
      const { width, height } = container.getBoundingClientRect();
      svg.attr('width', width).attr('height', height);
      
      let maxLabelWidth = 0;
      const tempSvg = d3.select(container).append('svg').attr('class', 'temp-svg').style('position', 'absolute').style('visibility', 'hidden').style('pointer-events', 'none');
      alignmentData.forEach(d => {
          const textNode = tempSvg.append('text').attr('class', 'text-sm fill-slate-600').text(d.code).node();
          if (textNode) {
              maxLabelWidth = Math.max(maxLabelWidth, textNode.getComputedTextLength());
          }
      });
      tempSvg.remove();

      const margin = { top: 30, right: 30, bottom: 50, left: Math.min(maxLabelWidth + 15, width / 2.5) };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      if (innerWidth <= 0 || innerHeight <= 0) return;

      const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

      const maxWorkload = d3.max(alignmentData, d => d.workload) || 0;
      
      const xScaleWorkload = d3.scaleLinear().domain([0, maxWorkload]).range([0, innerWidth]).nice();
      
      const yScale = d3.scaleBand()
        .domain(alignmentData.map(d => d.code))
        .range([0, innerHeight])
        .padding(0.4);

      const xAxisWorkload = g.append('g').attr('transform', `translate(0, ${innerHeight})`).call(d3.axisBottom(xScaleWorkload).ticks(Math.min(5, innerWidth / 80)));
      const yAxis = g.append('g').call(d3.axisLeft(yScale).tickSize(0));
      
      [xAxisWorkload, yAxis].forEach(axis => axis.select(".domain").remove());
      xAxisWorkload.selectAll("line").remove();
      yAxis.selectAll("text").attr('class', 'text-sm fill-slate-600');

      svg.append('text').attr('x', margin.left + innerWidth / 2).attr('y', height - 10).attr('text-anchor', 'middle').attr('class', 'text-xs fill-slate-500 font-medium').text('Charge (J/H)');

      g.append('g').attr('class', 'grid').call(d3.axisBottom(xScaleWorkload).ticks(5).tickSize(innerHeight)).selectAll('.tick line').attr('stroke', '#e2e8f0').attr('stroke-dasharray', '2,2');
      g.selectAll('.grid .domain, .grid .tick text').remove();

      const bars = g.selectAll('.bar')
        .data(alignmentData)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', 0)
        .attr('y', d => yScale((d as any).code)!)
        .attr('height', yScale.bandwidth())
        .attr('fill', '#7dd3fc')
        .attr('rx', 3)
        .attr('width', 0);
        
      bars.transition().duration(800).ease(d3.easeCubicOut).attr('width', d => xScaleWorkload((d as any).workload));

      bars.on('mouseover', function(event, d) {
            d3.select(this).style('opacity', 0.85);
            tooltip.style('opacity', 1).html(`<strong>${(d as any).fullLabel}</strong><br/>Charge: ${(d as any).workload.toFixed(1)} J/H`);
        })
        .on('mousemove', (event) => {
            const tooltipNode = tooltip.node();
            if (!tooltipNode) return;
            const { offsetWidth: tooltipWidth, offsetHeight: tooltipHeight } = tooltipNode;
            const { pageX, pageY } = event;
            const offset = 15;
            let x = pageX + offset;
            let y = pageY + offset;
            if (x + tooltipWidth > window.innerWidth) x = pageX - tooltipWidth - offset;
            if (y + tooltipHeight > window.innerHeight) y = pageY - tooltipHeight - offset;
            tooltip.style('left', `${x}px`).style('top', `${y}px`);
        })
        .on('mouseout', function() {
            d3.select(this).style('opacity', 1);
            tooltip.style('opacity', 0);
        });

      const legend = svg.append('g').attr('transform', `translate(${margin.left}, 0)`);
      const legendItem = legend.append('g');
      legendItem.append('rect').attr('width', 12).attr('height', 12).attr('fill', '#7dd3fc').attr('rx', 2);
      legendItem.append('text').attr('x', 16).attr('y', 10).text('Charge (J/H)').attr('class', 'text-xs fill-slate-600');
    };

    const resizeObserver = new ResizeObserver(drawChart);
    resizeObserver.observe(container);
    
    return () => resizeObserver.disconnect();
  }, [alignmentData]);

  return (
    <div className="h-full w-full flex flex-col">
      <CardHeader className="non-draggable">
        <CardTitle>Alignement des activités par orientation</CardTitle>
        <p className="text-sm text-slate-500 mt-1">Charge (J/H) des activités par orientation.</p>
      </CardHeader>
      <CardContent className="flex-grow min-h-0" ref={containerRef}>
        {alignmentData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-500">
                Aucune donnée pour afficher le graphique.
            </div>
        ) : (
            <svg ref={svgRef} className="w-full h-full"></svg>
        )}
      </CardContent>
    </div>
  );
};

export default StrategicAlignmentWidget;
