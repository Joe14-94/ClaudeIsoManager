
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import { CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Project } from '../../../types';
import { select, scaleTime, scaleLinear, axisBottom, axisLeft, line, timeFormat, max, curveMonotoneX } from 'd3';
import { TrendingUp } from 'lucide-react';

const ProjectSCurveWidget: React.FC = () => {
    const { projects } = useData();
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const svgRef = useRef<SVGSVGElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const eligibleProjects = useMemo(() => {
        return projects.filter(p => p.projectId !== 'TOTAL_GENERAL' && p.projectStartDate && p.projectEndDate && p.budgetApproved && p.budgetApproved > 0);
    }, [projects]);

    useEffect(() => {
        if (eligibleProjects.length > 0 && !selectedProjectId) {
            setSelectedProjectId(eligibleProjects[0].id);
        }
    }, [eligibleProjects, selectedProjectId]);

    const selectedProject = useMemo(() => projects.find(p => p.id === selectedProjectId), [projects, selectedProjectId]);

    const chartData = useMemo(() => {
        if (!selectedProject || !selectedProject.projectStartDate || !selectedProject.projectEndDate || !selectedProject.budgetApproved) return null;

        const startDate = new Date(selectedProject.projectStartDate);
        const endDate = new Date(selectedProject.projectEndDate);
        const budgetTotal = selectedProject.budgetApproved;

        const plannedData: { date: Date, value: number }[] = [];
        const totalMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
        const monthlyBudget = budgetTotal / Math.max(1, totalMonths);

        for (let i = 0; i <= totalMonths; i++) {
            const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
            const date = d > endDate ? endDate : d;
            const value = Math.min(budgetTotal, monthlyBudget * i);
            plannedData.push({ date, value });
        }
        if (plannedData[plannedData.length - 1].value < budgetTotal) {
             plannedData.push({ date: endDate, value: budgetTotal });
        }

        const committedData: { date: Date, value: number }[] = [];
        const realizedData: { date: Date, value: number }[] = [];

        committedData.push({ date: startDate, value: 0 });
        realizedData.push({ date: startDate, value: 0 });

        if (selectedProject.fdrHistory && selectedProject.fdrHistory.length > 0) {
             const sortedHistory = [...selectedProject.fdrHistory].sort((a, b) => {
                 const dateA = parseInt(a.year) * 100 + parseInt(a.week);
                 const dateB = parseInt(b.year) * 100 + parseInt(b.week);
                 return dateA - dateB;
             });

             sortedHistory.forEach(entry => {
                 const simpleDate = new Date(parseInt(entry.year), 0, 1 + (parseInt(entry.week) - 1) * 7);
                 if (entry.type === 'budget' && entry.data) {
                     if (entry.data.budgetCommitted !== undefined) committedData.push({ date: simpleDate, value: entry.data.budgetCommitted });
                     if (entry.data.completedPV !== undefined) realizedData.push({ date: simpleDate, value: entry.data.completedPV });
                 }
             });
        } else {
            const today = new Date();
            if (selectedProject.budgetCommitted) committedData.push({ date: today, value: selectedProject.budgetCommitted });
            if (selectedProject.completedPV) realizedData.push({ date: today, value: selectedProject.completedPV });
        }

        return { plannedData, committedData, realizedData, budgetTotal };
    }, [selectedProject]);

    useEffect(() => {
        if (!chartData || !svgRef.current || !containerRef.current) return;
        
        const { plannedData, committedData, realizedData, budgetTotal } = chartData;
        const container = containerRef.current;
        const svg = select(svgRef.current);
        
        svg.selectAll('*').remove();
        
        const { width, height } = container.getBoundingClientRect();
        const margin = { top: 20, right: 30, bottom: 30, left: 60 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

        const allDates = [...plannedData, ...committedData, ...realizedData].map(d => d.date);
        const xScale = scaleTime().domain([allDates.reduce((a, b) => a < b ? a : b), allDates.reduce((a, b) => a > b ? a : b)]).range([0, innerWidth]);

        const maxY = Math.max(budgetTotal, ...committedData.map(d => d.value));
        const yScale = scaleLinear().domain([0, maxY * 1.1]).range([innerHeight, 0]);

        const xAxis = axisBottom(xScale).ticks(5).tickFormat(timeFormat("%b %y") as any);
        const yAxis = axisLeft(yScale).ticks(5).tickFormat(d => `${(d as number) / 1000}k€`);

        const xAxisGroup = g.append('g').attr('transform', `translate(0, ${innerHeight})`).call(xAxis);
        xAxisGroup.select('.domain').attr('stroke', '#94a3b8').attr('stroke-width', 1.5);
        xAxisGroup.selectAll('text').attr('fill', '#64748b');
        xAxisGroup.selectAll('line').attr('stroke', '#cbd5e1');

        const yAxisGroup = g.append('g').call(yAxis);
        yAxisGroup.select('.domain').attr('stroke', '#94a3b8').attr('stroke-width', 1.5);
        yAxisGroup.selectAll('text').attr('fill', '#64748b');
        yAxisGroup.selectAll('line').attr('stroke', '#cbd5e1');
        
        g.append('g').attr('class', 'grid').call(axisLeft(yScale).tickSize(-innerWidth).tickFormat(() => "")).attr('color', '#e2e8f0').style('stroke-dasharray', '3,3').select('.domain').remove();

        const lineGen = line<{date: Date, value: number}>().x(d => xScale(d.date)).y(d => yScale(d.value)).curve(curveMonotoneX);

        g.append('path').datum(plannedData).attr('fill', 'none').attr('stroke', '#cbd5e1').attr('stroke-width', 2).attr('stroke-dasharray', '5,5').attr('d', lineGen);
            
        if (committedData.length > 0) {
            g.append('path').datum(committedData).attr('fill', 'none').attr('stroke', '#93c5fd').attr('stroke-width', 3).attr('d', lineGen);
             g.selectAll('.dot-committed').data(committedData).enter().append('circle').attr('cx', d => xScale(d.date)).attr('cy', d => yScale(d.value)).attr('r', 4).attr('fill', '#93c5fd').attr('stroke', '#fff').attr('stroke-width', 2);
        }

        if (realizedData.length > 0) {
            g.append('path').datum(realizedData).attr('fill', 'none').attr('stroke', '#6ee7b7').attr('stroke-width', 3).attr('d', lineGen);
             g.selectAll('.dot-realized').data(realizedData).enter().append('circle').attr('cx', d => xScale(d.date)).attr('cy', d => yScale(d.value)).attr('r', 4).attr('fill', '#6ee7b7').attr('stroke', '#fff').attr('stroke-width', 2);
        }
    }, [chartData]);

    return (
        <div className="h-full w-full flex flex-col">
            <CardHeader className="non-draggable pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2"><TrendingUp size={20} className="text-blue-400" /> Courbe en S (Financier)</CardTitle>
                    <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="text-sm border border-slate-200 rounded px-2 py-1 max-w-[200px] truncate bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200">
                        <option value="" disabled>Sélectionner un projet</option>
                        {eligibleProjects.map(p => (<option key={p.id} value={p.id}>{p.projectId} - {p.title}</option>))}
                    </select>
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col" ref={containerRef}>
                {selectedProjectId ? (
                    <>
                        <div className="flex justify-center gap-6 mb-2 text-xs">
                            <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-slate-300 border-t-2 border-dashed"></div><span className="text-slate-500">Budget Planifié</span></div>
                            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-300 rounded-full border border-white shadow-sm"></div><span className="text-slate-600">Engagé (Commandé)</span></div>
                             <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-300 rounded-full border border-white shadow-sm"></div><span className="text-slate-600">Réalisé (Facturé/PV)</span></div>
                        </div>
                        <div className="flex-grow relative min-h-[150px]"><svg ref={svgRef} width="100%" height="100%"></svg></div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 italic">Veuillez sélectionner un projet avec un budget défini.</div>
                )}
            </CardContent>
        </div>
    );
};
export default ProjectSCurveWidget;
