import React, { useRef, useEffect } from 'react';
import { select, scaleTime, extent, scaleLinear, max, axisBottom, timeMonth, timeFormat, axisLeft, formatLocale, format, area, curveMonotoneX, easeLinear, schemeTableau10, schemePastel1, schemeBlues } from 'd3';

type ColorPalette = 'vibrant' | 'professional' | 'pastel' | 'monochromatic';

const palettes: Record<ColorPalette, readonly string[]> = {
    vibrant: schemeTableau10,
    professional: ['#1976d2', '#42a5f5', '#90caf9', '#e3f2fd'],
    pastel: schemePastel1,
    monochromatic: schemeBlues[5],
};


interface AreaChartProps {
  data: { date: Date; value: number }[];
  config: { measure: string };
  colorPalette: ColorPalette;
}

const AreaChart: React.FC<AreaChartProps> = ({ data, config, colorPalette }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const isCurrency = config.measure.toLowerCase().includes('budget');
  const areaColor = palettes[colorPalette][0];
  const lineColor = palettes[colorPalette][1] || areaColor;

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
      const yAxis = axisLeft(yScale).tickFormat(d => isCurrency ? formatLocale({decimal: ",", thousands: " ", grouping: [3], currency: ["", "€"]}).format("~s")(d as number) + "€" : format("~s")(d as number));

      g.append('g').call(yAxis).selectAll('.domain').remove();
      g.append('g').attr('transform', `translate(0, ${innerHeight})`).call(xAxis).select('.domain').remove();
      
      g.selectAll('.tick line').attr('stroke', '#e2e8f0');

      const areaGenerator = area<{ date: Date; value: number }>()
        .x(d => xScale(d.date))
        .y0(innerHeight)
        .y1(d => yScale(d.value))
        .curve(curveMonotoneX);

      g.append('path')
        .datum(data)
        .attr('fill', areaColor)
        .attr('fill-opacity', 0.3)
        .attr('d', areaGenerator)
        .attr('opacity', 0)
        .transition()
        .duration(800)
        .attr('opacity', 1);

      const lineGenerator = areaGenerator.lineY1();

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', lineColor)
        .attr('stroke-width', 2.5)
        .attr('d', lineGenerator)
        .call(path => path.attr("stroke-dasharray", path.node()!.getTotalLength() + " " + path.node()!.getTotalLength())
          .attr("stroke-dashoffset", path.node()!.getTotalLength())
          .transition()
          .duration(1000)
          .ease(easeLinear)
          .attr("stroke-dashoffset", 0)
        );

      const bisectDate = (mx: number) => {
        if (data.length === 0) return null;
        const date = xScale.invert(mx);
        const index = data.findIndex(d => d.date > date);
        if (index === -1) return data[data.length - 1]; // After last point
        if (index === 0) return data[0]; // Before first point
        const a = data[index - 1];
        const b = data[index];
        return date.getTime() - a.date.getTime() > b.date.getTime() - date.getTime() ? b : a;
      };

      const focus = g.append('g').style('display', 'none');
      focus.append('circle').attr('r', 5).attr('fill', lineColor).attr('stroke', 'white').attr('stroke-width', 2);

      svg.append('rect')
          .attr('transform', `translate(${margin.left},${margin.top})`)
          .attr('class', 'overlay')
          .attr('width', innerWidth)
          .attr('height', innerHeight)
          .attr('fill', 'none')
          .attr('pointer-events', 'all')
          .on('mouseover', () => { focus.style('display', null); tooltip.style('opacity', .9); })
          .on('mouseout', () => { focus.style('display', 'none'); tooltip.style('opacity', 0); })
          .on('mousemove', (event) => {
              const pointer = [event.offsetX - margin.left, event.offsetY - margin.top];
              const d = bisectDate(pointer[0]);
              if (d) {
                  focus.attr('transform', `translate(${xScale(d.date)},${yScale(d.value)})`);
                  tooltip.html(`<strong>${d.date.toLocaleString('fr-FR', {month: 'long', year: 'numeric'})}</strong><br/>Valeur: ${isCurrency ? d.value.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}) : d.value.toLocaleString('fr-FR')}`)
                         .style('left', `${event.pageX + 15}px`)
                         .style('top', `${event.pageY - 28}px`);
              }
          });
    };

    const resizeObserver = new ResizeObserver(drawChart);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [data, config, isCurrency, areaColor, lineColor]);

  return (
    <div className="w-full h-full relative" ref={containerRef}>
        {data.length < 2 && (
             <div className="flex items-center justify-center h-full text-slate-500">
                <p>Données insuffisantes pour un graphique en aires (2 points minimum requis).</p>
            </div>
        )}
      <svg ref={svgRef} className="w-full h-full"></svg>
      <div ref={tooltipRef} className="d3-tooltip"></div>
    </div>
  );
};

export default AreaChart;
