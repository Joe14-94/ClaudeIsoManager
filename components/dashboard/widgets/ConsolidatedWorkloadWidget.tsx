
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { useData } from '../../../contexts/DataContext';
import { Timer, Info, PieChart } from 'lucide-react';
import Tooltip from '../../ui/Tooltip';

const formatJH = (value?: number): string => {
    if (value === undefined || value === null || isNaN(value)) return '0';
    return Math.round(value).toLocaleString('fr-FR');
};

const ConsolidatedWorkloadWidget: React.FC<{ isEditMode?: boolean }> = ({ isEditMode }) => {
    const { projects, lastCsvImportDate } = useData();
    const navigate = useNavigate();

    const { totals, grandTotal, percentExt } = useMemo(() => {
        const uoPattern = /^([a-zA-Z]+|\d+)\.\d+\.\d+\.\d+$/;
        // Filtre des projets "valides" pour les sommes (exclut TOTAL_GENERAL)
        const validProjects = projects.filter(p => !uoPattern.test(p.projectId) && p.projectId !== 'TOTAL_GENERAL');
        
        // Recherche du projet spécial contenant les totaux généraux
        const totalGeneralProject = projects.find(p => p.projectId === 'TOTAL_GENERAL');
        
        const initial = {
            intReq: 0, intCon: 0,
            extReq: 0, extCon: 0,
        };
        
        const sums = validProjects.reduce((acc, p) => {
            acc.intReq += p.internalWorkloadRequested || 0;
            acc.intCon += p.internalWorkloadConsumed || 0;
            acc.extReq += p.externalWorkloadRequested || 0;
            acc.extCon += p.externalWorkloadConsumed || 0;
            return acc;
        }, initial);
        
        let calculatedGrandTotal = {
            intReq: sums.intReq,
            intCon: sums.intCon,
            extReq: sums.extReq,
            extCon: sums.extCon,
            totalReq: sums.intReq + sums.extReq,
            totalCon: sums.intCon + sums.extCon,
        };

        // Si le projet "TOTAL_GENERAL" existe, on utilise ses valeurs pour les totaux globaux.
        // L'import place Interne dans internalWorkload et Externe dans externalWorkload
        if (totalGeneralProject) {
            const p = totalGeneralProject;
            calculatedGrandTotal = {
                intReq: p.internalWorkloadRequested || 0,
                intCon: p.internalWorkloadConsumed || 0,
                extReq: p.externalWorkloadRequested || 0,
                extCon: p.externalWorkloadConsumed || 0,
                totalReq: (p.internalWorkloadRequested || 0) + (p.externalWorkloadRequested || 0),
                totalCon: (p.internalWorkloadConsumed || 0) + (p.externalWorkloadConsumed || 0),
            };
        }

        // Calcul du % EXT = (Total Externe Demandé / Total Global Demandé) * 100
        const percentExtTotalBase = calculatedGrandTotal.totalReq;

        const percentExtCalc = percentExtTotalBase > 0 
            ? (calculatedGrandTotal.extReq / percentExtTotalBase) * 100 
            : 0;

        return { totals: sums, grandTotal: calculatedGrandTotal, percentExt: percentExtCalc };
    }, [projects]);
    
    const handleCardClick = () => {
        if (!isEditMode) {
            navigate('/projects-workload');
        }
    };

    return (
        <div className={`h-full w-full flex flex-col ${!isEditMode ? 'cursor-pointer' : ''}`} onClick={handleCardClick}>
            <CardHeader className="non-draggable">
                <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center gap-2">
                        <Timer size={20} />
                        Synthèse des charges (J/H)
                    </CardTitle>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md text-xs font-bold border border-indigo-200">
                            <PieChart size={14} />
                            <span>% EXT : {percentExt.toFixed(1)}%</span>
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
                    <div className="grid grid-cols-9 gap-2 font-bold text-base">
                        <div className="col-span-3">INTERNE</div>
                        <div className="col-span-3">EXTERNE</div>
                        <div className="col-span-3">TOTAL</div>
                    </div>
                    {/* Sub Headers */}
                    <div className="grid grid-cols-9 gap-2 mt-2 font-semibold text-slate-600 text-xs">
                        {/* Interne */}
                        <div className="col-span-1">Demandé</div>
                        <div className="col-span-2">Consommé</div>
                        {/* Externe */}
                        <div className="col-span-1">Demandé</div>
                        <div className="col-span-2">Consommé</div>
                        {/* TOTAL */}
                        <div className="col-span-1">Prévu</div>
                        <div className="col-span-2">Conso.</div>
                    </div>
                    
                    <div className="mt-4 pt-2 border-t">
                        <div className="font-semibold text-left mb-1 text-slate-700 text-xs uppercase tracking-wide">Cumul Projets</div>
                        <div className="grid grid-cols-9 gap-2 items-center">
                            {/* Interne */}
                            <div className="col-span-1 bg-sky-50 p-2 rounded font-bold text-sky-800">{formatJH(totals.intReq)}</div>
                            <div className="col-span-2 bg-sky-100 p-2 rounded font-bold text-sky-800">{formatJH(totals.intCon)}</div>
                            {/* Externe */}
                            <div className="col-span-1 bg-indigo-50 p-2 rounded font-bold text-indigo-800">{formatJH(totals.extReq)}</div>
                            <div className="col-span-2 bg-indigo-100 p-2 rounded font-bold text-indigo-800">{formatJH(totals.extCon)}</div>
                            {/* TOTAL */}
                            <div className="col-span-1 bg-blue-100 p-2 rounded font-bold text-blue-800">{formatJH(totals.intReq + totals.extReq)}</div>
                            <div className="col-span-2 bg-blue-200 p-2 rounded font-bold text-blue-800">{formatJH(totals.intCon + totals.extCon)}</div>
                        </div>
                    </div>

                    {/* LIGNE TOTAL GLOBAL */}
                    <div className="mt-4 pt-2 border-t-2 border-slate-300">
                        <div className="font-bold text-left mb-1 text-slate-800 text-xs uppercase tracking-wide">TOTAL GLOBAL (Import FDR)</div>
                        <div className="grid grid-cols-9 gap-2 items-center">
                            {/* Interne Total */}
                            <div className="col-span-1 bg-slate-700 text-white p-2 rounded font-bold">{formatJH(grandTotal.intReq)}</div>
                            <div className="col-span-2 bg-slate-600 text-white p-2 rounded font-bold">{formatJH(grandTotal.intCon)}</div>
                            {/* Externe Total */}
                            <div className="col-span-1 bg-slate-700 text-white p-2 rounded font-bold">{formatJH(grandTotal.extReq)}</div>
                            <div className="col-span-2 bg-slate-600 text-white p-2 rounded font-bold">{formatJH(grandTotal.extCon)}</div>
                            {/* TOTAL Total */}
                            <div className="col-span-1 bg-slate-800 text-white p-2 rounded font-extrabold border-2 border-slate-500">{formatJH(grandTotal.totalReq)}</div>
                            <div className="col-span-2 bg-slate-800 text-white p-2 rounded font-extrabold border-2 border-slate-500">{formatJH(grandTotal.totalCon)}</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </div>
    );
};

export default ConsolidatedWorkloadWidget;
