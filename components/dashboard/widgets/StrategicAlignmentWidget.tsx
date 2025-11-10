import React, { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { useData } from '../../../contexts/DataContext';
import { CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Objective, Chantier } from '../../../types';

const formatCurrency = (value?: number) => {
    if (value === undefined || value === null || isNaN(value)) return 'N/A';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', notation: 'compact' }).format(value);
};

const StrategicAlignmentWidget: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { activities, orientations, objectives, chantiers, projects } = useData();

  const alignmentData = useMemo(() => {
    const data: { [key: string]: { label: string, workload: number, budget: number } } = {};
    const orientationMap = new Map<string, { label: string }>(orientations.map(o => [o.id, { label: `${o.code} - ${o.label}` }]));
    const objectiveMap = new Map<string, Objective>(objectives.map(o => [o.id, o]));
    const chantierMap = new Map<string, Chantier>(chantiers.map(c => [c.id, c]));

    const totalBudget = projects.reduce((sum, p) => sum + (p.budgetApproved || 0), 0);
    const totalWorkloadAllProjects = projects.reduce((sum, p) => sum + (p.internalWorkloadEngaged || 0) + (p.externalWorkloadEngaged || 0), 0);
    const costPerDay = totalWorkloadAllProjects > 0 ? totalBudget / totalWorkloadAllProjects : 750;

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
            data[orientationId] = { label: orientationDetails.label, workload: 0, budget: 0 };
          }
          data[orientationId].workload += activity.workloadInPersonDays!;
          data[orientationId].budget += activity.workloadInPersonDays! * costPerDay;
        });
      }
    });

    return Object.values(data).sort((a, b) => b.workload - a.workload);
  }, [activities, orientations, objectives, chantiers, projects]);

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

      const margin = { top: 50, right: 30, bottom: 50, left: 220 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      if (innerWidth <= 0 || innerHeight <= 0) return;

      const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

      const maxWorkload = d3.max(alignmentData, d => d.workload) || 0;
      const maxBudget = d3.max(alignmentData, d => d.budget) || 0;
      
      const xScaleWorkload = d3.scaleLinear().domain([0, maxWorkload]).range([0, innerWidth]).nice();
      const xScaleBudget = d3.scaleLinear().domain([0, maxBudget]).range([0, innerWidth]).nice();
      
      const yScale0 = d3.scaleBand()
        .domain(alignmentData.map(d => d.label))
        .range([0, innerHeight])
        .padding(0.3);

      const yScale1 = d3.scaleBand()
        .domain(['workload', 'budget'])
        .range([0, yScale0.bandwidth()])
        .padding(0.1);

      const xAxisWorkload = g.append('g').attr('transform', `translate(0, ${innerHeight})`).call(d3.axisBottom(xScaleWorkload).ticks(Math.min(5, innerWidth / 80)));
      const xAxisBudget = g.append('g').call(d3.axisTop(xScaleBudget).ticks(Math.min(5, innerWidth / 80)).tickFormat(d3.format("~s")));
      const yAxis = g.append('g').call(d3.axisLeft(yScale0).tickSize(0));
      
      [xAxisWorkload, xAxisBudget, yAxis].forEach(axis => axis.select(".domain").remove());
      xAxisWorkload.selectAll("line").remove();
      xAxisBudget.selectAll("line").remove();
      yAxis.selectAll("text").attr('class', 'text-sm fill-slate-600');

      svg.append('text').attr('x', margin.left + innerWidth / 2).attr('y', height - 10).attr('text-anchor', 'middle').attr('class', 'text-xs fill-slate-500 font-medium').text('Charge (J/H)');
      svg.append('text').attr('x', margin.left + innerWidth / 2).attr('y', 20).attr('text-anchor', 'middle').attr('class', 'text-xs fill-slate-500 font-medium').text('Budget Estimé (€)');

      g.append('g').attr('class', 'grid').call(d3.axisBottom(xScaleWorkload).ticks(5).tickSize(innerHeight)).selectAll('.tick line').attr('stroke', '#e2e8f0').attr('stroke-dasharray', '2,2');
      g.selectAll('.grid .domain, .grid .tick text').remove();

      const orientationGroup = g.selectAll('.orientation-group').data(alignmentData).enter().append('g').attr('transform', d => `translate(0, ${yScale0(d.label)!})`);

      const bars = orientationGroup.selectAll('rect')
        .data(d => [{key: 'workload', value: d.workload, label: d.label}, {key: 'budget', value: d.budget, label: d.label}])
        .enter().append('rect')
        .attr('x', 0).attr('y', d => yScale1(d.key)!)
        .attr('height', yScale1.bandwidth())
        .attr('fill', d => d.key === 'workload' ? '#7dd3fc' : '#818cf8')
        .attr('width', 0);
        
      bars.transition().duration(800).ease(d3.easeCubicOut).attr('width', d => d.key === 'workload' ? xScaleWorkload(d.value) : xScaleBudget(d.value));

      bars.on('mouseover', function(event, d) {
            d3.select(this).style('opacity', 0.85);
            const fullData = alignmentData.find(item => item.label === d.label);
            tooltip.style('opacity', 1).html(`<strong>${d.label}</strong><br/>Charge: ${fullData?.workload.toFixed(1)} J/H<br/>Budget Estimé: ${formatCurrency(fullData?.budget)}`);
        })
        .on('mousemove', (event) => {
            const tooltipNode = tooltip.node();
            if (!tooltipNode) return;

            const tooltipWidth = tooltipNode.offsetWidth;
            const tooltipHeight = tooltipNode.offsetHeight;
            const { clientX, clientY } = event;
            const margin = 15;
            const horizontalOffset = 25;
            const verticalOffset = 75; // Increased offset to move tooltip higher

            // Calculate desired position (up and left of cursor)
            let x = clientX - tooltipWidth - horizontalOffset;
            let y = clientY - tooltipHeight - verticalOffset;

            // Adjust for viewport boundaries without flipping
            if (x < margin) {
                x = margin;
            }
            if (y < margin) {
                y = margin;
            }
            if (x + tooltipWidth > window.innerWidth - margin) {
                x = window.innerWidth - tooltipWidth - margin;
            }
            if (y + tooltipHeight > window.innerHeight - margin) {
                y = window.innerHeight - tooltipHeight - margin;
            }

            tooltip.style('left', `${x}px`).style('top', `${y}px`);
        })
        .on('mouseout', function() {
            d3.select(this).style('opacity', 1);
            tooltip.style('opacity', 0);
        });

      const legend = svg.append('g').attr('transform', `translate(${margin.left}, 0)`);
      const legendItems = [{ key: 'workload', label: 'Charge (J/H)', color: '#7dd3fc' }, { key: 'budget', label: 'Budget Estimé (€)', color: '#818cf8' }];
      const legendItem = legend.selectAll('.legend-item').data(legendItems).enter().append('g').attr('transform', (d, i) => `translate(${i * 160}, 0)`);
      legendItem.append('rect').attr('width', 12).attr('height', 12).attr('fill', d => d.color).attr('rx', 2);
      legendItem.append('text').attr('x', 16).attr('y', 10).text(d => d.label).attr('class', 'text-xs fill-slate-600');
    };

    const resizeObserver = new ResizeObserver(drawChart);
    resizeObserver.observe(container);
    
    return () => resizeObserver.disconnect();
  }, [alignmentData]);

  return (
    <div className="h-full w-full flex flex-col">
      <CardHeader className="non-draggable">
        <CardTitle>Alignement des activités par orientation</CardTitle>
        <p className="text-sm text-slate-500 mt-1">Charge (J/H) et budget (€) des activités par orientation.</p>
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