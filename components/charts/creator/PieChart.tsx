import React, { useRef, useEffect } from 'react';
// FIX: Replace monolithic d3 import with specific named imports to resolve type errors.
import { select, arc, pie, sum, interpolate, scaleOrdinal, schemeTableau10, schemePastel1, schemeBlues } from 'd3';

type ColorPalette = 'vibrant' | 'professional' | 'pastel' | 'monochromatic';

const palettes: Record<ColorPalette, readonly string[]> = {
    vibrant: schemeTableau10,
    professional: ['#0d47a1', '#1976d2', '#42a5f5', '#90caf9', '#e3f2fd'],
    pastel: schemePastel1,
    monochromatic: schemeBlues[9],
};

interface PieChartProps {
  data: { label: string; value: number }[];
  config: { measure: string };
  colorPalette: ColorPalette;
  onSliceClick: (data: any) => void;
  hiddenLabels: string[];
  setHiddenLabels: React.Dispatch<React.SetStateAction<string[]>>;
}

const PieChart: React.FC<PieChartProps> = ({ data, config, colorPalette, onSliceClick, hiddenLabels, setHiddenLabels }) => {
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
      
      const legendWidth = 150;
      const chartWidth = width - legendWidth;

      const radius = Math.min(chartWidth, height) / 2.5;

      const g = svg.append('g').attr('transform', `translate(${chartWidth / 2}, ${height / 2})`);

      const displayData = data.filter(d => !hiddenLabels.includes(d.label));
      const colorScale = scaleOrdinal(palettes[colorPalette]).domain(data.map(d => d.label));
      
      const pieGenerator = pie<{ label: string; value: number }>().value(d => d.value).sort(null);
      const arcGenerator = arc<any>().innerRadius(radius * 0.6).outerRadius(radius);
      const arcHover = arc<any>().innerRadius(radius * 0.6).outerRadius(radius * 1.05);

      const total = sum(displayData, d => d.value);

      const path = g.selectAll('path')
        .data(pieGenerator(displayData), (d: any) => d.data.label);

      path.enter()
        .append('path')
        .attr('fill', d => colorScale(d.data.label))
        .attr('stroke', 'white')
        .style('stroke-width', '2px')
        .style('cursor', 'pointer')
        .on('click', (event, d) => onSliceClick(d.data))
        .on('mouseover', (event, d) => {
          select(event.currentTarget).transition().duration(200).attr('d', arcHover);
          const percentage = (d.value / total) * 100;
          tooltip.style('opacity', .9)
                 .html(`<strong>${d.data.label}</strong><br/>Valeur: ${isCurrency ? d.data.value.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}) : d.data.value.toLocaleString('fr-FR')}<br/>(${percentage.toFixed(1)}%)`)
                 .style('left', `${event.pageX + 15}px`)
                 .style('top', `${event.pageY - 28}px`);
        })
        .on('mouseout', (event) => {
          select(event.currentTarget).transition().duration(200).attr('d', arcGenerator);
          tooltip.style('opacity', 0);
        })
        .transition().duration(750)
        .attrTween('d', function(d) {
            const i = interpolate((this as any)._current, d);
            (this as any)._current = i(0);
            return (t: any) => arcGenerator(i(t))!;
        });

      path.exit()
        .transition().duration(750)
        .attrTween('d', function(d) {
            const i = interpolate((this as any)._current, {startAngle: (this as any)._current.startAngle, endAngle: (this as any)._current.startAngle});
            return (t: any) => arcGenerator(i(t))!;
        })
        .remove();

      path.transition().duration(750)
        .attrTween('d', function(d) {
            const i = interpolate((this as any)._current, d);
            (this as any)._current = i(0);
            return (t: any) => arcGenerator(i(t))!;
        });

      g.selectAll('path').each(function(d) { (this as any)._current = d; });
      
      const centerGroup = g.selectAll('.center-text').data([total]);
      centerGroup.enter()
        .append('g').attr('class', 'center-text').attr('text-anchor', 'middle')
        .call(g => g.append('text').attr('class', 'value-text text-2xl font-bold fill-slate-800').attr('dy', '-0.5em'))
        .call(g => g.append('text').attr('class', 'label-text text-sm fill-slate-500').attr('dy', '1em').text('Total'));

      centerGroup.select('.value-text').text(isCurrency ? formatCurrency(total) : total.toLocaleString('fr-FR'));
      
      // Legend
      const legend = svg.append('g').attr('transform', `translate(${chartWidth + 20}, 20)`);
      const legendItems = legend.selectAll('.legend-item').data(data);
      
      const legendEnter = legendItems.enter().append('g').attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * 25})`)
        .style('cursor', 'pointer')
        .on('click', (event, d) => {
            setHiddenLabels(prev => prev.includes(d.label) ? prev.filter(l => l !== d.label) : [...prev, d.label]);
        });
      
      legendEnter.append('rect').attr('width', 14).attr('height', 14).attr('rx', 3);
      legendEnter.append('text').attr('x', 20).attr('y', 12).attr('class', 'text-sm');

      const legendUpdate = legendItems.merge(legendEnter as any);
      legendUpdate.select('rect').attr('fill', d => colorScale(d.label));
      legendUpdate.select('text').text(d => d.label);
      legendUpdate.transition().duration(300).style('opacity', d => hiddenLabels.includes(d.label) ? 0.4 : 1);

    };

    const formatCurrency = (value: number) => {
        if (value > 1000000) return `${(value / 1000000).toFixed(1)} M€`;
        if (value > 1000) return `${(value / 1000).toFixed(0)} k€`;
        return value.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0});
    }

    const resizeObserver = new ResizeObserver(drawChart);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [data, config, isCurrency, colorPalette, onSliceClick, hiddenLabels, setHiddenLabels]);

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      <svg ref={svgRef} className="w-full h-full"></svg>
      <div ref={tooltipRef} className="d3-tooltip"></div>
    </div>
  );
};

export default PieChart;
