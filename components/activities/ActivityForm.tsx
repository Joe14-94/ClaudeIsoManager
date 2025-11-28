
import React, { useState, useMemo, useEffect } from 'react';
import { Activity, ActivityStatus, Priority, ActivityType, SecurityDomain } from '../../types';
import { ISO_MEASURES_DATA } from '../../constants';
import { useData } from '../../contexts/DataContext';
import { Search } from 'lucide-react';
import CalendarDatePicker from '../ui/CalendarDatePicker';
import CustomMultiSelect from '../ui/CustomMultiSelect';

type FormActivity = Partial<Activity> & { chantierIds?: string[] };

interface ActivityFormProps {
    currentActivity: FormActivity;
    setCurrentActivity: React.Dispatch<React.SetStateAction<FormActivity | null>>;
    isReadOnly: boolean;
    handleSave: (e: React.FormEvent) => void;
    handleCloseModals: () => void;
}

const ActivityForm: React.FC<ActivityFormProps> = ({ currentActivity, setCurrentActivity, isReadOnly, handleSave, handleCloseModals }) => {
    const { objectives, orientations, chantiers, resources, securityProcesses } = useData();
    const [isoSearchTerm, setIsoSearchTerm] = useState('');
    const [orientationSearchTerm, setOrientationSearchTerm] = useState('');

    const filteredChantiers = useMemo(() => {
        if (!currentActivity?.strategicOrientations || currentActivity.strategicOrientations.length === 0) return [];
        const selectedOrientationIds = new Set(currentActivity.strategicOrientations);
        return chantiers.filter(c => selectedOrientationIds.has(c.strategicOrientationId));
    }, [currentActivity?.strategicOrientations, chantiers]);

    const filteredObjectives = useMemo(() => {
        if (!currentActivity?.chantierIds || currentActivity.chantierIds.length === 0) return [];
        const selectedChantierIds = new Set(currentActivity.chantierIds);
        return objectives.filter(o => selectedChantierIds.has(o.chantierId));
    }, [currentActivity?.chantierIds, objectives]);

    const filteredIsoOptions = useMemo(() => {
        const options = ISO_MEASURES_DATA.map(m => ({ value: m.code, label: `${m.code} - ${m.title}`, tooltip: m.details?.measure }));
        if (!isoSearchTerm) return options;
        return options.filter(opt => opt.label.toLowerCase().includes(isoSearchTerm.toLowerCase()));
    }, [isoSearchTerm]);

    const filteredOrientationOptions = useMemo(() => {
        const options = orientations.map(o => ({ value: o.id, label: `${o.code} - ${o.label}` }));
        if (!orientationSearchTerm) return options;
        return options.filter(opt => opt.label.toLowerCase().includes(orientationSearchTerm.toLowerCase()));
    }, [orientations, orientationSearchTerm]);

    useEffect(() => {
        if (currentActivity?.chantierIds?.length) {
            const availableChantierIds = new Set(filteredChantiers.map(c => c.id));
            const validSelectedChantiers = currentActivity.chantierIds.filter(id => availableChantierIds.has(id));
            if (validSelectedChantiers.length !== currentActivity.chantierIds.length) {
                setCurrentActivity(prev => prev ? ({ ...prev, chantierIds: validSelectedChantiers }) : null);
            }
        }
    }, [filteredChantiers, currentActivity?.chantierIds, setCurrentActivity]);

    useEffect(() => {
        if (currentActivity?.objectives?.length) {
            const availableObjectiveIds = new Set(filteredObjectives.map(o => o.id));
            const validSelectedObjectives = currentActivity.objectives.filter(id => availableObjectiveIds.has(id));
            if (validSelectedObjectives.length !== currentActivity.objectives.length) {
                setCurrentActivity(prev => prev ? ({ ...prev, objectives: validSelectedObjectives }) : null);
            }
        }
    }, [filteredObjectives, currentActivity?.objectives, setCurrentActivity]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const isNumber = type === 'number';
        setCurrentActivity(prev => {
            if (!prev) return null;
            if (isCheckbox) return { ...prev, [name]: (e.target as HTMLInputElement).checked };
            else if (isNumber) return { ...prev, [name]: value ? parseFloat(value) : undefined };
            else return { ...prev, [name]: value };
        });
    };

    const handleCustomMultiSelectChange = (name: string, value: string[]) => {
        setCurrentActivity(prev => prev ? ({ ...prev, [name]: value }) : null);
    };

    if (!currentActivity) return null;

    return (
        <form onSubmit={handleSave} className="space-y-4">
            <div><label htmlFor="activityId" className="block text-sm font-medium text-slate-700">ID activité</label><input type="text" name="activityId" id="activityId" value={currentActivity.activityId || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" required readOnly={isReadOnly} /></div>
            <div><label htmlFor="title" className="block text-sm font-medium text-slate-700">Titre</label><input type="text" name="title" id="title" value={currentActivity.title || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" required readOnly={isReadOnly} /></div>
            <div><label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label><textarea name="description" id="description" value={currentActivity.description || ''} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" readOnly={isReadOnly} /></div>

            <div className="grid grid-cols-2 gap-4">
                <div><label htmlFor="status" className="block text-sm font-medium text-slate-700">Statut</label><select name="status" id="status" value={currentActivity.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" disabled={isReadOnly}>{Object.values(ActivityStatus).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                <div><label htmlFor="priority" className="block text-sm font-medium text-slate-700">Priorité</label><select name="priority" id="priority" value={currentActivity.priority} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" disabled={isReadOnly}>{Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                <div><label htmlFor="activityType" className="block text-sm font-medium text-slate-700">Type d'activité</label><select name="activityType" id="activityType" value={currentActivity.activityType} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" disabled={isReadOnly}>{Object.values(ActivityType).map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label htmlFor="securityDomain" className="block text-sm font-medium text-slate-700">Domaine de sécurité</label><select name="securityDomain" id="securityDomain" value={currentActivity.securityDomain} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" disabled={isReadOnly}>{Object.values(SecurityDomain).map(d => <option key={d} value={d}>{d}</option>)}</select></div>
            </div>

            <div className="pt-2">
                <label htmlFor="isExternalService" className="flex items-center cursor-pointer">
                    <input type="checkbox" id="isExternalService" name="isExternalService" checked={currentActivity.isExternalService || false} onChange={handleChange} disabled={isReadOnly} className="sr-only peer" />
                    <div className={`w-4 h-4 border rounded flex-shrink-0 flex items-center justify-center transition-colors ${isReadOnly ? 'bg-slate-200 border-slate-300' : 'bg-white border-slate-400'} peer-checked:bg-blue-600 peer-checked:border-blue-600`}><svg className="hidden peer-checked:block w-3 h-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" /></svg></div>
                    <span className="ml-2 text-sm font-medium text-slate-700">Prestation externe</span>
                </label>
            </div>

            {currentActivity.isExternalService && (
                <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-md font-semibold text-slate-800">Budget ADF (€)</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2 border rounded-md bg-slate-50">
                            <div><label htmlFor="budgetRequested">Demandé</label><input type="number" name="budgetRequested" value={currentActivity.budgetRequested || ''} onChange={handleChange} readOnly={isReadOnly} min="0" step="any" /></div>
                            <div><label htmlFor="budgetApproved">Accordé</label><input type="number" name="budgetApproved" value={currentActivity.budgetApproved || ''} onChange={handleChange} readOnly={isReadOnly} min="0" step="any" /></div>
                            <div><label htmlFor="budgetCommitted">Engagé</label><input type="number" name="budgetCommitted" value={currentActivity.budgetCommitted || ''} onChange={handleChange} readOnly={isReadOnly} min="0" step="any" /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2 border rounded-md bg-slate-50">
                            <div><label htmlFor="validatedPurchaseOrders">Demandes d’achat validées</label><input type="number" name="validatedPurchaseOrders" value={currentActivity.validatedPurchaseOrders || ''} onChange={handleChange} readOnly={isReadOnly} min="0" step="any" /></div>
                            <div><label htmlFor="completedPV">Réalisé (PV)</label><input type="number" name="completedPV" value={currentActivity.completedPV || ''} onChange={handleChange} readOnly={isReadOnly} min="0" step="any" /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 p-2 border rounded-md bg-slate-50">
                            <div><label htmlFor="forecastedPurchaseOrders">Demandes d’achat prévues</label><input type="number" name="forecastedPurchaseOrders" value={currentActivity.forecastedPurchaseOrders || ''} onChange={handleChange} readOnly={isReadOnly} min="0" step="any" /></div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div><label htmlFor="startDate" className="block text-sm font-medium text-slate-700">Date de début (prévue)</label><CalendarDatePicker id="startDate" name="startDate" value={currentActivity.startDate ? currentActivity.startDate.split('T')[0] : ''} onChange={handleChange} readOnly={isReadOnly} /></div>
                <div><label htmlFor="endDatePlanned" className="block text-sm font-medium text-slate-700">Date de fin (prévue)</label><CalendarDatePicker id="endDatePlanned" name="endDatePlanned" value={currentActivity.endDatePlanned ? currentActivity.endDatePlanned.split('T')[0] : ''} onChange={handleChange} readOnly={isReadOnly} /></div>
            </div>

            <div><label htmlFor="functionalProcessId" className="block text-sm font-medium text-slate-700">Processus fonctionnel</label><select name="functionalProcessId" id="functionalProcessId" value={currentActivity.functionalProcessId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" disabled={isReadOnly}>{securityProcesses.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>

            <div>
                <label className="block text-sm font-medium text-slate-700">Mesures ISO</label>
                <div className="mt-1"><input type="text" placeholder="Rechercher par code ou titre..." className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white mb-2" value={isoSearchTerm} onChange={(e) => setIsoSearchTerm(e.target.value)} disabled={isReadOnly}/></div>
                <CustomMultiSelect label="" name="isoMeasures" options={filteredIsoOptions} selectedValues={currentActivity.isoMeasures || []} onChange={handleCustomMultiSelectChange} disabled={isReadOnly}/>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700">Orientations stratégiques</label>
                <div className="mt-1"><input type="text" placeholder="Rechercher par code ou libellé..." className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white mb-2" value={orientationSearchTerm} onChange={(e) => setOrientationSearchTerm(e.target.value)} disabled={isReadOnly}/></div>
                <CustomMultiSelect label="" name="strategicOrientations" options={filteredOrientationOptions} selectedValues={currentActivity.strategicOrientations || []} onChange={handleCustomMultiSelectChange} disabled={isReadOnly}/>
            </div>

            <CustomMultiSelect label="Chantiers" name="chantierIds" options={filteredChantiers.map(c => ({ value: c.id, label: `${c.code} - ${c.label}` }))} selectedValues={currentActivity.chantierIds || []} onChange={handleCustomMultiSelectChange} disabled={isReadOnly || !currentActivity.strategicOrientations || currentActivity.strategicOrientations.length === 0} />
            <CustomMultiSelect label="Objectifs" name="objectives" options={filteredObjectives.map(o => ({ value: o.id, label: `${o.code} - ${o.label}` }))} selectedValues={currentActivity.objectives || []} onChange={handleCustomMultiSelectChange} disabled={isReadOnly || !currentActivity.chantierIds || currentActivity.chantierIds.length === 0} />

            <div className="grid grid-cols-2 gap-4">
                <div><label htmlFor="owner" className="block text-sm font-medium text-slate-700">Responsable</label><select name="owner" id="owner" value={currentActivity.owner} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" disabled={isReadOnly}><option value="">Non assigné</option>{resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
                <div><label htmlFor="workloadInPersonDays" className="block text-sm font-medium text-slate-700">Charge (J/H)</label><input type="number" name="workloadInPersonDays" id="workloadInPersonDays" value={currentActivity.workloadInPersonDays || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" readOnly={isReadOnly} min="0" step="0.5" /></div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t mt-6">
                <button type="button" onClick={handleCloseModals} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-transparent rounded-md hover:bg-slate-200">{isReadOnly ? 'Fermer' : 'Annuler'}</button>
                {!isReadOnly && <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700">Enregistrer</button>}
            </div>
        </form>
    );
};

export default ActivityForm;
