

import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../ui/Modal';
import { useData } from '../../contexts/DataContext';
import { Activity, ActivityStatus, Priority, ActivityType, SecurityDomain, Objective, IsoMeasure, Chantier, StrategicOrientation } from '../../types';
import { ISO_MEASURES_DATA } from '../../constants';
import { ShieldCheck, Target, FileText, ArrowLeft, Search } from 'lucide-react';
import Card from '../ui/Card';

interface GuidedActivityWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newActivity: Activity) => void;
  onSwitchToManual: () => void;
}

const CustomMultiSelect: React.FC<{
  label: string;
  name: string;
  options: { value: string; label: string }[];
  selectedValues: string[];
  onChange: (name: string, newSelected: string[]) => void;
}> = ({ label, name, options, selectedValues, onChange }) => {
  const toggleOption = (value: string) => {
    const newSelected = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onChange(name, newSelected);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="mt-1 block w-full h-32 border border-slate-300 rounded-md shadow-sm overflow-y-auto bg-white">
        <ul className="divide-y divide-slate-100">
          {options.map(option => (
            <li
              key={option.value}
              onClick={() => toggleOption(option.value)}
              className={`p-2 cursor-pointer flex items-center text-sm ${selectedValues.includes(option.value) ? 'bg-blue-100' : 'hover:bg-slate-50'}`}
              role="option"
              aria-selected={selectedValues.includes(option.value)}
            >
              <div
                className={`w-4 h-4 mr-3 flex-shrink-0 flex items-center justify-center border rounded transition-colors
                  ${selectedValues.includes(option.value)
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-white border-slate-400'
                  }`}
              >
                  {selectedValues.includes(option.value) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                  )}
              </div>
              <span className="text-slate-800">{option.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};


const GuidedActivityWizard: React.FC<GuidedActivityWizardProps> = ({ isOpen, onClose, onSave, onSwitchToManual }) => {
  const { objectives, orientations, chantiers, resources, securityProcesses, activities } = useData();
  const [step, setStep] = useState(1);
  const [startPath, setStartPath] = useState<'iso' | 'objective' | null>(null);
  const [activityData, setActivityData] = useState<Partial<Activity>>({});
  
  const [searchTerm, setSearchTerm] = useState('');

  const allMeasures: IsoMeasure[] = useMemo(() => ISO_MEASURES_DATA.map(m => ({ ...m, id: m.code })), []);

  const referenceData = useMemo(async () => {
    const response = await fetch('/OrientationsEtISO.json');
    const rawData = await response.json();
    return rawData.strategie_cybersecurite;
  }, []);

  const [relationMap, setRelationMap] = useState<any[]>([]);
  useEffect(() => {
    referenceData.then(data => setRelationMap(data));
  }, [referenceData]);

  const handleStart = (path: 'iso' | 'objective' | 'manual') => {
    if (path === 'manual') {
      onSwitchToManual();
      return;
    }
    setStartPath(path);
    setStep(2);
    setActivityData({ // Initialize with defaults
      status: ActivityStatus.NOT_STARTED,
      priority: Priority.MEDIUM,
      activityType: ActivityType.PONCTUAL,
      securityDomain: SecurityDomain.GOUVERNANCE,
      isoMeasures: [],
      strategicOrientations: [],
      objectives: [],
      owner: resources[0]?.id || '',
      functionalProcessId: securityProcesses[0]?.id || ''
    });
  };

  const prefillFromSelection = (id: string) => {
    if (startPath === 'iso') {
        const relations = relationMap.filter(r => r.mapping_iso_27002.numero_mesure === id);
        if (relations.length > 0) {
            const relation = relations[0]; // Take the first match
            const objective = objectives.find(o => o.code === relation.objectif.numero);
            const orientation = orientations.find(o => o.code === relation.orientation_strategique.numero);

            setActivityData(prev => ({
                ...prev,
                isoMeasures: [id],
                objectives: objective ? [objective.id] : [],
                strategicOrientations: orientation ? [orientation.id] : [],
                title: `Activité liée à la mesure ${id}`,
            }));
        } else {
             setActivityData(prev => ({
                ...prev,
                isoMeasures: [id],
                title: `Activité liée à la mesure ${id}`,
            }));
        }
    } else if (startPath === 'objective') {
        const objective = objectives.find(o => o.id === id);
        if(objective) {
            const relations = relationMap.filter(r => r.objectif.numero === objective.code);
            const isoMeasures = relations.map(r => r.mapping_iso_27002.numero_mesure);

            setActivityData(prev => ({
                ...prev,
                objectives: [id],
                strategicOrientations: objective.strategicOrientations || [],
                isoMeasures: Array.from(new Set(isoMeasures)),
                title: `Activité pour l'objectif ${objective.code}`,
            }));
        }
    }
    setStep(3);
  };
  
  const handleSave = () => {
    if (!activityData.title) {
        alert("Le titre est obligatoire.");
        return;
    }
    const finalActivity: Activity = {
        id: `act-${Date.now()}`,
        activityId: `ACT-${String(activities.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...activityData
    } as Activity;
    onSave(finalActivity);
  }

  const resetWizard = () => {
    setStep(1);
    setStartPath(null);
    setActivityData({});
    setSearchTerm('');
  };

  const handleClose = () => {
    resetWizard();
    onClose();
  };
  
  const goBack = () => {
    if (step > 1) {
        if(step === 2) resetWizard();
        else setStep(prev => prev - 1);
    }
  }

  
  const filteredObjectives = useMemo(() => {
    if (!activityData?.strategicOrientations || activityData.strategicOrientations.length === 0) {
      return objectives;
    }
    const selectedOrientationIds = new Set(activityData.strategicOrientations);
    
    const prefixes = Array.from(selectedOrientationIds).map(id => {
      const orientation = orientations.find(o => o.id === id);
      if (!orientation) return null;
      const parts = orientation.code.split('.');
      if (parts.length < 2) return null;
      const prefix = `${parts[0]}.${String(parts[1]).padStart(2, '0')}`;
      return prefix;
    }).filter(p => p !== null) as string[];

    if(prefixes.length === 0) {
      return objectives;
    }
    
    return objectives.filter(obj => 
      prefixes.some(prefix => obj.code.startsWith(prefix))
    );
  }, [activityData?.strategicOrientations, objectives, orientations]);

  function Step3({ activityData, setActivityData }: { activityData: Partial<Activity>, setActivityData: React.Dispatch<React.SetStateAction<Partial<Activity>>>}) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setActivityData(prev => ({ ...prev, [name]: value }));
    };

    const handleCustomMultiSelectChange = (name: string, value: string[]) => {
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
                <input type="date" name="startDate" id="startDate" value={activityData.startDate ? activityData.startDate.split('T')[0] : ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" />
            </div>
            <div>
                <label htmlFor="endDatePlanned" className="block text-sm font-medium text-slate-700">Date de fin prévue</label>
                <input type="date" name="endDatePlanned" id="endDatePlanned" value={activityData.endDatePlanned ? activityData.endDatePlanned.split('T')[0] : ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" />
            </div>
        </div>

        <CustomMultiSelect
            label="Mesures ISO"
            name="isoMeasures"
            options={allMeasures.map(m => ({ value: m.code, label: `${m.code} - ${m.title}` }))}
            selectedValues={activityData.isoMeasures || []}
            onChange={handleCustomMultiSelectChange}
        />

        <CustomMultiSelect
            label="Orientations stratégiques"
            name="strategicOrientations"
            options={orientations.map(o => ({ value: o.id, label: `${o.code} - ${o.label}` }))}
            selectedValues={activityData.strategicOrientations || []}
            onChange={handleCustomMultiSelectChange}
        />

        <CustomMultiSelect
            label="Objectifs"
            name="objectives"
            options={filteredObjectives.map(o => ({ value: o.id, label: `${o.code} - ${o.label}` }))}
            selectedValues={activityData.objectives || []}
            onChange={handleCustomMultiSelectChange}
        />
      </div>
    );
  }

  function Step4({ activityData }: { activityData: Partial<Activity>}) {
    const selectedIsoMeasures = useMemo(() => 
        ISO_MEASURES_DATA.filter(m => activityData.isoMeasures?.includes(m.code)),
        [activityData.isoMeasures]
    );

    const selectedOrientations = useMemo(() =>
        orientations.filter(o => activityData.strategicOrientations?.includes(o.id)),
        [activityData.strategicOrientations, orientations]
    );

    const selectedObjectives = useMemo(() =>
        objectives.filter(o => activityData.objectives?.includes(o.id)),
        [activityData.objectives, objectives]
    );

    return (
        <div className="space-y-6">
            <p className="text-sm text-slate-600">Veuillez vérifier les informations de l'activité qui va être créée. Vous pouvez revenir en arrière pour modifier les sélections ou les détails.</p>
            
            {selectedIsoMeasures.length > 0 && (
                <div>
                    <h4 className="font-semibold mb-2 text-slate-700">Mesures ISO</h4>
                    <div className="max-h-32 overflow-y-auto border rounded-lg bg-white p-2 space-y-1">
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
            
            {selectedOrientations.length > 0 && (
                <div>
                    <h4 className="font-semibold mb-2 text-slate-700">Orientations stratégiques</h4>
                     <div className="max-h-32 overflow-y-auto border rounded-lg bg-white p-2 space-y-1">
                        {selectedOrientations.map(item => (
                            <div key={item.id} className="p-2 bg-blue-100 border-l-4 border-blue-500">
                                <p className="font-medium text-blue-900 text-sm">
                                    <span className="font-mono">{item.code}</span> - {item.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedObjectives.length > 0 && (
                <div>
                    <h4 className="font-semibold mb-2 text-slate-700">Objectifs</h4>
                     <div className="max-h-32 overflow-y-auto border rounded-lg bg-white p-2 space-y-1">
                        {selectedObjectives.map(item => (
                            <div key={item.id} className="p-2 bg-blue-100 border-l-4 border-blue-500">
                                <p className="font-medium text-blue-900 text-sm">
                                    <span className="font-mono">{item.code}</span> - {item.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

             <div className="pt-4 mt-4 border-t">
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
        </div>
    );
  }
  
  const renderStepContent = () => {
    switch(step) {
      case 1: return <Step1 onSelect={handleStart} />;
      case 2: return <Step2 startPath={startPath} onSelect={prefillFromSelection} measures={allMeasures} objectives={objectives} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />;
      case 3: return <Step3 activityData={activityData} setActivityData={setActivityData} />;
      case 4: return <Step4 activityData={activityData} />;
      default: return null;
    }
  };
  
  const wizardTitle = () => {
    switch(step) {
      case 1: return "Assistant de création : point de départ";
      case 2: return `Étape 2 : sélection de l'${startPath === 'iso' ? 'exigence' : 'objectif'}`;
      case 3: return "Étape 3 : détails de l'activité";
      case 4: return "Étape 4 : résumé et validation";
      default: return "Assistant de création";
    }
  }
  
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={wizardTitle()}>
      <div className="mb-6">
        <div className="w-full bg-slate-200 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(step / 4) * 100}%`, transition: 'width 0.3s ease-in-out' }}></div>
        </div>
      </div>
      
      {renderStepContent()}
      
      <div className="flex justify-between items-center gap-2 pt-4 border-t mt-6">
        <button type="button" onClick={goBack} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200" disabled={step === 1}>
          <ArrowLeft size={16} />
          Précédent
        </button>
        <div className="flex gap-2">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">Annuler</button>
            {step < 4 && <button type="button" onClick={() => setStep(prev => prev + 1)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Suivant</button>}
            {step === 4 && <button type="button" onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Créer l'activité</button>}
        </div>
      </div>
    </Modal>
  );
};


const Step1 = ({ onSelect }: { onSelect: (path: 'iso' | 'objective' | 'manual') => void }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card onClick={() => onSelect('iso')} className="text-center p-6 cursor-pointer hover:shadow-lg hover:border-blue-500 transition-all">
      <ShieldCheck className="mx-auto h-12 w-12 text-blue-600" />
      <h3 className="mt-2 text-lg font-semibold">Exigence normative</h3>
      <p className="mt-1 text-sm text-slate-500">Créer une activité pour répondre à une ou plusieurs mesures ISO 27002.</p>
    </Card>
    <Card onClick={() => onSelect('objective')} className="text-center p-6 cursor-pointer hover:shadow-lg hover:border-blue-500 transition-all">
      <Target className="mx-auto h-12 w-12 text-blue-600" />
      <h3 className="mt-2 text-lg font-semibold">But stratégique</h3>
      <p className="mt-1 text-sm text-slate-500">Créer une activité pour contribuer à un objectif de la stratégie cybersécurité.</p>
    </Card>
    <Card onClick={() => onSelect('manual')} className="text-center p-6 cursor-pointer hover:shadow-lg hover:border-blue-500 transition-all">
      <FileText className="mx-auto h-12 w-12 text-blue-600" />
      <h3 className="mt-2 text-lg font-semibold">Création manuelle</h3>
      <p className="mt-1 text-sm text-slate-500">Remplir tous les champs manuellement sans assistance au pré-remplissage.</p>
    </Card>
  </div>
);

const Step2 = ({ startPath, onSelect, measures, objectives, searchTerm, setSearchTerm }: { startPath: 'iso' | 'objective' | null, onSelect: (id: string) => void, measures: IsoMeasure[], objectives: Objective[], searchTerm: string, setSearchTerm: (term: string) => void }) => {
  const items = useMemo(() => {
    const list = startPath === 'iso' ? measures : objectives;
    if (!searchTerm) return list;
    return list.filter(item => 
        (item as any).code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item as any).title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item as any).label?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [startPath, measures, objectives, searchTerm]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text"
          placeholder={`Rechercher par code ou titre...`}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white"
        />
      </div>
      <div className="max-h-96 overflow-y-auto border rounded-md">
        <ul className="divide-y divide-slate-200">
          {items.map(item => (
            <li 
              key={(item as any).id} 
              onClick={() => onSelect((item as any).id)}
              className="p-3 hover:bg-blue-50 cursor-pointer"
            >
              <p className="font-semibold text-slate-800">
                <span className="font-mono text-blue-600">{(item as any).code}</span> - {(item as any).title || (item as any).label}
              </p>
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{(item as any).description}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};


export default GuidedActivityWizard;