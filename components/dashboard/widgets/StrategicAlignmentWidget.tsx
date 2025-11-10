import React, { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { useData } from '../../../contexts/DataContext';
import { CardHeader, CardTitle, CardContent } from '../../ui/Card';

const StrategicAlignmentWidget: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { activities, orientations } = useData();

  const alignmentData = useMemo(() => {
    const data: { [key: string]: { label: string, workload: number, color: string } } = {};
    // FIX: Explicitly type the Map to help TypeScript correctly infer the type of `orientationDetails`.
    const orientationMap = new Map<string, { label: string; color: string }>(orientations.map(o => [o.id, { label: `${o.code} - ${o.label}`, color: o.color || '#64748b' }]));

    activities.forEach(activity => {
      if (activity.workloadInPersonDays && activity.workloadInPersonDays > 0) {
        activity.strategicOrientations.forEach(orientationId => {
          const orientationDetails = orientationMap.get(orientationId);
          if (!orientationDetails) return;

          if (!data[orientationId]) {
            data[orientationId] = { 
              label: orientationDetails.label, 
              workload: 0, 
              color: orientationDetails.color
            };
          }
          data[orientationId].workload += activity.workloadInPersonDays;
        });
      }
    });

    return Object.values(data).sort((a, b) => b.workload - a.workload);
  }, [activities, orientations]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || alignmentData.length === 0) {
        // Clear SVG if no data
        if(svgRef.current) {
            d3.select(svgRef.current).selectAll('*').remove();
        }
        return;
    }
    
    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const drawChart = () => {
        const { width, height } = container.getBoundingClientRect();
        svg.attr('width', width).attr('height', height);

        const margin = { top: 20, right: 30, bottom: 120, left: 60 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);
        
        const xScale = d3.scaleBand()
            .domain(alignmentData.map(d => d.label))
            .range([0, innerWidth])
            .padding(0.2);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(alignmentData, d => d.workload) || 0])
            .range([innerHeight, 0])
            .nice();

        g.selectAll('.bar')
            .data(alignmentData)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => xScale(d.label)!)
            .attr('y', d => yScale(d.workload))
            .attr('width', xScale.bandwidth())
            .attr('height', d => innerHeight - yScale(d.workload))
            .attr('fill', d => d.color)
            .append('title')
            .text(d => `${d.label}: ${d.workload} J/H`);

        const xAxis = d3.axisBottom(xScale);
        g.append('g')
            .attr('transform', `translate(0, ${innerHeight})`)
            .call(xAxis)
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end');

        const yAxis = d3.axisLeft(yScale);
        g.append('g').call(yAxis);

        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left)
            .attr('x', 0 - (innerHeight / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .attr('class', 'text-xs fill-slate-500')
            .text('Charge (J/H)');
    };

    const resizeObserver = new ResizeObserver(drawChart);
    resizeObserver.observe(container);
    
    return () => resizeObserver.disconnect();

  }, [alignmentData]);


  return (
    <div className="h-full w-full flex flex-col">
      <CardHeader className="non-draggable">
        <CardTitle>Alignement stratégique de l'effort</CardTitle>
        <p className="text-sm text-slate-500 mt-1">Charge de travail (J/H) des activités par orientation stratégique.</p>
      </CardHeader>
      <CardContent className="flex-grow min-h-0" ref={containerRef}>
        {alignmentData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-500">
                Aucune donnée pour afficher le graphique.
            </div>
        ) : (
            <svg ref={svgRef}></svg>
        )}
      </CardContent>
    </div>
  );
};

export default StrategicAlignmentWidget;