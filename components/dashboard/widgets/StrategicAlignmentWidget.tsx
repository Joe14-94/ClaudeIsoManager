import React, { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { useData } from '../../../contexts/DataContext';
import { CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Objective, Chantier, Project } from '../../../types';

const formatCurrency = (value: number) => {
    if (isNaN(value)) return 'N/A';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', notation: 'compact', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

const StrategicAlignmentWidget: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const { activities, orientations, objectives, chantiers, projects } = useData();

  const alignmentData = useMemo(() => {
    const totalBudget = projects.reduce((acc, p) => acc + (p.budgetApproved || 0), 0);
    const totalWorkload = projects.reduce((acc, p) => acc + (p.internalWorkloadEngaged || 0) + (p.externalWorkloadEngaged || 0), 0);
    const averageDailyRate = totalWorkload > 0 ? totalBudget / totalWorkload : 0;

    const data: { [key: string]: { label: string, workload: number, budget: number } } = {};
    const orientationMap = new Map<string, { label: string }>(orientations.map(o => [o.id, { label: `${o.code} - ${o.label}` }]));
    const objectiveMap = new Map<string, Objective>(objectives.map(o => [o.id, o]));
    const chantierMap = new Map<string, Chantier>(chantiers.map(c => [c.id, c]));

    activities.forEach(activity => {
      if (activity.workloadInPersonDays && activity.workloadInPersonDays > 0) {
        const allOrientationIds = new Set<string>();
        if (activity.strategicOrientations) {
            activity.strategicOrientations.forEach(soId => allOrientationIds.add(soId));
        }
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
        });
      }
    });
    
    Object.values(data).forEach(d => {
        d.budget = d.workload * averageDailyRate;
    });

    return Object.values(data).sort((a, b) => b.workload - a.workload);
  }, [activities, orientations, objectives, chantiers, projects]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !tooltipRef.current || alignmentData.length === 0) {
      if (svgRef.current) d3.select(svgRef.current).selectAll('*').remove();
      return;
    }

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);

    const keys = ['workload', 'budget'];
    const colorPalette = ['#7dd3fc', '#a78bfa']; // Sky-300, Purple-400
    const color = d3.scaleOrdinal<string>().domain(keys).range(colorPalette);

    const drawChart = () => {
      svg.selectAll('*').remove();
      const { width, height } = container.getBoundingClientRect();
      svg.attr('width', width).attr('height', height);

      const margin = { top: 40, right: 30, bottom: 40, left: 220 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      if (innerWidth <= 0 || innerHeight <= 0) return;

      const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

      const yScale = d3.scaleBand()
        .domain(alignmentData.map(d => d.label))
        .range([0, innerHeight])
        .paddingInner(0.3); 
        
      const barPadding = 0.1;
      const barHeight = (yScale.bandwidth() * (1 - barPadding)) / 2;

      const xScaleWorkload = d3.scaleLinear()
        .domain([0, d3.max(alignmentData, d => d.workload) || 1])
        .range([0, innerWidth]).nice();

      const xScaleBudget = d3.scaleLinear()
        .domain([0, d3.max(alignmentData, d => d.budget) || 1])
        .range([0, innerWidth]).nice();

      // Axes
      g.append('g').call(d3.axisLeft(yScale).tickSize(0)).call(g => g.select(".domain").remove()).selectAll("text").attr('class', 'text-sm fill-slate-600');
      g.append('g').attr('transform', `translate(0, ${innerHeight})`).call(d3.axisBottom(xScaleWorkload).ticks(5)).call(g => g.select(".domain").attr('stroke', '#cbd5e1')).selectAll('.tick text').attr('class', 'text-xs fill-slate-500');
      g.append('g').call(d3.axisTop(xScaleBudget).ticks(5).tickFormat(d => d3.format("~s")(d)!.replace('G', 'B'))).call(g => g.select(".domain").attr('stroke', '#cbd5e1')).selectAll('.tick text').attr('class', 'text-xs fill-slate-500');

      // Axis Labels
      svg.append('text').attr('x', margin.left + innerWidth / 2).attr('y', height - 5).attr('text-anchor', 'middle').attr('class', 'text-xs fill-slate-500 font-medium').text('Charge de travail (J/H)');
      svg.append('text').attr('x', margin.left + innerWidth / 2).attr('y', 15).attr('text-anchor', 'middle').attr('class', 'text-xs fill-slate-500 font-medium').text('Budget Estimé (€)');
      
      const onMouseOver = function(event: MouseEvent, d: any) {
        d3.selectAll('.bar-group rect').style('opacity', 0.5);
        d3.select((this as SVGRectElement).parentNode).selectAll('rect').style('opacity', 1);
        tooltip.style('opacity', 1)
               .html(`<strong>${d.label}</strong><br/>
                      <span style="color:${color('workload')}">■</span> Charge: ${d.workload.toFixed(1)} J/H<br/>
                      <span style="color:${color('budget')}">■</span> Budget: ${formatCurrency(d.budget)}`);
      };

      const onMouseMove = function(event: MouseEvent) {
          tooltip.style('left', (event.pageX + 15) + 'px')
                 .style('top', (event.pageY - 15) + 'px');
      };
      
      const onMouseOut = function() {
          d3.selectAll('.bar-group rect').style('opacity', 1);
          tooltip.style('opacity', 0);
      };

      // Grouped bars
      const barGroups = g.selectAll('.bar-group').data(alignmentData).enter().append('g').attr('class', 'bar-group').attr('transform', d => `translate(0, ${yScale(d.label)})`);
      
      barGroups.append('rect').attr('y', 0).attr('height', barHeight).attr('fill', color('workload')).attr('rx', 2).attr('x', 0).attr('width', 0)
        .on('mouseover', onMouseOver).on('mousemove', onMouseMove).on('mouseout', onMouseOut)
        .transition().duration(700).ease(d3.easeCubicOut).attr('width', d => Math.max(0, xScaleWorkload(d.workload))).delay((d, i) => i * 40);

      barGroups.append('rect').attr('y', barHeight + yScale.bandwidth() * barPadding).attr('height', barHeight).attr('fill', color('budget')).attr('rx', 2).attr('x', 0).attr('width', 0)
        .on('mouseover', onMouseOver).on('mousemove', onMouseMove).on('mouseout', onMouseOut)
        .transition().duration(700).ease(d3.easeCubicOut).attr('width', d => Math.max(0, xScaleBudget(d.budget))).delay((d, i) => i * 40);

      // Legend
      const legend = g.append('g').attr('font-family', 'sans-serif').attr('font-size', 10).attr('text-anchor', 'start');
      const legendItem = legend.selectAll('.legend-item').data(keys).join('g').attr('class', 'legend-item').attr('transform', (d, i) => `translate(${i * 140}, ${innerHeight + margin.bottom - 20})`);
      legendItem.append('rect').attr('x', -margin.left + 20).attr('y', -5).attr('width', 10).attr('height', 10).attr('fill', color);
      legendItem.append('text').attr('x', -margin.left + 35).attr('y', 0).attr('dy', '0.32em').text(d => d === 'workload' ? 'Charge (J/H)' : 'Budget Estimé (€)').attr('class', 'text-xs fill-slate-600');
    };

    const resizeObserver = new ResizeObserver(drawChart);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [alignmentData, projects]);

  return (
    <div className="h-full w-full flex flex-col">
      <CardHeader className="non-draggable">
        <CardTitle>Alignement Activités par Orientation</CardTitle>
        <p className="text-sm text-slate-500 mt-1">Comparaison de la charge (J/H) et du budget estimé (€) par orientation.</p>
      </CardHeader>
      <CardContent className="flex-grow min-h-0" ref={containerRef}>
        {alignmentData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            Aucune donnée d'activité avec charge de travail pour afficher le graphique.
          </div>
        ) : (
          <>
            <svg ref={svgRef} className="w-full h-full"></svg>
            <div ref={tooltipRef} className="d3-tooltip" style={{ position: 'fixed' }}></div>
          </>
        )}
      </CardContent>
    </div>
  );
};

export default StrategicAlignmentWidget;