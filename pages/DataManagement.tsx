
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Timer, Coins, Table, Info, AlertTriangle, CheckCircle, Upload, Download, FileJson, Trash2, Database, Calendar, RefreshCw, FileCog, Wand2, FileSpreadsheet, FileText } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Project, ProjectCategory, ProjectStatus, Initiative, FdrHistoryEntry, TShirtSize } from '../types';
import Modal from '../components/ui/Modal';
import AdvancedImportModal from '../components/data/AdvancedImportModal';
import { demoData } from '../utils/demoData';
import { exportAllDataToExcel } from '../utils/excelExport';
import { exportDashboardReportToPDF } from '../utils/pdfExport';

// --- Interfaces & Constants ---

const fieldAliases: { [key in keyof Partial<Project> | string]: { label: string, aliases: string[] } } = {
    projectId: { label: 'ID Projet', aliases: ['id projet', 'project id', 'identifiant projet', 'id', 'projet', 'project', 'id-projet', 'id_projet', 'portefeuille', 'objet de cout'] },
    title: { label: 'Titre', aliases: ['titre', 'title', 'libellé', 'libelle', 'nom du projet'] },
    category: { label: 'Catégorie', aliases: ['catégorie', 'categorie', 'category'] },
    
    // Workload (Internal/External)
    internalWorkloadRequested: { label: 'Charge interne demandée', aliases: ['interne demandé', 'charge interne demandée'] },
    internalWorkloadEngaged: { label: 'Charge interne engagée', aliases: ['interne engagé', 'charge interne engagée'] },
    internalWorkloadConsumed: { label: 'Charge interne consommée', aliases: ['interne consommé', 'interne réalisé', 'charge interne consommée'] },
    
    externalWorkloadRequested: { label: 'Charge externe demandée', aliases: ['externe demandé', 'charge externe demandée'] },
    externalWorkloadEngaged: { label: 'Charge externe engagée', aliases: ['externe engagé', 'charge externe engagée'] },
    externalWorkloadConsumed: { label: 'Charge externe consommée', aliases: ['externe consommé', 'externe réalisé', 'charge externe consommée'] },

    // Budget fields
    budgetRequested: { label: 'Budget demandé', aliases: ['budget demandé', 'demandé', 'budget demande', 'budget demandé (€)', 'demande'] },
    budgetApproved: { label: 'Budget accordé', aliases: ['budget accordé', 'accordé', 'budget accorde', 'budget accordé (€)', 'accorde'] },
    budgetCommitted: { label: 'Budget engagé', aliases: ['budget engagé', 'engagé', 'budget engage', 'budget engagé (€)', 'engage'] },
    validatedPurchaseOrders: { label: 'DA validées', aliases: ['da validées', 'demandes d’achat validées', 'demandes d\'achat valides', 'da valides', 'da validees'] },
    completedPV: { label: 'Réalisé (PV)', aliases: ['réalisé (pv)', 'réalisé', 'pv', 'realise', 'realise (pv)'] },
    forecastedPurchaseOrders: { label: 'DA prévues', aliases: ['da prévues', 'demandes d’achat prévues', 'da prevues', 'demandes d\'achat prevues'] },
};

// --- Helper Components ---

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
                    <h3 className="text-lg font-bold text-slate-800">Mise à jour charges</h3>
                    <p className="text-sm text-slate-500 mt-2 text-center">Importer les données de consommation en jours/homme (J/H)</p>
                </button>
                
                <button 
                    onClick={() => onSelect('budget')}
                    className="flex flex-col items-center justify-center p-8 bg-purple-50 border-2 border-purple-100 rounded-xl hover:bg-purple-100 hover:border-purple-300 transition-all group"
                >
                    <div className="p-4 bg-purple-600 text-white rounded-full mb-4 group-hover:scale-110 transition-transform">
                        <Coins size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Mise à jour budgets</h3>
                    <p className="text-sm text-slate-500 mt-2 text-center">Importer les données budgétaires en Euros (€)</p>
                </button>
            </div>
        </Modal>
    );
};

// --- Main Import Modal Component ---

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
    
    const [week, setWeek] = useState<string>('');
    const [year, setYear] = useState<string>(new Date().getFullYear().toString());

    useEffect(() => {
        if (isOpen) {
             const now = new Date();
             const oneJan = new Date(now.getFullYear(), 0, 1);
             const numberOfDays = Math.floor((now.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
             const currentWeek = Math.ceil((now.getDay() + 1 + numberOfDays) / 7);
             const prevWeek = currentWeek > 1 ? currentWeek - 1 : 52;
             setWeek(prevWeek.toString());
             setYear(now.getFullYear().toString());
             
             setPastedData('');
             setDisplayedData([]);
             setStep('input');
        }
    }, [isOpen]);

    const handleVisualize = () => {
        if (!pastedData.trim()) return;

        const rows = pastedData.trim().split('\n');
        const rawData = rows.map(row => row.split('\t'));
        
        const categoryKeywords = ["Activité", "EPA", "MCO", "Opportunité", "Opération", "Projet"];
        let currentCategory = "";

        let headerRowIndex = -1;
        
        const keywords = mode === 'workload' 
            ? ["Demandé", "Réalisé", "Interne"] 
            : ["Budget", "Engagé", "Accordé", "PV"];

        for(let i=0; i<rawData.length; i++) {
            const rowString = rawData[i].slice(1).join(' ');
            if (keywords.some(k => rowString.includes(k))) {
                headerRowIndex = i;
                break;
            }
        }

        if (headerRowIndex === -1) {
             headerRowIndex = 0;
        }

        const originalHeaders = rawData[headerRowIndex];
        const newHeaders = ["Catégorie", "ID Projet", "Libellé"];
        
        if (mode === 'workload') {
            for (let i = 1; i < originalHeaders.length; i++) {
                let h = originalHeaders[i] || `Col ${i}`;
                if (h.toLowerCase().includes("interne") || (i >= 1 && i <= 3)) {
                     if (!h.toLowerCase().includes("interne")) h = "Interne " + h;
                } else if (h.toLowerCase().includes("externe") || (i >= 4 && i <= 6)) {
                    if (!h.toLowerCase().includes("externe")) h = "Externe " + h;
                }
                newHeaders.push(h);
            }
        } else {
             for (let i = 1; i < originalHeaders.length; i++) {
                newHeaders.push(originalHeaders[i] || `Col ${i}`);
            }
        }

        const finalRows: string[][] = [];

        for (let i = headerRowIndex + 1; i < rawData.length; i++) {
            const row = rawData[i];
            const colA = (row[0] || '').trim();

            if (!colA && row.length < 2) continue;

            if (categoryKeywords.includes(colA)) {
                currentCategory = colA;
                continue;
            }
            
            if (colA.toLowerCase().includes('total général')) {
                const id = 'TOTAL_GENERAL';
                const label = 'Total Général FDR';
                const dataValues = row.slice(1);
                while (dataValues.length < newHeaders.length - 3) {
                    dataValues.push('');
                }
                finalRows.push(['Total', id, label, ...dataValues]);
                continue;
            }

            const dotCount = (colA.match(/\./g) || []).length;
            if (dotCount === 3) continue;

            if (colA.includes(':')) {
                const separatorIndex = colA.indexOf(':');
                const id = colA.substring(0, separatorIndex).trim();
                const label = colA.substring(separatorIndex + 1).trim();
                const dataValues = row.slice(1);
                while (dataValues.length < newHeaders.length - 3) {
                    dataValues.push('');
                }
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
    };

    const handleImportData = () => {
        const h = headers;
        const existingMap = new Map<string, Project>(existingProjects.map(p => [p.projectId, p] as [string, Project]));
        const updatedProjectsList: Project[] = [];
        
        const parseNum = (val: string) => {
            if (!val) return 0;
            const v = val.replace(/JH|€|k€|M€/gi, '').replace(/\s/g, '').replace(',', '.');
            const n = parseFloat(v);
            return isNaN(n) ? 0 : n;
        }

        let idxIntDemande = -1, idxIntEngage = -1, idxIntRealise = -1;
        let idxExtDemande = -1, idxExtEngage = -1, idxExtRealise = -1;
        let idxBudReq = -1, idxBudApp = -1, idxBudCom = -1, idxDaVal = -1, idxPv = -1, idxDaPrev = -1;

        if (mode === 'workload') {
            idxIntDemande = h.findIndex(s => s.toLowerCase().includes("interne") && s.toLowerCase().includes("demandé"));
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
            idxBudReq = 3; // Index in displayedData (0=Cat, 1=ID, 2=Label)
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

            let project = existingMap.get(projectId);
            
            if (project) {
                // Update existing
                const historyEntry: FdrHistoryEntry = {
                    week,
                    year,
                    type: mode,
                    importDate: new Date().toISOString(),
                    data: specificImportData
                };
                
                const newHistory = [...(project.fdrHistory || []), historyEntry];
                
                const updatedProject: Project = {
                    ...project,
                    ...specificImportData,
                    fdrHistory: newHistory,
                    updatedAt: new Date().toISOString()
                };
                updatedProjectsList.push(updatedProject);
                existingMap.delete(projectId);
            } else {
                // Create new
                const historyEntry: FdrHistoryEntry = {
                    week,
                    year,
                    type: mode,
                    importDate: new Date().toISOString(),
                    data: specificImportData
                };

                const newProject: Project = {
                    id: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    projectId: projectId,
                    title: title,
                    status: ProjectStatus.IDENTIFIED,
                    tShirtSize: TShirtSize.M,
                    category: categoryEnum,
                    isTop30: false,
                    initiativeId: initiatives.length > 0 ? initiatives[0].id : '',
                    isoMeasures: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    fdrHistory: [historyEntry],
                    ...specificImportData
                } as Project;
                updatedProjectsList.push(newProject);
            }
        });

        existingMap.forEach((p) => {
            updatedProjectsList.push(p);
        });

        onImport(updatedProjectsList, week, year);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Import ${mode === 'workload' ? 'Charges' : 'Budgets'} (FDR)`}>
            {step === 'input' ? (
                <div className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-start gap-3">
                        <Info size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                            <p className="font-semibold mb-1">Instructions :</p>
                            <ol className="list-decimal list-inside space-y-1 ml-1">
                                <li>Ouvrez votre fichier FDR (Excel)</li>
                                <li>Sélectionnez les cellules contenant les données (avec les en-têtes)</li>
                                <li>Copiez (Ctrl+C) et collez (Ctrl+V) dans la zone ci-dessous</li>
                            </ol>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Année</label>
                            <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Semaine</label>
                            <input type="number" value={week} onChange={(e) => setWeek(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="ex: 42" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Données copiées</label>
                        <textarea 
                            className="w-full h-48 border border-slate-300 rounded px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Collez ici les données Excel..."
                            value={pastedData}
                            onChange={(e) => setPastedData(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded transition-colors">Annuler</button>
                        <button onClick={handleVisualize} disabled={!pastedData.trim() || !week || !year} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300 transition-colors">
                            Visualiser
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-sm text-slate-500">
                            Aperçu des données à importer ({displayedData.length} lignes)
                        </div>
                        <button onClick={() => setStep('input')} className="text-sm text-blue-600 hover:underline">
                            Modifier les données
                        </button>
                    </div>
                    
                    <div className="border rounded-md overflow-x-auto max-h-96">
                        <table className="w-full text-xs text-left whitespace-nowrap">
                            <thead className="bg-slate-100 sticky top-0">
                                <tr>
                                    {headers.map((h, i) => <th key={i} className="px-3 py-2 border-b border-slate-200 font-semibold text-slate-700">{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {displayedData.map((row, i) => (
                                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                                        {row.map((cell, j) => <td key={j} className="px-3 py-1.5">{cell}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-amber-50 text-amber-800 rounded-md text-sm border border-amber-200">
                        <AlertTriangle size={20} className="flex-shrink-0" />
                        <p>Cette action mettra à jour les données des projets existants et créera les projets manquants. L'historique sera conservé.</p>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded transition-colors">Annuler</button>
                        <button onClick={handleImportData} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2">
                            <CheckCircle size={18} />
                            Confirmer l'import
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

// --- Page Component ---

const DataManagement: React.FC = () => {
    const { 
        projects, setProjects, 
        activities, setActivities, 
        objectives, setObjectives,
        orientations, setOrientations,
        chantiers, setChantiers,
        initiatives, setInitiatives,
        resources, setResources,
        securityProcesses, setSecurityProcesses,
        majorRisks, setMajorRisks,
        dashboardLayouts, setDashboardLayouts,
        setLastCsvImportDate, setLastImportWeek, setLastImportYear, lastCsvImportDate 
    } = useData();
    
    const location = useLocation();
    const navigate = useNavigate();
    const locationState = location.state as any;

    const [isFdrChoiceOpen, setIsFdrChoiceOpen] = useState(false);
    const [isFdrImportOpen, setIsFdrImportOpen] = useState(false);
    const [isAdvancedImportOpen, setIsAdvancedImportOpen] = useState(false);
    const [importMode, setImportMode] = useState<'workload' | 'budget'>('workload');
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

    useEffect(() => {
        // Si l'URL se termine par /fdr ou si l'état demande l'ouverture, on ouvre la modale
        if (location.pathname.endsWith('/fdr') || locationState?.openFdrChoice) {
            setIsFdrChoiceOpen(true);
        }
    }, [location, locationState]);

    const handleOpenFdrImport = (mode: 'workload' | 'budget') => {
        setImportMode(mode);
        setIsFdrChoiceOpen(false);
        setIsFdrImportOpen(true);
    };

    // Lors de la fermeture des modales FDR, on revient toujours à la racine de DataManagement
    const handleCloseFdrChoice = () => {
        setIsFdrChoiceOpen(false);
        navigate('/data-management');
    };

    const handleCloseFdrImport = () => {
        setIsFdrImportOpen(false);
        navigate('/data-management');
    };

    const handleImportFdr = (updatedProjects: Project[], week: string, year: string) => {
        setProjects(updatedProjects);
        setLastCsvImportDate(new Date().toISOString());
        setLastImportWeek(week);
        setLastImportYear(year);
        handleCloseFdrImport();
        alert("Données FDR importées avec succès !");
    };

    const handleExportJSON = () => {
        const calendarHistory = localStorage.getItem('calendar_import_history');
        const calendarHidden = localStorage.getItem('calendar_hidden_summaries');

        const allData = { 
            activities, 
            objectives, 
            orientations, 
            resources, 
            chantiers, 
            securityProcesses, 
            projects, 
            initiatives, 
            dashboardLayouts,
            majorRisks,
            calendar_import_history: calendarHistory ? JSON.parse(calendarHistory) : {},
            calendar_hidden_summaries: calendarHidden ? JSON.parse(calendarHidden) : []
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

    const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                
                if (json.activities) setActivities(json.activities);
                if (json.projects) setProjects(json.projects);
                if (json.objectives) setObjectives(json.objectives);
                if (json.orientations) setOrientations(json.orientations);
                if (json.chantiers) setChantiers(json.chantiers);
                if (json.initiatives) setInitiatives(json.initiatives);
                if (json.resources) setResources(json.resources);
                if (json.securityProcesses) setSecurityProcesses(json.securityProcesses);
                if (json.majorRisks) setMajorRisks(json.majorRisks);
                if (json.dashboardLayouts) setDashboardLayouts(json.dashboardLayouts);

                if (json.calendar_import_history) localStorage.setItem('calendar_import_history', JSON.stringify(json.calendar_import_history));
                if (json.calendar_hidden_summaries) localStorage.setItem('calendar_hidden_summaries', JSON.stringify(json.calendar_hidden_summaries));

                alert("Restauration des données réussie !");
            } catch (err) {
                console.error("Erreur import JSON", err);
                alert("Erreur lors de l'importation du fichier de sauvegarde.");
            }
        };
        reader.readAsText(file);
        // Reset value to allow re-importing same file
        event.target.value = '';
    };

    const handleLoadDemoData = () => {
        setActivities(demoData.activities);
        setProjects(demoData.projects);
        setObjectives(demoData.objectives);
        setChantiers(demoData.chantiers);
        setOrientations(demoData.orientations);
        setInitiatives(demoData.initiatives);
        setResources(demoData.resources);
        setSecurityProcesses(demoData.securityProcesses);
        setMajorRisks(demoData.majorRisks);
        
        setIsDemoModalOpen(false);
        alert("Jeu de données de démonstration chargé avec succès !");
    };

    const handleResetData = () => {
        setActivities([]);
        setProjects([]);
        setObjectives([]);
        setChantiers([]);
        setOrientations([]);
        setInitiatives([]);
        setResources([]);
        setSecurityProcesses([]);
        setMajorRisks([]);
        setLastCsvImportDate(null);
        setLastImportWeek(null);
        setLastImportYear(null);
        localStorage.removeItem('calendar_import_history');
        localStorage.removeItem('calendar_hidden_summaries');
        setIsResetModalOpen(false);
        alert("Toutes les données ont été effacées.");
    };

    const handleExportExcel = () => {
        exportAllDataToExcel(
            projects,
            activities,
            objectives,
            chantiers,
            initiatives,
            resources
        );
    };

    const handleExportPDF = () => {
        exportDashboardReportToPDF(
            projects,
            activities,
            objectives
        );
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">Gestion des données</h1>
            <p className="text-slate-600">Administrez les données de l'application : imports, exports et mises à jour.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Card FDR */}
                <Card className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-blue-500" onClick={() => setIsFdrChoiceOpen(true)}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-700">
                            <Table size={20} />
                            Mise à jour FDR
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500 mb-4">
                            Importer les charges (J/H) ou les budgets (€) depuis un export Excel/CSV de l'outil FDR.
                        </p>
                        {lastCsvImportDate && (
                            <div className="text-xs text-slate-400 flex items-center gap-1 bg-slate-50 p-2 rounded">
                                <Info size={12}/> Dernière màj: {new Date(lastCsvImportDate).toLocaleDateString()}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Card Calendar */}
                <Card className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-indigo-500" onClick={() => navigate('/data-management/calendar-import')}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-indigo-700">
                            <Calendar size={20} />
                            Import calendrier
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500">
                            Convertir des réunions Outlook (.ics) en temps consommé sur les projets et activités.
                        </p>
                    </CardContent>
                </Card>
                
                {/* Card Demo Generator */}
                <Card className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-purple-500" onClick={() => setIsDemoModalOpen(true)}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-purple-700">
                            <Wand2 size={20} />
                            Générateur de données
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500">
                            Injecter un jeu de données de démonstration complet (Projets, Activités, Risques...) pour tester l'application.
                        </p>
                    </CardContent>
                </Card>

                {/* Card Export */}
                <Card className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-emerald-500" onClick={handleExportJSON}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-emerald-700">
                            <Download size={20} />
                            Sauvegarder les données
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500">
                            Télécharger une copie complète de toutes les données actuelles au format JSON.
                        </p>
                    </CardContent>
                </Card>

                {/* Card Export Excel */}
                <Card className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-green-500" onClick={handleExportExcel}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700">
                            <FileSpreadsheet size={20} />
                            Export Excel
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500">
                            Exporter toutes les données au format Excel (fichier multi-feuilles avec projets, activités, objectifs...).
                        </p>
                    </CardContent>
                </Card>

                {/* Card Export PDF */}
                <Card className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-orange-500" onClick={handleExportPDF}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-700">
                            <FileText size={20} />
                            Export PDF
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500">
                            Générer un rapport PDF complet avec statistiques et tableaux récapitulatifs.
                        </p>
                    </CardContent>
                </Card>

                {/* Card Advanced Import */}
                <Card className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-violet-500" onClick={() => setIsAdvancedImportOpen(true)}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-violet-700">
                            <FileCog size={20} />
                            Restauration avancée
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500">
                            Restaurer sélectivement des données depuis une sauvegarde (fusion intelligente).
                        </p>
                    </CardContent>
                </Card>

                {/* Card Import Full */}
                <Card className="relative border-l-4 border-l-amber-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-700">
                            <Upload size={20} />
                            Restauration complète
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500 mb-3">
                            Remplacer TOUTES les données actuelles par celles d'un fichier de sauvegarde.
                        </p>
                        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-md hover:bg-amber-100 transition-colors text-sm font-medium w-full justify-center border border-amber-200">
                            <FileJson size={16}/>
                            Choisir un fichier...
                            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                        </label>
                    </CardContent>
                </Card>

                {/* Card Reset */}
                <Card className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-red-500 bg-red-50/30" onClick={() => setIsResetModalOpen(true)}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700">
                            <Trash2 size={20} />
                            Réinitialiser l'application
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-red-600/80">
                            Attention : Cette action effacera toutes les données (projets, activités, paramètres...).
                        </p>
                    </CardContent>
                </Card>
            </div>

            <FdrChoiceModal 
                isOpen={isFdrChoiceOpen} 
                onClose={handleCloseFdrChoice} 
                onSelect={handleOpenFdrImport} 
            />

            {isFdrImportOpen && (
                <FdrImportModal 
                    isOpen={isFdrImportOpen} 
                    mode={importMode} 
                    onClose={handleCloseFdrImport} 
                    onImport={handleImportFdr}
                    existingProjects={projects}
                    initiatives={initiatives}
                />
            )}

            <AdvancedImportModal 
                isOpen={isAdvancedImportOpen}
                onClose={() => setIsAdvancedImportOpen(false)}
            />

            {isResetModalOpen && (
                <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} title="Confirmation requise">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
                            <AlertTriangle size={32} className="flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-lg">Êtes-vous sûr ?</h3>
                                <p className="text-sm">Cette action est irréversible. Toutes les données locales seront perdues.</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button onClick={() => setIsResetModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded transition-colors">Annuler</button>
                            <button onClick={handleResetData} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-2">
                                <Trash2 size={16} />
                                Tout effacer
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
            
            {isDemoModalOpen && (
                <Modal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} title="Génération de données de test">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-purple-600 bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <Wand2 size={32} className="flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-lg">Mode Démonstration</h3>
                                <p className="text-sm">
                                    Cette action va <strong>remplacer</strong> vos données actuelles par un jeu de données fictif complet (Projets, Risques, Activités, etc.). 
                                    Idéal pour découvrir les fonctionnalités avancées.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button onClick={() => setIsDemoModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded transition-colors">Annuler</button>
                            <button onClick={handleLoadDemoData} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center gap-2">
                                <Wand2 size={16} />
                                Générer les données
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default DataManagement;
