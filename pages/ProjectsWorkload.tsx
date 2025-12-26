
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Project } from '../types';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Search, ArrowUp, ArrowDown, Info, Timer } from 'lucide-react';

type SortKey = 'projectId' | 'title' | 'totalWorkloadEngaged' | 'totalWorkloadConsumed' | 'totalProgress';
type SortDirection = 'ascending' | 'descending';

const formatJH = (value?: number) => {
    if (value === undefined || value === null || isNaN(value)) return 'N/A';
    return `${Math.round(value)} J/H`;
};

const getProjectProgress = (project: Project): number => {
    const consumed = (project.internalWorkloadConsumed || 0) + (project.externalWorkloadConsumed || 0);
    const engaged = (project.internalWorkloadEngaged || 0) + (project.externalWorkloadEngaged || 0);
    return engaged > 0 ? Math.round((consumed / engaged) * 100) : 0;
};

const ProjectsWorkload: React.FC = () => {
    const { projects, lastCsvImportDate, lastImportWeek, lastImportYear } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>({ key: 'projectId', direction: 'ascending' });

    const totalStats = useMemo(() => {
        const uoPattern = /^([a-zA-Z]+|\d+)\.\d+\.\d+\.\d+$/;
        const validProjects = projects.filter(p => !uoPattern.test(p.projectId) && p.projectId !== 'TOTAL_GENERAL');
        return validProjects.reduce((acc, p) => {
            acc.intEng += p.internalWorkloadEngaged || 0;
            acc.intCon += p.internalWorkloadConsumed || 0;
            acc.extEng += p.externalWorkloadEngaged || 0;
            acc.extCon += p.externalWorkloadConsumed || 0;
            return acc;
        }, { intEng: 0, intCon: 0, extEng: 0, extCon: 0 });
    }, [projects]);
    
    const sortedProjects = useMemo(() => {
        const uoPattern = /^([a-zA-Z]+|\d+)\.\d+\.\d+\.\d+$/;
        let sortableItems = [...projects].filter(project =>
            !uoPattern.test(project.projectId) &&
            project.projectId !== 'TOTAL_GENERAL' &&
            (searchTerm === '' || project.title.toLowerCase().includes(searchTerm.toLowerCase()) || project.projectId.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue: string | number | undefined;
                let bValue: string | number | undefined;
                if (sortConfig.key === 'totalProgress') { aValue = getProjectProgress(a); bValue = getProjectProgress(b); }
                else if (sortConfig.key === 'totalWorkloadEngaged') { aValue = (a.internalWorkloadEngaged || 0) + (a.externalWorkloadEngaged || 0); bValue = (b.internalWorkloadEngaged || 0) + (b.externalWorkloadEngaged || 0); }
                else if (sortConfig.key === 'totalWorkloadConsumed') { aValue = (a.internalWorkloadConsumed || 0) + (a.externalWorkloadConsumed || 0); bValue = (b.internalWorkloadConsumed || 0) + (b.externalWorkloadConsumed || 0); }
                else { aValue = a[sortConfig.key as keyof Project] as (string | number | undefined); bValue = b[sortConfig.key as keyof Project] as (string | number | undefined); }
                const valA = aValue ?? (typeof aValue === 'number' ? -Infinity : ''); const valB = bValue ?? (typeof bValue === 'number' ? -Infinity : '');
                let comparison = 0; if (typeof valA === 'number' && typeof valB === 'number') comparison = valA - valB; else comparison = String(valA).localeCompare(String(valB), 'fr', { numeric: true, sensitivity: 'base' });
                return sortConfig.direction === 'ascending' ? comparison : -comparison;
            });
        }
        return sortableItems;
    }, [projects, searchTerm, sortConfig]);

    const requestSort = (key: SortKey) => {
        let direction: SortDirection = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
        setSortConfig({ key, direction });
    };

    const renderSortArrow = (key: SortKey) => {
        if (sortConfig?.key === key) return sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
        return null;
    };
    
    const totalEngaged = totalStats.intEng + totalStats.extEng;
    const totalConsumed = totalStats.intCon + totalStats.extCon;

    const StatGroup = ({ title, engaged, consumed, colorClass }: { title: string, engaged: number, consumed: number, colorClass: string }) => (
        <div className="flex flex-col items-center px-4 md:px-8 border-r border-slate-200 last:border-r-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{title}</span>
            <div className="flex items-baseline gap-3">
                <div className="flex flex-col items-end">
                    <span className={`text-sm font-bold ${colorClass}`}>{formatJH(engaged)}</span>
                    <span className="text-[10px] text-slate-400">Engagé</span>
                </div>
                <div className="w-px h-6 bg-slate-200 mx-1"></div>
                <div className="flex flex-col items-start">
                    <span className={`text-sm font-bold ${colorClass}`}>{formatJH(consumed)}</span>
                    <span className="text-[10px] text-slate-400">Consommé</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-3 h-full flex flex-col">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <h1 className="text-2xl font-bold text-slate-800">Vue des charges projets (J/H)</h1>
                 {lastCsvImportDate && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        <Info size={14} />
                        {lastImportWeek && lastImportYear ? (
                            <span>Données FDR S{lastImportWeek}-{lastImportYear} (importé le {new Date(lastCsvImportDate).toLocaleString('fr-FR')})</span>
                        ) : (
                            <span>Données FDR mises à jour le {new Date(lastCsvImportDate).toLocaleString('fr-FR')}</span>
                        )}
                    </div>
                )}
            </div>
            
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-y-6 overflow-x-auto py-2">
                         <StatGroup title="Charge Interne" engaged={totalStats.intEng} consumed={totalStats.intCon} colorClass="text-indigo-600" />
                         <StatGroup title="Charge Externe" engaged={totalStats.extEng} consumed={totalStats.extCon} colorClass="text-sky-600" />
                         <div className="flex flex-col items-center px-8">
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1"><Timer size={14}/> Total Global</span>
                             <div className="flex items-baseline gap-4">
                                 <div className="text-center">
                                     <span className="block text-2xl font-bold text-slate-800">{formatJH(totalEngaged)}</span>
                                     <span className="text-[10px] text-slate-500 uppercase font-semibold">Engagé</span>
                                 </div>
                                 <div className="text-center">
                                     <span className="block text-2xl font-bold text-slate-800">{formatJH(totalConsumed)}</span>
                                     <span className="text-[10px] text-slate-500 uppercase font-semibold">Consommé</span>
                                 </div>
                             </div>
                         </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="flex-grow flex flex-col min-h-0">
                <CardHeader>
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Filtrer les projets..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100 sticky top-0">
                                <tr>
                                    <th key="projectId" scope="col" className="px-6 py-3 cursor-pointer whitespace-nowrap" onClick={() => requestSort('projectId')}>ID {renderSortArrow('projectId')}</th>
                                    <th key="title" scope="col" className="px-6 py-3 cursor-pointer whitespace-nowrap" onClick={() => requestSort('title')}>Titre {renderSortArrow('title')}</th>
                                    <th key="totalEngaged" scope="col" className="px-6 py-3 cursor-pointer whitespace-nowrap text-right" onClick={() => requestSort('totalWorkloadEngaged')}>Total Engagé {renderSortArrow('totalWorkloadEngaged')}</th>
                                    <th key="totalConsumed" scope="col" className="px-6 py-3 cursor-pointer whitespace-nowrap text-right" onClick={() => requestSort('totalWorkloadConsumed')}>Total Conso {renderSortArrow('totalWorkloadConsumed')}</th>
                                    <th key="progress" scope="col" className="px-6 py-3 cursor-pointer whitespace-nowrap" onClick={() => requestSort('totalProgress')}>Avancement {renderSortArrow('totalProgress')}</th>
                                    <th className="px-6 py-3 text-center bg-indigo-50/50 border-l border-slate-200" colSpan={2}>Interne</th>
                                    <th className="px-6 py-3 text-center bg-sky-50/50 border-l border-slate-200" colSpan={2}>Externe</th>
                                </tr>
                                <tr className="text-xs bg-slate-100">
                                    <th colSpan={5}></th>
                                    <th className="px-2 py-2 font-medium text-right bg-indigo-50/50 border-l border-slate-200">Conso</th>
                                    <th className="px-2 py-2 font-medium text-right bg-indigo-50/50">Engagé</th>
                                    <th className="px-2 py-2 font-medium text-right bg-sky-50/50 border-l border-slate-200">Conso</th>
                                    <th className="px-2 py-2 font-medium text-right bg-sky-50/50">Engagé</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedProjects.map(project => {
                                    const progress = getProjectProgress(project);
                                    const totalEngaged = (project.internalWorkloadEngaged || 0) + (project.externalWorkloadEngaged || 0);
                                    const totalConsumed = (project.internalWorkloadConsumed || 0) + (project.externalWorkloadConsumed || 0);
                                    
                                    return (
                                    <tr key={project.id} className="bg-white border-b hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-900">{project.projectId}</td>
                                        <td className="px-6 py-4">{project.title}</td>
                                        <td className="px-6 py-4 text-right font-medium">{formatJH(totalEngaged)}</td>
                                        <td className="px-6 py-4 text-right font-medium">{formatJH(totalConsumed)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-full bg-slate-200 rounded-full h-2.5 min-w-[50px]">
                                                    <div className={`${progress > 100 ? 'bg-red-500' : 'bg-emerald-500'} h-2.5 rounded-full`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                                </div>
                                                <span className="font-semibold text-xs">{progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-2 py-4 text-right bg-indigo-50/20 border-l border-slate-100">{formatJH(project.internalWorkloadConsumed)}</td>
                                        <td className="px-2 py-4 text-right bg-indigo-50/20">{formatJH(project.internalWorkloadEngaged)}</td>
                                        <td className="px-2 py-4 text-right bg-sky-50/20 border-l border-slate-100">{formatJH(project.externalWorkloadConsumed)}</td>
                                        <td className="px-2 py-4 text-right bg-sky-50/20">{formatJH(project.externalWorkloadEngaged)}</td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                        {sortedProjects.length === 0 && <div className="text-center py-8 text-slate-500">Aucun projet ne correspond à vos critères.</div>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
export default ProjectsWorkload;
