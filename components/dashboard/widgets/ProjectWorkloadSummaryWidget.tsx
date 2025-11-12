import React, { useMemo } from 'react';
import { CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { useData } from '../../../contexts/DataContext';
import { Info } from 'lucide-react';

const formatJH = (value?: number) => {
    if (value === undefined || value === null || isNaN(value)) return 'N/A';
    return `${Math.round(value)} J/H`;
};

const ProjectWorkloadSummaryWidget: React.FC = () => {
    const { projects, lastCsvImportDate } = useData();

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
    
    const totalEngaged = totalStats.intEng + totalStats.extEng;
    const totalConsumed = totalStats.intCon + totalStats.extCon;
    const totalProgress = totalEngaged > 0 ? Math.round((totalConsumed / totalEngaged) * 100) : 0;

    return (
        <div className="h-full w-full flex flex-col">
            <CardHeader className="non-draggable">
                 <div className="flex justify-between items-start">
                    <CardTitle>Résumé des charges projets</CardTitle>
                    {lastCsvImportDate && (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Info size={14} />
                            <span>MàJ: {new Date(lastCsvImportDate).toLocaleDateString('fr-FR')}</span>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-around">
                <div className="text-center">
                    <p className="text-sm text-slate-500">Charge totale engagée</p>
                    <p className="text-2xl font-bold text-slate-800">{formatJH(totalEngaged)}</p>
                </div>
                 <div className="text-center">
                    <p className="text-sm text-slate-500">Charge totale consommée</p>
                    <p className="text-2xl font-bold text-slate-800">{formatJH(totalConsumed)}</p>
                </div>
                 <div className="text-center">
                    <p className="text-sm text-slate-500">Avancement global</p>
                    <p className="text-2xl font-bold text-blue-600">{totalProgress}%</p>
                </div>
            </CardContent>
        </div>
    );
};

export default ProjectWorkloadSummaryWidget;