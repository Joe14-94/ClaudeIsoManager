
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Upload, HelpCircle, DatabaseBackup, Info, AlertTriangle, Trash2, Workflow, FileDown, Database, ClipboardPaste, CheckCircle, XCircle, Table, Play, Calendar, Coins, Timer } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Tooltip from '../components/ui/Tooltip';
import { Activity, Chantier, Objective, StrategicOrientation, Resource, SecurityProcess, Project, TShirtSize, Initiative, ProjectCategory, ProjectStatus, IsoLink, FdrHistoryEntry } from '../types';
import Modal from '../components/ui/Modal';
import { loadReferenceData } from '../utils/referenceData';
import { ISO_MEASURES_DATA } from '../constants';
import { majorRisks as defaultMajorRisks } from '../data/majorRisks';

type AnalysisType = 'workload' | 'budget';

interface AnalysisResult {
    updates: {
        existingProject: Project;
        newData: Partial<Project>;
        changes: { field: keyof Project, fieldLabel: string, oldValue: any, newValue: any }[];
    }[];
    creates: Partial<Project>[];
    errors: { line: number; rowData: string[]; reason: string }[];
}

const fieldAliases: { [key in keyof Partial<Project> | string]: { label: string, aliases: string[] } } = {
    projectId: { label: 'ID Projet', aliases: ['id projet', 'project id', 'identifiant projet', 'id', 'projet', 'project', 'id-projet', 'id_projet', 'portefeuille', 'objet de cout'] },
    title: { label: 'Titre', aliases: ['titre', 'title', 'libellé', 'libelle', 'nom du projet'] },
    category: { label: 'Catégorie', aliases: ['catégorie', 'categorie', 'category'] },
    
    // Workload (Internal/External)
    internalWorkloadRequested: { label: 'Charge Interne Demandée', aliases: ['interne demandé', 'charge interne demandée'] },
    internalWorkloadEngaged: { label: 'Charge Interne Engagée', aliases: ['interne engagé', 'charge interne engagée'] },
    internalWorkloadConsumed: { label: 'Charge Interne Consommée', aliases: ['interne consommé', 'interne réalisé', 'charge interne consommée'] },
    
    externalWorkloadRequested: { label: 'Charge Externe Demandée', aliases: ['externe demandé', 'charge externe demandée'] },
    externalWorkloadEngaged: { label: 'Charge Externe Engagée', aliases: ['externe engagé', 'charge externe engagée'] },
    externalWorkloadConsumed: { label: 'Charge Externe Consommée', aliases: ['externe consommé', 'externe réalisé', 'charge externe consommée'] },

    // Budget fields
    budgetRequested: { label: 'Budget demandé', aliases: ['budget demandé', 'demandé', 'budget demande', 'budget demandé (€)', 'demande'] },
    budgetApproved: { label: 'Budget accordé', aliases: ['budget accordé', 'accordé', 'budget accorde', 'budget accordé (€)', 'accorde'] },
    budgetCommitted: { label: 'Budget engagé', aliases: ['budget engagé', 'engagé', 'budget engage', 'budget engagé (€)', 'engage'] },
    validatedPurchaseOrders: { label: 'DA validées', aliases: ['da validées', 'demandes d’achat validées', 'demandes d\'achat valides', 'da valides', 'da validees'] },
    completedPV: { label: 'Réalisé (PV)', aliases: ['réalisé (pv)', 'réalisé', 'pv', 'realise', 'realise (pv)'] },
    forecastedPurchaseOrders: { label: 'DA prévues', aliases: ['da prévues', 'demandes d’achat prévues', 'da prevues', 'demandes d\'achat prevues'] },
};


const ImportedDataDisplay: React.FC<{ data: Partial<Project> }> = ({ data }) => {
    const workloadKeys: (keyof Project)[] = ['internalWorkloadRequested', 'internalWorkloadEngaged', 'internalWorkloadConsumed', 'externalWorkloadRequested', 'externalWorkloadEngaged', 'externalWorkloadConsumed'];
    const budgetKeys: (keyof Project)[] = ['budgetRequested', 'budgetApproved', 'budgetCommitted', 'validatedPurchaseOrders', 'completedPV', 'forecastedPurchaseOrders'];
    const otherKeys: (keyof Project)[] = ['category'];

    const renderGroup = (title: string, keys: (keyof Project)[]) => {
        const items = keys.map(key => {
            const value = data[key];
            if (value === undefined || value === null || value === '') return null;
            const label = fieldAliases[key as keyof typeof fieldAliases]?.label || key;
            const displayValue = typeof value === 'number' ? value.toLocaleString('fr-FR') : String(value);
            return <div key={key} className="truncate text-slate-700"><span className="font-medium text-slate-500">{label}:</span> {displayValue}</div>
        }).filter(Boolean);

        if (items.length === 0) return null;

        return (
            <div>
                <h6 className="font-semibold text-slate-600 mt-2">{title}</h6>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pl-2">
                    {items}
                </div>
            </div>
        );
    };
    
    return (
        <div className="space-y-1 text-xs">
            {renderGroup('Charges (J/H)', workloadKeys)}
            {renderGroup('Budget (€)', budgetKeys)}
            {renderGroup('Autres', otherKeys)}
        </div>
    );
};

const FdrChoiceModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSelect: (type: 'workload' | 'budget') => void;
}> = ({ isOpen, onClose, onSelect }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Mise à jour FDR">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                <button 
                    onClick={() => onSelect('workload')}
                    className="flex flex-col items-center justify-center p-8 bg-blue-50 border-2 border-blue-100 rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-all group"
                >
                    <div className="p-4 bg-blue-600 text-white rounded-full mb-4 group-hover:scale-110 transition-transform">
                        <Timer size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Mise à jour Charges</h3>
                    <p className="text-sm text-slate-500 mt-2 text-center">Importer les données de consommation en jours/homme (J/H)</p>
                </button>
                
                <button 
                    onClick={() => onSelect('budget')}
                    className="flex flex-col items-center justify-center p-8 bg-purple-50 border-2 border-purple-100 rounded-xl hover:bg-purple-100 hover:border-purple-300 transition-all group"
                >
                    <div className="p-4 bg-purple-600 text-white rounded-full mb-4 group-hover:scale-110 transition-transform">
                        <Coins size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Mise à jour Budgets</h3>
                    <p className="text-sm text-slate-500 mt-2 text-center">Importer les données budgétaires en Euros (€)</p>
                </button>
            </div>
        </Modal>
    );
};


// Composant Modal pour la Mise à jour FDR (générique)
const FdrImportModal: React.FC<{
    isOpen: boolean;
    mode: 'workload' | 'budget';
    onClose: () => void;
    onImport: (projects: Project[], week: string, year: string) => void;
    existingProjects: Project[];
    initiatives: Initiative[];
}> = ({ isOpen, mode, onClose, onImport, existingProjects, initiatives }) => {
    const [pastedData, setPastedData] = useState('');
    const [displayedData, setDisplayedData] = useState<string[][]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [step, setStep] = useState<'input' | 'preview'>('input');
    const [importStats, setImportStats] = useState<{created: number, updated: number} | null>(null);

    // Nouveaux états pour la semaine et l'année
    const [week, setWeek] = useState<string>('');
    const [year, setYear] = useState<string>(new Date().getFullYear().toString());

    // Initialiser la semaine par défaut à la semaine précédente
    useEffect(() => {
        if (isOpen) {
             const now = new Date();
             const oneJan = new Date(now.getFullYear(), 0, 1);
             const numberOfDays = Math.floor((now.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
             const currentWeek = Math.ceil((now.getDay() + 1 + numberOfDays) / 7);
             const prevWeek = currentWeek > 1 ? currentWeek - 1 : 52; // Simplification
             setWeek(prevWeek.toString());
             setYear(now.getFullYear().toString());
             
             // Reset internal state
             setPastedData('');
             setDisplayedData([]);
             setStep('input');
             setImportStats(null);
        }
    }, [isOpen]);

    // Calcul des totaux pour la prévisualisation
    const previewTotals = useMemo(() => {
        if (displayedData.length === 0 || headers.length === 0) return null;

        // Initialiser le tableau des totaux avec des zéros
        const totals = new Array(headers.length).fill(0);

        displayedData.forEach(row => {
            // Exclure la ligne "Total général" du calcul des sommes de la prévisualisation
            // pour éviter de doubler les montants (puisque c'est déjà une somme)
            if (row[1] === 'TOTAL_GENERAL') return;

            row.forEach((cell, index) => {
                // On ignore les colonnes Catégorie, ID, Libellé (indices 0, 1, 2)
                if (index > 2) {
                     // Nettoyage : enlever ' JH', ' €', espaces, et remplacer virgule par point pour le calcul
                    const cleanVal = cell.replace(/[^0-9,.-]/g, '').replace(',', '.');
                    const num = parseFloat(cleanVal);
                    if (!isNaN(num)) {
                        totals[index] += num;
                    }
                }
            });
        });

        // Formater les totaux pour l'affichage
        return totals.map((val, index) => {
            if (index === 0) return "TOTAL (Calc)";
            if (index < 3) return ""; // Cellules vides pour ID et Libellé
            // Format français avec séparateur de milliers
            return val.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
        });
    }, [displayedData, headers]);

    const handleVisualize = () => {
        if (!pastedData.trim()) return;

        const rows = pastedData.trim().split('\n');
        const rawData = rows.map(row => row.split('\t'));
        
        const categoryKeywords = ["Activité", "EPA", "MCO", "Opportunité", "Opération", "Projet"];
        let currentCategory = "";

        // 1. Identifier la ligne d'en-tête
        let headerRowIndex = -1;
        
        const keywords = mode === 'workload' 
            ? ["Demandé", "Réalisé", "Interne"] 
            : ["Budget", "Engagé", "Accordé", "PV"];

        for(let i=0; i<rawData.length; i++) {
             // On regarde à partir de la colonne 1 pour éviter de confondre avec des titres en col 0
            const rowString = rawData[i].slice(1).join(' ');
            if (keywords.some(k => rowString.includes(k))) {
                headerRowIndex = i;
                break;
            }
        }

        if (headerRowIndex === -1) {
             headerRowIndex = 0;
        }

        // 2. Préparer les nouveaux en-têtes
        const originalHeaders = rawData[headerRowIndex];
        const newHeaders = ["Catégorie", "ID Projet", "Libellé"];
        
        if (mode === 'workload') {
            // Mapping flexible: On suppose que l'export a Interne et Externe en premiers blocs
            for (let i = 1; i < originalHeaders.length; i++) {
                let h = originalHeaders[i] || `Col ${i}`;
                // Mapping simplifié basé sur l'ordre supposé des colonnes dans l'export FDR standard
                // Col 1-3: Interne (Demandé, Engagé, Réalisé)
                // Col 4-6: Externe (Demandé, Engagé, Réalisé)
                // Col 7+: Totaux
                
                if (h.toLowerCase().includes("interne") || (i >= 1 && i <= 3)) {
                     if (!h.toLowerCase().includes("interne")) h = "Interne " + h;
                } else if (h.toLowerCase().includes("externe") || (i >= 4 && i <= 6)) {
                    if (!h.toLowerCase().includes("externe")) h = "Externe " + h;
                }
                
                newHeaders.push(h);
            }
        } else {
            // Budget mapping
             for (let i = 1; i < originalHeaders.length; i++) {
                newHeaders.push(originalHeaders[i] || `Col ${i}`);
            }
        }

        const finalRows: string[][] = [];

        // 3. Itérer sur les données (après la ligne d'en-tête)
        for (let i = headerRowIndex + 1; i < rawData.length; i++) {
            const row = rawData[i];
            const colA = (row[0] || '').trim();

            // Sauter les lignes vides
            if (!colA && row.length < 2) continue;

            // A. Détection de catégorie (Stricte)
            if (categoryKeywords.includes(colA)) {
                currentCategory = colA;
                continue;
            }
            
            // A bis. Détection de la ligne "Total général"
            if (colA.toLowerCase().includes('total général')) {
                const id = 'TOTAL_GENERAL';
                const label = 'Total Général FDR';
                 // Récupérer les données (colonnes 1 à fin)
                const dataValues = row.slice(1);
                 // Si dataValues est plus court que prévu, on complète avec des vides
                while (dataValues.length < newHeaders.length - 3) {
                    dataValues.push('');
                }
                 // Construire la nouvelle ligne pour le total général.
                finalRows.push(['Total', id, label, ...dataValues]);
                continue;
            }

            // B. Exclusion (3 points)
            const dotCount = (colA.match(/\./g) || []).length;
            if (dotCount === 3) continue;

            // C. Traitement des lignes de données
            if (colA.includes(':')) {
                const separatorIndex = colA.indexOf(':');
                const id = colA.substring(0, separatorIndex).trim();
                const label = colA.substring(separatorIndex + 1).trim();

                // Récupérer les données (colonnes 1 à fin)
                const dataValues = row.slice(1);
                
                // Si dataValues est plus court que prévu, on complète avec des vides
                while (dataValues.length < newHeaders.length - 3) {
                    dataValues.push('');
                }

                // Construire la nouvelle ligne
                finalRows.push([currentCategory, id, label, ...dataValues]);
            }
        }

        if (finalRows.length === 0) {
             alert("Aucune donnée valide n'a été trouvée. Assurez-vous que les lignes de projets contiennent le séparateur ':' (ex: P25-001 : Mon Projet) ou qu'une ligne 'Total général' est présente.");
             return;
        }

        setHeaders(newHeaders);
        setDisplayedData(finalRows);
        setStep('preview');
        setImportStats(null);
    };

    // Helper pour calculer le score de récence d'une entrée d'historique
    const getRecencyScore = (w: string, y: string): number => {
        return parseInt(y) * 100 + parseInt(w);
    };

    // Fonction pour recalculer les champs "plats" d'un projet en fonction de son historique
    const recalculateProjectFields = (project: Project): Project => {
        if (!project.fdrHistory || project.fdrHistory.length === 0) return project;

        // Trier l'historique du plus récent au plus ancien
        const sortedHistory = [...project.fdrHistory].sort((a, b) => {
            return getRecencyScore(b.week, b.year) - getRecencyScore(a.week, a.year);
        });

        const latestWorkload = sortedHistory.find(h => h.type === 'workload');
        const latestBudget = sortedHistory.find(h => h.type === 'budget');

        const newData: Partial<Project> = {};

        // Appliquer les dernières données de charge
        if (latestWorkload && latestWorkload.data) {
            newData.internalWorkloadRequested = latestWorkload.data.internalWorkloadRequested;
            newData.internalWorkloadEngaged = latestWorkload.data.internalWorkloadEngaged;
            newData.internalWorkloadConsumed = latestWorkload.data.internalWorkloadConsumed;
            newData.externalWorkloadRequested = latestWorkload.data.externalWorkloadRequested;
            newData.externalWorkloadEngaged = latestWorkload.data.externalWorkloadEngaged;
            newData.externalWorkloadConsumed = latestWorkload.data.externalWorkloadConsumed;
        }

        // Appliquer les dernières données budgétaires
        if (latestBudget && latestBudget.data) {
            newData.budgetRequested = latestBudget.data.budgetRequested;
            newData.budgetApproved = latestBudget.data.budgetApproved;
            newData.budgetCommitted = latestBudget.data.budgetCommitted;
            newData.validatedPurchaseOrders = latestBudget.data.validatedPurchaseOrders;
            newData.completedPV = latestBudget.data.completedPV;
            newData.forecastedPurchaseOrders = latestBudget.data.forecastedPurchaseOrders;
        }

        return { ...project, ...newData };
    };


    const handleImportData = () => {
        const h = headers;
        const existingMap = new Map<string, Project>(existingProjects.map(p => [p.projectId, p] as [string, Project]));
        let created = 0;
        let updated = 0;
        const updatedProjectsList: Project[] = [];
        
        const parseNum = (val: string) => {
            if (!val) return 0;
            // Remove currency symbols, JH, spaces
            const v = val.replace(/JH|€|k€|M€/gi, '').replace(/\s/g, '').replace(',', '.');
            const n = parseFloat(v);
            return isNaN(n) ? 0 : n;
        }

        // Indices identification
        let idxIntDemande = -1, idxIntEngage = -1, idxIntRealise = -1;
        let idxExtDemande = -1, idxExtEngage = -1, idxExtRealise = -1;
        
        let idxBudReq = -1, idxBudApp = -1, idxBudCom = -1, idxDaVal = -1, idxPv = -1, idxDaPrev = -1;

        if (mode === 'workload') {
            // On cherche les colonnes contenant "Interne" ou "Externe"
            idxIntDemande = h.findIndex(s => s.toLowerCase().includes("interne") && s.toLowerCase().includes("demandé"));
            // Fallback index si non trouvé par nom (conventionnel: col 1, 2, 3 pour interne)
            if(idxIntDemande === -1) idxIntDemande = 1;

            idxIntEngage = h.findIndex(s => s.toLowerCase().includes("interne") && s.toLowerCase().includes("engagé"));
            if(idxIntEngage === -1) idxIntEngage = 2;

            idxIntRealise = h.findIndex(s => s.toLowerCase().includes("interne") && (s.toLowerCase().includes("réalisé") || s.toLowerCase().includes("consommé")));
            if(idxIntRealise === -1) idxIntRealise = 3;

            idxExtDemande = h.findIndex(s => s.toLowerCase().includes("externe") && s.toLowerCase().includes("demandé"));
            if(idxExtDemande === -1) idxExtDemande = 4;

            idxExtEngage = h.findIndex(s => s.toLowerCase().includes("externe") && s.toLowerCase().includes("engagé"));
            if(idxExtEngage === -1) idxExtEngage = 5;

            idxExtRealise = h.findIndex(s => s.toLowerCase().includes("externe") && (s.toLowerCase().includes("réalisé") || s.toLowerCase().includes("consommé")));
            if(idxExtRealise === -1) idxExtRealise = 6;

        } else {
            // Budget Mapping based on typical FDR export
            idxBudReq = 3;
            idxBudApp = 4;
            idxBudCom = 5;
            idxDaVal = 6;
            idxPv = 7;
            idxDaPrev = 8;
        }

        displayedData.forEach(row => {
            const rawCategory = row[0];
            const projectId = row[1];
            const title = row[2];
            
            if (!projectId) return;

            let categoryEnum = ProjectCategory.PROJECT;
            if (rawCategory === 'Activité') categoryEnum = ProjectCategory.ACTIVITY;
            else if (rawCategory === 'EPA') categoryEnum = ProjectCategory.EPA;
            else if (rawCategory === 'MCO') categoryEnum = ProjectCategory.MCO;
            else if (rawCategory === 'Opportunité') categoryEnum = ProjectCategory.OPPORTUNITY;
            else if (rawCategory === 'Opération') categoryEnum = ProjectCategory.OPERATION;
            
            // On extrait uniquement les données spécifiques à l'import en cours pour l'historique
            const specificImportData: Partial<Project> = {};

            if (mode === 'workload') {
                specificImportData.internalWorkloadRequested = idxIntDemande > -1 ? parseNum(row[idxIntDemande]) : 0;
                specificImportData.internalWorkloadEngaged = idxIntEngage > -1 ? parseNum(row[idxIntEngage]) : 0;
                specificImportData.internalWorkloadConsumed = idxIntRealise > -1 ? parseNum(row[idxIntRealise]) : 0;
                
                specificImportData.externalWorkloadRequested = idxExtDemande > -1 ? parseNum(row[idxExtDemande]) : 0;
                specificImportData.externalWorkloadEngaged = idxExtEngage > -1 ? parseNum(row[idxExtEngage]) : 0;
                specificImportData.externalWorkloadConsumed = idxExtRealise > -1 ? parseNum(row[idxExtRealise]) : 0;
            } else {
                specificImportData.budgetRequested = idxBudReq > -1 ? parseNum(row[idxBudReq]) : 0;
                specificImportData.budgetApproved = idxBudApp > -1 ? parseNum(row[idxBudApp]) : 0;
                specificImportData.budgetCommitted = idxBudCom > -1 ? parseNum(row[idxBudCom]) : 0;
                specificImportData.validatedPurchaseOrders = idxDaVal > -1 ? parseNum(row[idxDaVal]) : 0;
                specificImportData.completedPV = idxPv > -1 ? parseNum(row[idxPv]) : 0;
                specificImportData.forecastedPurchaseOrders = idxDaPrev > -1 ? parseNum(row[idxDaPrev]) : 0;
            }

            const historyEntry: FdrHistoryEntry = {
                week,
                year,
                type: mode,
                importDate: new Date().toISOString(),
                data: specificImportData
            };

            if (existingMap.has(projectId)) {
                const existing = existingMap.get(projectId)!;
                
                // Mise à jour de l'historique
                const currentHistory = existing.fdrHistory ? [...existing.fdrHistory] : [];
                // Supprimer une éventuelle entrée existante pour la même semaine/année/type pour éviter les doublons
                const filteredHistory = currentHistory.filter(h => !(h.week === week && h.year === year && h.type === mode));
                filteredHistory.push(historyEntry);

                // Recalculer les champs plats à partir du nouvel historique complet
                const updatedProjectWithHistory = {
                    ...existing,
                    updatedAt: new Date().toISOString(),
                    fdrHistory: filteredHistory
                };

                const fullyUpdatedProject = recalculateProjectFields(updatedProjectWithHistory);

                updatedProjectsList.push(fullyUpdatedProject);
                existingMap.delete(projectId);
                updated++;
            } else {
                // Nouveau projet
                const newProjectBase: Project = {
                    id: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    projectId,
                    title: title || 'Projet sans titre',
                    status: ProjectStatus.IDENTIFIED,
                    tShirtSize: TShirtSize.M,
                    isTop30: false,
                    initiativeId: initiatives[0]?.id || '', 
                    isoMeasures: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    category: categoryEnum,
                    fdrHistory: [historyEntry], // Initialiser avec l'historique
                     // Initialiser les champs à 0
                    budgetRequested: 0, budgetApproved: 0, budgetCommitted: 0, validatedPurchaseOrders: 0, completedPV: 0, forecastedPurchaseOrders: 0,
                    internalWorkloadRequested: 0, internalWorkloadEngaged: 0, internalWorkloadConsumed: 0,
                    externalWorkloadRequested: 0, externalWorkloadEngaged: 0, externalWorkloadConsumed: 0,
                };
                
                if (projectId === 'TOTAL_GENERAL') {
                    newProjectBase.isTop30 = false;
                }

                // Appliquer les champs de l'import courant
                const newProject = recalculateProjectFields(newProjectBase);
                
                updatedProjectsList.push(newProject);
                created++;
            }
        });

        // Ajouter les projets existants non touchés par l'import
        existingMap.forEach(p => updatedProjectsList.push(p));

        onImport(updatedProjectsList, week, year);
        setImportStats({ created, updated });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Mise à jour FDR (${mode === 'workload' ? 'Charges J/H' : 'Budget €'})`}>
            {importStats ? (
                 <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                        <CheckCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Importation réussie !</h3>
                    <div className="flex gap-8 text-center">
                        <div>
                            <p className="text-3xl font-bold text-slate-700">{importStats.updated}</p>
                            <p className="text-sm text-slate-500">Projets mis à jour</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-slate-700">{importStats.created}</p>
                            <p className="text-sm text-slate-500">Projets créés</p>
                        </div>
                    </div>
                    <p className="text-sm text-slate-600 italic">Les données ont été archivées sous S{week}-{year}.</p>
                    <button onClick={onClose} className="mt-4 px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition-colors">
                        Fermer
                    </button>
                 </div>
            ) : (
                <div className="space-y-4 h-[70vh] flex flex-col">
                    {step === 'input' ? (
                        <>
                            <p className="text-sm text-slate-600">
                                1. Précisez la semaine et l'année de référence.<br/>
                                2. Copiez les données <strong>{mode === 'workload' ? 'charges' : 'budgétaires'}</strong> depuis votre fichier Excel (incluant les en-têtes) et collez-les ci-dessous.
                            </p>
                            <div className="flex gap-4 items-center p-3 bg-slate-50 border border-slate-200 rounded-md">
                                <div className="flex items-center gap-2">
                                    <Calendar size={18} className="text-slate-500" />
                                    <label htmlFor="weekInput" className="text-sm font-medium text-slate-700">Semaine :</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">S</span>
                                        <input 
                                            id="weekInput"
                                            type="number" 
                                            min="1" 
                                            max="53"
                                            className="w-20 pl-6 pr-2 py-1.5 border border-slate-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="44"
                                            value={week}
                                            onChange={(e) => setWeek(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label htmlFor="yearInput" className="text-sm font-medium text-slate-700">Année :</label>
                                    <input 
                                        id="yearInput"
                                        type="number" 
                                        min="2020" 
                                        max="2030"
                                        className="w-20 px-3 py-1.5 border border-slate-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="2025"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                    />
                                </div>
                            </div>

                            <textarea 
                                value={pastedData}
                                onChange={e => setPastedData(e.target.value)}
                                className="flex-grow w-full p-3 border border-slate-300 rounded-md font-mono text-xs bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                placeholder={`Collez vos données ${mode === 'workload' ? 'de charges (J/H)' : 'de budget (€)'} ici...`}
                            />
                            <div className="flex justify-end pt-2">
                                <button onClick={handleVisualize} disabled={!pastedData || !week || !year} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 transition-colors">
                                    <Play size={16} />
                                    Visualiser le traitement
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-slate-800">Prévisualisation (Données S{week}-{year})</h3>
                                <button onClick={() => { setStep('input'); setDisplayedData([]); }} className="text-sm text-blue-600 hover:underline">
                                    Modifier les données brutes
                                </button>
                            </div>
                            <div className="flex-grow overflow-auto border border-slate-200 rounded-md bg-slate-50 relative">
                                <table className="w-full text-xs text-left whitespace-nowrap">
                                    <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 shadow-sm z-10">
                                        <tr>
                                            {headers.map((h, i) => <th key={i} className="px-3 py-2 border-b border-r last:border-r-0 border-slate-200">{h}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-100">
                                        {displayedData.map((row, i) => (
                                            <tr key={i} className={`hover:bg-blue-50 ${row[1] === 'TOTAL_GENERAL' ? 'bg-slate-100 font-semibold' : ''}`}>
                                                {row.map((cell, j) => <td key={j} className="px-3 py-1.5 border-r last:border-r-0 border-slate-100">{cell}</td>)}
                                            </tr>
                                        ))}
                                    </tbody>
                                    {previewTotals && (
                                        <tfoot className="bg-slate-800 text-white font-bold sticky bottom-0 z-10 shadow-md">
                                            <tr>
                                                {previewTotals.map((cell, i) => (
                                                    <td key={i} className="px-3 py-3 border-r last:border-r-0 border-slate-600">
                                                        {cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                             <div className="flex justify-end pt-2 gap-3">
                                <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                                    Annuler
                                </button>
                                <button onClick={handleImportData} disabled={displayedData.length === 0} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-300 transition-colors">
                                    <Database size={16} />
                                    Importer les données
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </Modal>
    );
};


const DataManagement: React.FC = () => {
  const { 
    activities, setActivities,
    objectives, setObjectives,
    orientations, setOrientations,
    resources, setResources,
    chantiers, setChantiers,
    securityProcesses, setSecurityProcesses,
    projects, setProjects,
    initiatives, setInitiatives,
    dashboardLayouts, setDashboardLayouts,
    setLastCsvImportDate,
    setLastImportWeek,
    setLastImportYear,
    setMajorRisks
  } = useData();
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isReadOnly = false;
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const [showResetActivitiesModal, setShowResetActivitiesModal] = useState(false);
  const [showResetProjectsModal, setShowResetProjectsModal] = useState(false);
  const [showAppInitModal, setShowAppInitModal] = useState(false);
  const [showDeleteAllDataModal, setShowDeleteAllDataModal] = useState(false);

  // FDR Choice & Import Modal States
  const [isFdrChoiceModalOpen, setIsFdrChoiceModalOpen] = useState(false);
  const [isFdrImportModalOpen, setIsFdrImportModalOpen] = useState(false);
  const [fdrImportMode, setFdrImportMode] = useState<'workload' | 'budget'>('workload');

  useEffect(() => {
      // Check if navigation requested to open FDR choice
      if ((location.state && (location.state as any).openFdrChoice) || location.pathname.endsWith('/fdr')) {
          setIsFdrChoiceModalOpen(true);
          // Clean state
          window.history.replaceState({}, document.title);
      }
  }, [location]);
  
  const handleFdrChoice = (type: 'workload' | 'budget') => {
      setFdrImportMode(type);
      setIsFdrChoiceModalOpen(false);
      setIsFdrImportModalOpen(true);
  };

  const storageUsage = useMemo(() => {
    const dataToMeasure = {
        activities, objectives, orientations, resources, chantiers,
        securityProcesses, projects, initiatives, dashboardLayouts
    };

    let totalBytes = 0;
    try {
        for (const key in localStorage) {
            if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
                const value = localStorage.getItem(key);
                if (value) {
                    totalBytes += (key.length + value.length) * 2; // Approximation: 2 bytes per char
                }
            }
        }
    } catch(e) {
        console.error("Could not calculate localStorage size.", e);
        return { usedBytes: 0, percentage: 0, color: 'bg-green-500' };
    }
    
    const MAX_STORAGE = 5 * 1024 * 1024; // 5MB
    const percentage = Math.min((totalBytes / MAX_STORAGE) * 100, 100);

    let color = 'bg-green-500';
    if (percentage > 80) {
      color = 'bg-red-500';
    } else if (percentage > 50) {
      color = 'bg-yellow-500';
    }

    return { usedBytes: totalBytes, percentage, color };
  }, [activities, objectives, orientations, resources, chantiers, securityProcesses, projects, initiatives, dashboardLayouts]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Octets';
    const k = 1024;
    const sizes = ['Octets', 'Ko', 'Mo', 'Go', 'To'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };
  
  const handleExport = () => {
    if (isReadOnly) return;
    const allData = {
      activities,
      objectives,
      orientations,
      resources,
      chantiers,
      securityProcesses,
      projects,
      initiatives,
      dashboardLayouts
    };
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iso-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportReferentiel = () => {
    if (isReadOnly) return;
    const referentielData = {
      initiatives,
      orientations,
      chantiers,
      objectives,
      securityProcesses,
      resources
    };
    const blob = new Blob([JSON.stringify(referentielData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `referentiel-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>, dataType: string) => {
    if (isReadOnly) {
        if(event.target) event.target.value = '';
        return;
    }
    const file = event.target.files?.[0];
    const inputElement = event.target;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
          
          if (dataType !== 'Sauvegarde Complète' && !Array.isArray(content)) {
            showFeedback('error', 'Le fichier JSON doit contenir un tableau de données.');
            return;
          }

          switch(dataType) {
            case 'Projets':
                setProjects(content as Project[]);
                showFeedback('success', 'Projets importés avec succès.');
                break;
            case 'Objectifs':
                setObjectives(content as Objective[]);
                showFeedback('success', 'Objectifs importés avec succès.');
                break;
            case 'Orientations':
                setOrientations(content as StrategicOrientation[]);
                showFeedback('success', 'Orientations importées avec succès.');
                break;
             case 'Initiatives':
                setInitiatives(content as Initiative[]);
                showFeedback('success', 'Initiatives importées avec succès.');
                break;
            case 'Activités':
                setActivities(content as Activity[]);
                showFeedback('success', 'Activités importées avec succès.');
                break;
            case 'Chantiers':
                setChantiers(content as Chantier[]);
                showFeedback('success', 'Chantiers importés avec succès.');
                break;
            case 'Processus de sécurité':
                setSecurityProcesses(content as SecurityProcess[]);
                showFeedback('success', 'Processus de sécurité importés avec succès.');
                break;
            case 'Sauvegarde Complète':
                let importedCount = 0;
                if (Array.isArray(content.activities)) { setActivities(content.activities); importedCount++; }
                if (Array.isArray(content.objectives)) { setObjectives(content.objectives); importedCount++; }
                if (Array.isArray(content.orientations)) { setOrientations(content.orientations); importedCount++; }
                if (Array.isArray(content.resources)) { setResources(content.resources); importedCount++; }
                if (Array.isArray(content.chantiers)) { setChantiers(content.chantiers); importedCount++; }
                if (Array.isArray(content.securityProcesses)) { setSecurityProcesses(content.securityProcesses); importedCount++; }
                if (Array.isArray(content.projects)) { setProjects(content.projects); importedCount++; }
                if (Array.isArray(content.initiatives)) { setInitiatives(content.initiatives); importedCount++; }
                if (content.dashboardLayouts) { setDashboardLayouts(content.dashboardLayouts); importedCount++; }
                if (Array.isArray(content.majorRisks)) { setMajorRisks(content.majorRisks); importedCount++; }
                
                if (importedCount > 0) {
                    showFeedback('success', `Sauvegarde restaurée avec succès. ${importedCount} type(s) de données importé(s).`);
                } else {
                    showFeedback('error', 'Fichier de sauvegarde invalide. La structure des données est incorrecte ou des données sont manquantes.');
                }
                break;
            default:
                showFeedback('error', `L'importation pour le type "${dataType}" n'est pas encore implémentée.`);
          }
        } catch (error) {
          showFeedback('error', 'Erreur lors de la lecture ou du parsing du fichier JSON.');
        } finally {
            if(inputElement) inputElement.value = '';
        }
      };
      reader.onerror = () => {
          showFeedback('error', 'Erreur de lecture du fichier.');
          if(inputElement) inputElement.value = '';
      };
      reader.readAsText(file);
    }
  };

  const handleStrategyIsoImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) {
      if (event.target) event.target.value = '';
      return;
    }
    const file = event.target.files?.[0];
    const inputElement = event.target;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
          if (!content.strategie_cybersecurite || !Array.isArray(content.strategie_cybersecurite)) {
            showFeedback('error', 'Le fichier JSON est invalide. Il doit contenir une clé "strategie_cybersecurite" avec un tableau.');
            return;
          }

          const data = content.strategie_cybersecurite;
          const isoMeasuresMap = new Map(ISO_MEASURES_DATA.map(m => [m.code, m.title]));

          const newOrientations = new Map<string, StrategicOrientation>();
          const newChantiers = new Map<string, Chantier>();
          const newObjectives = new Map<string, Objective>();

          data.forEach((item: any) => {
            const osCode = item.orientation_strategique?.numero;
            if (osCode && !newOrientations.has(osCode)) {
              newOrientations.set(osCode, {
                id: `so-import-${osCode.replace('.', '-')}`,
                code: osCode,
                label: item.orientation_strategique.description,
                createdAt: new Date().toISOString(),
              });
            }

            const chantierCode = item.chantier?.numero;
            if (chantierCode && !newChantiers.has(chantierCode)) {
              const orientation = newOrientations.get(osCode);
              if (orientation) {
                newChantiers.set(chantierCode, {
                  id: `ch-import-${chantierCode.replace('.', '-')}`,
                  code: chantierCode,
                  label: item.chantier.description,
                  strategicOrientationId: orientation.id,
                  createdAt: new Date().toISOString(),
                });
              }
            }

            const objectiveCode = item.objectif?.numero;
            if (objectiveCode) {
              const chantier = newChantiers.get(chantierCode);
              const orientation = newOrientations.get(osCode);

              if (chantier && orientation) {
                if (!newObjectives.has(objectiveCode)) {
                  let label = item.objectif.description.replace(/^- /, '').split('\n')[0];
                  if (label.length > 100) label = label.substring(0, 100) + '...';
                  newObjectives.set(objectiveCode, {
                    id: `obj-import-${objectiveCode.replace(/\./g, '-')}`,
                    code: objectiveCode,
                    label: label,
                    description: item.objectif.description,
                    chantierId: chantier.id,
                    strategicOrientations: [orientation.id],
                    createdAt: new Date().toISOString(),
                    mesures_iso: [],
                  });
                }
                
                const objective = newObjectives.get(objectiveCode)!;
                if (item.mapping_iso_27002) {
                  const isoMapping = item.mapping_iso_27002;
                  const isoCode = isoMapping.numero_mesure;
                  if (!objective.mesures_iso?.some(m => m.numero_mesure === isoCode)) {
                    objective.mesures_iso?.push({
                      domaine: isoMapping.domaine,
                      numero_mesure: isoCode,
                      titre: isoMeasuresMap.get(isoCode) || 'Titre non trouvé',
                      description: isoMapping.synthese_mesure,
                      niveau_application: '',
                    });
                  }
                }
              }
            }
          });

          setOrientations(Array.from(newOrientations.values()));
          setChantiers(Array.from(newChantiers.values()));
          setObjectives(Array.from(newObjectives.values()));

          showFeedback('success', `Référentiel Stratégie/ISO importé : ${newOrientations.size} orientations, ${newChantiers.size} chantiers, ${newObjectives.size} objectifs créés.`);

        } catch (error) {
          console.error(error);
          showFeedback('error', 'Erreur lors du traitement du fichier JSON de stratégie.');
        } finally {
          if (inputElement) inputElement.value = '';
        }
      };
      reader.onerror = () => {
        showFeedback('error', 'Erreur de lecture du fichier.');
        if (inputElement) inputElement.value = '';
      };
      reader.readAsText(file);
    }
  };

  const confirmResetActivities = () => {
    if (isReadOnly) return;
    setActivities([]);
    setShowResetActivitiesModal(false);
    showFeedback('success', 'Toutes les activités ont été supprimées.');
  }
  
  const confirmResetProjects = () => {
    if (isReadOnly) return;
    setProjects([]);
    setShowResetProjectsModal(false);
    showFeedback('success', 'Tous les projets ont été supprimés.');
  }

  const confirmAppInit = async () => {
    if (isReadOnly) return;
    try {
        setActivities([]);
        setProjects([]);
        // Reset dashboards to empty default for clean start
        setDashboardLayouts({ lg: [] });
        
        // Restore default Major Risks by deep copying the original constant
        setMajorRisks(JSON.parse(JSON.stringify(defaultMajorRisks)));
        
        setLastCsvImportDate(null);
        setLastImportWeek(null);
        setLastImportYear(null);

        const refData = await loadReferenceData();
        setOrientations(refData.orientations);
        setChantiers(refData.chantiers);
        setObjectives(refData.objectives);
        // Mise à jour de toutes les données de référence
        setInitiatives(refData.initiatives);
        setResources(refData.resources);
        setSecurityProcesses(refData.securityProcesses);
        
        setShowAppInitModal(false);
        showFeedback('success', "L'application a été réinitialisée avec succès.");
    } catch (error) {
        setShowAppInitModal(false);
        showFeedback('error', "Une erreur est survenue lors de la réinitialisation de l'application.");
        console.error("Erreur d'initialisation de l'application:", error);
    }
  };
  
    const confirmDeleteAllData = () => {
    if (isReadOnly) return;
    setActivities([]);
    setProjects([]);
    setObjectives([]);
    setChantiers([]);
    setOrientations([]);
    setInitiatives([]);
    setResources([]);
    setSecurityProcesses([]);
    setMajorRisks([]);
    setDashboardLayouts({ lg: [] });
    setLastCsvImportDate(null);
    setLastImportWeek(null);
    setLastImportYear(null);
    
    setShowDeleteAllDataModal(false);
    showFeedback('success', 'Toutes les données de l\'application ont été supprimées.');
  };

    // Callback pour la nouvelle modale FDR
    const handleFdrUpdate = (updatedProjects: Project[], week: string, year: string) => {
        setProjects(updatedProjects);
        setLastCsvImportDate(new Date().toISOString());
        setLastImportWeek(week);
        setLastImportYear(year);
        setIsFdrImportModalOpen(false);
        showFeedback('success', `Données FDR (S${week}-${year}) importées et mises à jour avec succès.`);
    }


  const buttonClasses = "flex items-center justify-center px-4 py-2 rounded-lg transition-colors";
  const disabledClasses = "bg-slate-300 text-slate-500 cursor-not-allowed";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Gestion des données</h1>
      
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Database size={20} />
                Utilisation de l'espace de stockage local
                <Tooltip text="Les données sont stockées dans votre navigateur. Cette jauge est une estimation basée sur une limite commune de 5 Mo.">
                    <Info size={16} className="text-slate-400 cursor-help" />
                </Tooltip>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                    <span className="text-lg font-bold text-slate-800">{storageUsage.percentage.toFixed(2)}% utilisé</span>
                    <span className="text-sm text-slate-500">{formatBytes(storageUsage.usedBytes)} / 5 Mo</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-4">
                    <div className={`${storageUsage.color} h-4 rounded-full transition-all duration-500`} style={{ width: `${storageUsage.percentage}%` }}></div>
                </div>
            </div>
        </CardContent>
      </Card>

      <p className="text-slate-600">
        Importez, exportez ou sauvegardez/restaurez les données de votre application.
      </p>

      {isReadOnly && (
        <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
          <p className="font-bold">Mode lecture seule</p>
          <p>Les fonctionnalités d'importation et d'exportation sont désactivées.</p>
        </div>
      )}

      {(userRole === 'admin' || userRole === 'pmo') && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Sauvegarde et restauration</CardTitle>
            <Tooltip text="La sauvegarde complète inclut : projets (avec historique FDR), activités, objectifs, orientations, chantiers, ressources, initiatives, processus de sécurité, risques majeurs et la disposition du tableau de bord.">
              <Info size={18} className="text-slate-500 cursor-help" />
            </Tooltip>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleExport}
              disabled={isReadOnly}
              className={`${buttonClasses} ${isReadOnly ? disabledClasses : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              <DatabaseBackup className="mr-2" size={18} />
              Sauvegarder les données (JSON)
            </button>
            
            <label className={`${buttonClasses} ${isReadOnly ? disabledClasses : 'bg-slate-500 text-white hover:bg-slate-600 cursor-pointer'}`}>
                <Upload className="mr-2" size={18} />
                Restaurer une sauvegarde
                <input type="file" className="hidden" accept=".json" onChange={(e) => handleFileImport(e, 'Sauvegarde Complète')} disabled={isReadOnly} />
            </label>
          </CardContent>
        </Card>
      )}

      {(userRole === 'admin' || userRole === 'pmo') && (
        <Card>
          <CardHeader>
            <CardTitle>Export du Référentiel</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Sauvegardez les données de référence principales de l'application dans un fichier JSON.</p>
          </CardHeader>
          <CardContent>
            <button
              onClick={handleExportReferentiel}
              disabled={isReadOnly}
              className={`${buttonClasses} ${isReadOnly ? disabledClasses : 'bg-purple-600 text-white hover:bg-purple-700'}`}
            >
              <FileDown className="mr-2" size={18} />
              Exporter le Référentiel (JSON)
            </button>
          </CardContent>
        </Card>
      )}
      
      <div className="my-4">
        {feedback && (
            <div className={`p-4 rounded-md text-sm border ${feedback.type === 'success' ? 'bg-green-100 border-green-300 text-green-800' : 'bg-red-100 border-red-300 text-red-800'}`}>
                <p>{feedback.message}</p>
            </div>
        )}
      </div>
      

      <Card>
        <CardHeader>
          <CardTitle>Import de données</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Importez des listes spécifiques. L'importation remplacera les données existantes pour le type sélectionné, sauf pour les imports FDR.</p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {userRole === 'admin' && (
            <>
              <div className="p-4 border rounded-lg md:col-span-2 bg-slate-50">
                <h3 className="font-semibold text-slate-800">Importer le référentiel Stratégie/ISO (JSON)</h3>
                <div className="flex items-center text-sm text-slate-600 mt-1 mb-2">
                    <HelpCircle size={16} className="mr-2"/>
                    <span>Importe les orientations, chantiers et objectifs depuis le fichier de mapping. <strong>Écrase les données de référence existantes.</strong></span>
                </div>
                <label className={`${buttonClasses} text-sm w-fit ${isReadOnly ? disabledClasses : 'bg-orange-600 text-white hover:bg-orange-700 cursor-pointer'}`}>
                    <Workflow size={16} className="mr-2" /> Importer le référentiel
                    <input type="file" className="hidden" accept=".json" onChange={handleStrategyIsoImport} disabled={isReadOnly}/>
                </label>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold">Importer des objectifs (JSON)</h3>
                <div className="flex items-center text-sm text-slate-500 mt-1 mb-2">
                  <HelpCircle size={16} className="mr-2"/>
                  <span>Le fichier JSON doit être un tableau d'objets `Objective`.</span>
                </div>
                <label className={`${buttonClasses} text-sm w-fit ${isReadOnly ? disabledClasses : 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'}`}>
                  <Upload size={16} className="mr-2" /> Importer
                  <input type="file" className="hidden" accept=".json" onChange={(e) => handleFileImport(e, 'Objectifs')} disabled={isReadOnly}/>
                </label>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold">Importer des orientations (JSON)</h3>
                <div className="flex items-center text-sm text-slate-500 mt-1 mb-2">
                  <HelpCircle size={16} className="mr-2"/>
                  <span>Le fichier JSON doit être un tableau d'objets `StrategicOrientation`.</span>
                </div>
                <label className={`${buttonClasses} text-sm w-fit ${isReadOnly ? disabledClasses : 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'}`}>
                  <Upload size={16} className="mr-2" /> Importer
                  <input type="file" className="hidden" accept=".json" onChange={(e) => handleFileImport(e, 'Orientations')} disabled={isReadOnly}/>
                </label>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold">Importer des chantiers (JSON)</h3>
                <div className="flex items-center text-sm text-slate-500 mt-1 mb-2">
                  <HelpCircle size={16} className="mr-2"/>
                  <span>Le fichier JSON doit être un tableau d'objets `Chantier`.</span>
                </div>
                <label className={`${buttonClasses} text-sm w-fit ${isReadOnly ? disabledClasses : 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'}`}>
                  <Upload size={16} className="mr-2" /> Importer
                  <input type="file" className="hidden" accept=".json" onChange={(e) => handleFileImport(e, 'Chantiers')} disabled={isReadOnly}/>
                </label>
              </div>
              
               <div className="p-4 border rounded-lg">
                <h3 className="font-semibold">Importer des initiatives (JSON)</h3>
                <div className="flex items-center text-sm text-slate-500 mt-1 mb-2">
                  <HelpCircle size={16} className="mr-2"/>
                  <span>Le fichier JSON doit être un tableau d'objets `Initiative`.</span>
                </div>
                <label className={`${buttonClasses} text-sm w-fit ${isReadOnly ? disabledClasses : 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'}`}>
                  <Upload size={16} className="mr-2" /> Importer
                  <input type="file" className="hidden" accept=".json" onChange={(e) => handleFileImport(e, 'Initiatives')} disabled={isReadOnly}/>
                </label>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold">Importer des activités (JSON)</h3>
                <div className="flex items-center text-sm text-slate-500 mt-1 mb-2">
                  <HelpCircle size={16} className="mr-2"/>
                  <span>Le fichier JSON doit être un tableau d'objets `Activity`.</span>
                </div>
                <label className={`${buttonClasses} text-sm w-fit ${isReadOnly ? disabledClasses : 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'}`}>
                  <Upload size={16} className="mr-2" /> Importer
                  <input type="file" className="hidden" accept=".json" onChange={(e) => handleFileImport(e, 'Activités')} disabled={isReadOnly}/>
                </label>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold">Importer des projets (JSON)</h3>
                <div className="flex items-center text-sm text-slate-500 mt-1 mb-2">
                  <HelpCircle size={16} className="mr-2"/>
                  <span>Le fichier JSON doit être un tableau d'objets `Project`. Attention: l'historique FDR sera écrasé.</span>
                </div>
                <label className={`${buttonClasses} text-sm w-fit ${isReadOnly ? disabledClasses : 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'}`}>
                  <Upload size={16} className="mr-2" /> Importer
                  <input type="file" className="hidden" accept=".json" onChange={(e) => handleFileImport(e, 'Projets')} disabled={isReadOnly}/>
                </label>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold">Importer des processus (JSON)</h3>
                <div className="flex items-center text-sm text-slate-500 mt-1 mb-2">
                  <HelpCircle size={16} className="mr-2"/>
                  <span>Le fichier JSON doit être un tableau d'objets `SecurityProcess`.</span>
                </div>
                <label className={`${buttonClasses} text-sm w-fit ${isReadOnly ? disabledClasses : 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'}`}>
                  <Upload size={16} className="mr-2" /> Importer
                  <input type="file" className="hidden" accept=".json" onChange={(e) => handleFileImport(e, 'Processus de sécurité')} disabled={isReadOnly}/>
                </label>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      

      {(userRole === 'admin' || userRole === 'pmo') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-orange-700">
              <AlertTriangle className="mr-2" />
              Actions de réinitialisation
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">Actions dangereuses à n'utiliser qu'en connaissance de cause.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h3 className="font-semibold text-slate-800">Supprimer toutes les activités</h3>
                    <p className="text-sm text-slate-600 mt-1">Cette action supprimera définitivement toutes les activités de l'application.</p>
                </div>
                <button onClick={() => setShowResetActivitiesModal(true)} disabled={isReadOnly} className={`${buttonClasses} ${isReadOnly ? disabledClasses : 'bg-red-600 text-white hover:bg-red-700'}`}>
                    <Trash2 className="mr-2" size={18} /> Supprimer les activités
                </button>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h3 className="font-semibold text-slate-800">Supprimer tous les projets</h3>
                    <p className="text-sm text-slate-600 mt-1">Cette action supprimera définitivement tous les projets de l'application.</p>
                </div>
                <button onClick={() => setShowResetProjectsModal(true)} disabled={isReadOnly} className={`${buttonClasses} ${isReadOnly ? disabledClasses : 'bg-red-600 text-white hover:bg-red-700'}`}>
                    <Trash2 className="mr-2" size={18} /> Supprimer les projets
                </button>
            </div>
             <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h3 className="font-semibold text-slate-800">Initialisation de l'application</h3>
                    <p className="text-sm text-slate-600 mt-1">Réinitialise toutes les données (projets, activités, etc.) et recharge les données de référence.</p>
                </div>
                <button onClick={() => setShowAppInitModal(true)} disabled={isReadOnly} className={`${buttonClasses} ${isReadOnly ? disabledClasses : 'bg-red-600 text-white hover:bg-red-700'}`}>
                    <Workflow className="mr-2" size={18} /> Initialiser l'application
                </button>
            </div>
            <div className="p-4 border border-red-200 rounded-lg bg-red-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h3 className="font-semibold text-red-800">Supprimer toutes les données</h3>
                    <p className="text-sm text-red-600 mt-1">Supprime DÉFINITIVEMENT toutes les données : projets, activités, et l'ensemble du référentiel (orientations, chantiers, Objectifs, Initiatives, Processus, Ressources, Risques Majeurs)</p>
                </div>
                <button onClick={() => setShowDeleteAllDataModal(true)} disabled={isReadOnly} className={`${buttonClasses} ${isReadOnly ? disabledClasses : 'bg-red-600 text-white hover:bg-red-700'}`}>
                    <Trash2 className="mr-2" size={18} /> Supprimer toutes les données
                </button>
            </div>
          </CardContent>
        </Card>
      )}

      {showResetActivitiesModal && (
        <Modal isOpen={true} onClose={() => setShowResetActivitiesModal(false)} title="Confirmer la suppression des activités">
            <p>Êtes-vous absolument certain de vouloir supprimer TOUTES les activités ? Cette action est irréversible.</p>
            <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
                <button onClick={() => setShowResetActivitiesModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300">Annuler</button>
                <button onClick={confirmResetActivities} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Oui, supprimer tout</button>
            </div>
        </Modal>
      )}

      {showResetProjectsModal && (
        <Modal isOpen={true} onClose={() => setShowResetProjectsModal(false)} title="Confirmer la suppression des projets">
            <p>Êtes-vous absolument certain de vouloir supprimer TOUS les projets ? Cette action est irréversible.</p>
            <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
                <button onClick={() => setShowResetProjectsModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300">Annuler</button>
                <button onClick={confirmResetProjects} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Oui, supprimer tout</button>
            </div>
        </Modal>
      )}

       {showAppInitModal && (
        <Modal isOpen={true} onClose={() => setShowAppInitModal(false)} title="Confirmer la réinitialisation de l'application">
            <p>Êtes-vous sûr de vouloir réinitialiser l'application ? Toutes les données (projets, activités, etc.) seront supprimées et les données de référence (orientations, chantiers, objectifs) seront rechargées. Cette action est irréversible.</p>
            <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
                <button onClick={() => setShowAppInitModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300">Annuler</button>
                <button onClick={confirmAppInit} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Oui, réinitialiser</button>
            </div>
        </Modal>
      )}

      {showDeleteAllDataModal && (
        <Modal isOpen={true} onClose={() => setShowDeleteAllDataModal(false)} title="Confirmer la suppression TOTALE des données">
            <div className="space-y-4">
                <p className="text-lg font-medium text-slate-800">Êtes-vous absolument certain de vouloir supprimer <strong className="text-red-600">TOUTES</strong> les données de l'application ?</p>
                <p className="text-sm text-slate-600">Cette action est irréversible et videra complètement les données suivantes :</p>
                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                    <li>Tous les Projets</li>
                    <li>Toutes les Activités</li>
                    <li>Tout le référentiel (Orientations, Chantiers, Objectifs, Initiatives, Processus, Ressources, Risques Majeurs)</li>
                    <li>Historiques d'imports FDR</li>
                    <li>Configurations des tableaux de bord</li>
                </ul>
            </div>
            <div className="flex justify-end gap-2 pt-4 mt-6 border-t">
                <button onClick={() => setShowDeleteAllDataModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300">Annuler</button>
                <button onClick={confirmDeleteAllData} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Oui, tout supprimer</button>
            </div>
        </Modal>
      )}
      
      <FdrChoiceModal 
        isOpen={isFdrChoiceModalOpen}
        onClose={() => setIsFdrChoiceModalOpen(false)}
        onSelect={handleFdrChoice}
      />

      <FdrImportModal 
        isOpen={isFdrImportModalOpen} 
        mode={fdrImportMode}
        onClose={() => { setIsFdrImportModalOpen(false); navigate('/data-management'); }}
        onImport={handleFdrUpdate} 
        existingProjects={projects}
        initiatives={initiatives}
      />

    </div>
  );
};

export default DataManagement;
