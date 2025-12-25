import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search, X, FileText, Folder, Target, Flag, Users, Shield, AlertTriangle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';

type SearchResultType = 'project' | 'activity' | 'initiative' | 'objective' | 'orientation' | 'chantier' | 'process' | 'resource' | 'risk';

interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  path: string;
  matchedField?: string;
}

const typeConfig: Record<SearchResultType, {
  icon: React.ElementType;
  label: string;
  color: string;
  bgColor: string;
}> = {
  project: { icon: Folder, label: 'Projet', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  activity: { icon: FileText, label: 'Activité', color: 'text-green-600', bgColor: 'bg-green-100' },
  initiative: { icon: Target, label: 'Initiative', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  objective: { icon: Flag, label: 'Objectif', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  orientation: { icon: Shield, label: 'Orientation', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  chantier: { icon: Folder, label: 'Chantier', color: 'text-teal-600', bgColor: 'bg-teal-100' },
  process: { icon: Shield, label: 'Processus', color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  resource: { icon: Users, label: 'Ressource', color: 'text-pink-600', bgColor: 'bg-pink-100' },
  risk: { icon: AlertTriangle, label: 'Risque', color: 'text-red-600', bgColor: 'bg-red-100' },
};

interface GlobalSearchProps {
  className?: string;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { projects, activities, initiatives, objectives, orientations, chantiers, processes, resources, majorRisks } = useData();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [results, setResults] = useState<SearchResult[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fonction de recherche
  const searchItems = useCallback((searchQuery: string): SearchResult[] => {
    if (!searchQuery.trim()) return [];

    const normalizedQuery = searchQuery.toLowerCase().trim();
    const foundResults: SearchResult[] = [];

    // Recherche dans les projets
    projects.forEach((project) => {
      const matches =
        project.name?.toLowerCase().includes(normalizedQuery) ||
        project.code?.toLowerCase().includes(normalizedQuery) ||
        project.description?.toLowerCase().includes(normalizedQuery);

      if (matches) {
        foundResults.push({
          id: project.id,
          type: 'project',
          title: project.name,
          subtitle: project.code,
          path: '/projets',
          matchedField: project.code?.toLowerCase().includes(normalizedQuery) ? 'Code' : 'Nom',
        });
      }
    });

    // Recherche dans les activités
    activities.forEach((activity) => {
      const matches =
        activity.name?.toLowerCase().includes(normalizedQuery) ||
        activity.description?.toLowerCase().includes(normalizedQuery);

      if (matches) {
        foundResults.push({
          id: activity.id,
          type: 'activity',
          title: activity.name,
          subtitle: activity.status,
          path: '/activities',
        });
      }
    });

    // Recherche dans les initiatives
    initiatives.forEach((initiative) => {
      const matches =
        initiative.name?.toLowerCase().includes(normalizedQuery) ||
        initiative.description?.toLowerCase().includes(normalizedQuery);

      if (matches) {
        foundResults.push({
          id: initiative.id,
          type: 'initiative',
          title: initiative.name,
          subtitle: initiative.pillar,
          path: '/initiatives',
        });
      }
    });

    // Recherche dans les objectifs
    objectives.forEach((objective) => {
      const matches =
        objective.name?.toLowerCase().includes(normalizedQuery) ||
        objective.description?.toLowerCase().includes(normalizedQuery);

      if (matches) {
        foundResults.push({
          id: objective.id,
          type: 'objective',
          title: objective.name,
          path: '/objectives',
        });
      }
    });

    // Recherche dans les orientations
    orientations.forEach((orientation) => {
      const matches =
        orientation.name?.toLowerCase().includes(normalizedQuery) ||
        orientation.description?.toLowerCase().includes(normalizedQuery);

      if (matches) {
        foundResults.push({
          id: orientation.id,
          type: 'orientation',
          title: orientation.name,
          path: '/orientations',
        });
      }
    });

    // Recherche dans les chantiers
    chantiers.forEach((chantier) => {
      const matches =
        chantier.name?.toLowerCase().includes(normalizedQuery) ||
        chantier.description?.toLowerCase().includes(normalizedQuery);

      if (matches) {
        foundResults.push({
          id: chantier.id,
          type: 'chantier',
          title: chantier.name,
          path: '/chantiers',
        });
      }
    });

    // Recherche dans les processus
    processes.forEach((process) => {
      const matches =
        process.name?.toLowerCase().includes(normalizedQuery) ||
        process.description?.toLowerCase().includes(normalizedQuery);

      if (matches) {
        foundResults.push({
          id: process.id,
          type: 'process',
          title: process.name,
          path: '/processes',
        });
      }
    });

    // Recherche dans les ressources
    resources.forEach((resource) => {
      const matches =
        resource.name?.toLowerCase().includes(normalizedQuery) ||
        resource.role?.toLowerCase().includes(normalizedQuery);

      if (matches) {
        foundResults.push({
          id: resource.id,
          type: 'resource',
          title: resource.name,
          subtitle: resource.role,
          path: '/resources',
        });
      }
    });

    // Recherche dans les risques
    majorRisks.forEach((risk) => {
      const matches =
        risk.name?.toLowerCase().includes(normalizedQuery) ||
        risk.description?.toLowerCase().includes(normalizedQuery);

      if (matches) {
        foundResults.push({
          id: risk.id,
          type: 'risk',
          title: risk.name,
          path: '/projets',
        });
      }
    });

    return foundResults.slice(0, 20); // Limiter à 20 résultats
  }, [projects, activities, initiatives, objectives, orientations, chantiers, processes, resources, majorRisks]);

  // Effectuer la recherche avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const searchResults = searchItems(query);
      setResults(searchResults);
      setSelectedIndex(0);
    }, 150);

    return () => clearTimeout(timer);
  }, [query, searchItems]);

  // Raccourci clavier global (Ctrl+K ou Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus sur l'input quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Fermer sur clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Gestion de la navigation au clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setQuery('');
        break;
    }
  };

  // Scroll vers l'élément sélectionné
  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleSelect = (result: SearchResult) => {
    navigate(result.path, { state: { highlightId: result.id, searchQuery: query } });
    setIsOpen(false);
    setQuery('');
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
  };

  // Grouper les résultats par type
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    results.forEach((result) => {
      if (!groups[result.type]) {
        groups[result.type] = [];
      }
      groups[result.type].push(result);
    });
    return groups;
  }, [results]);

  return (
    <>
      {/* Bouton de recherche */}
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-3 py-2 text-sm text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors ${className}`}
        aria-label="Recherche globale (Ctrl+K)"
      >
        <Search size={18} />
        <span className="hidden sm:inline">Rechercher...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-slate-400 bg-slate-200 rounded">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Modal de recherche */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black bg-opacity-50">
          <div
            ref={containerRef}
            className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Recherche globale"
          >
            {/* Barre de recherche */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200">
              <Search className="text-slate-400" size={20} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Rechercher des projets, activités, objectifs..."
                className="flex-1 text-base bg-transparent border-none outline-none placeholder-slate-400"
                aria-label="Terme de recherche"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                  aria-label="Effacer la recherche"
                >
                  <X size={18} />
                </button>
              )}
              <button
                onClick={handleClose}
                className="px-2 py-1 text-xs font-medium text-slate-500 bg-slate-100 rounded hover:bg-slate-200"
              >
                ESC
              </button>
            </div>

            {/* Résultats */}
            <div
              ref={resultsRef}
              className="max-h-96 overflow-y-auto"
              role="listbox"
            >
              {query.trim() === '' ? (
                <div className="p-8 text-center text-slate-500">
                  <Search className="mx-auto mb-3 text-slate-300" size={40} />
                  <p>Commencez à taper pour rechercher</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Projets, activités, initiatives, objectifs...
                  </p>
                </div>
              ) : results.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <p>Aucun résultat pour "{query}"</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Essayez avec d'autres termes
                  </p>
                </div>
              ) : (
                Object.entries(groupedResults).map(([type, items]) => {
                  const config = typeConfig[type as SearchResultType];
                  return (
                    <div key={type}>
                      <div className="px-4 py-2 text-xs font-semibold text-slate-500 bg-slate-50 uppercase tracking-wider">
                        {config.label}s ({items.length})
                      </div>
                      {items.map((result, idx) => {
                        const globalIndex = results.indexOf(result);
                        const IconComponent = config.icon;
                        const isSelected = globalIndex === selectedIndex;

                        return (
                          <button
                            key={result.id}
                            onClick={() => handleSelect(result)}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                              isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
                            }`}
                            role="option"
                            aria-selected={isSelected}
                          >
                            <div className={`p-2 rounded-lg ${config.bgColor}`}>
                              <IconComponent className={config.color} size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-900 truncate">
                                {result.title}
                              </p>
                              {result.subtitle && (
                                <p className="text-sm text-slate-500 truncate">
                                  {result.subtitle}
                                </p>
                              )}
                            </div>
                            <ChevronRight className="text-slate-400" size={16} />
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {results.length > 0 && (
              <div className="px-4 py-2 text-xs text-slate-500 bg-slate-50 border-t border-slate-200 flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-200 rounded">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-slate-200 rounded">↓</kbd>
                  naviguer
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-200 rounded">↵</kbd>
                  sélectionner
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-200 rounded">esc</kbd>
                  fermer
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalSearch;
