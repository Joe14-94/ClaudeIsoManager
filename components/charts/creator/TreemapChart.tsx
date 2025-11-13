
import React, { useRef, useEffect } from 'react';
import { select, treemap, hierarchy, scaleOrdinal, schemeTableau10, schemePastel1, schemeBlues } from 'd3';

type ColorPalette = 'vibrant' | 'professional' | 'pastel' | 'monochromatic';

const palettes: Record<ColorPalette, readonly string[]> = {
    vibrant: schemeTableau10,
    professional: ['#0d47a1', '#1976d2', '#42a5f5', '#90caf9', '#e3f2fd'],
    pastel: schemePastel1,
    monochromatic: schemeBlues[9],
};

interface TreemapChartProps {
  data: { name: string; children?: any[] };
  config: { measure: string };
  colorPalette: ColorPalette;
}

const TreemapChart: React.FC<TreemapChartProps> = ({ data, config, colorPalette }) => {
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

      const treemapLayout = treemap()
        .size([width, height])
        .paddingInner(2) // Utiliser le padding pour créer un espacement blanc
        .paddingTop(24);

      const root = hierarchy(data)
        .sum(d => (d as any).value)
        .sort((a, b) => b.value! - a.value!);
      
      treemapLayout(root);

      const colorDomain = root.children ? root.children.map(d => (d.data as any).name) : [];
      const colorScale = scaleOrdinal(palettes[colorPalette]).domain(colorDomain);

      const cell = svg.selectAll("g")
        .data(root.leaves())
        .enter().append("g")
// FIX: Cast `d` to `any` to access layout properties.
        .attr("transform", d => `translate(${(d as any).x0},${(d as any).y0})`);

      cell.append("rect")
        .attr("id", (d, i) => `rect-${i}`)
// FIX: Cast `d` to `any` to access layout properties.
        .attr("width", d => (d as any).x1 - (d as any).x0)
// FIX: Cast `d` to `any` to access layout properties.
        .attr("height", d => (d as any).y1 - (d as any).y0)
        .attr("fill", d => colorScale((d.parent?.data as any).name))
        .on('mouseover', (event, d) => {
            tooltip.style('opacity', .9)
                   .html(`<strong>${(d.parent?.data as any).name} > ${(d.data as any).name}</strong><br/>Valeur: ${isCurrency ? (d.data as any).value.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}) : (d.data as any).value.toLocaleString('fr-FR')}`)
                   .style('left', `${event.pageX + 15}px`)
                   .style('top', `${event.pageY - 28}px`);
            select(event.currentTarget).style('opacity', 0.8);
        })
        .on('mouseout', (event) => {
            tooltip.style('opacity', 0);
            select(event.currentTarget).style('opacity', 1);
        });
        
      cell.append("clipPath")
          .attr("id", (d, i) => `clip-${i}`)
          .append("use")
          .attr("xlink:href", (d, i) => `#rect-${i}`);

      cell.append("text")
        .attr('clip-path', (d, i) => `url(#clip-${i})`)
        .attr("x", 4)
        .attr("y", 14)
        .text(d => (d.data as any).name)
        .attr('font-size', '11px')
        .attr('fill', 'white')
        .attr('stroke', 'rgba(0,0,0,0.6)')
        .attr('stroke-width', 2)
        .attr('paint-order', 'stroke');
        
      svg.selectAll("g.group-label")
        .data(root.children!)
        .enter().append("g")
        .attr('class', 'group-label')
        .append("text")
// FIX: Cast `d` to `any` to access layout properties.
        .attr("x", d => (d as any).x0 + 5)
// FIX: Cast `d` to `any` to access layout properties.
        .attr("y", d => (d as any).y0 + 15)
        .text(d => (d.data as any).name)
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .attr("fill", "white")
        .attr('stroke', 'rgba(0,0,0,0.6)')
        .attr('stroke-width', 3)
        .attr('paint-order', 'stroke');
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

export default TreemapChart;
