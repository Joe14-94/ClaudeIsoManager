
import React from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Upload, HelpCircle, DatabaseBackup, Info } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Tooltip from '../components/ui/Tooltip';

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
    if (isReadOnly) return;
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
          
          if (dataType !== 'Sauvegarde Complète' && !Array.isArray(content)) {
            alert('Le fichier JSON doit contenir un tableau de données.');
            event.target.value = '';
            return;
          }

          switch(dataType) {
            case 'Objectifs':
                setObjectives(content);
                alert('Objectifs importés avec succès.');
                break;
            case 'Orientations':
                setOrientations(content);
                alert('Orientations importées avec succès.');
                break;
            case 'Activités':
                setActivities(content);
                alert('Activités importées avec succès.');
                break;
            case 'Sauvegarde Complète':
                if (content.activities && content.objectives && content.orientations && content.resources && content.chantiers) {
                    setActivities(content.activities);
                    setObjectives(content.objectives);
                    setOrientations(content.orientations);
                    setResources(content.resources);
                    setChantiers(content.chantiers);
                    alert('Sauvegarde restaurée avec succès.');
                } else {
                    alert('Fichier de sauvegarde invalide. Des données sont manquantes.');
                }
                break;
            default:
                alert(`L'importation pour le type "${dataType}" n'est pas encore implémentée.`);
          }
        } catch (error) {
          alert('Erreur lors de la lecture ou du parsing du fichier JSON.');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  const buttonClasses = "flex items-center justify-center px-4 py-2 rounded-lg transition-colors";
  const disabledClasses = "bg-slate-300 text-slate-500 cursor-not-allowed";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Gestion des données</h1>
      <p className="text-slate-600">
        Importez, exportez ou sauvegardez/restaurez les données de votre application.
      </p>
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
    </div>
  );
};

export default DataManagement;