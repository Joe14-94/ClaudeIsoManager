
import React, { useRef, useEffect } from 'react';
import { select, hierarchy, partition, arc, scaleOrdinal, schemeTableau10, schemePastel1, schemeBlues, descending } from 'd3';

type ColorPalette = 'vibrant' | 'professional' | 'pastel' | 'monochromatic';

const palettes: Record<ColorPalette, readonly string[]> = {
    vibrant: schemeTableau10,
    professional: ['#0d47a1', '#1976d2', '#42a5f5', '#90caf9', '#e3f2fd'],
    pastel: schemePastel1,
    monochromatic: schemeBlues[9],
};

interface SunburstChartProps {
  data: { name: string; children?: any[] };
  config: { measure: string };
  colorPalette: ColorPalette;
}

const SunburstChart: React.FC<SunburstChartProps> = ({ data, config, colorPalette }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  
  const isCurrency = config.measure.toLowerCase().includes('budget');
  const isWorkload = config.measure.toLowerCase().includes('workload');

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !tooltipRef.current) return;

    const container = containerRef.current;
    const svg = select(svgRef.current);
    const tooltip = select(tooltipRef.current);

    const drawChart = () => {
      svg.selectAll('*').remove();
      
      const { width, height } = container.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;

      const radius = Math.min(width, height) / 2.2;
      
      const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`);

      const root = hierarchy(data)
// FIX: Cast `d` to `any` to access `value` property on leaf nodes.
          .sum(d => (d as any).value)
// FIX: Cast `a` and `b` to `any` to access the `value` property added by `.sum()`.
          .sort((a, b) => descending((a as any).value, (b as any).value));
          
      partition().size([2 * Math.PI, radius])(root);
      
      const totalValue = root.value || 0;

      const colorDomain = root.children ? root.children.map(d => (d.data as any).name) : [];
      const colorScale = scaleOrdinal(palettes[colorPalette]).domain(colorDomain);

      const arcGenerator = arc<any>()
          .startAngle(d => d.x0)
          .endAngle(d => d.x1)
          .padAngle(0.01)
          .padRadius(radius / 2)
          .innerRadius(d => d.y0)
          .outerRadius(d => d.y1 - 1);

      const paths = g.selectAll('path')
        .data(root.descendants().filter(d => d.depth > 0))
        .join('path')
        .attr('fill', d => {
            let ancestor = d;
            while (ancestor.depth > 1) {
                ancestor = ancestor.parent!;
            }
            return colorScale((ancestor.data as any).name);
        })
        .attr('fill-opacity', d => 1 - (d.depth * 0.15))
        .attr('d', arcGenerator)
        .on('mouseover', (event, d) => {
            const path = d.ancestors().map(node => (node.data as any).name).reverse().slice(1).join(" > ");
            const value = d.value || 0;
            const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
            const valueString = isCurrency
                ? value.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0})
                : isWorkload
                    ? `${value.toLocaleString('fr-FR')} j/h`
                    : value.toLocaleString('fr-FR');
            tooltip.style('opacity', .9)
                   .html(`<strong>${path}</strong><br/>Valeur: ${valueString} (${percentage.toFixed(1)}%)`)
                   .style('left', `${event.pageX + 15}px`)
                   .style('top', `${event.pageY - 28}px`);
            select(event.currentTarget).style('stroke', '#334155').style('stroke-width', '1.5px');
        })
        .on('mouseout', (event) => {
            tooltip.style('opacity', 0);
            select(event.currentTarget).style('stroke', 'none');
        });
        
      const text = g.selectAll("text")
// FIX: Cast `d` to `any` to access layout properties.
        .data(root.descendants().filter(d => d.depth > 0 && ((d as any).y1 - (d as any).y0) > 10 && ((d as any).x1 - (d as any).x0) > 0.03))
        .join("text")
        .attr("transform", function(d) {
// FIX: Cast `d` to `any` to access layout properties.
            const x = ((d as any).x0 + (d as any).x1) / 2 * 180 / Math.PI;
// FIX: Cast `d` to `any` to access layout properties.
            const y = ((d as any).y0 + (d as any).y1) / 2;
            const rotate = x - 90;
            const flip = rotate > 90 ? 180 : 0;
            return `rotate(${rotate}) translate(${y},0) rotate(${flip})`;
        })
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("fill", "#1e293b")
        .text(d => (d.data as any).name);

      const centerGroup = g.append('g').attr('text-anchor', 'middle');

      centerGroup.append('text')
          .attr('class', 'text-sm fill-slate-500')
          .attr('dy', '-0.5em')
          .text('Total');
      
      const totalText = isCurrency
        ? totalValue.toLocaleString('fr-FR', {style:'currency', currency: 'EUR', notation:'compact'})
        : isWorkload
            ? `${Math.round(totalValue).toLocaleString('fr-FR')} j/h`
            : totalValue.toLocaleString('fr-FR');

      centerGroup.append('text')
          .attr('class', 'text-2xl font-bold fill-slate-800')
          .attr('dy', '0.6em')
          .text(totalText);

    };

    drawChart();

    const resizeObserver = new ResizeObserver(drawChart);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [data, config, isCurrency, isWorkload, colorPalette]);

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      <svg ref={svgRef} className="w-full h-full"></svg>
      <div ref={tooltipRef} className="d3-tooltip"></div>
    </div>
  );
};

export default SunburstChart;
