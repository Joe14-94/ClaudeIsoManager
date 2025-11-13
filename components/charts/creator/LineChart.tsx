import React, { useRef, useEffect } from 'react';
// FIX: Replace monolithic d3 import with specific named imports to resolve type errors.
import { select, scaleTime, extent, scaleLinear, max, axisBottom, timeMonth, timeFormat, axisLeft, formatLocale, format, line, curveMonotoneX, easeLinear, schemeTableau10, schemePastel1, schemeBlues } from 'd3';

type ColorPalette = 'vibrant' | 'professional' | 'pastel' | 'monochromatic';

const palettes: Record<ColorPalette, readonly string[]> = {
    vibrant: schemeTableau10,
    professional: ['#1976d2', '#42a5f5', '#90caf9', '#e3f2fd'],
    pastel: schemePastel1,
    monochromatic: schemeBlues[5],
};


interface LineChartProps {
  data: { date: Date; value: number }[];
  config: { measure: string };
  colorPalette: ColorPalette;
}

const LineChart: React.FC<LineChartProps> = ({ data, config, colorPalette }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const isCurrency = config.measure.toLowerCase().includes('budget');
  const lineColor = palettes[colorPalette][0];
  const dotColor = palettes[colorPalette][1] || lineColor;


  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !tooltipRef.current || data.length < 2) return;

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

      const xScale = scaleTime()
        .domain(extent(data, d => d.date) as [Date, Date])
        .range([0, innerWidth]);

      const yScale = scaleLinear()
        .domain([0, max(data, d => d.value) || 0])
        .nice()
        .range([innerHeight, 0]);

      const xAxis = axisBottom(xScale).ticks(timeMonth.every(innerWidth > 600 ? 1 : 2)).tickFormat(timeFormat("%b %y"));
      // FIX: The locale definition for d3.formatLocale was missing the `currency` property.
      const yAxis = axisLeft(yScale).tickFormat(d => isCurrency ? formatLocale({decimal: ",", thousands: " ", grouping: [3], currency: ["", "€"]}).format("~s")(d as number) + "€" : format("~s")(d as number));

      g.append('g').call(yAxis).selectAll('.domain').remove();
      g.append('g').attr('transform', `translate(0, ${innerHeight})`).call(xAxis).select('.domain').remove();
      
      const lineGenerator = line<{ date: Date; value: number }>()
        .x(d => xScale(d.date))
        .y(d => yScale(d.value))
        .curve(curveMonotoneX);

      const path = g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', lineColor)
        .attr('stroke-width', 2.5)
        .attr('d', lineGenerator);
        
      const pathLength = path.node()?.getTotalLength() || 0;
      path.attr("stroke-dasharray", pathLength + " " + pathLength)
          .attr("stroke-dashoffset", pathLength)
          .transition()
          .duration(1000)
          .ease(easeLinear)
          .attr("stroke-dashoffset", 0);

      g.selectAll('.dot')
        .data(data)
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('cx', d => xScale(d.date))
        .attr('cy', d => yScale(d.value))
        .attr('r', 5)
        .attr('fill', dotColor)
        .attr('stroke', 'white')
        .style('stroke-width', '2px')
        .on('mouseover', (event, d) => {
          tooltip.style('opacity', 0.9)
                 .html(`<strong>${d.date.toLocaleString('fr-FR', {month: 'long', year: 'numeric'})}</strong><br/>Valeur: ${isCurrency ? d.value.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}) : d.value.toLocaleString('fr-FR')}`)
                 .style('left', `${event.pageX + 15}px`)
                 .style('top', `${event.pageY - 28}px`);
          select(event.currentTarget).attr('r', 7);
        })
        .on('mouseout', (event) => {
          tooltip.style('opacity', 0);
          select(event.currentTarget).attr('r', 5);
        });
    };

    const resizeObserver = new ResizeObserver(drawChart);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [data, config, isCurrency, lineColor, dotColor]);

  return (
    <div className="w-full h-full relative" ref={containerRef}>
        {data.length < 2 && (
             <div className="flex items-center justify-center h-full text-slate-500">
                <p>Données insuffisantes pour un graphique en ligne (2 points minimum requis).</p>
            </div>
        )}
      <svg ref={svgRef} className="w-full h-full"></svg>
      <div ref={tooltipRef} className="d3-tooltip"></div>
    </div>
  );
};

export default LineChart;
