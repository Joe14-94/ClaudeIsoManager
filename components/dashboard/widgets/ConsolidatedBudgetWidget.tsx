
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { useData } from '../../../contexts/DataContext';
import { CircleDollarSign, Info, PieChart } from 'lucide-react';
import Tooltip from '../../ui/Tooltip';

const formatCurrency = (value?: number): string => {
    if (value === undefined || value === null || isNaN(value)) return '0 €';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
};

const ConsolidatedBudgetWidget: React.FC<{ isEditMode?: boolean }> = ({ isEditMode }) => {
    const { projects, lastCsvImportDate } = useData();
    const navigate = useNavigate();

    const { totals, grandTotal, consumptionRate } = useMemo(() => {
        const uoPattern = /^([a-zA-Z]+|\d+)\.\d+\.\d+\.\d+$/;
        // Filtre des projets "valides" pour les sommes (exclut TOTAL_GENERAL)
        const validProjects = projects.filter(p => !uoPattern.test(p.projectId) && p.projectId !== 'TOTAL_GENERAL');
        
        // Recherche du projet spécial contenant les totaux généraux (Import FDR)
        const totalGeneralProject = projects.find(p => p.projectId === 'TOTAL_GENERAL');
        
        const initial = {
            requested: 0,
            approved: 0,
            committed: 0,
            validatedPO: 0,
            completedPV: 0,
            forecastedPO: 0
        };
        
        const sums = validProjects.reduce((acc, p) => {
            acc.requested += p.budgetRequested || 0;
            acc.approved += p.budgetApproved || 0;
            acc.committed += p.budgetCommitted || 0;
            acc.validatedPO += p.validatedPurchaseOrders || 0;
            acc.completedPV += p.completedPV || 0;
            acc.forecastedPO += p.forecastedPurchaseOrders || 0;
            return acc;
        }, initial);
        
        let calculatedGrandTotal = { ...sums };

        // Si le projet "TOTAL_GENERAL" existe, on utilise ses valeurs pour la ligne "TOTAL GLOBAL"
        // Cela permet de voir l'écart éventuel entre la somme des lignes et le total officiel du fichier importé
        if (totalGeneralProject) {
            calculatedGrandTotal = {
                requested: totalGeneralProject.budgetRequested || 0,
                approved: totalGeneralProject.budgetApproved || 0,
                committed: totalGeneralProject.budgetCommitted || 0,
                validatedPO: totalGeneralProject.validatedPurchaseOrders || 0,
                completedPV: totalGeneralProject.completedPV || 0,
                forecastedPO: totalGeneralProject.forecastedPurchaseOrders || 0,
            };
        }

        // Taux de consommation global (Réalisé / Accordé)
        // On privilégie le total général s'il existe pour le KPI
        const baseApproved = calculatedGrandTotal.approved > 0 ? calculatedGrandTotal.approved : sums.approved;
        const baseCompleted = calculatedGrandTotal.completedPV > 0 ? calculatedGrandTotal.completedPV : sums.completedPV;
        
        const rate = baseApproved > 0 ? (baseCompleted / baseApproved) * 100 : 0;

        return { totals: sums, grandTotal: calculatedGrandTotal, consumptionRate: rate };
    }, [projects]);
    
    const handleCardClick = () => {
        if (!isEditMode) {
            navigate('/projects-budget');
        }
    };

    const availableBudget = totals.approved - totals.committed;
    const globalAvailableBudget = grandTotal.approved - grandTotal.committed;

    return (
        <div className={`h-full w-full flex flex-col ${!isEditMode ? 'cursor-pointer' : ''}`} onClick={handleCardClick}>
            <CardHeader className="non-draggable">
                <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center gap-2">
                        <CircleDollarSign size={20} />
                        Synthèse Budgétaire (€)
                    </CardTitle>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md text-xs font-bold border border-emerald-200">
                            <PieChart size={14} />
                            <span>Conso : {consumptionRate.toFixed(1)}%</span>
                        </div>
                        {lastCsvImportDate && (
                            <Tooltip text={`Données FDR mises à jour le ${new Date(lastCsvImportDate).toLocaleDateString('fr-FR')}`}>
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                    <Info size={14} />
                                </div>
                            </Tooltip>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
                <div className="w-full text-center text-xs sm:text-sm">
                    {/* Main Headers */}
                    <div className="grid grid-cols-6 gap-2 font-bold text-slate-700 mb-2 text-xs uppercase tracking-wide">
                        <div className="col-span-1">Demandé</div>
                        <div className="col-span-1">Accordé</div>
                        <div className="col-span-1">Engagé</div>
                        <div className="col-span-1">DA Validées</div>
                        <div className="col-span-1">Réalisé (PV)</div>
                        <div className="col-span-1">Disponible</div>
                    </div>
                    
                    {/* Somme des projets */}
                    <div className="grid grid-cols-6 gap-2 items-center mb-4">
                        <div className="bg-slate-100 p-2 rounded font-medium text-slate-600" title="Budget Demandé">{formatCurrency(totals.requested)}</div>
                        <div className="bg-blue-100 p-2 rounded font-bold text-blue-800" title="Budget Accordé">{formatCurrency(totals.approved)}</div>
                        <div className="bg-indigo-50 p-2 rounded font-semibold text-indigo-700" title="Budget Engagé">{formatCurrency(totals.committed)}</div>
                        <div className="bg-slate-50 p-2 rounded text-slate-600" title="DA Validées">{formatCurrency(totals.validatedPO)}</div>
                        <div className="bg-green-100 p-2 rounded font-bold text-green-800" title="Réalisé (PV)">{formatCurrency(totals.completedPV)}</div>
                        <div className={`p-2 rounded font-bold border ${availableBudget >= 0 ? 'bg-white text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`} title="Accordé - Engagé">
                            {formatCurrency(availableBudget)}
                        </div>
                    </div>

                    {/* LIGNE TOTAL GLOBAL (FDR) */}
                    <div className="mt-4 pt-3 border-t-2 border-slate-200">
                        <div className="flex justify-between items-center mb-2">
                            <div className="font-bold text-left text-slate-800 text-xs uppercase tracking-wide flex items-center gap-2">
                                TOTAL GLOBAL
                                <span className="text-[10px] font-normal text-slate-500 normal-case">(Import FDR)</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-6 gap-2 items-center">
                            <div className="bg-slate-700 text-white p-2 rounded font-medium opacity-80">{formatCurrency(grandTotal.requested)}</div>
                            <div className="bg-blue-800 text-white p-2 rounded font-bold border border-blue-600">{formatCurrency(grandTotal.approved)}</div>
                            <div className="bg-indigo-800 text-white p-2 rounded font-semibold border border-indigo-600">{formatCurrency(grandTotal.committed)}</div>
                            <div className="bg-slate-600 text-white p-2 rounded opacity-80">{formatCurrency(grandTotal.validatedPO)}</div>
                            <div className="bg-green-800 text-white p-2 rounded font-bold border border-green-600">{formatCurrency(grandTotal.completedPV)}</div>
                            <div className={`p-2 rounded font-bold text-white border-2 ${globalAvailableBudget >= 0 ? 'bg-green-700 border-green-500' : 'bg-red-700 border-red-500'}`}>
                                {formatCurrency(globalAvailableBudget)}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </div>
    );
};

export default ConsolidatedBudgetWidget;
