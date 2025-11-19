
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
            moaIntReq: 0, moaIntCon: 0,
            moaExtReq: 0, moaExtCon: 0,
            moeIntReq: 0, moeIntCon: 0,
            moeExtReq: 0, moeExtCon: 0,
        };
        
        const sums = validProjects.reduce((acc, p) => {
            acc.moaIntReq += p.moaInternalWorkloadRequested || 0;
            acc.moaIntCon += p.moaInternalWorkloadConsumed || 0;
            acc.moaExtReq += p.moaExternalWorkloadRequested || 0;
            acc.moaExtCon += p.moaExternalWorkloadConsumed || 0;
            acc.moeIntReq += p.moeInternalWorkloadRequested || 0;
            acc.moeIntCon += p.moeInternalWorkloadConsumed || 0;
            acc.moeExtReq += p.moeExternalWorkloadRequested || 0;
            acc.moeExtCon += p.moeExternalWorkloadConsumed || 0;
            return acc;
        }, initial);
        
        const splitTotals = {
            moa: {
                intReq: sums.moaIntReq,
                intCon: sums.moaIntCon,
                extReq: sums.moaExtReq,
                extCon: sums.moaExtCon,
            },
            moe: {
                intReq: sums.moeIntReq,
                intCon: sums.moeIntCon,
                extReq: sums.moeExtReq,
                extCon: sums.moeExtCon,
            },
            total: {
                intReq: sums.moaIntReq + sums.moeIntReq,
                intCon: sums.moaIntCon + sums.moeIntCon,
                extReq: sums.moaExtReq + sums.moeExtReq,
                extCon: sums.moaExtCon + sums.moeExtCon,
            }
        };

        let calculatedGrandTotal = {
            moaReq: splitTotals.moa.intReq + splitTotals.moa.extReq,
            moaCon: splitTotals.moa.intCon + splitTotals.moa.extCon,
            moeReq: splitTotals.moe.intReq + splitTotals.moe.extReq,
            moeCon: splitTotals.moe.intCon + splitTotals.moe.extCon,
            totalReq: splitTotals.total.intReq + splitTotals.total.extReq,
            totalCon: splitTotals.total.intCon + splitTotals.total.extCon,
        };

        // Si le projet "TOTAL_GENERAL" existe, on utilise ses valeurs pour les totaux globaux.
        // L'import FDR place toutes les données dans les champs MOE (Interne = MOE Int, Externe = MOE Ext).
        // Donc pour le total général importé : 
        // Total Interne (MOA+MOE) se trouve dans moeInternalWorkload...
        // Total Externe (MOA+MOE) se trouve dans moeExternalWorkload...
        if (totalGeneralProject) {
            const p = totalGeneralProject;
            const importedTotalIntReq = p.moeInternalWorkloadRequested || 0;
            const importedTotalIntCon = p.moeInternalWorkloadConsumed || 0;
            const importedTotalExtReq = p.moeExternalWorkloadRequested || 0;
            const importedTotalExtCon = p.moeExternalWorkloadConsumed || 0;

            calculatedGrandTotal = {
                ...calculatedGrandTotal,
                // On écrase les totaux globaux avec ceux de la ligne "Total général"
                totalReq: importedTotalIntReq + importedTotalExtReq,
                totalCon: importedTotalIntCon + importedTotalExtCon,
            };
             // Note: On ne peut pas écraser précisément moaReq/moeReq car l'import ne distingue pas MOA/MOE sur la ligne Total Général
        }

        // Calcul du % EXT = (Total Externe Demandé / Total Global Demandé) * 100
        // Si TOTAL_GENERAL existe, on utilise ses valeurs pour plus de précision
        const percentExtCalcBase = totalGeneralProject 
            ? (totalGeneralProject.moeExternalWorkloadRequested || 0) 
            : splitTotals.total.extReq;
            
        const percentExtTotalBase = calculatedGrandTotal.totalReq;

        const percentExtCalc = percentExtTotalBase > 0 
            ? (percentExtCalcBase / percentExtTotalBase) * 100 
            : 0;

        return { totals: splitTotals, grandTotal: calculatedGrandTotal, percentExt: percentExtCalc };
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
                    <div className="grid grid-cols-12 gap-2 font-bold text-base">
                        <div className="col-span-4">MOA</div>
                        <div className="col-span-4">MOE</div>
                        <div className="col-span-4">TOTAL</div>
                    </div>
                    {/* Sub Headers */}
                    <div className="grid grid-cols-12 gap-2 mt-2 font-semibold text-slate-600 text-xs">
                        {/* MOA */}
                        <div className="col-span-2">Demandé</div>
                        <div className="col-span-2">Consommé</div>
                        {/* MOE */}
                        <div className="col-span-2">Demandé</div>
                        <div className="col-span-2">Consommé</div>
                        {/* TOTAL */}
                        <div className="col-span-2">Total Prévu</div>
                        <div className="col-span-2">Total Conso.</div>
                    </div>
                    
                    <div className="mt-4 border-t pt-2">
                        <div className="font-semibold text-left mb-1 text-slate-700 text-xs uppercase tracking-wide">Interne</div>
                        <div className="grid grid-cols-12 gap-2 items-center">
                            {/* MOA Interne */}
                            <div className="col-span-2 bg-sky-50 p-2 rounded font-bold text-sky-800">{formatJH(totals.moa.intReq)}</div>
                            <div className="col-span-2 bg-sky-100 p-2 rounded font-bold text-sky-800">{formatJH(totals.moa.intCon)}</div>
                            {/* MOE Interne */}
                            <div className="col-span-2 bg-sky-50 p-2 rounded font-bold text-sky-800">{formatJH(totals.moe.intReq)}</div>
                            <div className="col-span-2 bg-sky-100 p-2 rounded font-bold text-sky-800">{formatJH(totals.moe.intCon)}</div>
                            {/* TOTAL Interne */}
                            <div className="col-span-2 bg-blue-100 p-2 rounded font-bold text-blue-800">{formatJH(totals.total.intReq)}</div>
                            <div className="col-span-2 bg-blue-200 p-2 rounded font-bold text-blue-800">{formatJH(totals.total.intCon)}</div>
                        </div>
                    </div>

                    <div className="mt-2">
                        <div className="font-semibold text-left mb-1 text-slate-700 text-xs uppercase tracking-wide">Externe</div>
                         <div className="grid grid-cols-12 gap-2 items-center">
                            {/* MOA Externe */}
                            <div className="col-span-2 bg-indigo-50 p-2 rounded font-bold text-indigo-800">{formatJH(totals.moa.extReq)}</div>
                            <div className="col-span-2 bg-indigo-100 p-2 rounded font-bold text-indigo-800">{formatJH(totals.moa.extCon)}</div>
                            {/* MOE Externe */}
                            <div className="col-span-2 bg-indigo-50 p-2 rounded font-bold text-indigo-800">{formatJH(totals.moe.extReq)}</div>
                            <div className="col-span-2 bg-indigo-100 p-2 rounded font-bold text-indigo-800">{formatJH(totals.moe.extCon)}</div>
                            {/* TOTAL Externe */}
                            <div className="col-span-2 bg-purple-100 p-2 rounded font-bold text-purple-800">{formatJH(totals.total.extReq)}</div>
                            <div className="col-span-2 bg-purple-200 p-2 rounded font-bold text-purple-800">{formatJH(totals.total.extCon)}</div>
                        </div>
                    </div>

                    {/* LIGNE TOTAL GLOBAL */}
                    <div className="mt-4 pt-2 border-t-2 border-slate-300">
                        <div className="font-bold text-left mb-1 text-slate-800 text-xs uppercase tracking-wide">TOTAL GLOBAL</div>
                        <div className="grid grid-cols-12 gap-2 items-center">
                            {/* MOA Total (Somme calculée car pas de détail dans Total General) */}
                            <div className="col-span-2 bg-slate-700 text-white p-2 rounded font-bold">{formatJH(grandTotal.moaReq)}</div>
                            <div className="col-span-2 bg-slate-600 text-white p-2 rounded font-bold">{formatJH(grandTotal.moaCon)}</div>
                            {/* MOE Total (Somme calculée car pas de détail dans Total General) */}
                            <div className="col-span-2 bg-slate-700 text-white p-2 rounded font-bold">{formatJH(grandTotal.moeReq)}</div>
                            <div className="col-span-2 bg-slate-600 text-white p-2 rounded font-bold">{formatJH(grandTotal.moeCon)}</div>
                            {/* TOTAL Total (Peut provenir de la ligne Total Général) */}
                            <div className="col-span-2 bg-slate-800 text-white p-2 rounded font-extrabold border-2 border-slate-500">{formatJH(grandTotal.totalReq)}</div>
                            <div className="col-span-2 bg-slate-800 text-white p-2 rounded font-extrabold border-2 border-slate-500">{formatJH(grandTotal.totalCon)}</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </div>
    );
};

export default ConsolidatedWorkloadWidget;