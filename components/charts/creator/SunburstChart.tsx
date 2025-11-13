import React, { useRef, useEffect } from 'react';
import { select, hierarchy, partition, arc, scaleOrdinal, schemeTableau10, schemePastel1, schemeBlues } from 'd3';

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
          .sum(d => d.value)
          .sort((a, b) => b.value! - a.value!);
          
      partition().size([2 * Math.PI, radius])(root);
      
      const colorDomain = root.children ? root.children.map(d => (d.data as any).name) : [];
      const colorScale = scaleOrdinal(palettes[colorPalette]).domain(colorDomain);

      const arcGenerator = arc<any>()
          .startAngle(d => d.x0)
          .endAngle(d => d.x1)
          .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
          .padRadius(radius / 2)
          .innerRadius(d => d.y0)
          .outerRadius(d => d.y1 - 1);

      g.selectAll('path')
        .data(root.descendants().filter(d => d.depth > 0))
        .join('path')
        .attr('fill', d => {
            let ancestor = d;
            while (ancestor.depth > 1) {
                ancestor = ancestor.parent!;
            }
            return colorScale((ancestor.data as any).name);
        })
        .attr('d', arcGenerator)
        .on('mouseover', (event, d) => {
            const path = d.ancestors().map(node => (node.data as any).name).reverse().slice(1).join(" > ");
            const value = d.value || 0;
            tooltip.style('opacity', .9)
                   .html(`<strong>${path}</strong><br/>Valeur: ${isCurrency ? value.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}) : value.toLocaleString('fr-FR')}`)
                   .style('left', `${event.pageX + 15}px`)
                   .style('top', `${event.pageY - 28}px`);
            select(event.currentTarget).style('stroke', '#334155').style('stroke-width', '1.5px');
        })
        .on('mouseout', (event) => {
            tooltip.style('opacity', 0);
            select(event.currentTarget).style('stroke', 'none');
        });
        
    };

    const resizeObserver = new ResizeObserver(drawChart);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [data, config, isCurrency, colorPalette]);

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      <svg ref={svgRef} className="w-full h-full"></svg>
      <div ref={tooltipRef} className="d3-tooltip"></div>
    </div>
  );
};

export default SunburstChart;