

import React, { useState } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Upload, HelpCircle, DatabaseBackup, Info, AlertTriangle, Trash2 } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Tooltip from '../components/ui/Tooltip';
import { Activity, Chantier, Objective, StrategicOrientation, Resource } from '../types';

const DataManagement: React.FC = () => {
  const { 
    activities, setActivities,
    objectives, setObjectives,
    orientations, setOrientations,
    resources, setResources,
    chantiers, setChantiers
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
      chantiers
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
            case 'Objectifs':
                setObjectives(content as Objective[]);
                showFeedback('success', 'Objectifs importés avec succès.');
                break;
            case 'Orientations':
                setOrientations(content as StrategicOrientation[]);
                showFeedback('success', 'Orientations importées avec succès.');
                break;
            case 'Activités':
                setActivities(content as Activity[]);
                showFeedback('success', 'Activités importées avec succès.');
                break;
            case 'Chantiers':
                setChantiers(content as Chantier[]);
                showFeedback('success', 'Chantiers importés avec succès.');
                break;
            case 'Sauvegarde Complète':
                let importedCount = 0;
                if (Array.isArray(content.activities)) { setActivities(content.activities); importedCount++; }
                if (Array.isArray(content.objectives)) { setObjectives(content.objectives); importedCount++; }
                if (Array.isArray(content.orientations)) { setOrientations(content.orientations); importedCount++; }
                if (Array.isArray(content.resources)) { setResources(content.resources); importedCount++; }
                if (Array.isArray(content.chantiers)) { setChantiers(content.chantiers); importedCount++; }
                
                if (importedCount > 0) {
                    showFeedback('success', 'Sauvegarde restaurée avec succès.');
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

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Sauvegarde et restauration</CardTitle>
           <Tooltip text="La sauvegarde complète inclut : activités, objectifs, orientations, chantiers et ressources.">
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

      <Card>
        <CardHeader>
          <CardTitle>Import de données</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Importez des listes spécifiques au format JSON.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold">Importer des objectifs</h3>
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
            <h3 className="font-semibold">Importer des orientations stratégiques</h3>
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
            <h3 className="font-semibold">Importer des chantiers</h3>
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
            <h3 className="font-semibold">Importer des activités</h3>
            <div className="flex items-center text-sm text-slate-500 mt-1 mb-2">
              <HelpCircle size={16} className="mr-2"/>
              <span>Le fichier JSON doit être un tableau d'objets `Activity`.</span>
            </div>
            <label className={`${buttonClasses} text-sm w-fit ${isReadOnly ? disabledClasses : 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'}`}>
              <Upload size={16} className="mr-2" /> Importer
              <input type="file" className="hidden" accept=".json" onChange={(e) => handleFileImport(e, 'Activités')} disabled={isReadOnly}/>
            </label>
          </div>

        </CardContent>
      </Card>
      
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
    </div>
  );
};

export default DataManagement;
