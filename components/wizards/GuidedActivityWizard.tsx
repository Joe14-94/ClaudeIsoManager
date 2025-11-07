import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../ui/Modal';
import { useData } from '../../contexts/DataContext';
import { Activity, ActivityStatus, Priority, ActivityType, SecurityDomain, Objective, IsoMeasure, StrategicOrientation, Chantier, Resource, SecurityProcess } from '../../types';
import { ISO_MEASURES_DATA } from '../../constants';
import { ShieldCheck, FileText, ArrowLeft, Search, TrendingUp, Workflow, Target } from 'lucide-react';
import Card from '../ui/Card';
import CustomMultiSelect from '../ui/CustomMultiSelect';
import CalendarDatePicker from '../ui/CalendarDatePicker';
import Tooltip from '../ui/Tooltip';

interface GuidedActivityWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newActivity: Activity) => void;
  onSwitchToManual: () => void;
}

type FormActivity = Partial<Activity> & { chantierIds?: string[] };

const StartStep = ({ onSelect }: { onSelect: (path: 'iso' | 'orientation' | 'manual') => void }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card onClick={() => onSelect('iso')} className="text-center p-6 cursor-pointer hover:shadow-lg hover:border-blue-500 transition-all">
      <ShieldCheck className="mx-auto h-12 w-12 text-blue-600" />
      <h3 className="mt-2 text-lg font-semibold">Exigence normative</h3>
      <p className="mt-1 text-sm text-slate-500">Créer une activité pour répondre à une ou plusieurs mesures ISO 27002.</p>
    </Card>
    <Card onClick={() => onSelect('orientation')} className="text-center p-6 cursor-pointer hover:shadow-lg hover:border-blue-500 transition-all">
      <TrendingUp className="mx-auto h-12 w-12 text-blue-600" />
      <h3 className="mt-2 text-lg font-semibold">Orientation stratégique</h3>
      <p className="mt-1 text-sm text-slate-500">Créer une activité pour contribuer à une orientation de la stratégie cybersécurité.</p>
    </Card>
    <Card onClick={() => onSelect('manual')} className="text-center p-6 cursor-pointer hover:shadow-lg hover:border-blue-500 transition-all">
      <FileText className="mx-auto h-12 w-12 text-blue-600" />
      <h3 className="mt-2 text-lg font-semibold">Création manuelle</h3>
      <p className="mt-1 text-sm text-slate-500">Remplir tous les champs manuellement sans assistance au pré-remplissage.</p>
    </Card>
  </div>
);

interface SelectionStepProps<T> {
    onSelect: (id: string) => void;
    items: T[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    placeholder: string;
    itemRenderer: (item: T) => React.ReactNode;
}

const SelectionStep = <T extends { id: string }>({ onSelect, items, searchTerm, setSearchTerm, placeholder, itemRenderer }: SelectionStepProps<T>) => {
    const filteredItems = useMemo(() => {
        if (!searchTerm) return items;
        const lowercasedTerm = searchTerm.toLowerCase();
        // FIX: The `item` parameter should be explicitly typed as `T`.
        return items.filter((item: T) => 
            Object.values(item).some(value => 
                typeof value === 'string' && value.toLowerCase().includes(lowercasedTerm)
            )
        );
    }, [items, searchTerm]);

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white"
                />
            </div>
            <div className="max-h-96 overflow-y-auto border rounded-md">
                {filteredItems.length > 0 ? (
                    <ul className="divide-y divide-slate-200">
                        {filteredItems.map(item => (
                            <li 
                                key={item.id} 
                                onClick={() => onSelect(item.id)}
                                className="p-3 hover:bg-blue-50 cursor-pointer"
                            >
                                {itemRenderer(item)}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-4 text-center text-slate-500">Aucun élément trouvé.</div>
                )}
            </div>
        </div>
    );
}

const FullActivityFormStep = ({
  activityData,
  setActivityData,
}: {
  activityData: FormActivity;
  setActivityData: React.Dispatch<React.SetStateAction<FormActivity>>;
}) => {
  const { objectives, orientations, chantiers, resources, securityProcesses } = useData();
  const [isoSearchTerm, setIsoSearchTerm] = useState('');
  const isReadOnly = false;

  const filteredChantiers = useMemo(() => {
    if (!activityData?.strategicOrientations || activityData.strategicOrientations.length === 0) {
      return [];
    }
    const selectedOrientationIds = new Set(activityData.strategicOrientations);
    return chantiers.filter(c => selectedOrientationIds.has(c.strategicOrientationId));
  }, [activityData?.strategicOrientations, chantiers]);
  
  const filteredObjectives = useMemo(() => {
    if (!activityData?.chantierIds || activityData.chantierIds.length === 0) {
      return [];
    }
    const selectedChantierIds = new Set(activityData.chantierIds);
    return objectives.filter(o => selectedChantierIds.has(o.chantierId));
  }, [activityData?.chantierIds, objectives]);
  
  const filteredIsoOptions = useMemo(() => {
    const options = ISO_MEASURES_DATA.map(m => ({
      value: m.code,
      label: `${m.code} - ${m.title}`,
      tooltip: m.details?.measure,
    }));
    if (!isoSearchTerm) return options;
    return options.filter(opt => opt.label.toLowerCase().includes(isoSearchTerm.toLowerCase()));
  }, [isoSearchTerm]);


  useEffect(() => {
    if (activityData?.chantierIds?.length) {
      const availableChantierIds = new Set(filteredChantiers.map(c => c.id));
      const validSelectedChantiers = activityData.chantierIds.filter(id => availableChantierIds.has(id));
      if (validSelectedChantiers.length !== activityData.chantierIds.length) {
        setActivityData(prev => ({ ...prev!, chantierIds: validSelectedChantiers }));
      }
    }
  }, [filteredChantiers, activityData?.chantierIds, setActivityData]);

  useEffect(() => {
    if (activityData?.objectives?.length) {
      const availableObjectiveIds = new Set(filteredObjectives.map(o => o.id));
      const validSelectedObjectives = activityData.objectives.filter(id => availableObjectiveIds.has(id));
      if (validSelectedObjectives.length !== activityData.objectives.length) {
        setActivityData(prev => ({ ...prev!, objectives: validSelectedObjectives }));
      }
    }
  }, [filteredObjectives, activityData?.objectives, setActivityData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'workloadInPersonDays') {
      setActivityData({ ...activityData, workloadInPersonDays: value ? parseFloat(value) : undefined });
    } else {
      setActivityData({ ...activityData, [name]: value });
    }
  };

  const handleCustomMultiSelectChange = (name: string, value: string[]) => {
    setActivityData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700">Titre</label>
        <input type="text" name="title" id="title" value={activityData.title || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" required readOnly={isReadOnly} />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
        <textarea name="description" id="description" value={activityData.description || ''} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" readOnly={isReadOnly} />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-slate-700">Statut</label>
          <select name="status" id="status" value={activityData.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" disabled={isReadOnly}>
            {Object.values(ActivityStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-slate-700">Priorité</label>
          <select name="priority" id="priority" value={activityData.priority} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" disabled={isReadOnly}>
            {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="activityType" className="block text-sm font-medium text-slate-700">Type d'activité</label>
          <select name="activityType" id="activityType" value={activityData.activityType} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" disabled={isReadOnly}>
            {Object.values(ActivityType).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="securityDomain" className="block text-sm font-medium text-slate-700">Domaine de sécurité</label>
          <select name="securityDomain" id="securityDomain" value={activityData.securityDomain} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" disabled={isReadOnly}>
            {Object.values(SecurityDomain).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
          <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-slate-700">Date de début (prévue)</label>
              <CalendarDatePicker id="startDate" name="startDate" value={activityData.startDate ? activityData.startDate.split('T')[0] : ''} onChange={handleChange} readOnly={isReadOnly} />
          </div>
          <div>
              <label htmlFor="endDatePlanned" className="block text-sm font-medium text-slate-700">Date de fin (prévue)</label>
              <CalendarDatePicker id="endDatePlanned" name="endDatePlanned" value={activityData.endDatePlanned ? activityData.endDatePlanned.split('T')[0] : ''} onChange={handleChange} readOnly={isReadOnly} />
          </div>
      </div>

      <div>
        <label htmlFor="functionalProcessId" className="block text-sm font-medium text-slate-700">Processus fonctionnel</label>
        <select name="functionalProcessId" id="functionalProcessId" value={activityData.functionalProcessId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" disabled={isReadOnly}>
          {securityProcesses.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div>
          <label className="block text-sm font-medium text-slate-700">Mesures ISO</label>
          <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher par code ou titre..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md bg-white mb-2"
                value={isoSearchTerm}
                onChange={(e) => setIsoSearchTerm(e.target.value)}
                disabled={isReadOnly}
              />
          </div>
          <CustomMultiSelect
              label=""
              name="isoMeasures"
              options={filteredIsoOptions}
              selectedValues={activityData.isoMeasures || []}
              onChange={handleCustomMultiSelectChange}
              disabled={isReadOnly}
          />
      </div>
      
      <CustomMultiSelect label="Orientations stratégiques" name="strategicOrientations" options={orientations.map(o => ({ value: o.id, label: `${o.code} - ${o.label}`}))} selectedValues={activityData.strategicOrientations || []} onChange={handleCustomMultiSelectChange} disabled={isReadOnly} />
      <CustomMultiSelect label="Chantiers" name="chantierIds" options={filteredChantiers.map(c => ({ value: c.id, label: `${c.code} - ${c.label}`}))} selectedValues={activityData.chantierIds || []} onChange={handleCustomMultiSelectChange} disabled={isReadOnly || !activityData.strategicOrientations || activityData.strategicOrientations.length === 0} />
      <CustomMultiSelect label="Objectifs" name="objectives" options={filteredObjectives.map(o => ({ value: o.id, label: `${o.code} - ${o.label}`}))} selectedValues={activityData.objectives || []} onChange={handleCustomMultiSelectChange} disabled={isReadOnly || !activityData.chantierIds || activityData.chantierIds.length === 0} />
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="owner" className="block text-sm font-medium text-slate-700">Responsable</label>
          <select name="owner" id="owner" value={activityData.owner} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" disabled={isReadOnly}>
            <option value="">Non assigné</option>
            {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div>
            <label htmlFor="workloadInPersonDays" className="block text-sm font-medium text-slate-700">Charge (J/H)</label>
            <input type="number" name="workloadInPersonDays" id="workloadInPersonDays" value={activityData.workloadInPersonDays || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" readOnly={isReadOnly} min="0" step="0.5"/>
        </div>
      </div>
    </div>
  );
};

const ActivityDetailsStep = ({ activityData, setActivityData }: { activityData: Partial<Activity>, setActivityData: React.Dispatch<React.SetStateAction<Partial<Activity>>>}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setActivityData(prev => ({ ...prev, [name]: value }));
    };

    return (
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700">Titre</label>
          <input type="text" name="title" id="title" value={activityData.title || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" required />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
          <textarea name="description" id="description" value={activityData.description || ''} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700">Statut</label>
            <select name="status" id="status" value={activityData.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm">
              {Object.values(ActivityStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-slate-700">Priorité</label>
            <select name="priority" id="priority" value={activityData.priority} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm">
              {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-slate-700">Date de début</label>
                 <CalendarDatePicker
                    id="startDate"
                    name="startDate"
                    value={activityData.startDate ? activityData.startDate.split('T')[0] : ''}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label htmlFor="endDatePlanned" className="block text-sm font-medium text-slate-700">Date de fin prévue</label>
                <CalendarDatePicker
                    id="endDatePlanned"
                    name="endDatePlanned"
                    value={activityData.endDatePlanned ? activityData.endDatePlanned.split('T')[0] : ''}
                    onChange={handleChange}
                />
            </div>
        </div>
      </div>
    );
};

const SummaryStep = ({ activityData, objectives, orientations, chantiers }: { activityData: Partial<Activity>, objectives: Objective[], orientations: StrategicOrientation[], chantiers: Chantier[] }) => {
    const selectedIsoMeasures = useMemo(() => 
        ISO_MEASURES_DATA.filter(m => activityData.isoMeasures?.includes(m.code)),
        [activityData.isoMeasures]
    );

    const selectedOrientations = useMemo(() =>
        orientations.filter(o => activityData.strategicOrientations?.includes(o.id)),
        [activityData.strategicOrientations, orientations]
    );
    
    const selectedChantiers = useMemo(() => 
        chantiers.filter(c => {
          const objective = objectives.find(o => activityData.objectives?.includes(o.id));
          return objective && c.id === objective.chantierId;
        }),
        [activityData.objectives, objectives, chantiers]
    );

    const selectedObjectives = useMemo(() =>
        objectives.filter(o => activityData.objectives?.includes(o.id)),
        [activityData.objectives, objectives]
    );

    return (
        <div className="space-y-6">
            <p className="text-sm text-slate-600">Veuillez vérifier les informations de l'activité qui va être créée. Vous pouvez revenir en arrière pour modifier les sélections ou les détails.</p>
            
             <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2 text-slate-700">Détails de l'activité</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div><span className="font-medium text-slate-500">Titre:</span> <span className="text-slate-800">{activityData.title}</span></div>
                    <div><span className="font-medium text-slate-500">Statut:</span> <span className="text-slate-800">{activityData.status}</span></div>
                    <div><span className="font-medium text-slate-500">Priorité:</span> <span className="text-slate-800">{activityData.priority}</span></div>
                    <div><span className="font-medium text-slate-500">Date de début:</span> <span className="text-slate-800">{activityData.startDate ? new Date(activityData.startDate).toLocaleDateString() : 'N/A'}</span></div>
                    <div><span className="font-medium text-slate-500">Date de fin:</span> <span className="text-slate-800">{activityData.endDatePlanned ? new Date(activityData.endDatePlanned).toLocaleDateString() : 'N/A'}</span></div>
                    {activityData.description && <div className="col-span-2"><span className="font-medium text-slate-500">Description:</span> <p className="text-slate-800 whitespace-pre-wrap">{activityData.description}</p></div>}
                </div>
            </div>
            
            {selectedOrientations.length > 0 && (
                <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-2 text-slate-700">Orientation stratégique</h4>
                     <div className="max-h-24 overflow-y-auto border rounded-lg bg-white p-2 space-y-1">
                        {selectedOrientations.map(item => (
                            <div key={item.id} className="p-2 bg-purple-100 border-l-4 border-purple-500">
                                <p className="font-medium text-purple-900 text-sm">
                                    <span className="font-mono">{item.code}</span> - {item.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {selectedChantiers.length > 0 && (
                <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-2 text-slate-700">Chantier</h4>
                     <div className="max-h-24 overflow-y-auto border rounded-lg bg-white p-2 space-y-1">
                        {selectedChantiers.map(item => (
                            <div key={item.id} className="p-2 bg-cyan-100 border-l-4 border-cyan-500">
                                <p className="font-medium text-cyan-900 text-sm">
                                    <span className="font-mono">{item.code}</span> - {item.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedObjectives.length > 0 && (
                <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-2 text-slate-700">Objectif</h4>
                     <div className="max-h-24 overflow-y-auto border rounded-lg bg-white p-2 space-y-1">
                        {selectedObjectives.map(item => (
                            <div key={item.id} className="p-2 bg-green-100 border-l-4 border-green-500">
                                <p className="font-medium text-green-900 text-sm">
                                    <span className="font-mono">{item.code}</span> - {item.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedIsoMeasures.length > 0 && (
                <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-2 text-slate-700">Mesure ISO</h4>
                    <div className="max-h-24 overflow-y-auto border rounded-lg bg-white p-2 space-y-1">
                        {selectedIsoMeasures.map(item => (
                            <div key={item.code} className="p-2 bg-blue-100 border-l-4 border-blue-500">
                                <p className="font-medium text-blue-900 text-sm">
                                    <span className="font-mono">{item.code}</span> - {item.title}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


const GuidedActivityWizard: React.FC<GuidedActivityWizardProps> = ({ isOpen, onClose, onSave, onSwitchToManual }) => {
  const { objectives, orientations, chantiers, resources, securityProcesses, activities } = useData();
  const [step, setStep] = useState(1);
  const [startPath, setStartPath] = useState<'iso' | 'orientation' | null>(null);
  
  const [selectedIsoMeasureCode, setSelectedIsoMeasureCode] = useState<string | null>(null);
  const [selectedOrientationId, setSelectedOrientationId] = useState<string | null>(null);
  const [selectedChantierId, setSelectedChantierId] = useState<string | null>(null);
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string | null>(null);

  const [activityData, setActivityData] = useState<FormActivity>({});
  const [searchTerm, setSearchTerm] = useState('');

  const allMeasures: IsoMeasure[] = useMemo(() => ISO_MEASURES_DATA.map(m => ({ ...m, id: m.code })), []);

  const handleStart = (path: 'iso' | 'orientation' | 'manual') => {
    if (path === 'manual') {
      onSwitchToManual();
      return;
    }
    setStartPath(path);
    setActivityData({
      activityId: `ACT-${String(activities.length + 1).padStart(3, '0')}`,
      status: ActivityStatus.NOT_STARTED,
      priority: Priority.MEDIUM,
      activityType: ActivityType.PONCTUAL,
      securityDomain: SecurityDomain.GOUVERNANCE,
      isoMeasures: [],
      strategicOrientations: [],
      chantierIds: [],
      objectives: [],
      owner: resources[0]?.id || '',
      functionalProcessId: securityProcesses[0]?.id || ''
    });
    setStep(2);
  };
  
  const handleIsoMeasureSelect = (code: string) => {
    setSelectedIsoMeasureCode(code);
    const measure = allMeasures.find(m => m.code === code);
    setActivityData(prev => ({
      ...prev,
      isoMeasures: [code],
      title: `Activité pour la mesure ${code}`,
    }));
    setStep(3);
  };
  
  const handleOrientationSelect = (id: string) => {
      setSelectedOrientationId(id);
      setStep(3);
  }
  
  const handleChantierSelect = (id: string) => {
      setSelectedChantierId(id);
      setStep(4);
  }
  
  const handleObjectiveSelect = (id: string) => {
      setSelectedObjectiveId(id);
      const objective = objectives.find(o => o.id === id);
      if (objective) {
          const chantier = chantiers.find(c => c.id === objective.chantierId);
          const orientation = chantier ? orientations.find(o => o.id === chantier.strategicOrientationId) : undefined;
          const isoCodes = objective.mesures_iso?.map(m => m.numero_mesure) || [];
          
          setActivityData(prev => ({
              ...prev,
              objectives: [objective.id],
              strategicOrientations: orientation ? [orientation.id] : [],
              isoMeasures: Array.from(new Set(isoCodes)),
              title: `Activité pour l'objectif ${objective.code}`,
          }));
      }
      setStep(5);
  };

  const filteredChantiersByOrientation = useMemo(() => {
    if (!selectedOrientationId) return [];
    return chantiers.filter(c => c.strategicOrientationId === selectedOrientationId);
  }, [chantiers, selectedOrientationId]);

  const filteredObjectivesByChantier = useMemo(() => {
    if (!selectedChantierId) return [];
    return objectives.filter(o => o.chantierId === selectedChantierId);
  }, [objectives, selectedChantierId]);

  const handleSave = () => {
    if (!activityData.title) {
        alert("Le titre est obligatoire.");
        return;
    }
    
    const { chantierIds, ...activityToSave } = activityData;

    const finalActivity: Activity = {
        id: `act-${Date.now()}`,
        activityId: `ACT-${String(activities.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...activityToSave
    } as Activity;
    onSave(finalActivity);
  }

  const resetWizard = () => {
    setStep(1);
    setStartPath(null);
    setSelectedIsoMeasureCode(null);
    setSelectedOrientationId(null);
    setSelectedChantierId(null);
    setSelectedObjectiveId(null);
    setActivityData({});
    setSearchTerm('');
  };

  const handleClose = () => {
    resetWizard();
    onClose();
  };
  
  const goBack = () => {
    setSearchTerm('');
    if (step === 2) {
        resetWizard();
        return;
    }
    
    if (startPath === 'iso') {
        if (step === 3) {
            setSelectedIsoMeasureCode(null);
            setActivityData(prev => ({ ...prev, title: '', isoMeasures: [] }));
        }
    } else if (startPath === 'orientation') {
        if (step === 3) setSelectedOrientationId(null);
        if (step === 4) setSelectedChantierId(null);
        if (step === 5) {
          setSelectedObjectiveId(null);
          // Reset pre-filled data
          setActivityData(prev => ({
            ...prev,
            title: '',
            objectives: [],
            strategicOrientations: [],
            isoMeasures: []
          }));
        }
    }
    setStep(prev => prev - 1);
  }

  const totalSteps = startPath === 'iso' ? 3 : 6;

  const renderStepContent = () => {
    switch(step) {
      case 1: return <StartStep onSelect={handleStart} />;
      
      case 2:
        if (startPath === 'iso') {
            return <SelectionStep<IsoMeasure> 
                items={allMeasures} 
                onSelect={handleIsoMeasureSelect} 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
                placeholder="Rechercher par code ou titre de mesure..." 
                itemRenderer={(item) => (
                    <Tooltip text={item.details?.measure || ''}>
                        <div>
                            <p className="font-semibold text-slate-800"><span className="font-mono text-blue-600">{item.code}</span> - {item.title}</p>
                            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                        </div>
                    </Tooltip>
                )} 
            />;
        }
        if (startPath === 'orientation') {
             return <SelectionStep<StrategicOrientation> items={orientations} onSelect={handleOrientationSelect} searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="Rechercher par code ou libellé d'orientation..." itemRenderer={(item) => (<><p className="font-semibold text-slate-800"><span className="font-mono text-blue-600">{item.code}</span> - {item.label}</p></>)} />;
        }
        return null;

       case 3:
         if (startPath === 'iso') {
             return <FullActivityFormStep activityData={activityData} setActivityData={setActivityData} />;
         }
         if (startPath === 'orientation') {
            return <SelectionStep<Chantier> items={filteredChantiersByOrientation} onSelect={handleChantierSelect} searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="Rechercher par code ou libellé de chantier..." itemRenderer={(item) => (<><p className="font-semibold text-slate-800"><span className="font-mono text-blue-600">{item.code}</span> - {item.label}</p></>)} />;
         }
         return null;
       
       case 4:
         if (startPath === 'orientation') {
            return <SelectionStep<Objective> items={filteredObjectivesByChantier} onSelect={handleObjectiveSelect} searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="Rechercher par code ou libellé d'objectif..." itemRenderer={(item) => (<><p className="font-semibold text-slate-800"><span className="font-mono text-blue-600">{item.code}</span> - {item.label}</p></>)} />;
         }
         return null;

      case 5: 
        if (startPath === 'orientation') {
            return <ActivityDetailsStep activityData={activityData} setActivityData={setActivityData} />;
        }
        return null;

      case 6:
        if (startPath === 'orientation') {
            return <SummaryStep activityData={activityData} objectives={objectives} orientations={orientations} chantiers={chantiers} />;
        }
        return null;

      default: return null;
    }
  };
  
  const wizardTitle = () => {
    if (startPath === 'iso') {
        switch(step) {
            case 1: return `Étape 1/3 : Point de départ`;
            case 2: return `Étape 2/3 : Sélection de la mesure ISO`;
            case 3: return `Étape 3/3 : Renseignement de l'activité`;
            default: return "Assistant de création";
        }
    } else if (startPath === 'orientation') {
        switch(step) {
            case 1: return `Étape 1/6 : Point de départ`;
            case 2: return `Étape 2/6 : Sélection de l'orientation`;
            case 3: return `Étape 3/6 : Sélection du chantier`;
            case 4: return `Étape 4/6 : Sélection de l'objectif`;
            case 5: return `Étape 5/6 : Détails de l'activité`;
            case 6: return `Étape 6/6 : Résumé et validation`;
            default: return "Assistant de création";
        }
    }
    return "Assistant de création";
  }
  
  const isNextDisabled = () => {
    if (startPath === 'iso') {
        if (step === 2 && !selectedIsoMeasureCode) return true;
    } else if (startPath === 'orientation') {
        if (step === 2 && !selectedOrientationId) return true;
        if (step === 3 && !selectedChantierId) return true;
        if (step === 4 && !selectedObjectiveId) return true;
        if (step === 5 && !activityData.title) return true;
    }
    return false;
  }
  
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={wizardTitle()}>
      {step > 1 && startPath && (
        <div className="mb-6">
            <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(step / totalSteps) * 100}%`, transition: 'width 0.3s ease-in-out' }}></div>
            </div>
        </div>
      )}
      
      {renderStepContent()}
      
      <div className="flex justify-between items-center gap-2 pt-4 border-t mt-6">
        <button type="button" onClick={goBack} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed" disabled={step === 1}>
          <ArrowLeft size={16} />
          Précédent
        </button>
        <div className="flex gap-2">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">Annuler</button>
            {((startPath === 'iso' && step < 3) || (startPath === 'orientation' && step < 6)) &&
                <button type="button" onClick={() => setStep(prev => prev + 1)} disabled={isNextDisabled()} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed">Suivant</button>
            }
            {((startPath === 'iso' && step === 3) || (startPath === 'orientation' && step === 6)) &&
                <button type="button" onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Créer l'activité</button>
            }
        </div>
      </div>
    </Modal>
  );
};

export default GuidedActivityWizard;