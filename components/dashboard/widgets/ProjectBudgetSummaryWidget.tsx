import React, { useMemo } from 'react';
import { CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { useData } from '../../../contexts/DataContext';

const formatCurrency = (value?: number) => {
    if (value === undefined || value === null || isNaN(value)) return 'N/A';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

const ProjectBudgetSummaryWidget: React.FC = () => {
    const { projects } = useData();

    const totalStats = useMemo(() => {
        return projects.reduce((acc, p) => {
            acc.requested += p.budgetRequested || 0;
            acc.approved += p.budgetApproved || 0;
            acc.committed += p.budgetCommitted || 0;
            return acc;
        }, { requested: 0, approved: 0, committed: 0 });
    }, [projects]);
    
    return (
        <div className="h-full w-full flex flex-col">
            <CardHeader className="non-draggable">
                <CardTitle>Résumé budgétaire des projets</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-around">
                <div className="text-center">
                    <p className="text-sm text-slate-500">Demandé</p>
                    <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalStats.requested)}</p>
                </div>
                <div className="text-center">
                    <p className="text-sm text-slate-500">Accordé</p>
                    <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalStats.approved)}</p>
                </div>
                 <div className="text-center">
                    <p className="text-sm text-slate-500">Engagé</p>
                    <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalStats.committed)}</p>
                </div>
            </CardContent>
        </div>
    );
};

export default ProjectBudgetSummaryWidget;
