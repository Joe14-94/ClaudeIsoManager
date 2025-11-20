
import React, { useMemo } from 'react';
import { CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { useData } from '../../../contexts/DataContext';
import { Info, Timer } from 'lucide-react';
import Tooltip from '../../ui/Tooltip';

const formatJH = (value?: number): string => {
    if (value === undefined || value === null || isNaN(value)) return '0';
    return Math.round(value).toLocaleString('fr-FR');
};

const CircularProgress: React.FC<{ value: number, label: string, subLabel: string, color: string }> = ({ value, label, subLabel, color }) => {
    const size = 100; 
    const strokeWidth = 8;
    const center = size / 2;
    const radius = (size - strokeWidth) / 2 - 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(value, 100);
    const dashoffset = circumference - (progress / 100) * circumference;
    
    return (
        <div className="flex flex-col items-center">
            <div className="relative w-20 h-20">
                <svg 
                    className="w-full h-full" 
                    viewBox={`0 0 ${size} ${size}`}
                >
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        className="text-slate-100"
                    />
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashoffset}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${center} ${center})`}
                        className="transition-all duration-1000 ease-out"
                    />
                    <text
                        x="50%"
                        y="50%"
                        dominantBaseline="central"
                        textAnchor="middle"
                        className="text-xl font-bold fill-slate-700"
                        style={{ fontSize: '24px' }}
                    >
                        {Math.round(value)}%
                    </text>
                </svg>
            </div>
            <p className="text-xs font-medium text-slate-600 mt-1">{label}</p>
            <p className="text-[10px] text-slate-400">{subLabel}</p>
        </div>
    );
};

const ProjectWorkloadSummaryWidget: React.FC = () => {
    const { projects, lastCsvImportDate } = useData();

    const stats = useMemo(() => {
        return projects.reduce((acc, p) => {
            if (p.projectId === 'TOTAL_GENERAL') return acc;

            acc.intEngaged += p.internalWorkloadEngaged || 0;
            acc.intConsumed += p.internalWorkloadConsumed || 0;
            
            acc.extEngaged += p.externalWorkloadEngaged || 0;
            acc.extConsumed += p.externalWorkloadConsumed || 0;
            
            return acc;
        }, { intEngaged: 0, intConsumed: 0, extEngaged: 0, extConsumed: 0 });
    }, [projects]);
    
    const totalEngaged = stats.intEngaged + stats.extEngaged;
    const totalConsumed = stats.intConsumed + stats.extConsumed;
    const totalProgress = totalEngaged > 0 ? (totalConsumed / totalEngaged) * 100 : 0;
    
    const intProgress = stats.intEngaged > 0 ? (stats.intConsumed / stats.intEngaged) * 100 : 0;
    const extProgress = stats.extEngaged > 0 ? (stats.extConsumed / stats.extEngaged) * 100 : 0;

    return (
        <div className="h-full w-full flex flex-col">
            <CardHeader className="non-draggable pb-2">
                 <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center gap-2">
                        <Timer className="text-blue-400" size={20} />
                        Synthèse Charges
                    </CardTitle>
                    {lastCsvImportDate && (
                        <Tooltip text={`Données mises à jour le ${new Date(lastCsvImportDate).toLocaleDateString('fr-FR')}`}>
                            <Info size={16} className="text-slate-400 cursor-help" />
                        </Tooltip>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-center gap-4">
                
                {/* Global Progress Bar */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="text-sm font-semibold text-slate-700">Avancement Global</span>
                        <span className="text-lg font-bold text-blue-400">{Math.round(totalProgress)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 mb-1">
                        <div className="bg-blue-300 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${Math.min(totalProgress, 100)}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>Conso: {formatJH(totalConsumed)} J/H</span>
                        <span>Engagé: {formatJH(totalEngaged)} J/H</span>
                    </div>
                </div>

                {/* Circular Breakdown */}
                <div className="flex justify-around items-center pt-2">
                    <CircularProgress 
                        value={intProgress} 
                        label="Avancement Interne" 
                        subLabel={`${formatJH(stats.intConsumed)} / ${formatJH(stats.intEngaged)} JH`}
                        color="#c4b5fd" // Violet 300 (Pastel)
                    />
                    <div className="h-12 w-px bg-slate-200"></div>
                    <CircularProgress 
                        value={extProgress} 
                        label="Avancement Externe" 
                        subLabel={`${formatJH(stats.extConsumed)} / ${formatJH(stats.extEngaged)} JH`}
                        color="#7dd3fc" // Sky 300 (Pastel)
                    />
                </div>

            </CardContent>
        </div>
    );
};

export default ProjectWorkloadSummaryWidget;
