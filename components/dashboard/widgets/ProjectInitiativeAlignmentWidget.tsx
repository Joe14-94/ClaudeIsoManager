
import React, { useRef, useEffect, useMemo } from 'react';
import { select, scaleBand, max, scaleLinear, axisLeft, axisBottom, axisTop, format, easeCubicOut } from 'd3';
import { useData } from '../../../contexts/DataContext';
import { CardHeader, CardTitle, CardContent } from '../../ui/Card';

const formatCurrency = (value?: number) => {
    if (value === undefined || value === null || isNaN(value)) return 'N/A';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

const ProjectInitiativeAlignmentWidget: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { projects, initiatives } = useData();

  const alignmentData: { code: string, fullLabel: string, workload: number, budget: number }[] = useMemo(() => {
    const data: { [key: string]: { code: string, fullLabel: string, workload: number, budget: number } } = {};
    const initiativeMap = new Map<string, { code: string; fullLabel: string; }>(initiatives.map(i => [i.id, { code: i.code, fullLabel: `${i.code} - ${i.label}` }]));

    projects.forEach(project => {
      const workload = (project.internalWorkloadEngaged || 0) + (project.externalWorkloadEngaged || 0);
      const budget = project.completedPV || 0;

      if ((workload > 0 || budget > 0) && project.initiativeId) {
        const initiativeDetails = initiativeMap.get(project.initiativeId);
        if (!initiativeDetails) return;

        if (!data[project.initiativeId]) {
          data[project.initiativeId] = { 
            code: initiativeDetails.code,
            fullLabel: initiativeDetails.fullLabel, 
            workload: 0,
            budget: 0
          };
        }
        data[project.initiativeId].workload += workload;
        data[project.initiativeId].budget += budget;
      }
    });

    return Object.values(data).sort((a, b) => b.workload - a.workload);
  }, [projects, initiatives]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || alignmentData.length === 0) {
      if (svgRef.current) {
        select(svgRef.current).selectAll('*').remove();
      }
      return;
    }

    const container = containerRef.current;
    const svg = select(svgRef.current);
    // Clean up existing tooltips to prevent duplicates
    select('body').selectAll('.d3-tooltip').remove();
    const tooltip = select('body').append('div').attr('class', 'd3-tooltip').style('opacity', 0);
    
    const workloadColor = '#7dd3fc'; // sky-300
    const budgetColor = '#c4b5fd'; // violet-300

    const drawChart = () => {
      svg.selectAll('*').remove();
      const { width, height } = container.getBoundingClientRect();
      svg.attr('width', width).attr('height', height);

      let maxLabelWidth = 0;
      const tempSvg = select(container).append('svg').attr('class', 'temp-svg').style('position', 'absolute').style('visibility', 'hidden').style('pointer-events', 'none');
      alignmentData.forEach(d => {
          const textNode = tempSvg.append('text').attr('class', 'text-sm fill-slate-600').text(d.code).node();
          if (textNode) {
              maxLabelWidth = Math.max(maxLabelWidth, textNode.getComputedTextLength());
          }
      });
      tempSvg.remove();

      const margin = { top: 40, right: 30, bottom: 50, left: Math.min(maxLabelWidth + 15, width / 2.5) };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      if (innerWidth <= 0 || innerHeight <= 0) return;

      const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

      const yScale = scaleBand()
        .domain(alignmentData.map(d => d.code))
        .range([0, innerHeight])
        .padding(0.4);
      
      const maxWorkload = max(alignmentData, d => d.workload) || 0;
      const xScaleWorkload = scaleLinear().domain([0, maxWorkload]).range([0, innerWidth]).nice();

      const maxBudget = max(alignmentData, d => d.budget) || 0;
      const xScaleBudget = scaleLinear().domain([0, maxBudget]).range([0, innerWidth]).nice();

      const yAxis = g.append('g').call(axisLeft(yScale).tickSize(0));
      yAxis.select(".domain").remove();
      yAxis.selectAll("text").attr('class', 'text-sm fill-slate-600');

      g.append('g').attr('class', 'grid').call(axisBottom(xScaleWorkload).ticks(Math.min(5, innerWidth / 80)).tickSize(innerHeight)).selectAll('.tick line').attr('stroke', '#e2e8f0').attr('stroke-dasharray', '2,2');
      g.selectAll('.grid .domain, .grid .tick text').remove();

      // Workload bars
      g.selectAll('.bar-workload')
        .data(alignmentData)
        .enter().append('rect')
        .attr('class', 'bar-workload')
        .attr('y', d => yScale((d as any).code)! )
        .attr('height', yScale.bandwidth() / 2)
        .attr('fill', workloadColor)
        .attr('rx', 3)
        .attr('x', 0)
        .attr('width', 0)
        .on('mouseover', function(event, d) {
            select(this).style('opacity', 0.85);
            tooltip.style('opacity', 1)
                   .html(`<strong>${(d as any).fullLabel}</strong><br/>Charge: ${(d as any).workload.toFixed(1)} J/H`);
        })
        .on('mousemove', (event) => {
            const tooltipNode = tooltip.node() as HTMLDivElement;
            if (!tooltipNode) return;
            const { offsetWidth: tooltipWidth, offsetHeight: tooltipHeight } = tooltipNode;
            const { pageX, pageY } = event;
            const offset = 15;
            let x = pageX + offset; let y = pageY + offset;
            if (x + tooltipWidth > window.innerWidth) x = pageX - tooltipWidth - offset;
            if (y + tooltipHeight > window.innerHeight) y = pageY - tooltipHeight - offset;
            tooltip.style('left', `${x}px`).style('top', `${y}px`);
        })
        .on('mouseout', function() {
            select(this).style('opacity', 1);
            tooltip.style('opacity', 0);
        })
        .transition()
        .duration(700)
        .ease(easeCubicOut)
        .attr('width', d => Math.max(0, xScaleWorkload((d as any).workload)))
        .delay((d, i) => i * 40);

      // Budget bars
      g.selectAll('.bar-budget')
        .data(alignmentData)
        .enter().append('rect')
        .attr('class', 'bar-budget')
        .attr('y', d => yScale((d as any).code)! + yScale.bandwidth() / 2)
        .attr('height', yScale.bandwidth() / 2)
        .attr('fill', budgetColor)
        .attr('rx', 3)
        .attr('x', 0)
        .attr('width', 0)
        .on('mouseover', function(event, d) {
            select(this).style('opacity', 0.85);
            tooltip.style('opacity', 1)
                   .html(`<strong>${(d as any).fullLabel}</strong><br/>Budget consommé: ${formatCurrency((d as any).budget)}`);
        })
        .on('mousemove', (event) => {
            const tooltipNode = tooltip.node() as HTMLDivElement;
            if (!tooltipNode) return;
            const { offsetWidth: tooltipWidth, offsetHeight: tooltipHeight } = tooltipNode;
            const { pageX, pageY } = event;
            const offset = 15;
            let x = pageX + offset; let y = pageY + offset;
            if (x + tooltipWidth > window.innerWidth) x = pageX - tooltipWidth - offset;
            if (y + tooltipHeight > window.innerHeight) y = pageY - tooltipHeight - offset;
            tooltip.style('left', `${x}px`).style('top', `${y}px`);
        })
        .on('mouseout', function() {
            select(this).style('opacity', 1);
            tooltip.style('opacity', 0);
        })
        .transition()
        .duration(700)
        .ease(easeCubicOut)
        .attr('width', d => Math.max(0, xScaleBudget((d as any).budget)))
        .delay((d, i) => i * 40);
          
      const xAxisWorkload = g.append('g').attr('transform', `translate(0, ${innerHeight})`).call(axisBottom(xScaleWorkload).ticks(Math.min(5, innerWidth/80)));
      xAxisWorkload.select(".domain").remove();
      xAxisWorkload.selectAll("line").remove();
      xAxisWorkload.selectAll('.tick text').attr('class', 'text-xs fill-slate-500');
      
      const xAxisBudget = g.append('g').call(axisTop(xScaleBudget).ticks(Math.min(5, innerWidth/80)).tickFormat(d => format("~s")(d as number)!.replace('G', 'B')));
      xAxisBudget.select(".domain").remove();
      xAxisBudget.selectAll("line").remove();
      xAxisBudget.selectAll('.tick text').attr('class', 'text-xs fill-slate-500');

      svg.append('text').attr('x', margin.left + innerWidth / 2).attr('y', 15).attr('text-anchor', 'middle').attr('class', 'text-xs fill-slate-500 font-medium').text('Budget Consommé (€)');
      svg.append('text').attr('x', margin.left + innerWidth / 2).attr('y', height - 30).attr('text-anchor', 'middle').attr('class', 'text-xs fill-slate-500 font-medium').text('Charge de travail (J/H)');

      const legend = svg.append('g').attr('transform', `translate(${margin.left}, ${height - 15})`);
      const legendWorkload = legend.append('g');
      legendWorkload.append('rect').attr('width', 12).attr('height', 12).attr('fill', workloadColor).attr('rx', 2);
      legendWorkload.append('text').attr('x', 16).attr('y', 10).text('Charge (J/H)').attr('class', 'text-xs fill-slate-600');
      
      const legendBudget = legend.append('g').attr('transform', `translate(120, 0)`);
      legendBudget.append('rect').attr('width', 12).attr('height', 12).attr('fill', budgetColor).attr('rx', 2);
      legendBudget.append('text').attr('x', 16).attr('y', 10).text('Budget Consommé (€)').attr('class', 'text-xs fill-slate-600');
    };

    const resizeObserver = new ResizeObserver(drawChart);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [alignmentData]);

  return (
    <div className="h-full w-full flex flex-col">
      <CardHeader className="non-draggable">
        <CardTitle>Alignement Projets / Initiatives</CardTitle>
        <p className="text-sm text-slate-500 mt-1">Charges engagées et budgets consommés par initiative.</p>
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

export default ProjectInitiativeAlignmentWidget;
