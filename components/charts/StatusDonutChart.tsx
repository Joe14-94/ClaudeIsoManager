import React, { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { Activity, ActivityStatus } from '../../types';
import { STATUS_HEX_COLORS } from '../../constants';

interface StatusDonutChartProps {
  data: Activity[];
  onSliceClick?: (status: ActivityStatus) => void;
}

const StatusDonutChart: React.FC<StatusDonutChartProps> = ({ data, onSliceClick }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const statusData = useMemo(() => {
    const counts = data.reduce((acc, activity) => {
      acc[activity.status] = (acc[activity.status] || 0) + 1;
      return acc;
    }, {} as { [key in ActivityStatus]: number });

    return Object.entries(counts).map(([status, count]) => ({
      status: status as ActivityStatus,
      count,
    })).sort((a, b) => a.status.localeCompare(b.status));

  }, [data]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || statusData.length === 0) return;

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        drawChart(width, height);
      }
    });
    resizeObserver.observe(container);
    
    const drawChart = (width: number, height: number) => {
        svg.selectAll('*').remove();
        const radius = Math.min(width, height) / 2.2;
        const arc = d3.arc<any>().innerRadius(radius * 0.65).outerRadius(radius);
        const arcHover = d3.arc<any>().innerRadius(radius * 0.65).outerRadius(radius * 1.05);
        const pie = d3.pie<any>().value(d => d.count).sort(null);

        const g = svg.append('g').attr('transform', `translate(${width / 2}, ${height / 2})`);

        const path = g.selectAll('path')
            .data(pie(statusData))
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', d => STATUS_HEX_COLORS[d.data.status])
            .attr('stroke', '#fff')
            .style('stroke-width', '2px')
            .style('cursor', 'pointer')
            .on('mouseover', function (event, d) {
                path.transition('fade').duration(200).style('opacity', p => (p === d ? 1 : 0.5));
                d3.select(this).transition('zoom').duration(200).attr('d', arcHover);
                updateCenterText(d.data.status, d.data.count);
            })
            .on('mouseout', function () {
                path.transition('fade').duration(200).style('opacity', 1);
                d3.select(this).transition('zoom').duration(200).attr('d', arc);
                resetCenterText();
            })
            .on('click', (event, d) => {
                if (onSliceClick) {
                    onSliceClick(d.data.status);
                }
            });
        
        const centerText = g.append('text')
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('fill', '#475569');

        const centerCount = centerText.append('tspan')
            .attr('x', 0)
            .attr('dy', '-0.1em')
            .style('font-size', '28px')
            .style('font-weight', '600');

        const centerLabel = centerText.append('tspan')
            .attr('x', 0)
            .attr('dy', '1.2em');

        const total = d3.sum(statusData, d => d.count);

        const updateCenterText = (status: string, count: number) => {
            centerCount.text(count);
            centerLabel.text(status);
        };
        
        const resetCenterText = () => {
            centerCount.text(total);
            centerLabel.text('Activités');
        };

        resetCenterText();
    }
    
    return () => resizeObserver.disconnect();
  }, [statusData, onSliceClick]);

  if (statusData.length === 0) {
    return <div className="flex items-center justify-center h-full text-slate-500">Aucune donnée de statut à afficher.</div>;
  }

  return (
    <div className="flex flex-col md:flex-row items-center h-[350px] w-full gap-6">
        <div ref={containerRef} className="flex-1 h-full w-full min-h-0 relative">
            <svg ref={svgRef} width="100%" height="100%"></svg>
        </div>
        <div className="flex-none w-full md:w-48">
            <ul className="space-y-2">
                {statusData.map(({ status, count }) => (
                    <li key={status} className="flex items-center text-sm">
                        <span className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: STATUS_HEX_COLORS[status] }}></span>
                        <span className="text-slate-700">{status}</span>
                        <span className="ml-auto text-slate-600 font-medium">{count}</span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
  );
};

export default StatusDonutChart;
