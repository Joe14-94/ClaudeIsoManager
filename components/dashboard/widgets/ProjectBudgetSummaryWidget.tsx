
import React, { useMemo } from 'react';
import { CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { useData } from '../../../contexts/DataContext';
import { Info, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Tooltip from '../../ui/Tooltip';

const formatCurrency = (value?: number): string => {
    if (value === undefined || value === null || isNaN(value)) return '0 €';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
};

const ProgressBar: React.FC<{ value: number, max: number, colorClass: string, label: string, subLabel: string }> = ({ value, max, colorClass, label, subLabel }) => {
    const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    const isOver = value > max && max > 0;
    
    return (
        <div className="w-full">
            <div className="flex justify-between items-end mb-1">
                <span className="text-sm font-medium text-slate-700">{label}</span>
                <div className="text-right">
                    <span className={`text-sm font-bold ${isOver ? 'text-red-400' : 'text-slate-800'}`}>{formatCurrency(value)}</span>
                    <span className="text-xs text-slate-500 ml-1">/ {formatCurrency(max)}</span>
                </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden relative">
                <div 
                    className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-300' : colorClass}`} 
                    style={{ width: `${percentage}%` }}
                ></div>
                {isOver && (
                     <div className="absolute top-0 bottom-0 right-0 w-1 bg-red-400 animate-pulse"></div>
                )}
            </div>
            <p className="text-xs text-slate-500 mt-1 text-right">{subLabel}: {isOver ? <span className="text-red-400 font-bold">Dépassement</span> : <span className="text-emerald-500 font-medium">{Math.round(percentage)}%</span>}</p>
        </div>
    );
};

const ProjectBudgetSummaryWidget: React.FC = () => {
    const { projects, lastCsvImportDate } = useData();

    const stats = useMemo(() => {
        return projects.reduce((acc, p) => {
            // Exclure TOTAL_GENERAL pour éviter les doublons si présent
            if (p.projectId === 'TOTAL_GENERAL') return acc;
            
            acc.requested += p.budgetRequested || 0;
            acc.approved += p.budgetApproved || 0;
            acc.committed += p.budgetCommitted || 0;
            acc.completedPV += p.completedPV || 0;
            return acc;
        }, { requested: 0, approved: 0, committed: 0, completedPV: 0 });
    }, [projects]);
    
    const consumptionRate = stats.approved > 0 ? (stats.committed / stats.approved) * 100 : 0;
    const realizationRate = stats.committed > 0 ? (stats.completedPV / stats.committed) * 100 : 0;

    return (
        <div className="h-full w-full flex flex-col">
            <CardHeader className="non-draggable pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="text-emerald-400" size={20} />
                        Synthèse Budgétaire
                    </CardTitle>
                    {lastCsvImportDate && (
                        <Tooltip text={`Données mises à jour le ${new Date(lastCsvImportDate).toLocaleDateString('fr-FR')}`}>
                            <Info size={16} className="text-slate-400 cursor-help" />
                        </Tooltip>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-center gap-6 py-2">
                
                <ProgressBar 
                    label="Consommation (Engagé vs Accordé)" 
                    value={stats.committed} 
                    max={stats.approved} 
                    colorClass="bg-blue-300"
                    subLabel="Taux d'engagement"
                />

                <ProgressBar 
                    label="Réalisation (PV vs Engagé)" 
                    value={stats.completedPV} 
                    max={stats.committed} 
                    colorClass="bg-emerald-300"
                    subLabel="Taux de facturation"
                />

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div className="bg-slate-50 p-2 rounded-lg text-center">
                         <p className="text-xs text-slate-500 mb-1">Budget Total Demandé</p>
                         <p className="font-bold text-slate-700">{formatCurrency(stats.requested)}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg text-center">
                         <p className="text-xs text-slate-500 mb-1">Budget Total Accordé</p>
                         <p className="font-bold text-slate-800 text-lg">{formatCurrency(stats.approved)}</p>
                    </div>
                </div>

            </CardContent>
        </div>
    );
};

export default ProjectBudgetSummaryWidget;
