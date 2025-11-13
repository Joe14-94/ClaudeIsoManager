import React, { useRef, useEffect } from 'react';
// FIX: Replace monolithic d3 import with specific named imports to resolve type errors.
import { select, scaleBand, scaleLinear, max, axisLeft, axisBottom, easeCubicOut, scaleOrdinal, schemeTableau10, schemePastel1, schemeBlues, formatLocale, format } from 'd3';

type ColorPalette = 'vibrant' | 'professional' | 'pastel' | 'monochromatic';

const palettes: Record<ColorPalette, readonly string[]> = {
    vibrant: schemeTableau10,
    professional: ['#0d47a1', '#1976d2', '#42a5f5', '#90caf9', '#e3f2fd'],
    pastel: schemePastel1,
    monochromatic: schemeBlues[5],
};


interface BarChartProps {
  data: { label: string; value: number }[];
  config: { measure: string };
  colorPalette: ColorPalette;
  onBarClick: (data: any) => void;
}

const BarChart: React.FC<BarChartProps> = ({ data, config, colorPalette, onBarClick }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  
  const isCurrency = config.measure.toLowerCase().includes('budget');
  const colorScale = scaleOrdinal(palettes[colorPalette]).domain(data.map(d => d.label));


  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !tooltipRef.current) return;

    const container = containerRef.current;
    const svg = select(svgRef.current);
    const tooltip = select(tooltipRef.current);

    const drawChart = () => {
      svg.selectAll('*').remove();
      
      const { width, height } = container.getBoundingClientRect();
      const margin = { top: 20, right: 30, bottom: 120, left: 80 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      if (innerWidth <= 0 || innerHeight <= 0) return;

      const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

      const xScale = scaleBand()
        .domain(data.map(d => d.label))
        .range([0, innerWidth])
        .padding(0.2);

      const yScale = scaleLinear()
        .domain([0, max(data, d => d.value) || 0])
        .nice()
        .range([innerHeight, 0]);

      // FIX: The locale definition for d3.formatLocale was missing the `currency` property.
      const yAxis = axisLeft(yScale).tickFormat(d => isCurrency ? formatLocale({decimal: ",", thousands: " ", grouping: [3], currency: ["", "€"]}).format("~s")(d as number) + "€" : format("~s")(d as number));
      const xAxis = axisBottom(xScale);
      
      g.append('g').call(yAxis).selectAll('.domain, .tick line').remove();

      g.append('g').attr('transform', `translate(0, ${innerHeight})`).call(xAxis)
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .attr('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em');
      
      g.selectAll('.tick line').remove();
      g.select('.domain').remove();
      
      g.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.label)!)
        .attr('y', innerHeight)
        .attr('width', xScale.bandwidth())
        .attr('height', 0)
        .attr('fill', d => colorScale(d.label))
        .attr('rx', 3)
        // FIX: Added click handler and pointer cursor for interactivity.
        .style('cursor', 'pointer')
        .on('click', (event, d) => onBarClick(d))
        .on('mouseover', (event, d) => {
          tooltip.style('opacity', 0.9)
                 .html(`<strong>${d.label}</strong><br/>Valeur: ${isCurrency ? d.value.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}) : d.value.toLocaleString('fr-FR')}`)
                 .style('left', `${event.pageX + 15}px`)
                 .style('top', `${event.pageY - 28}px`);
          select(event.currentTarget).style('opacity', 0.8);
        })
        .on('mouseout', (event) => {
          tooltip.style('opacity', 0);
          select(event.currentTarget).style('opacity', 1);
        })
        .transition()
        .duration(800)
        .ease(easeCubicOut)
        .attr('y', d => yScale(d.value))
        .attr('height', d => innerHeight - yScale(d.value));
    };

    const resizeObserver = new ResizeObserver(drawChart);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [data, config, isCurrency, colorScale, onBarClick]);

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      <svg ref={svgRef} className="w-full h-full"></svg>
      <div ref={tooltipRef} className="d3-tooltip"></div>
    </div>
  );
};

export default BarChart;
