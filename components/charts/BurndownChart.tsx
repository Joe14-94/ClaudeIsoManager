import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { Project, ProjectTask } from '../../types';

interface BurndownDataPoint {
  date: Date;
  ideal: number;
  actual: number;
  remaining: number;
}

interface BurndownChartProps {
  project: Project;
  mode?: 'burndown' | 'burnup';
  width?: number;
  height?: number;
}

/**
 * Calcule les points de données pour le burndown/burnup chart
 */
function calculateBurndownData(project: Project, mode: 'burndown' | 'burnup'): BurndownDataPoint[] {
  if (!project.projectStartDate || !project.projectEndDate || !project.tasks) {
    return [];
  }

  const startDate = new Date(project.projectStartDate);
  const endDate = new Date(project.projectEndDate);
  const today = new Date();

  // Calculer le travail total (en jours ou points)
  const totalWork = project.tasks.reduce((sum, task) => {
    // Utiliser la durée de la tâche comme travail
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    const duration = (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24);
    return sum + duration;
  }, 0);

  // Générer les points de données jour par jour
  const data: BurndownDataPoint[] = [];
  const currentDate = new Date(startDate);
  const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

  let dayIndex = 0;
  while (currentDate <= (today < endDate ? today : endDate)) {
    const daysPassed = dayIndex;

    // Ligne idéale (linéaire)
    const idealProgress = (daysPassed / totalDays) * totalWork;
    const idealRemaining = totalWork - idealProgress;

    // Travail réel complété
    const actualCompleted = project.tasks.reduce((sum, task) => {
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.endDate);
      const taskDuration = (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24);

      // Si la tâche est commencée
      if (currentDate >= taskStart) {
        // Calculer le progrès basé sur le pourcentage d'avancement
        const taskProgress = (task.progress || 0) / 100;
        return sum + (taskDuration * taskProgress);
      }
      return sum;
    }, 0);

    const actualRemaining = totalWork - actualCompleted;

    data.push({
      date: new Date(currentDate),
      ideal: mode === 'burndown' ? idealRemaining : idealProgress,
      actual: mode === 'burndown' ? actualRemaining : actualCompleted,
      remaining: actualRemaining,
    });

    currentDate.setDate(currentDate.getDate() + 1);
    dayIndex++;
  }

  // Ajouter le point final si on n'a pas encore atteint la fin
  if (today < endDate) {
    data.push({
      date: new Date(endDate),
      ideal: mode === 'burndown' ? 0 : totalWork,
      actual: mode === 'burndown' ? data[data.length - 1].actual : data[data.length - 1].actual,
      remaining: data[data.length - 1].remaining,
    });
  }

  return data;
}

/**
 * Composant Burndown/Burnup Chart
 */
export function BurndownChart({ project, mode = 'burndown', width = 600, height = 400 }: BurndownChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const data = useMemo(() => calculateBurndownData(project, mode), [project, mode]);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Nettoyer le SVG
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Échelles
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([0, innerWidth]);

    const maxY = d3.max(data, d => Math.max(d.ideal, d.actual)) || 100;
    const yScale = d3.scaleLinear()
      .domain([0, maxY * 1.1])
      .range([innerHeight, 0]);

    // Axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(6)
      .tickFormat(d3.timeFormat('%d/%m') as any);

    const yAxis = d3.axisLeft(yScale)
      .ticks(5);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    g.append('g')
      .call(yAxis);

    // Labels des axes
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + margin.bottom - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Date');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -margin.left + 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text(mode === 'burndown' ? 'Travail restant (jours)' : 'Travail complété (jours)');

    // Ligne idéale
    const idealLine = d3.line<BurndownDataPoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.ideal));

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('d', idealLine);

    // Ligne réelle
    const actualLine = d3.line<BurndownDataPoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.actual));

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 3)
      .attr('d', actualLine);

    // Points sur la ligne réelle
    g.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => yScale(d.actual))
      .attr('r', 3)
      .attr('fill', '#3b82f6');

    // Légende
    const legend = g.append('g')
      .attr('transform', `translate(${innerWidth - 120}, 10)`);

    legend.append('line')
      .attr('x1', 0)
      .attr('x2', 30)
      .attr('y1', 0)
      .attr('y2', 0)
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5');

    legend.append('text')
      .attr('x', 35)
      .attr('y', 5)
      .style('font-size', '12px')
      .text('Idéal');

    legend.append('line')
      .attr('x1', 0)
      .attr('x2', 30)
      .attr('y1', 20)
      .attr('y2', 20)
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 3);

    legend.append('text')
      .attr('x', 35)
      .attr('y', 25)
      .style('font-size', '12px')
      .text('Réel');

  }, [data, width, height]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg">
        <p className="text-slate-500">Aucune donnée disponible pour ce projet</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        {mode === 'burndown' ? 'Burndown Chart' : 'Burnup Chart'}
      </h3>
      <svg ref={svgRef}></svg>
    </div>
  );
}

export default BurndownChart;
