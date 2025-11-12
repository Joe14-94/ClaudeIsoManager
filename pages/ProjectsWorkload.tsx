import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Project } from '../types';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Search, ArrowUp, ArrowDown, Info } from 'lucide-react';

type SortKey = 'projectId' | 'title' | 'internalWorkloadRequested' | 'internalWorkloadEngaged' | 'internalWorkloadConsumed' | 'externalWorkloadRequested' | 'externalWorkloadEngaged' | 'externalWorkloadConsumed' | 'totalProgress';
type SortDirection = 'ascending' | 'descending';

const formatJH = (value?: number) => {
    if (value === undefined || value === null || isNaN(value)) return 'N/A';
    return `${value} J/H`;
};

const getProjectProgress = (project: Project): number => {
    const consumed = (project.internalWorkloadConsumed || 0) + (project.externalWorkloadConsumed || 0);
    const engaged = (project.internalWorkloadEngaged || 0) + (project.externalWorkloadEngaged || 0);
    return engaged > 0 ? Math.round((consumed / engaged) * 100) : 0;
};


const ProjectsWorkload: React.FC = () => {
    const { projects, lastCsvImportDate } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>({ key: 'projectId', direction: 'ascending' });

    const totalStats = useMemo(() => {
        return projects.reduce((acc, p) => {
            acc.intReq += p.internalWorkloadRequested || 0;
            acc.intEng += p.internalWorkloadEngaged || 0;
            acc.intCon += p.internalWorkloadConsumed || 0;
            acc.extReq += p.externalWorkloadRequested || 0;
            acc.extEng += p.externalWorkloadEngaged || 0;
            acc.extCon += p.externalWorkloadConsumed || 0;
            return acc;
        }, { intReq: 0, intEng: 0, intCon: 0, extReq: 0, extEng: 0, extCon: 0 });
    }, [projects]);
    
    const sortedProjects = useMemo(() => {
        let sortableItems = [...projects].filter(project =>
            searchTerm === '' ||
            project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.projectId.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue: string | number | undefined;
                let bValue: string | number | undefined;
                
                if (sortConfig.key === 'totalProgress') {
                    aValue = getProjectProgress(a);
                    bValue = getProjectProgress(b);
                } else {
                    aValue = a[sortConfig.key as keyof Project] as (string | number | undefined);
                    bValue = b[sortConfig.key as keyof Project] as (string | number | undefined);
                }

                const valA = aValue ?? (typeof aValue === 'number' ? -Infinity : '');
                const valB = bValue ?? (typeof bValue === 'number' ? -Infinity : '');
                
                let comparison = 0;
                if (typeof valA === 'number' && typeof valB === 'number') {
                    comparison = valA - valB;
                } else {
                    comparison = String(valA).localeCompare(String(valB), 'fr', { numeric: true, sensitivity: 'base' });
                }

                return sortConfig.direction === 'ascending' ? comparison : -comparison;
            });
        }
        return sortableItems;
    }, [projects, searchTerm, sortConfig]);

    const requestSort = (key: SortKey) => {
        let direction: SortDirection = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const renderSortArrow = (key: SortKey) => {
        if (sortConfig?.key === key) {
            return sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
        }
        return null;
    };
    
    const headers: { key: SortKey, label: string }[] = [
        { key: 'projectId', label: 'ID Projet' },
        { key: 'title', label: 'Titre' },
        { key: 'internalWorkloadRequested', label: 'Int. Demandée' },
        { key: 'internalWorkloadEngaged', label: 'Int. Engagée' },
        { key: 'internalWorkloadConsumed', label: 'Int. Consommée' },
        { key: 'externalWorkloadRequested', label: 'Ext. Demandée' },
        { key: 'externalWorkloadEngaged', label: 'Ext. Engagée' },
        { key: 'externalWorkloadConsumed', label: 'Ext. Consommée' },
        { key: 'totalProgress', label: 'Avancement Total' },
    ];
    
    const totalEngaged = totalStats.intEng + totalStats.extEng;
    const totalConsumed = totalStats.intCon + totalStats.extCon;
    const totalProgress = totalEngaged > 0 ? Math.round((totalConsumed / totalEngaged) * 100) : 0;

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <h1 className="text-3xl font-bold text-slate-800">Vue des charges projets (J/H)</h1>
                {lastCsvImportDate && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        <Info size={14} />
                        <span>Données mises à jour le {new Date(lastCsvImportDate).toLocaleString('fr-FR')}</span>
                    </div>
                )}
            </div>

            <Card>
                <CardHeader><CardTitle>Totaux des Charges</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div><p className="text-sm text-slate-500">Int. Demandée</p><p className="text-lg font-bold">{formatJH(totalStats.intReq)}</p></div>
                    <div><p className="text-sm text-slate-500">Int. Engagée</p><p className="text-lg font-bold">{formatJH(totalStats.intEng)}</p></div>
                    <div><p className="text-sm text-slate-500">Int. Consommée</p><p className="text-lg font-bold">{formatJH(totalStats.intCon)}</p></div>
                    <div><p className="text-sm text-slate-500">Avancement Total</p><p className="text-lg font-bold text-blue-600">{totalProgress}%</p></div>
                    <div><p className="text-sm text-slate-500">Ext. Demandée</p><p className="text-lg font-bold">{formatJH(totalStats.extReq)}</p></div>
                    <div><p className="text-sm text-slate-500">Ext. Engagée</p><p className="text-lg font-bold">{formatJH(totalStats.extEng)}</p></div>
                    <div><p className="text-sm text-slate-500">Ext. Consommée</p><p className="text-lg font-bold">{formatJH(totalStats.extCon)}</p></div>
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
                                    {headers.map(header => (
                                        <th key={header.key} scope="col" className="px-6 py-3 cursor-pointer whitespace-nowrap" onClick={() => requestSort(header.key)}>
                                            {header.label} {renderSortArrow(header.key)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sortedProjects.map(project => {
                                    const progress = getProjectProgress(project);
                                    return (
                                    <tr key={project.id} className="bg-white border-b hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-900">{project.projectId}</td>
                                        <td className="px-6 py-4">{project.title}</td>
                                        <td className="px-6 py-4">{formatJH(project.internalWorkloadRequested)}</td>
                                        <td className="px-6 py-4">{formatJH(project.internalWorkloadEngaged)}</td>
                                        <td className="px-6 py-4">{formatJH(project.internalWorkloadConsumed)}</td>
                                        <td className="px-6 py-4">{formatJH(project.externalWorkloadRequested)}</td>
                                        <td className="px-6 py-4">{formatJH(project.externalWorkloadEngaged)}</td>
                                        <td className="px-6 py-4">{formatJH(project.externalWorkloadConsumed)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-full bg-slate-200 rounded-full h-2.5 min-w-[50px]">
                                                    <div className={`${progress > 100 ? 'bg-red-600' : 'bg-blue-600'} h-2.5 rounded-full`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                                </div>
                                                <span className="font-semibold">{progress}%</span>
                                            </div>
                                        </td>
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