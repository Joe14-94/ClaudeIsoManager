import React, { useState, useMemo } from 'react';
import Modal from '../ui/Modal';
import { useData } from '../../contexts/DataContext';
import { Upload, CheckSquare, Square, ChevronDown, ChevronRight, AlertCircle, FileJson, CheckCircle } from 'lucide-react';
import { Activity, Project, Objective, StrategicOrientation, Chantier, Initiative, Resource, SecurityProcess, MajorRisk } from '../../types';
import { saveToLocalStorage } from '../../utils/storage';

interface AdvancedImportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type DataCategory = 
    | 'projects' 
    | 'activities' 
    | 'objectives' 
    | 'orientations' 
    | 'chantiers' 
    | 'initiatives' 
    | 'resources' 
    | 'securityProcesses' 
    | 'majorRisks';

const CATEGORY_LABELS: Record<DataCategory, string> = {
    projects: 'Projets',
    activities: 'Activités',
    objectives: 'Objectifs',
    orientations: 'Orientations stratégiques',
    chantiers: 'Chantiers',
    initiatives: 'Initiatives',
    resources: 'Ressources',
    securityProcesses: 'Processus de sécurité',
    majorRisks: 'Risques majeurs',
};

// Helper pour obtenir un libellé lisible d'un item générique
const getItemLabel = (item: any, category: DataCategory): string => {
    switch (category) {
        case 'projects': return `${item.projectId} - ${item.title}`;
        case 'activities': return `${item.activityId} - ${item.title}`;
        case 'objectives': return `${item.code} - ${item.label}`;
        case 'orientations': return `${item.code} - ${item.label}`;
        case 'chantiers': return `${item.code} - ${item.label}`;
        case 'initiatives': return `${item.code} - ${item.label}`;
        case 'resources': return item.name;
        case 'securityProcesses': return item.name;
        case 'majorRisks': return item.label;
        default: return item.id || 'Élément sans nom';
    }
};

const AdvancedImportModal: React.FC<AdvancedImportModalProps> = ({ isOpen, onClose }) => {
    const contextData = useData();
    const [step, setStep] = useState<'upload' | 'select'>('upload');
    const [parsedData, setParsedData] = useState<any>(null);
    const [selection, setSelection] = useState<Record<string, Set<string>>>({});
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);

    // Réinitialisation à l'ouverture/fermeture
    React.useEffect(() => {
        if (isOpen) {
            setStep('upload');
            setParsedData(null);
            setSelection({});
            setExpandedCategories(new Set());
            setError(null);
        }
    }, [isOpen]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                // Vérification basique de la structure
                if (!json || typeof json !== 'object') {
                    throw new Error("Format de fichier invalide");
                }
                setParsedData(json);
                
                // Initialiser la sélection (tout décoché par défaut)
                const initialSelection: Record<string, Set<string>> = {};
                Object.keys(CATEGORY_LABELS).forEach(key => {
                    if (Array.isArray(json[key])) {
                        initialSelection[key] = new Set();
                    }
                });
                setSelection(initialSelection);
                setStep('select');
                setError(null);
            } catch (err) {
                console.error(err);
                setError("Impossible de lire le fichier. Assurez-vous qu'il s'agit d'un fichier JSON valide.");
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset input
    };

    const toggleCategoryExpand = (category: string) => {
        const newSet = new Set(expandedCategories);
        if (newSet.has(category)) newSet.delete(category);
        else newSet.add(category);
        setExpandedCategories(newSet);
    };

    const toggleItemSelection = (category: string, itemId: string) => {
        const currentSet = new Set(selection[category] || []);
        if (currentSet.has(itemId)) currentSet.delete(itemId);
        else currentSet.add(itemId);
        setSelection({ ...selection, [category]: currentSet });
    };

    const toggleCategorySelection = (category: string, allIds: string[]) => {
        const currentSet = selection[category] || new Set();
        const allSelected = allIds.every(id => currentSet.has(id));
        
        if (allSelected) {
            setSelection({ ...selection, [category]: new Set() });
        } else {
            setSelection({ ...selection, [category]: new Set(allIds) });
        }
    };

    const handleRestore = () => {
        if (!parsedData) return;

        let importCount = 0;

        // Fonction générique de fusion
        const mergeData = <T extends { id: string }>(
            currentData: T[], 
            newData: T[], 
            selectedIds: Set<string>, 
            setter: React.Dispatch<React.SetStateAction<T[]>>
        ) => {
            const itemsToImport = newData.filter(item => selectedIds.has(item.id));
            if (itemsToImport.length === 0) return;

            const dataMap = new Map(currentData.map(item => [item.id, item]));
            
            itemsToImport.forEach(item => {
                dataMap.set(item.id, item); // Écrase si existe, ajoute sinon
                importCount++;
            });

            setter(Array.from(dataMap.values()));
        };

        // Appliquer la fusion pour chaque catégorie
        (Object.keys(CATEGORY_LABELS) as DataCategory[]).forEach(category => {
            if (parsedData[category] && selection[category]?.size > 0) {
                const contextKey = category as keyof typeof contextData;
                // On suppose que le nom du setter est "set" + CapitalizedKey
                // Mais ici nous avons accès directement aux setters via le contexte typé, 
                // donc on va faire un switch case pour être type-safe
                
                switch(category) {
                    case 'projects': mergeData(contextData.projects, parsedData.projects, selection.projects, contextData.setProjects); break;
                    case 'activities': mergeData(contextData.activities, parsedData.activities, selection.activities, contextData.setActivities); break;
                    case 'objectives': mergeData(contextData.objectives, parsedData.objectives, selection.objectives, contextData.setObjectives); break;
                    case 'orientations': mergeData(contextData.orientations, parsedData.orientations, selection.orientations, contextData.setOrientations); break;
                    case 'chantiers': mergeData(contextData.chantiers, parsedData.chantiers, selection.chantiers, contextData.setChantiers); break;
                    case 'initiatives': mergeData(contextData.initiatives, parsedData.initiatives, selection.initiatives, contextData.setInitiatives); break;
                    case 'resources': mergeData(contextData.resources, parsedData.resources, selection.resources, contextData.setResources); break;
                    case 'securityProcesses': mergeData(contextData.securityProcesses, parsedData.securityProcesses, selection.securityProcesses, contextData.setSecurityProcesses); break;
                    case 'majorRisks': mergeData(contextData.majorRisks, parsedData.majorRisks, selection.majorRisks, contextData.setMajorRisks); break;
                }
            }
        });

        // Gestion spécifique pour les données du calendrier (localStorage direct)
        // Si on importe, on fusionne les dictionnaires
        if (parsedData.calendar_import_history) {
            const currentHistory = localStorage.getItem('calendar_import_history');
            const parsedHistory = currentHistory ? JSON.parse(currentHistory) : {};
            const mergedHistory = { ...parsedHistory, ...parsedData.calendar_import_history };
            saveToLocalStorage('calendar_import_history', mergedHistory);
        }
        if (parsedData.calendar_hidden_summaries) {
            const currentHidden = localStorage.getItem('calendar_hidden_summaries');
            const parsedHidden = currentHidden ? JSON.parse(currentHidden) : [];
            // Fusion unique (Set)
            const mergedHidden = Array.from(new Set([...parsedHidden, ...parsedData.calendar_hidden_summaries]));
            saveToLocalStorage('calendar_hidden_summaries', mergedHidden);
        }

        alert(`${importCount} éléments ont été restaurés/mis à jour avec succès.`);
        onClose();
    };

    const renderCategorySection = (category: DataCategory) => {
        const items = parsedData[category];
        if (!items || !Array.isArray(items) || items.length === 0) return null;

        const isExpanded = expandedCategories.has(category);
        const selectedSet = selection[category] || new Set();
        const allIds = items.map((i: any) => i.id);
        const isAllSelected = allIds.length > 0 && allIds.every(id => selectedSet.has(id));
        const isPartiallySelected = selectedSet.size > 0 && !isAllSelected;

        return (
            <div key={category} className="border border-slate-200 rounded-md mb-2 overflow-hidden">
                <div className="flex items-center justify-between bg-slate-50 p-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <button onClick={() => toggleCategoryExpand(category)} className="text-slate-500 hover:text-slate-800">
                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => toggleCategorySelection(category, allIds)}>
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isAllSelected ? 'bg-blue-600 border-blue-600' : isPartiallySelected ? 'bg-blue-100 border-blue-300' : 'bg-white border-slate-300'}`}>
                                {isAllSelected && <CheckSquare size={14} className="text-white" />}
                                {isPartiallySelected && <div className="w-2.5 h-2.5 bg-blue-600 rounded-sm" />}
                            </div>
                            <span className="font-semibold text-slate-700">{CATEGORY_LABELS[category]}</span>
                            <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                                {selectedSet.size} / {items.length}
                            </span>
                        </div>
                    </div>
                </div>
                
                {isExpanded && (
                    <div className="max-h-60 overflow-y-auto bg-white p-2 space-y-1">
                        {items.map((item: any) => {
                            const isSelected = selectedSet.has(item.id);
                            return (
                                <div 
                                    key={item.id} 
                                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                                    onClick={() => toggleItemSelection(category, item.id)}
                                >
                                    <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                                        {isSelected && <CheckSquare size={12} className="text-white" />}
                                    </div>
                                    <span className="text-sm text-slate-700 truncate">
                                        {getItemLabel(item, category)}
                                    </span>
                                    {/* Indicateur visuel si l'item existe déjà (optionnel, pour une version future) */}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    // FIX: Explicitly cast set to Set<string> to avoid "Property 'size' does not exist on type 'unknown'" error
    // FIX: Explicitly typed 'sum' to avoid 'unknown' type error.
    const totalSelected = Object.values(selection).reduce((sum: number, set) => sum + (set as Set<string>).size, 0);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Restauration avancée de sauvegarde">
            <div className="min-h-[400px] flex flex-col">
                {step === 'upload' && (
                    <div className="flex-grow flex flex-col items-center justify-center space-y-6 p-8">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                            <FileJson size={40} className="text-blue-600" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-semibold text-slate-800">Sélectionnez un fichier de sauvegarde</h3>
                            <p className="text-sm text-slate-500 max-w-sm">
                                Chargez un fichier JSON précédemment exporté. Vous pourrez ensuite choisir précisément quelles données restaurer.
                            </p>
                        </div>
                        
                        <label className="cursor-pointer">
                            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                            <span className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium">
                                <Upload size={20} />
                                Choisir le fichier
                            </span>
                        </label>

                        {error && (
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-md text-sm mt-4">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}
                    </div>
                )}

                {step === 'select' && parsedData && (
                    <div className="flex flex-col h-full">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4 flex items-start gap-3">
                            <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-semibold mb-1">Mode fusion</p>
                                <p>Les éléments sélectionnés seront ajoutés à vos données actuelles. Si un élément existe déjà (même ID), il sera mis à jour avec les données de la sauvegarde.</p>
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto pr-2 space-y-2 mb-4 max-h-[50vh]">
                            {(Object.keys(CATEGORY_LABELS) as DataCategory[]).map(category => renderCategorySection(category))}
                        </div>

                        <div className="border-t border-slate-200 pt-4 mt-auto flex justify-between items-center">
                            <div className="text-sm text-slate-600 font-medium">
                                {totalSelected} élément(s) sélectionné(s)
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setStep('upload')} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors text-sm">
                                    Retour
                                </button>
                                <button 
                                    onClick={handleRestore} 
                                    disabled={totalSelected === 0}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <CheckCircle size={18} />
                                    Restaurer la sélection
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default AdvancedImportModal;