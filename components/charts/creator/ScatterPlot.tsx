import React, { useRef, useEffect } from 'react';
import { select, extent, scaleLinear, scaleOrdinal, axisBottom, axisLeft, schemeTableau10, schemePastel1, schemeBlues } from 'd3';

type ColorPalette = 'vibrant' | 'professional' | 'pastel' | 'monochromatic';

const palettes: Record<ColorPalette, readonly string[]> = {
    vibrant: schemeTableau10,
    professional: ['#0d47a1', '#1976d2', '#42a5f5', '#90caf9', '#e3f2fd'],
    pastel: schemePastel1,
    monochromatic: schemeBlues[9],
};

interface ScatterPlotProps {
  data: { label: string; xValue: number; yValue: number }[];
  config: { 
    measureXLabel: string,
    measureYLabel: string,
  };
  colorPalette: ColorPalette;
}

const ScatterPlot: React.FC<ScatterPlotProps> = ({ data, config, colorPalette }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !tooltipRef.current) return;

    const container = containerRef.current;
    const svg = select(svgRef.current);
    const tooltip = select(tooltipRef.current);
    
    const drawChart = () => {
      svg.selectAll('*').remove();
      
      const { width, height } = container.getBoundingClientRect();
      const margin = { top: 20, right: 30, bottom: 60, left: 80 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      if (innerWidth <= 0 || innerHeight <= 0) return;

      const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);
      
      const xDomain = extent(data, d => d.xValue) as [number, number];
      const yDomain = extent(data, d => d.yValue) as [number, number];
      
      const xScale = scaleLinear().domain(xDomain).range([0, innerWidth]).nice();
      const yScale = scaleLinear().domain(yDomain).range([innerHeight, 0]).nice();
      
      const colorDomain = Array.from(new Set(data.map(d => d.label)));
      const colorScale = scaleOrdinal(palettes[colorPalette]).domain(colorDomain);
      
      const formatValue = (value: number) => {
          if (value > 1_000_000) return `${(value/1_000_000).toFixed(1)}M`;
          if (value > 1_000) return `${(value/1_000).toFixed(0)}k`;
          return value;
      }

      const xAxis = g.append('g').attr('transform', `translate(0, ${innerHeight})`).call(axisBottom(xScale).tickFormat(d => String(formatValue(d as number))));
      const yAxis = g.append('g').call(axisLeft(yScale).tickFormat(d => String(formatValue(d as number))));

      xAxis.select(".domain").remove();
      yAxis.select(".domain").remove();
      xAxis.selectAll("line").remove();
      yAxis.selectAll("line").remove();

      g.append('g').attr('class', 'grid').call(axisLeft(yScale).tickSize(-innerWidth).tickFormat(() => "")).selectAll('.tick line').attr('stroke', '#e2e8f0').attr('stroke-dasharray', '2,2');
      g.selectAll('.grid .domain').remove();
      
      svg.append('text').attr('x', margin.left + innerWidth / 2).attr('y', height - 10).attr('text-anchor', 'middle').attr('class', 'text-xs fill-slate-500 font-medium').text(config.measureXLabel);
      svg.append('text').attr('transform', 'rotate(-90)').attr('x', -(margin.top + innerHeight / 2)).attr('y', 20).attr('text-anchor', 'middle').attr('class', 'text-xs fill-slate-500 font-medium').text(config.measureYLabel);

      g.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.xValue))
        .attr('cy', d => yScale(d.yValue))
        .attr('r', 5)
        .attr('fill', d => colorScale(d.label))
        .attr('fill-opacity', 0.7)
        .on('mouseover', (event, d) => {
            tooltip.style('opacity', .9)
                   .html(`<strong>${d.label}</strong><br/>
                          ${config.measureXLabel}: ${d.xValue.toLocaleString('fr-FR')}<br/>
                          ${config.measureYLabel}: ${d.yValue.toLocaleString('fr-FR')}`)
                   .style('left', `${event.pageX + 15}px`)
                   .style('top', `${event.pageY - 28}px`);
            select(event.currentTarget).attr('r', 8).attr('fill-opacity', 1).attr('stroke', 'black').attr('stroke-width', 1);
        })
        .on('mouseout', (event) => {
            tooltip.style('opacity', 0);
            select(event.currentTarget).attr('r', 5).attr('fill-opacity', 0.7).attr('stroke', 'none');
        });
    };

    const resizeObserver = new ResizeObserver(drawChart);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [data, config, colorPalette]);

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      <svg ref={svgRef} className="w-full h-full"></svg>
      <div ref={tooltipRef} className="d3-tooltip"></div>
    </div>
  );
};

export default ScatterPlot;
