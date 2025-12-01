

import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Upload, Calendar, Clock, CheckCircle2, AlertCircle, FileUp, Search, Filter, ArrowRight, RefreshCw, Trash2, History } from 'lucide-react';
import { parseICSFile, CalendarEvent, ImportHistoryItem } from '../utils/icsParser';
import { Project, Activity } from '../types';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/storage';
import Tooltip from '../components/ui/Tooltip';

const HISTORY_STORAGE_KEY = 'calendar_import_history';

type EventStatus = 'new' | 'modified' | 'imported' | 'cancelled';

interface DisplayEvent extends CalendarEvent {
  importStatus: EventStatus;
  history?: ImportHistoryItem;
}

const CalendarImportPage: React.FC = () => {
  const { projects, activities, setProjects, setActivities } = useData();
  const [events, setEvents] = useState<DisplayEvent[]>([]);
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());
  const [importHistory, setImportHistory] = useState<Record<string, ImportHistoryItem>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [showImported, setShowImported] = useState(false);
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({ start: '', end: '' });

  // Panier d'imputation
  const [targetId, setTargetId] = useState<string>('');
  const [conversionRate, setConversionRate] = useState<number>(7); // 1 jour = 7 heures

  // Chargement de l'historique au démarrage
  useEffect(() => {
    const history = loadFromLocalStorage<Record<string, ImportHistoryItem>>(HISTORY_STORAGE_KEY, {});
    setImportHistory(history);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const parsedEvents = await parseICSFile(file);
      
      // Comparaison avec l'historique
      const processedEvents: DisplayEvent[] = parsedEvents.map(evt => {
        const historyItem = importHistory[evt.uid];
        let status: EventStatus = 'new';

        if (evt.status === 'CANCELLED') {
          status = 'cancelled';
        } else if (historyItem) {
          if (historyItem.hash === evt.hash) {
            status = 'imported';
          } else {
            status = 'modified';
          }
        }

        return { ...evt, importStatus: status, history: historyItem };
      });

      setEvents(processedEvents);
      
      // Pré-sélection des nouveaux et modifiés
      const newIds = processedEvents.filter(e => e.importStatus === 'new' || e.importStatus === 'modified').map(e => e.uid);
      // setSelectedEventIds(new Set(newIds)); // Optionnel : tout sélectionner par défaut
      
    } catch (error) {
      console.error("Erreur parsing ICS", error);
      alert("Erreur lors de la lecture du fichier calendrier.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (!showImported && event.importStatus === 'imported') return false;
      if (event.importStatus === 'cancelled') return false;
      
      if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        if (!event.summary.toLowerCase().includes(lowerTerm) && !event.description.toLowerCase().includes(lowerTerm)) {
          return false;
        }
      }

      if (dateRange.start && new Date(event.startDate) < new Date(dateRange.start)) return false;
      if (dateRange.end && new Date(event.endDate) > new Date(dateRange.end)) return false;

      return true;
    });
  }, [events, showImported, searchTerm, dateRange]);

  const selectedEventsList = useMemo(() => {
    return events.filter(e => selectedEventIds.has(e.uid));
  }, [events, selectedEventIds]);

  const totalHours = useMemo(() => {
    return selectedEventsList.reduce((sum, e) => sum + e.durationHours, 0);
  }, [selectedEventsList]);

  const totalDays = useMemo(() => {
    return parseFloat((totalHours / conversionRate).toFixed(2));
  }, [totalHours, conversionRate]);

  const toggleSelection = (uid: string) => {
    const newSet = new Set(selectedEventIds);
    if (newSet.has(uid)) newSet.delete(uid);
    else newSet.add(uid);
    setSelectedEventIds(newSet);
  };

  const selectAllFiltered = () => {
    const newSet = new Set(selectedEventIds);
    filteredEvents.forEach(e => newSet.add(e.uid));
    setSelectedEventIds(newSet);
  };

  const deselectAll = () => {
    setSelectedEventIds(new Set());
  };

  const handleImpute = () => {
    if (!targetId || selectedEventsList.length === 0) return;

    const project = projects.find(p => p.id === targetId);
    const activity = activities.find(a => a.id === targetId);
    
    const targetName = project ? project.title : activity ? activity.title : 'Inconnu';
    let imputationSuccess = false;

    if (project) {
      // Mise à jour du projet
      const updatedProject = { 
        ...project, 
        internalWorkloadConsumed: (project.internalWorkloadConsumed || 0) + totalDays,
        updatedAt: new Date().toISOString()
      };
      setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p));
      imputationSuccess = true;
    } else if (activity) {
      // Mise à jour de l'activité
      const updatedActivity = {
          ...activity,
          consumedWorkload: (activity.consumedWorkload || 0) + totalDays,
          updatedAt: new Date().toISOString()
      };
      setActivities(prev => prev.map(a => a.id === activity.id ? updatedActivity : a));
      imputationSuccess = true;
    }

    if (imputationSuccess) {
      // Mise à jour de l'historique local
      const newHistory = { ...importHistory };
      const now = new Date().toISOString();

      selectedEventsList.forEach(evt => {
        newHistory[evt.uid] = {
          uid: evt.uid,
          hash: evt.hash,
          importedOn: now,
          targetId: targetId,
          targetName: targetName
        };
      });

      setImportHistory(newHistory);
      saveToLocalStorage(HISTORY_STORAGE_KEY, newHistory);

      // Feedback visuel
      const updatedEvents = events.map(e => {
        if (selectedEventIds.has(e.uid)) {
          return { ...e, importStatus: 'imported' as EventStatus, history: newHistory[e.uid] };
        }
        return e;
      });
      setEvents(updatedEvents);
      setSelectedEventIds(new Set()); // Vider la sélection
      alert(`${totalDays} J/H imputés avec succès sur "${targetName}".`);
    } else {
        alert("Erreur : Cible d'imputation non trouvée.");
    }
  };

  const clearHistory = () => {
      if(confirm("Voulez-vous vraiment effacer tout l'historique d'importation ? Les prochains imports ne reconnaîtront plus les événements déjà traités.")) {
          setImportHistory({});
          saveToLocalStorage(HISTORY_STORAGE_KEY, {});
          // Reset status visual
           setEvents(prev => prev.map(e => ({ ...e, importStatus: 'new', history: undefined })));
      }
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Import Calendrier</h1>
          <p className="text-slate-600">Transformez vos réunions Outlook en temps consommé sur vos projets ou activités.</p>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={clearHistory} className="text-slate-400 hover:text-red-500 text-sm flex items-center gap-1 px-3 py-2 rounded hover:bg-red-50 transition-colors">
                <Trash2 size={14}/> Effacer l'historique
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors shadow-sm">
            <Upload size={18} />
            <span>Importer un fichier .ics</span>
            <input type="file" accept=".ics" onChange={handleFileUpload} className="hidden" />
            </label>
        </div>
      </div>

      {events.length === 0 ? (
        <Card className="flex-grow flex items-center justify-center border-2 border-dashed border-slate-300 bg-slate-50">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Aucun calendrier chargé</h3>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">
              Exportez votre calendrier Outlook au format .ics et glissez-le ici ou utilisez le bouton d'import en haut à droite.
            </p>
            <p className="text-xs text-slate-400 mt-4">
                Astuce Outlook : Fichier &gt; Enregistrer le calendrier &gt; Plus d'options &gt; Plage de dates &gt; Détails complets.
            </p>
          </div>
        </Card>
      ) : (
        <div className="flex-grow grid grid-cols-12 gap-6 min-h-0">
          
          {/* Colonne Gauche : Liste des événements */}
          <div className="col-span-8 flex flex-col min-h-0">
            <Card className="flex-grow flex flex-col min-h-0">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center mb-4">
                  <CardTitle>Événements ({filteredEvents.length})</CardTitle>
                  <div className="flex gap-2">
                      <button onClick={selectAllFiltered} className="text-xs text-blue-600 hover:underline">Tout sélectionner</button>
                      <span className="text-slate-300">|</span>
                      <button onClick={deselectAll} className="text-xs text-slate-500 hover:underline">Tout désélectionner</button>
                  </div>
                </div>
                
                {/* Filtres */}
                <div className="flex flex-wrap gap-3 pb-2">
                  <div className="relative flex-grow max-w-xs">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Filtrer par objet..." 
                      className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                   <div className="flex items-center gap-2">
                        <input type="date" className="text-sm border border-slate-300 rounded px-2 py-1.5" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
                        <span className="text-slate-400">-</span>
                        <input type="date" className="text-sm border border-slate-300 rounded px-2 py-1.5" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
                   </div>
                  <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none bg-slate-100 px-3 py-1.5 rounded hover:bg-slate-200">
                    <input type="checkbox" checked={showImported} onChange={e => setShowImported(e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    Afficher déjà imputés
                  </label>
                </div>
              </CardHeader>
              
              <CardContent className="flex-grow overflow-y-auto p-0">
                <div className="divide-y divide-slate-100">
                  {filteredEvents.map(event => {
                    const isSelected = selectedEventIds.has(event.uid);
                    
                    let statusBadge = null;
                    if (event.importStatus === 'new') statusBadge = <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase">Nouveau</span>;
                    else if (event.importStatus === 'modified') statusBadge = <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase flex items-center gap-1"><RefreshCw size={10}/> Modifié</span>;
                    else if (event.importStatus === 'imported') statusBadge = <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase flex items-center gap-1"><CheckCircle2 size={10}/> Imputé</span>;

                    return (
                      <div 
                        key={event.uid} 
                        onClick={() => toggleSelection(event.uid)}
                        className={`p-3 flex items-start gap-3 cursor-pointer transition-colors border-l-4 ${isSelected ? 'bg-blue-50 border-l-blue-500' : 'border-l-transparent hover:bg-slate-50'} ${event.importStatus === 'imported' ? 'opacity-60 grayscale-[0.5]' : ''}`}
                      >
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          onChange={() => toggleSelection(event.uid)}
                          className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <div className="flex-grow min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-slate-800 truncate pr-2" title={event.summary}>{event.summary}</h4>
                            {statusBadge}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1"><Calendar size={12}/> {event.startDate.toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock size={12}/> {event.startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {event.endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            <span className="font-medium text-slate-700">{event.durationHours}h</span>
                          </div>
                          {event.importStatus === 'imported' && event.history && (
                              <div className="text-[10px] text-green-600 mt-1 flex items-center gap-1">
                                  <History size={10}/>
                                  Déjà imputé sur : {event.history.targetName} le {new Date(event.history.importedOn).toLocaleDateString()}
                              </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {filteredEvents.length === 0 && (
                      <div className="p-8 text-center text-slate-400 italic">Aucun événement ne correspond aux filtres.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne Droite : Panier d'imputation */}
          <div className="col-span-4 flex flex-col">
            <div className="sticky top-4 space-y-4">
                <Card className="bg-slate-50 border-slate-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileUp className="text-blue-600"/>
                            Panier d'imputation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-500 text-sm">Événements</span>
                                <span className="font-bold text-slate-800">{selectedEventsList.length}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-500 text-sm">Total Heures</span>
                                <span className="font-bold text-slate-800">{totalHours.toFixed(2)} h</span>
                            </div>
                            <div className="border-t border-slate-100 my-2 pt-2 flex justify-between items-center">
                                <span className="text-slate-700 font-medium">Total Jours/Homme</span>
                                <span className="text-xl font-bold text-blue-600">{totalDays} J/H</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1 text-right">
                                Base de conversion : 1j = {conversionRate}h
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Imputer sur...</label>
                            <select 
                                value={targetId} 
                                onChange={e => setTargetId(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Sélectionner une cible...</option>
                                {projects.length > 0 && (
                                    <optgroup label="Projets">
                                        {projects.filter(p => p.projectId !== 'TOTAL_GENERAL').map(p => (
                                            <option key={p.id} value={p.id}>{p.projectId} - {p.title}</option>
                                        ))}
                                    </optgroup>
                                )}
                                {activities.length > 0 && (
                                    <optgroup label="Activités">
                                        {activities.map(a => (
                                            <option key={a.id} value={a.id}>{a.activityId} - {a.title}</option>
                                        ))}
                                    </optgroup>
                                )}
                            </select>
                        </div>
                        
                        <div className="pt-2">
                             <div className="flex items-center justify-between mb-1">
                                <label className="text-xs text-slate-500">Taux de conversion (h/j)</label>
                                <input 
                                    type="number" 
                                    value={conversionRate} 
                                    onChange={e => setConversionRate(parseFloat(e.target.value))}
                                    className="w-16 text-right text-xs border border-slate-300 rounded px-1 py-0.5"
                                    step="0.5"
                                />
                             </div>
                        </div>

                        <button 
                            onClick={handleImpute}
                            disabled={selectedEventsList.length === 0 || !targetId}
                            className="w-full py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                            <CheckCircle2 size={18} />
                            Valider l'imputation
                        </button>
                        
                        {selectedEventsList.length > 0 && !targetId && (
                            <p className="text-xs text-amber-600 text-center">
                                Veuillez sélectionner une cible (projet ou activité).
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default CalendarImportPage;