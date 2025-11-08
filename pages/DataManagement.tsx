// FIX: The import statement was malformed and was missing the 'useState' hook import.
import React, { useState } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Upload, HelpCircle, DatabaseBackup, Info, AlertTriangle, Trash2, Workflow } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Tooltip from '../components/ui/Tooltip';
import { Activity, Chantier, Objective, StrategicOrientation, Resource, SecurityProcess, Project, ActivityStatus, TShirtSize, Initiative } from '../types';

const DataManagement: React.FC = () => {
  const { 
    activities, setActivities,
    objectives, setObjectives,
    orientations, setOrientations,
    resources, setResources,
    chantiers, setChantiers,
    securityProcesses, setSecurityProcesses,
    projects, setProjects,
    initiatives, setInitiatives
  } = useData();
  const { userRole } = useAuth();
  const isReadOnly = userRole === 'readonly';
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);

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

  const handleFdrJhImport = (event: React.ChangeEvent<HTMLInputElement>) => {
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
          const content = e.target?.result as string;
          const lines = content.split('\n').slice(2); // Skip header lines
          
          const updatedProjects: Project[] = [];
          const newProjects: Project[] = [];
          
          const existingProjectsMap = new Map(projects.map(p => [p.projectId, p]));

          lines.forEach(line => {
            if (!line.trim()) return;
            const columns = line.split(';');

            const [idPart, titlePart] = (columns[0] || '').split(' : ');
            if (!idPart || !titlePart) return;

            const projectId = idPart.trim();
            const title = titlePart.trim();
            
            const parseJH = (value: string) => value ? parseFloat(value.replace(' JH', '').replace(',', '.')) : 0;

            const internalWorkloadRequested = parseJH(columns[1]);
            const internalWorkloadEngaged = parseJH(columns[2]);
            const internalWorkloadConsumed = parseJH(columns[3]);
            const externalWorkloadRequested = parseJH(columns[5]);
            const externalWorkloadEngaged = parseJH(columns[6]);
            const externalWorkloadConsumed = parseJH(columns[7]);

            const existingProject = existingProjectsMap.get(projectId);
            
            if (existingProject) {
                updatedProjects.push({
                    ...existingProject,
                    internalWorkloadRequested,
                    internalWorkloadEngaged,
                    internalWorkloadConsumed,
                    externalWorkloadRequested,
                    externalWorkloadEngaged,
                    externalWorkloadConsumed,
                    updatedAt: new Date().toISOString(),
                });
            } else {
                 newProjects.push({
                    id: `proj-${Date.now()}-${Math.random()}`,
                    projectId,
                    title,
                    status: ActivityStatus.NOT_STARTED,
                    tShirtSize: TShirtSize.M,
                    isTop30: false,
                    initiativeId: initiatives[0]?.id || '',
                    isoMeasures: [],
                    internalWorkloadRequested,
                    internalWorkloadEngaged,
                    internalWorkloadConsumed,
                    externalWorkloadRequested,
                    externalWorkloadEngaged,
                    externalWorkloadConsumed,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
            }
          });

          setProjects(prev => {
            const prevMap = new Map(prev.map(p => [p.projectId, p]));
            updatedProjects.forEach(p => prevMap.set(p.projectId, p));
            newProjects.forEach(p => prevMap.set(p.projectId, p));
            return Array.from(prevMap.values());
          });

          showFeedback('success', `${newProjects.length} projet(s) créé(s) et ${updatedProjects.length} projet(s) mis à jour.`);

        } catch (error) {
          console.error(error);
          showFeedback('error', 'Erreur lors du traitement du fichier CSV.');
        } finally {
            if(inputElement) inputElement.value = '';
        }
      };
      reader.onerror = () => {
          showFeedback('error', 'Erreur de lecture du fichier.');
          if(inputElement) inputElement.value = '';
      };
      reader.readAsText(file, 'ISO-8859-1'); // Or 'UTF-8' if that's the encoding
    }
  };
  
  const handleFdrEurosImport = (event: React.ChangeEvent<HTMLInputElement>) => {
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
          const content = e.target?.result as string;
          const lines = content.split('\n').slice(1); // Skip header line

          const updatedProjects: Project[] = [];
          const newProjects: Project[] = [];
          
          const existingProjectsMap = new Map(projects.map(p => [p.projectId, p]));

          const parseEuros = (value: string): number | undefined => {
              if (!value || !value.trim()) return undefined;
              const cleanedValue = value.replace(/K€/g, '').replace(/€/g, '').trim();
              const number = parseFloat(cleanedValue.replace(',', '.'));
              return isNaN(number) ? undefined : number * 1000;
          };

          lines.forEach(line => {
              if (!line.trim()) return;
              const columns = line.split(';');

              let idTitlePart = columns[0] || '';
              if (idTitlePart.startsWith('\"') && idTitlePart.endsWith('\"')) {
                  idTitlePart = idTitlePart.substring(1, idTitlePart.length - 1);
              }
              const [idPart, titlePart] = idTitlePart.split(' : ');
              if (!idPart || !titlePart) return;

              const projectId = idPart.trim();
              const title = titlePart.trim();

              const budgetData = {
                  budgetRequested: parseEuros(columns[1]),
                  budgetCommitted: parseEuros(columns[2]),
                  budgetApproved: parseEuros(columns[3]),
                  validatedPurchaseOrders: parseEuros(columns[4]),
                  completedPV: parseEuros(columns[5]),
                  forecastedPurchaseOrders: parseEuros(columns[9]),
              };

              const existingProject = existingProjectsMap.get(projectId);
              
              if (existingProject) {
                  updatedProjects.push({
                      ...existingProject,
                      ...budgetData,
                      updatedAt: new Date().toISOString(),
                  });
              } else {
                   newProjects.push({
                      id: `proj-${Date.now()}-${Math.random()}`,
                      projectId,
                      title,
                      status: ActivityStatus.NOT_STARTED,
                      tShirtSize: TShirtSize.M,
                      isTop30: false,
                      initiativeId: initiatives[0]?.id || '',
                      isoMeasures: [],
                      ...budgetData,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                  });
              }
          });

          setProjects(prev => {
            const prevMap = new Map(prev.map(p => [p.projectId, p]));
            updatedProjects.forEach(p => prevMap.set(p.projectId, p));
            newProjects.forEach(p => prevMap.set(p.projectId, p));
            return Array.from(prevMap.values());
          });

          showFeedback('success', `${newProjects.length} projet(s) créé(s) et ${updatedProjects.length} projet(s) mis à jour.`);

        } catch (error) {
          console.error(error);
          showFeedback('error', 'Erreur lors du traitement du fichier CSV budgétaire.');
        } finally {
            if(inputElement) inputElement.value = '';
        }
      };
      reader.onerror = () => {
          showFeedback('error', 'Erreur de lecture du fichier.');
          if(inputElement) inputElement.value = '';
      };
      reader.readAsText(file, 'UTF-8');
    }
  };

  const handleResetActivities = () => {
    if (isReadOnly) return;
    setShowResetConfirmation(true);
  };
  
  const confirmResetActivities = () => {
    setActivities([]);
    setShowResetConfirmation(false);
    showFeedback('success', 'Toutes les activités ont été supprimées.');
  }

  const buttonClasses = "flex items-center justify-center px-4 py-2 rounded-lg transition-colors";
  const disabledClasses = "bg-slate-300 text-slate-500 cursor-not-allowed";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Gestion des données</h1>
      <p className="text-slate-600">
        Importez, exportez ou sauvegardez/restaurez les données de votre application.
      </p>

      {feedback && (
        <div className={`p-4 rounded-md text-sm my-4 border ${feedback.type === 'success' ? 'bg-green-100 border-green-300 text-green-800' : 'bg-red-100 border-red-300 text-red-800'}`}>
            <p>{feedback.message}</p>
        </div>
      )}

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
            <Tooltip text="La sauvegarde complète inclut : projets, activités, objectifs, orientations, chantiers, ressources, initiatives et processus de sécurité.">
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

      <Card>
        <CardHeader>
          <CardTitle>Import de données</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Importez des listes spécifiques. L'importation remplacera les données existantes pour le type sélectionné, sauf pour les imports FDR.</p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {userRole === 'admin' && (
            <>
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
                  <span>Le fichier JSON doit être un tableau d'objets `Project`.</span>
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
          
          {(userRole === 'admin' || userRole === 'pmo') && (
            <>
              <div className="p-4 border rounded-lg md:col-span-1">
                <h3 className="font-semibold">Import FDR JH (CSV)</h3>
                <div className="flex items-center text-sm text-slate-500 mt-1 mb-2">
                  <HelpCircle size={16} className="mr-2"/>
                  <span>Import spécifique pour la mise à jour des charges projets (J/H).</span>
                </div>
                <label className={`${buttonClasses} text-sm w-fit ${isReadOnly ? disabledClasses : 'bg-teal-600 text-white hover:bg-teal-700 cursor-pointer'}`}>
                  <Upload size={16} className="mr-2" /> Importer le CSV des charges
                  <input type="file" className="hidden" accept=".csv" onChange={handleFdrJhImport} disabled={isReadOnly}/>
                </label>
              </div>

              <div className="p-4 border rounded-lg md:col-span-1">
                <h3 className="font-semibold">Import FDR Euros (CSV)</h3>
                <div className="flex items-center text-sm text-slate-500 mt-1 mb-2">
                  <HelpCircle size={16} className="mr-2"/>
                  <span>Import spécifique pour la mise à jour des budgets projets (€).</span>
                </div>
                <label className={`${buttonClasses} text-sm w-fit ${isReadOnly ? disabledClasses : 'bg-teal-600 text-white hover:bg-teal-700 cursor-pointer'}`}>
                  <Upload size={16} className="mr-2" /> Importer le CSV des budgets
                  <input type="file" className="hidden" accept=".csv" onChange={handleFdrEurosImport} disabled={isReadOnly}/>
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
          <CardContent>
              {showResetConfirmation ? (
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <h3 className="font-semibold text-red-800">Confirmation requise</h3>
                      <p className="text-sm text-red-700 mt-1">Êtes-vous absolument certain de vouloir supprimer TOUTES les activités ? Cette action est irréversible.</p>
                      <div className="flex gap-4 mt-4">
                          <button onClick={confirmResetActivities} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                              Oui, supprimer tout
                          </button>
                          <button onClick={() => setShowResetConfirmation(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300">
                              Annuler
                          </button>
                      </div>
                  </div>
              ) : (
                  <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                      <h3 className="font-semibold text-slate-800">Supprimer toutes les activités</h3>
                      <p className="text-sm text-slate-600 mt-1">Cette action supprimera définitivement toutes les activités de l'application. Utilisez-la pour nettoyer les données de test avant d'importer des données réelles.</p>
                      </div>
                      <Tooltip text="Cette action est irréversible.">
                      <button
                          onClick={handleResetActivities}
                          disabled={isReadOnly}
                          className={`${buttonClasses} ${isReadOnly ? disabledClasses : 'bg-red-600 text-white hover:bg-red-700'}`}
                      >
                          <Trash2 className="mr-2" size={18} />
                          Supprimer les activités
                      </button>
                      </Tooltip>
                  </div>
              )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataManagement;