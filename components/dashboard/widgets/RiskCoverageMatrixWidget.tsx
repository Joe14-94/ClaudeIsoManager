
import React, { useMemo, useState } from 'react';
import { useData } from '../../../contexts/DataContext';
import { CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { ShieldAlert, Check, AlertTriangle } from 'lucide-react';
import Tooltip from '../../ui/Tooltip';
import { ProjectStatus } from '../../../types';

const RiskCoverageMatrixWidget: React.FC = () => {
    const { projects, majorRisks } = useData();
    const [filterStatus, setFilterStatus] = useState<'active' | 'all'>('active');

    const filteredProjects = useMemo(() => {
        return projects.filter(p => {
            if (p.projectId === 'TOTAL_GENERAL') return false;
            if (filterStatus === 'active') {
                return p.status === ProjectStatus.NO || p.status === ProjectStatus.IDENTIFIED;
            }
            return true;
        });
    }, [projects, filterStatus]);

    const matrixData = useMemo(() => {
        return majorRisks.map(risk => {
            const coveringProjects = filteredProjects.filter(p => p.majorRiskIds?.includes(risk.id));
            const isCovered = coveringProjects.length > 0;
            return {
                risk,
                projects: filteredProjects.map(p => ({ projectId: p.id, isCovered: p.majorRiskIds?.includes(risk.id) })),
                isCoveredGlobal: isCovered,
                count: coveringProjects.length
            };
        });
    }, [majorRisks, filteredProjects]);

    return (
        <div className="h-full w-full flex flex-col">
            <CardHeader className="non-draggable pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2"><ShieldAlert size={20} className="text-orange-600" /> Matrice de couverture des risques</CardTitle>
                    <div className="flex gap-2">
                        <button onClick={() => setFilterStatus('active')} className={`px-2 py-1 text-xs rounded ${filterStatus === 'active' ? 'bg-blue-100 text-blue-700 font-bold' : 'bg-slate-100 text-slate-600'}`}>Actifs</button>
                        <button onClick={() => setFilterStatus('all')} className={`px-2 py-1 text-xs rounded ${filterStatus === 'all' ? 'bg-blue-100 text-blue-700 font-bold' : 'bg-slate-100 text-slate-600'}`}>Tous</button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-auto p-0">
                <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="p-2 border-b border-r font-bold text-slate-700 min-w-[150px]">Risque Majeur</th>
                            <th className="p-2 border-b border-r text-center w-20 font-semibold text-slate-600 bg-slate-100">Couverture</th>
                            {filteredProjects.map(p => (
                                <th key={p.id} className="p-2 border-b text-center font-medium text-slate-600 min-w-[40px] max-w-[100px] truncate" title={p.title}><span className="[writing-mode:vertical-rl] transform rotate-180 block h-24 whitespace-nowrap overflow-hidden text-ellipsis">{p.projectId}</span></th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {matrixData.map((row, idx) => (
                            <tr key={row.risk.id} className={`hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                <td className="p-2 border-r border-b border-slate-200"><div className="font-semibold text-slate-800">{row.risk.label}</div><div className="text-[10px] text-slate-500">{row.risk.category}</div></td>
                                <td className={`p-2 border-r border-b border-slate-200 text-center ${row.isCoveredGlobal ? 'bg-green-50' : 'bg-red-50'}`}>
                                    {row.isCoveredGlobal ? (<div className="flex flex-col items-center text-green-700"><Check size={16} /><span className="text-[10px] font-bold">{row.count} prj</span></div>) : (<Tooltip text="Ce risque n'est adressé par aucun projet affiché !"><div className="flex justify-center text-red-600 cursor-help"><AlertTriangle size={18} /></div></Tooltip>)}
                                </td>
                                {row.projects.map(cell => (
                                    <td key={`${row.risk.id}-${cell.projectId}`} className="p-1 border-b border-slate-200 text-center">{cell.isCovered && (<div className="inline-flex items-center justify-center w-5 h-5 bg-blue-600 rounded-full text-white shadow-sm"><Check size={12} strokeWidth={3} /></div>)}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredProjects.length === 0 && <div className="p-8 text-center text-slate-500 italic">Aucun projet à afficher pour générer la matrice.</div>}
            </CardContent>
        </div>
    );
};
export default RiskCoverageMatrixWidget;
