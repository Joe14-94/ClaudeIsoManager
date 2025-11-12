import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Project } from '../types';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Search, ArrowUp, ArrowDown, Info } from 'lucide-react';

type SortKey = 'projectId' | 'title' | 'budgetRequested' | 'budgetApproved' | 'budgetCommitted' | 'validatedPurchaseOrders' | 'completedPV' | 'forecastedPurchaseOrders';
type SortDirection = 'ascending' | 'descending';

const formatCurrency = (value?: number) => {
    if (value === undefined || value === null || isNaN(value)) return 'N/A';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

const ProjectsBudget: React.FC = () => {
    const { projects, lastCsvImportDate } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>({ key: 'projectId', direction: 'ascending' });

    const totalStats = useMemo(() => {
        return projects.reduce((acc, p) => {
            acc.requested += p.budgetRequested || 0;
            acc.approved += p.budgetApproved || 0;
            acc.committed += p.budgetCommitted || 0;
            acc.validatedPO += p.validatedPurchaseOrders || 0;
            acc.completedPV += p.completedPV || 0;
            acc.forecastedPO += p.forecastedPurchaseOrders || 0;
            return acc;
        }, { requested: 0, approved: 0, committed: 0, validatedPO: 0, completedPV: 0, forecastedPO: 0 });
    }, [projects]);
    
    const sortedProjects = useMemo(() => {
        let sortableItems = [...projects].filter(project =>
            searchTerm === '' ||
            project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.projectId.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key as keyof Project] as (string | number | undefined);
                const bValue = b[sortConfig.key as keyof Project] as (string | number | undefined);

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
        { key: 'budgetRequested', label: 'Demandé' },
        { key: 'budgetApproved', label: 'Accordé' },
        { key: 'budgetCommitted', label: 'Engagé' },
        { key: 'validatedPurchaseOrders', label: 'DA Validées' },
        { key: 'completedPV', label: 'Réalisé (PV)' },
        { key: 'forecastedPurchaseOrders', label: 'DA Prévues' },
    ];

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <h1 className="text-3xl font-bold text-slate-800">Vue budgétaire des projets</h1>
                 {lastCsvImportDate && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        <Info size={14} />
                        <span>Données mises à jour le {new Date(lastCsvImportDate).toLocaleString('fr-FR')}</span>
                    </div>
                )}
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Totaux Budgétaires</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
                    <div><p className="text-sm text-slate-500">Demandé</p><p className="text-lg font-bold">{formatCurrency(totalStats.requested)}</p></div>
                    <div><p className="text-sm text-slate-500">Accordé</p><p className="text-lg font-bold">{formatCurrency(totalStats.approved)}</p></div>
                    <div><p className="text-sm text-slate-500">Engagé</p><p className="text-lg font-bold">{formatCurrency(totalStats.committed)}</p></div>
                    <div><p className="text-sm text-slate-500">DA Validées</p><p className="text-lg font-bold">{formatCurrency(totalStats.validatedPO)}</p></div>
                    <div><p className="text-sm text-slate-500">Réalisé (PV)</p><p className="text-lg font-bold">{formatCurrency(totalStats.completedPV)}</p></div>
                    <div><p className="text-sm text-slate-500">DA Prévues</p><p className="text-lg font-bold">{formatCurrency(totalStats.forecastedPO)}</p></div>
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
                                        <th key={header.key} scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort(header.key)}>
                                            {header.label} {renderSortArrow(header.key)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sortedProjects.map(project => (
                                    <tr key={project.id} className="bg-white border-b hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-900">{project.projectId}</td>
                                        <td className="px-6 py-4">{project.title}</td>
                                        <td className="px-6 py-4">{formatCurrency(project.budgetRequested)}</td>
                                        <td className="px-6 py-4">{formatCurrency(project.budgetApproved)}</td>
                                        <td className="px-6 py-4">{formatCurrency(project.budgetCommitted)}</td>
                                        <td className="px-6 py-4">{formatCurrency(project.validatedPurchaseOrders)}</td>
                                        <td className="px-6 py-4">{formatCurrency(project.completedPV)}</td>
                                        <td className="px-6 py-4">{formatCurrency(project.forecastedPurchaseOrders)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {sortedProjects.length === 0 && <div className="text-center py-8 text-slate-500">Aucun projet ne correspond à vos critères.</div>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
export default ProjectsBudget;