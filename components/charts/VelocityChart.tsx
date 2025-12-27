import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { VelocityDataPoint } from '../../utils/velocityTracking';

interface VelocityChartProps {
  data: VelocityDataPoint[];
  width?: number;
  height?: number;
  showCumulative?: boolean;
}

/**
 * Composant de graphique de vélocité
 * Affiche la vélocité par période avec option cumulative
 */
export function VelocityChart({
  data,
  width = 800,
  height = 400,
  showCumulative = false,
}: VelocityChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Nettoyer le SVG
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 80, bottom: 80, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Échelles
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.period))
      .range([0, innerWidth])
      .padding(0.2);

    const maxValue = showCumulative
      ? Math.max(...data.map(d => Math.max(d.cumulativePlanned, d.cumulativeCompleted)))
      : Math.max(...data.map(d => Math.max(d.plannedWork, d.completedWork)));

    const yScale = d3.scaleLinear()
      .domain([0, maxValue * 1.1])
      .range([innerHeight, 0]);

    // Axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale).ticks(6);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '11px');

    g.append('g')
      .call(yAxis);

    // Labels des axes
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + margin.bottom - 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Période');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -margin.left + 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text(showCumulative ? 'Travail cumulé (jours)' : 'Travail (jours)');

    if (showCumulative) {
      // Ligne cumulative planifiée
      const plannedLine = d3.line<VelocityDataPoint>()
        .x(d => (xScale(d.period) || 0) + xScale.bandwidth() / 2)
        .y(d => yScale(d.cumulativePlanned));

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('d', plannedLine);

      // Ligne cumulative complétée
      const completedLine = d3.line<VelocityDataPoint>()
        .x(d => (xScale(d.period) || 0) + xScale.bandwidth() / 2)
        .y(d => yScale(d.cumulativeCompleted));

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 3)
        .attr('d', completedLine);

      // Points sur les lignes
      g.selectAll('.dot-planned')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot-planned')
        .attr('cx', d => (xScale(d.period) || 0) + xScale.bandwidth() / 2)
        .attr('cy', d => yScale(d.cumulativePlanned))
        .attr('r', 4)
        .attr('fill', '#94a3b8');

      g.selectAll('.dot-completed')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot-completed')
        .attr('cx', d => (xScale(d.period) || 0) + xScale.bandwidth() / 2)
        .attr('cy', d => yScale(d.cumulativeCompleted))
        .attr('r', 4)
        .attr('fill', '#3b82f6');
    } else {
      // Barres pour travail planifié (gris clair, en arrière-plan)
      g.selectAll('.bar-planned')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar-planned')
        .attr('x', d => xScale(d.period) || 0)
        .attr('y', d => yScale(d.plannedWork))
        .attr('width', xScale.bandwidth())
        .attr('height', d => innerHeight - yScale(d.plannedWork))
        .attr('fill', '#e2e8f0')
        .attr('opacity', 0.7);

      // Barres pour vélocité (travail complété) - bleu, au premier plan
      g.selectAll('.bar-velocity')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar-velocity')
        .attr('x', d => xScale(d.period) || 0)
        .attr('y', d => yScale(d.velocity))
        .attr('width', xScale.bandwidth())
        .attr('height', d => innerHeight - yScale(d.velocity))
        .attr('fill', '#3b82f6');

      // Ligne de vélocité moyenne
      const avgVelocity = data.reduce((sum, d) => sum + d.velocity, 0) / data.length;
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', yScale(avgVelocity))
        .attr('y2', yScale(avgVelocity))
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');

      // Label pour la moyenne
      g.append('text')
        .attr('x', innerWidth + 5)
        .attr('y', yScale(avgVelocity) + 5)
        .style('font-size', '11px')
        .style('fill', '#ef4444')
        .text(`Moy: ${avgVelocity.toFixed(1)}`);
    }

    // Légende
    const legend = g.append('g')
      .attr('transform', `translate(${innerWidth - 150}, 10)`);

    if (showCumulative) {
      // Légende pour mode cumulatif
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
        .style('font-size', '11px')
        .text('Planifié');

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
        .style('font-size', '11px')
        .text('Complété');
    } else {
      // Légende pour mode période
      legend.append('rect')
        .attr('x', 0)
        .attr('y', -5)
        .attr('width', 20)
        .attr('height', 10)
        .attr('fill', '#e2e8f0');

      legend.append('text')
        .attr('x', 25)
        .attr('y', 5)
        .style('font-size', '11px')
        .text('Planifié');

      legend.append('rect')
        .attr('x', 0)
        .attr('y', 15)
        .attr('width', 20)
        .attr('height', 10)
        .attr('fill', '#3b82f6');

      legend.append('text')
        .attr('x', 25)
        .attr('y', 25)
        .style('font-size', '11px')
        .text('Vélocité');

      legend.append('line')
        .attr('x1', 0)
        .attr('x2', 20)
        .attr('y1', 40)
        .attr('y2', 40)
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');

      legend.append('text')
        .attr('x', 25)
        .attr('y', 45)
        .style('font-size', '11px')
        .text('Moyenne');
    }

  }, [data, width, height, showCumulative]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg">
        <p className="text-slate-500">Aucune donnée de vélocité disponible</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg">
      <svg ref={svgRef}></svg>
    </div>
  );
}

export default VelocityChart;
