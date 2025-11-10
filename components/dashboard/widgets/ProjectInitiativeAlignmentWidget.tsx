import React, { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { useData } from '../../../contexts/DataContext';
import { CardHeader, CardTitle, CardContent } from '../../ui/Card';

const ProjectInitiativeAlignmentWidget: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { projects, initiatives } = useData();

  const alignmentData = useMemo(() => {
    const data: { [key: string]: { label: string, workload: number } } = {};
    const initiativeMap: Map<string, { label: string }> = new Map(initiatives.map(i => [i.id, { label: `${i.code} - ${i.label}` }]));

    projects.forEach(project => {
      const workload = (project.internalWorkloadEngaged || 0) + (project.externalWorkloadEngaged || 0);
      if (workload > 0 && project.initiativeId) {
        const initiativeDetails = initiativeMap.get(project.initiativeId);
        if (!initiativeDetails) return;

        if (!data[project.initiativeId]) {
          data[project.initiativeId] = { 
            label: initiativeDetails.label, 
            workload: 0,
          };
        }
        data[project.initiativeId].workload += workload;
      }
    });

    return Object.values(data).sort((a, b) => b.workload - a.workload);
  }, [projects, initiatives]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || alignmentData.length === 0) {
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll('*').remove();
      }
      return;
    }

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    const tooltip = d3.select('body').selectAll('.d3-tooltip').data([null]).join('div').attr('class', 'd3-tooltip');

    const colorPalette = ['#7dd3fc', '#818cf8', '#a78bfa', '#f472b6', '#fb923c', '#4ade80'];
    const colorScale = d3.scaleOrdinal(colorPalette).domain(alignmentData.map(d => d.label));

    const drawChart = () => {
      svg.selectAll('*').remove();
      const { width, height } = container.getBoundingClientRect();
      svg.attr('width', width).attr('height', height);

      const margin = { top: 20, right: 30, bottom: 40, left: 180 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      if (innerWidth <= 0 || innerHeight <= 0) return;

      const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

      const yScale = d3.scaleBand()
        .domain(alignmentData.map(d => d.label))
        .range([0, innerHeight])
        .padding(0.6);

      const xScale = d3.scaleLinear()
        .domain([0, d3.max(alignmentData, d => d.workload) || 0])
        .range([0, innerWidth])
        .nice();

      const yAxis = g.append('g')
        .call(d3.axisLeft(yScale).tickSize(0));
      yAxis.select(".domain").remove();
      yAxis.selectAll("text").attr('class', 'text-sm fill-slate-600');

      g.append('g')
        .attr('class', 'grid')
        .call(d3.axisTop(xScale)
            .ticks(Math.min(5, innerWidth/80))
            .tickSize(-innerHeight)
            .tickFormat(() => "")
        )
        .call(g => g.select('.domain').remove())
        .selectAll('.tick line')
        .attr('stroke', '#e2e8f0')
        .attr('stroke-dasharray', '2,2');

      const bars = g.selectAll('.bar')
        .data(alignmentData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('y', d => yScale(d.label)!)
        .attr('height', yScale.bandwidth())
        .attr('fill', d => colorScale(d.label))
        .attr('rx', 3)
        .attr('x', 0)
        .attr('width', 0)
        .on('mouseover', function(event, d) {
            d3.select(this).style('opacity', 0.85);
            tooltip.style('opacity', 1)
                   .html(`<strong>${d.label}</strong><br/>${d.workload.toFixed(1)} J/H`);
        })
        .on('mousemove', (event) => {
            const tooltipNode = tooltip.node();
            if (!tooltipNode) return;

            const tooltipWidth = tooltipNode.offsetWidth;
            const tooltipHeight = tooltipNode.offsetHeight;
            const { clientX, clientY } = event;
            const margin = 15;
            const horizontalOffset = 25;
            const verticalOffset = 75;

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
      
      bars.transition()
          .duration(700)
          .ease(d3.easeCubicOut)
          .attr('width', d => Math.max(0, xScale(d.workload)))
          .delay((d, i) => i * 40);
          
      const xAxis = g.append('g')
        .attr('transform', `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(xScale).ticks(Math.min(5, innerWidth/80)));
      
      xAxis.select(".domain").remove();
      xAxis.selectAll("line").remove();
      xAxis.selectAll('.tick text').attr('class', 'text-xs fill-slate-500');

      svg.append('text')
          .attr('x', margin.left + innerWidth / 2)
          .attr('y', height - 5)
          .attr('text-anchor', 'middle')
          .attr('class', 'text-xs fill-slate-500 font-medium')
          .text('Charge de travail (J/H)');
    };

    const resizeObserver = new ResizeObserver(drawChart);
    resizeObserver.observe(container);
    
    return () => resizeObserver.disconnect();
  }, [alignmentData]);


  return (
    <div className="h-full w-full flex flex-col">
      <CardHeader className="non-draggable">
        <CardTitle>Alignement des projets par initiative</CardTitle>
        <p className="text-sm text-slate-500 mt-1">Charge de travail (J/H) des projets par initiative.</p>
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