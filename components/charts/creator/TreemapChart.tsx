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
        .padding(1)
        .paddingTop(20);

      const root = hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value! - a.value!);
      
      treemapLayout(root);

      const colorDomain = root.children ? root.children.map(d => (d.data as any).name) : [];
      const colorScale = scaleOrdinal(palettes[colorPalette]).domain(colorDomain);

      const cell = svg.selectAll("g")
        .data(root.leaves())
        .enter().append("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

      cell.append("rect")
        .attr("id", (d, i) => `rect-${i}`)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", d => colorScale((d.parent?.data as any).name))
        .attr("stroke", "white")
        .on('mouseover', (event, d) => {
            tooltip.style('opacity', .9)
                   .html(`<strong>${(d.parent?.data as any).name}</strong><br/>
                          ${(d.data as any).name}: ${isCurrency ? (d.data as any).value.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}) : (d.data as any).value.toLocaleString('fr-FR')}`)
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
        .selectAll("tspan")
        .data(d => (d.data as any).name.split(/(?=[A-Z][^A-Z])/g))
        .enter().append("tspan")
        .attr("x", 4)
        .attr("y", (d, i) => 13 + i * 10)
        .text(d => d)
        .attr('font-size', '11px')
        .attr('fill', 'white');
        
      svg.selectAll("g")
        .data(root.children!)
        .enter().append("g")
        .append("text")
        .attr("x", d => d.x0 + 5)
        .attr("y", d => d.y0 + 15)
        .text(d => (d.data as any).name)
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .attr("fill", "white");

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
