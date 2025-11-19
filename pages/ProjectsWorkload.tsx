
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Project } from '../types';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Search, ArrowUp, ArrowDown, Info } from 'lucide-react';

type SortKey = 'projectId' | 'title' | 'totalWorkloadEngaged' | 'totalWorkloadConsumed' | 'totalProgress';
type SortDirection = 'ascending' | 'descending';

const formatJH = (value?: number) => {
    if (value === undefined || value === null || isNaN(value)) return 'N/A';
    return `${Math.round(value)} J/H`;
};

const getProjectProgress = (project: Project): number => {
    const consumed = (project.moaInternalWorkloadConsumed || 0) + (project.moaExternalWorkloadConsumed || 0) + (project.moeInternalWorkloadConsumed || 0) + (project.moeExternalWorkloadConsumed || 0);
    const engaged = (project.moaInternalWorkloadEngaged || 0) + (project.moaExternalWorkloadEngaged || 0) + (project.moeInternalWorkloadEngaged || 0) + (project.moeExternalWorkloadEngaged || 0);
    return engaged > 0 ? Math.round((consumed / engaged) * 100) : 0;
};


const ProjectsWorkload: React.FC = () => {
    const { projects, lastCsvImportDate } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>({ key: 'projectId', direction: 'ascending' });

    const totalStats = useMemo(() => {
        const uoPattern = /^([a-zA-Z]+|\d+)\.\d+\.\d+\.\d+$/;
        // Exclure TOTAL_GENERAL
        const validProjects = projects.filter(p => !uoPattern.test(p.projectId) && p.projectId !== 'TOTAL_GENERAL');
        return validProjects.reduce((acc, p) => {
            acc.moaIntEng += p.moaInternalWorkloadEngaged || 0;
            acc.moaIntCon += p.moaInternalWorkloadConsumed || 0;
            acc.moaExtEng += p.moaExternalWorkloadEngaged || 0;
            acc.moaExtCon += p.moaExternalWorkloadConsumed || 0;
            acc.moeIntEng += p.moeInternalWorkloadEngaged || 0;
            acc.moeIntCon += p.moeInternalWorkloadConsumed || 0;
            acc.moeExtEng += p.moeExternalWorkloadEngaged || 0;
            acc.moeExtCon += p.moeExternalWorkloadConsumed || 0;
            return acc;
        }, { moaIntEng: 0, moaIntCon: 0, moaExtEng: 0, moaExtCon: 0, moeIntEng: 0, moeIntCon: 0, moeExtEng: 0, moeExtCon: 0 });
    }, [projects]);
    
    const sortedProjects = useMemo(() => {
        const uoPattern = /^([a-zA-Z]+|\d+)\.\d+\.\d+\.\d+$/;
        // Exclure TOTAL_GENERAL de la liste
        let sortableItems = [...projects].filter(project =>
            !uoPattern.test(project.projectId) &&
            project.projectId !== 'TOTAL_GENERAL' &&
            (searchTerm === '' ||
            project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.projectId.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue: string | number | undefined;
                let bValue: string | number | undefined;
                
                if (sortConfig.key === 'totalProgress') {
                    aValue = getProjectProgress(a);
                    bValue = getProjectProgress(b);
                } else if (sortConfig.key === 'totalWorkloadEngaged') {
                    aValue = (a.moaInternalWorkloadEngaged || 0) + (a.moaExternalWorkloadEngaged || 0) + (a.moeInternalWorkloadEngaged || 0) + (a.moeExternalWorkloadEngaged || 0);
                    bValue = (b.moaInternalWorkloadEngaged || 0) + (b.moaExternalWorkloadEngaged || 0) + (b.moeInternalWorkloadEngaged || 0) + (b.moeExternalWorkloadEngaged || 0);
                } else if (sortConfig.key === 'totalWorkloadConsumed') {
                    aValue = (a.moaInternalWorkloadConsumed || 0) + (a.moaExternalWorkloadConsumed || 0) + (a.moeInternalWorkloadConsumed || 0) + (a.moeExternalWorkloadConsumed || 0);
                    bValue = (b.moaInternalWorkloadConsumed || 0) + (b.moaExternalWorkloadConsumed || 0) + (b.moeInternalWorkloadConsumed || 0) + (b.moeExternalWorkloadConsumed || 0);
                }
                 else {
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
        { key: 'totalWorkloadEngaged', label: 'Total Engagé' },
        { key: 'totalWorkloadConsumed', label: 'Total Consommé' },
        { key: 'totalProgress', label: 'Avancement Total' },
    ];
    
    const totalEngaged = totalStats.moaIntEng + totalStats.moaExtEng + totalStats.moeIntEng + totalStats.moeExtEng;
    const totalConsumed = totalStats.moaIntCon + totalStats.moaExtCon + totalStats.moeIntCon + totalStats.moeExtCon;
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
                    <div><p className="text-sm text-slate-500">Total MOA Engagé</p><p className="text-lg font-bold">{formatJH(totalStats.moaIntEng + totalStats.moaExtEng)}</p></div>
                    <div><p className="text-sm text-slate-500">Total MOA Consommé</p><p className="text-lg font-bold">{formatJH(totalStats.moaIntCon + totalStats.moaExtCon)}</p></div>
                    <div><p className="text-sm text-slate-500">Total MOE Engagé</p><p className="text-lg font-bold">{formatJH(totalStats.moeIntEng + totalStats.moeExtEng)}</p></div>
                    <div><p className="text-sm text-slate-500">Total MOE Consommé</p><p className="text-lg font-bold">{formatJH(totalStats.moeIntCon + totalStats.moeExtCon)}</p></div>
                    <div className="md:col-span-2"><p className="text-sm text-slate-500">Total Engagé (Global)</p><p className="text-xl font-bold">{formatJH(totalEngaged)}</p></div>
                    <div className="md:col-span-2"><p className="text-sm text-slate-500">Total Consommé (Global)</p><p className="text-xl font-bold">{formatJH(totalConsumed)}</p></div>
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
                                    <th className="px-6 py-3 text-center" colSpan={2}>Détail MOA</th>
                                    <th className="px-6 py-3 text-center" colSpan={2}>Détail MOE</th>
                                </tr>
                                <tr className="text-xs bg-slate-100">
                                    <th colSpan={5}></th>
                                    <th className="px-2 py-2 font-medium">Int.</th>
                                    <th className="px-2 py-2 font-medium">Ext.</th>
                                    <th className="px-2 py-2 font-medium">Int.</th>
                                    <th className="px-2 py-2 font-medium">Ext.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedProjects.map(project => {
                                    const progress = getProjectProgress(project);
                                    const totalEngaged = (project.moaInternalWorkloadEngaged || 0) + (project.moaExternalWorkloadEngaged || 0) + (project.moeInternalWorkloadEngaged || 0) + (project.moeExternalWorkloadEngaged || 0);
                                    const totalConsumed = (project.moaInternalWorkloadConsumed || 0) + (project.moaExternalWorkloadConsumed || 0) + (project.moeInternalWorkloadConsumed || 0) + (project.moeExternalWorkloadConsumed || 0);
                                    
                                    return (
                                    <tr key={project.id} className="bg-white border-b hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-900">{project.projectId}</td>
                                        <td className="px-6 py-4">{project.title}</td>
                                        <td className="px-6 py-4">{formatJH(totalEngaged)}</td>
                                        <td className="px-6 py-4">{formatJH(totalConsumed)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-full bg-slate-200 rounded-full h-2.5 min-w-[50px]">
                                                    <div className={`${progress > 100 ? 'bg-red-600' : 'bg-blue-600'} h-2.5 rounded-full`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                                </div>
                                                <span className="font-semibold">{progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-2 py-4">{formatJH(project.moaInternalWorkloadConsumed)}</td>
                                        <td className="px-2 py-4">{formatJH(project.moaExternalWorkloadConsumed)}</td>
                                        <td className="px-2 py-4">{formatJH(project.moeInternalWorkloadConsumed)}</td>
                                        <td className="px-2 py-4">{formatJH(project.moeExternalWorkloadConsumed)}</td>
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