
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Upload, Calendar, Clock, CheckCircle2, AlertCircle, FileUp, Search, Filter, ArrowRight, RefreshCw, Trash2, History, ArrowDownAZ, CalendarDays, Plus, X, Copy, EyeOff, ListX } from 'lucide-react';
import { parseICSFile, CalendarEvent, ImportHistoryItem } from '../utils/icsParser';
import { Project, Activity, ProjectStatus, TShirtSize, ProjectCategory, ActivityStatus, Priority, ActivityType, SecurityDomain } from '../types';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/storage';
import Tooltip from '../components/ui/Tooltip';
import Modal from '../components/ui/Modal';

const HISTORY_STORAGE_KEY = 'calendar_import_history';
const HIDDEN_SUMMARIES_KEY = 'calendar_hidden_summaries';

type EventStatus = 'new' | 'modified' | 'imported' | 'cancelled';

interface DisplayEvent extends CalendarEvent {
  importStatus: EventStatus;
  history?: ImportHistoryItem;
  internalId: string; // ID unique pour l'affichage React et la sélection
}

type SortOption = 'date' | 'alpha';

const ITEMS_PER_PAGE = 50;

const CalendarImportPage: React.FC = () => {
  const { projects, activities, setProjects, setActivities, initiatives, resources, securityProcesses } = useData();
  const [events, setEvents] = useState<DisplayEvent[]>([]);
  const [selectedInternalIds, setSelectedInternalIds] = useState<Set<string>>(new Set());
  const [importHistory, setImportHistory] = useState<Record<string, ImportHistoryItem>>({});
  const [hiddenSummaries, setHiddenSummaries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Pagination virtuelle
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  
  // Filtres et Tri
  const [searchTerm, setSearchTerm] = useState('');
  const [showImported, setShowImported] = useState(false);
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({ start: '', end: '' });
  const [sortOption, setSortOption] = useState<SortOption>('date');

  // Panier d'imputation
  const [targetId, setTargetId] = useState<string>('');
  const [conversionRate, setConversionRate] = useState<number>(8);

  // Création rapide
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newItemType, setNewItemType] = useState<'project' | 'activity'>('project');
  const [newItemTitle, setNewItemTitle] = useState('');

  // Gestion des masqués
  const [isHiddenManagerOpen, setIsHiddenManagerOpen] = useState(false);
  
  // Refs pour le scroll infini
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Chargement de l'historique et des filtres au démarrage
  useEffect(() => {
    const history = loadFromLocalStorage<Record<string, ImportHistoryItem>>(HISTORY_STORAGE_KEY, {});
    setImportHistory(history);
    
    const hidden = loadFromLocalStorage<string[]>(HIDDEN_SUMMARIES_KEY, []);
    setHiddenSummaries(hidden);
  }, []);

  // Reset pagination quand les filtres changent
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchTerm, showImported, dateRange, sortOption, hiddenSummaries]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const parsedEvents = await parseICSFile(file);
      
      // Comparaison avec l'historique et génération d'internalId
      const processedEvents: DisplayEvent[] = parsedEvents.map((evt, index) => {
        const historyValues = Object.values(importHistory) as ImportHistoryItem[];
        const historyItem = historyValues.find(h => h.uid === evt.uid && h.hash === evt.hash);

        let status: EventStatus = 'new';

        if (evt.status === 'CANCELLED') {
          status = 'cancelled';
        } else if (historyItem) {
            status = 'imported';
        }

        return { 
            ...evt, 
            importStatus: status, 
            history: historyItem,
            internalId: `${evt.uid}-${index}-${Date.now()}` // ID unique stable pour cette session
        };
      });

      setEvents(processedEvents);
      setVisibleCount(ITEMS_PER_PAGE);
      
    } catch (error) {
      console.error("Erreur parsing ICS", error);
      alert("Erreur lors de la lecture du fichier calendrier.");
    } finally {
      setIsLoading(false);
      // Reset input value to allow re-uploading same file
      e.target.value = '';
    }
  };

  const filteredEvents = useMemo(() => {
    let result = events.filter(event => {
      if (event.summary === 'Sans titre') return false;
      if (event.summary.startsWith('Annulé:')) return false;
      
      // Filtrage des événements masqués par l'utilisateur
      if (hiddenSummaries.includes(event.summary.trim())) return false;

      if (!showImported && event.importStatus === 'imported') return false;
      if (event.importStatus === 'cancelled') return false;
      
      if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        const summaryMatch = event.summary.toLowerCase().includes(lowerTerm);
        const descMatch = event.description ? event.description.toLowerCase().includes(lowerTerm) : false;
        
        if (!summaryMatch && !descMatch) {
          return false;
        }
      }

      if (dateRange.start && new Date(event.startDate) < new Date(dateRange.start)) return false;
      if (dateRange.end && new Date(event.endDate) > new Date(dateRange.end)) return false;

      return true;
    });

    // Application du tri
    return result.sort((a, b) => {
        if (sortOption === 'alpha') {
            return a.summary.localeCompare(b.summary);
        } else {
            return b.startDate.getTime() - a.startDate.getTime();
        }
    });
  }, [events, showImported, searchTerm, dateRange, sortOption, hiddenSummaries]);

  const visibleEvents = useMemo(() => {
      return filteredEvents.slice(0, visibleCount);
  }, [filteredEvents, visibleCount]);

  const selectedEventsList = useMemo(() => {
    return events.filter(e => selectedInternalIds.has(e.internalId));
  }, [events, selectedInternalIds]);

  const totalHours = useMemo(() => {
    return selectedEventsList.reduce((sum, e) => sum + e.durationHours, 0);
  }, [selectedEventsList]);

  const totalDays = useMemo(() => {
    return parseFloat((totalHours / conversionRate).toFixed(2));
  }, [totalHours, conversionRate]);

  const toggleSelection = (internalId: string) => {
    const newSet = new Set(selectedInternalIds);
    if (newSet.has(internalId)) newSet.delete(internalId);
    else newSet.add(internalId);
    setSelectedInternalIds(newSet);
  };

  const selectAllFiltered = () => {
    const newSet = new Set(selectedInternalIds);
    filteredEvents.forEach(e => newSet.add(e.internalId));
    setSelectedInternalIds(newSet);
  };

  const selectSimilarEvents = (modelEvent: DisplayEvent) => {
      const newSet = new Set(selectedInternalIds);
      const targetSummary = modelEvent.summary.trim();

      const similarEvents = events.filter(e => 
          e.summary.trim() === targetSummary && 
          e.importStatus !== 'imported' && 
          e.importStatus !== 'cancelled'
      );
      
      let addedCount = 0;
      similarEvents.forEach(e => {
          if (!newSet.has(e.internalId)) {
              newSet.add(e.internalId);
              addedCount++;
          }
      });
      
      setSelectedInternalIds(newSet);
      setSearchTerm(targetSummary);
  };

  const deselectAll = () => {
    setSelectedInternalIds(new Set());
    setSearchTerm(''); // Réinitialiser aussi la recherche pour revenir à la vue complète
  };

  const handleScroll = () => {
      if (listContainerRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = listContainerRef.current;
          if (scrollTop + clientHeight >= scrollHeight - 50) {
              if (visibleCount < filteredEvents.length) {
                  setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredEvents.length));
              }
          }
      }
  };

  const handleImpute = () => {
    if (!targetId || selectedEventsList.length === 0) return;

    const project = projects.find(p => p.id === targetId);
    const activity = activities.find(a => a.id === targetId);
    
    const targetName = project ? project.title : activity ? activity.title : 'Inconnu';
    let imputationSuccess = false;

    if (project) {
      const updatedProject = { 
        ...project, 
        internalWorkloadConsumed: (project.internalWorkloadConsumed || 0) + totalDays,
        updatedAt: new Date().toISOString()
      };
      setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p));
      imputationSuccess = true;
    } else if (activity) {
      const updatedActivity = {
          ...activity,
          consumedWorkload: (activity.consumedWorkload || 0) + totalDays,
          updatedAt: new Date().toISOString()
      };
      setActivities(prev => prev.map(a => a.id === activity.id ? updatedActivity : a));
      imputationSuccess = true;
    }

    if (imputationSuccess) {
      const newHistory = { ...importHistory };
      const now = new Date().toISOString();

      selectedEventsList.forEach(evt => {
        const historyKey = `${evt.uid}_${evt.hash}`;
        newHistory[historyKey] = {
          uid: evt.uid,
          hash: evt.hash,
          importedOn: now,
          targetId: targetId,
          targetName: targetName
        };
        newHistory[evt.uid] = newHistory[historyKey];
      });

      setImportHistory(newHistory);
      saveToLocalStorage(HISTORY_STORAGE_KEY, newHistory);

      const updatedEvents = events.map(e => {
        if (selectedInternalIds.has(e.internalId)) {
            const historyKey = `${e.uid}_${e.hash}`;
            return { ...e, importStatus: 'imported' as EventStatus, history: newHistory[historyKey] };
        }
        return e;
      });
      setEvents(updatedEvents);
      setSelectedInternalIds(new Set());
      setSearchTerm(''); 
      
      alert(`${totalDays} J/H imputés avec succès sur "${targetName}".`);
    } else {
        alert("Erreur : Cible d'imputation non trouvée.");
    }
  };

  // --- Gestion des masqués ---

  const handleHideSelected = () => {
      if (selectedEventsList.length === 0) return;

      const summariesToHide = new Set<string>();
      selectedEventsList.forEach(e => summariesToHide.add(e.summary.trim()));

      const newHiddenSummaries = [...hiddenSummaries];
      summariesToHide.forEach(s => {
          if (!newHiddenSummaries.includes(s)) {
              newHiddenSummaries.push(s);
          }
      });

      setHiddenSummaries(newHiddenSummaries);
      saveToLocalStorage(HIDDEN_SUMMARIES_KEY, newHiddenSummaries);
      setSelectedInternalIds(new Set()); // Clear selection after hiding
      setSearchTerm(''); // Clear search to see result
  };

  const handleHideSingle = (summary: string) => {
      const s = summary.trim();
      if (!hiddenSummaries.includes(s)) {
          const newHiddenSummaries = [...hiddenSummaries, s];
          setHiddenSummaries(newHiddenSummaries);
          saveToLocalStorage(HIDDEN_SUMMARIES_KEY, newHiddenSummaries);
          
          // Si l'utilisateur filtrait sur ce terme, on vide la recherche pour revenir à la liste
          if (searchTerm === s) {
              setSearchTerm('');
          }
          
          // On enlève de la sélection tout événement correspondant
          if (selectedInternalIds.size > 0) {
              const newSelection = new Set(selectedInternalIds);
              events.forEach(e => {
                 if (e.summary.trim() === s && newSelection.has(e.internalId)) {
                     newSelection.delete(e.internalId);
                 }
              });
              setSelectedInternalIds(newSelection);
          }
      }
  };

  const handleRemoveHiddenSummary = (summary: string) => {
      const newHiddenSummaries = hiddenSummaries.filter(s => s !== summary);
      setHiddenSummaries(newHiddenSummaries);
      saveToLocalStorage(HIDDEN_SUMMARIES_KEY, newHiddenSummaries);
  };

  const clearHistory = () => {
      if(confirm("Voulez-vous vraiment effacer tout l'historique d'importation ?")) {
          setImportHistory({});
          saveToLocalStorage(HISTORY_STORAGE_KEY, {});
           setEvents(prev => prev.map(e => ({ ...e, importStatus: 'new', history: undefined })));
      }
  };

  const handleCreateNewItem = () => {
      if (!newItemTitle.trim()) {
          alert("Le titre est obligatoire.");
          return;
      }
      const newId = Date.now().toString();
      const now = new Date().toISOString();

      if (newItemType === 'project') {
        const nextIdNumber = projects.length > 0 ? Math.max(...projects.map(p => { const match = p.projectId.match(/P\d{2}-(\d{3})/); return match ? parseInt(match[1], 10) : 0; })) + 1 : 1;
        const projectIdDisplay = `P25-${String(nextIdNumber).padStart(3, '0')}`;
        const newProject: Project = { id: `proj-${newId}`, projectId: projectIdDisplay, title: newItemTitle, status: ProjectStatus.IDENTIFIED, tShirtSize: TShirtSize.M, category: ProjectCategory.PROJECT, isTop30: false, initiativeId: initiatives[0]?.id || '', isoMeasures: [], createdAt: now, updatedAt: now, internalWorkloadConsumed: 0 };
        setProjects(prev => [...prev, newProject]);
        setTargetId(newProject.id);
      } else {
        const nextIdNumber = activities.length + 1;
        const activityIdDisplay = `ACT-${String(nextIdNumber).padStart(3, '0')}`;
        const newActivity: Activity = { id: `act-${newId}`, activityId: activityIdDisplay, title: newItemTitle, status: ActivityStatus.NOT_STARTED, priority: Priority.MEDIUM, activityType: ActivityType.PONCTUAL, securityDomain: SecurityDomain.GOUVERNANCE, isoMeasures: [], strategicOrientations: [], objectives: [], functionalProcessId: securityProcesses[0]?.id || '', createdAt: now, updatedAt: now, consumedWorkload: 0 };
        setActivities(prev => [...prev, newActivity]);
        setTargetId(newActivity.id);
      }
      setIsCreateModalOpen(false);
      setNewItemTitle('');
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Import calendrier</h1>
          <p className="text-slate-600">Transformez vos réunions Outlook en temps consommé.</p>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => setIsHiddenManagerOpen(true)} className="text-slate-600 hover:text-blue-600 text-sm flex items-center gap-1 px-3 py-2 rounded hover:bg-blue-50 transition-colors bg-white border border-slate-200 shadow-sm">
                <ListX size={14}/> Gérer les masqués ({hiddenSummaries.length})
            </button>
            <button onClick={clearHistory} className="text-slate-400 hover:text-red-500 text-sm flex items-center gap-1 px-3 py-2 rounded hover:bg-red-50 transition-colors">
                <Trash2 size={14}/> Effacer historique
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
          </div>
        </Card>
      ) : (
        <div className="flex-grow grid grid-cols-12 gap-3 min-h-0">
          
          {/* Colonne Gauche : Liste des événements */}
          <div className="col-span-8 flex flex-col min-h-0">
            <Card className="flex-grow flex flex-col min-h-0">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center mb-4">
                  <CardTitle>
                    Événements filtrés ({filteredEvents.length})
                    <span className="text-sm font-normal text-slate-500 ml-2">sur {events.length} total</span>
                  </CardTitle>
                  <div className="flex gap-2">
                      <button onClick={selectAllFiltered} className="text-xs text-blue-600 hover:underline">Tout sélectionner</button>
                      <span className="text-slate-300">|</span>
                      <button onClick={deselectAll} className="text-xs text-slate-500 hover:underline">Tout désélectionner</button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 pb-2 items-center">
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
                   
                   <div className="flex bg-slate-100 rounded-md p-0.5">
                        <button 
                            onClick={() => setSortOption('date')} 
                            className={`p-1.5 rounded-sm transition-colors ${sortOption === 'date' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                            title="Trier par date"
                        >
                            <CalendarDays size={16} />
                        </button>
                        <button 
                            onClick={() => setSortOption('alpha')} 
                            className={`p-1.5 rounded-sm transition-colors ${sortOption === 'alpha' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                            title="Trier par ordre alphabétique"
                        >
                            <ArrowDownAZ size={16} />
                        </button>
                   </div>

                  <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none bg-slate-100 px-3 py-1.5 rounded hover:bg-slate-200">
                    <input type="checkbox" checked={showImported} onChange={e => setShowImported(e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    Afficher déjà imputés
                  </label>
                </div>
              </CardHeader>
              
              <CardContent className="flex-grow overflow-y-auto p-0" ref={listContainerRef} onScroll={handleScroll}>
                <div className="divide-y divide-slate-100">
                  {visibleEvents.map(event => {
                    const isSelected = selectedInternalIds.has(event.internalId);
                    
                    let statusBadge = null;
                    if (event.importStatus === 'new') statusBadge = <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase">Nouveau</span>;
                    else if (event.importStatus === 'modified') statusBadge = <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase flex items-center gap-1"><RefreshCw size={10}/> Modifié</span>;
                    else if (event.importStatus === 'imported') statusBadge = <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase flex items-center gap-1"><CheckCircle2 size={10}/> Imputé</span>;

                    return (
                      <div 
                        key={event.internalId} 
                        className={`p-3 flex items-start gap-3 transition-colors border-l-4 ${isSelected ? 'bg-blue-50 border-l-blue-500' : 'border-l-transparent hover:bg-slate-50'} ${event.importStatus === 'imported' ? 'opacity-60 grayscale-[0.5]' : ''}`}
                      >
                        {/* Colonne Gauche : Checkbox et Copie */}
                        <div className="flex flex-col items-center gap-2 mt-1 flex-shrink-0 w-8">
                            <input 
                                type="checkbox" 
                                checked={isSelected} 
                                onChange={() => toggleSelection(event.internalId)}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <Tooltip text="Sélectionner toutes les occurrences (et filtrer)">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); selectSimilarEvents(event); }}
                                    className="text-slate-400 hover:text-blue-600 transition-colors p-1.5 rounded-full hover:bg-blue-100"
                                >
                                    <Copy size={14} />
                                </button>
                            </Tooltip>
                        </div>

                        {/* Colonne Centrale : Contenu (Titre sur ligne 1, Dates sur ligne 2) */}
                        <div className="flex-grow min-w-0 cursor-pointer flex flex-col justify-center gap-1" onClick={() => toggleSelection(event.internalId)}>
                            <h4 className="font-bold text-slate-800 truncate text-sm leading-tight" title={event.summary}>
                                {event.summary}
                            </h4>
                            
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                    <Calendar size={12} className="text-slate-400"/> 
                                    {event.startDate.toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock size={12} className="text-slate-400"/> 
                                    {event.startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {event.endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                                <span className="font-medium text-slate-700 bg-slate-100 px-1.5 rounded border border-slate-200">
                                    {event.durationHours}h
                                </span>
                                {event.importStatus === 'imported' && event.history && (
                                    <span className="text-[10px] text-green-600 flex items-center gap-1 ml-auto">
                                        <History size={10}/>
                                        Imputé sur : {event.history.targetName}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Colonne Droite : Statut et Masquer */}
                        <div className="flex flex-col items-end justify-between gap-2 flex-shrink-0 w-20 self-stretch">
                             {statusBadge}
                             <Tooltip text="Masquer cet événement (et similaires)">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleHideSingle(event.summary); }}
                                    className="text-slate-400 hover:text-red-600 transition-colors p-1.5 rounded-full hover:bg-red-50 mb-1"
                                >
                                    <EyeOff size={16} />
                                </button>
                            </Tooltip>
                        </div>
                      </div>
                    );
                  })}
                  
                  {filteredEvents.length === 0 && (
                      <div className="p-8 text-center text-slate-400 italic">Aucun événement ne correspond aux filtres.</div>
                  )}
                  {filteredEvents.length > visibleEvents.length && (
                      <div className="p-4 text-center text-xs text-slate-400">
                          Faites défiler pour voir plus d'événements...
                      </div>
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

                        <button
                            onClick={handleHideSelected}
                            disabled={selectedEventsList.length === 0}
                            className="w-full py-2 bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-lg font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <EyeOff size={16} />
                            Masquer la sélection
                        </button>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Imputer sur...</label>
                            <div className="flex gap-2">
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
                                <Tooltip text="Créer un nouveau projet/activité">
                                    <button onClick={() => setIsCreateModalOpen(true)} className="flex-shrink-0 bg-white border border-slate-300 rounded-md w-10 flex items-center justify-center text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-colors">
                                        <Plus size={20} />
                                    </button>
                                </Tooltip>
                            </div>
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

      {/* Modal de création rapide */}
      {isCreateModalOpen && (
        <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Création rapide">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Type d'élément</label>
                    <div className="flex gap-4">
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="itemType" checked={newItemType === 'project'} onChange={() => setNewItemType('project')} className="sr-only peer"/>
                            <div className="px-4 py-2 rounded-md border border-slate-300 peer-checked:bg-blue-100 peer-checked:border-blue-500 peer-checked:text-blue-700">Projet</div>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input type="radio" name="itemType" checked={newItemType === 'activity'} onChange={() => setNewItemType('activity')} className="sr-only peer"/>
                            <div className="px-4 py-2 rounded-md border border-slate-300 peer-checked:bg-blue-100 peer-checked:border-blue-500 peer-checked:text-blue-700">Activité</div>
                        </label>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Titre</label>
                    <input 
                        type="text" 
                        value={newItemTitle} 
                        onChange={(e) => setNewItemTitle(e.target.value)} 
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Mise à jour des serveurs"
                        autoFocus
                    />
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t">
                    <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md">Annuler</button>
                    <button onClick={handleCreateNewItem} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Créer et sélectionner</button>
                </div>
            </div>
        </Modal>
      )}

      {/* Modal de gestion des masqués */}
      {isHiddenManagerOpen && (
          <Modal isOpen={isHiddenManagerOpen} onClose={() => setIsHiddenManagerOpen(false)} title="Événements masqués">
              <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                      Les événements ayant ces libellés sont automatiquement masqués de la liste d'importation.
                  </p>
                  {hiddenSummaries.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 italic bg-slate-50 rounded-lg border border-dashed border-slate-300">
                          Aucun filtre de masquage actif.
                      </div>
                  ) : (
                      <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-md bg-white">
                          {hiddenSummaries.sort().map(summary => (
                              <div key={summary} className="flex justify-between items-center p-3 hover:bg-slate-50">
                                  <span className="text-sm text-slate-800 font-medium">{summary}</span>
                                  <Tooltip text="Ré-afficher (ne plus masquer)">
                                      <button 
                                          onClick={() => handleRemoveHiddenSummary(summary)} 
                                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                      >
                                          <Trash2 size={16} />
                                      </button>
                                  </Tooltip>
                              </div>
                          ))}
                      </div>
                  )}
                  <div className="flex justify-end pt-4 border-t">
                      <button onClick={() => setIsHiddenManagerOpen(false)} className="px-4 py-2 text-sm bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-md transition-colors">
                          Fermer
                      </button>
                  </div>
              </div>
          </Modal>
      )}
    </div>
  );
};

export default CalendarImportPage;
