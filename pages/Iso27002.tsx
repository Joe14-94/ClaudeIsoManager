import React, { useState, useMemo, useEffect } from 'react';
// FIX: The project appears to use react-router-dom v5. The `useLocation` hook is available in v5.1+, and the error likely stems from a project-wide version mismatch with v6. Updated to v6.
import { useLocation } from 'react-router-dom';
import { ISO_MEASURES_DATA, CHAPTER_COLORS } from '../constants';
import { IsoChapter, IsoMeasure, IsoMeasureDetails } from '../types';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { SlidersHorizontal, Search } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import ActiveFiltersDisplay from '../components/ui/ActiveFiltersDisplay';

const MeasureDetails: React.FC<{ measure: IsoMeasure }> = ({ measure }) => {
    if (!measure.details) {
        return <p>Détails non disponibles.</p>;
    }

    const { details } = measure;

    const renderTags = (title: string, tags: string[] | string) => {
        const tagArray = Array.isArray(tags) ? tags : [tags];
        return (
            <div className="mb-2">
                <h4 className="font-semibold text-sm text-slate-600">{title}</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                    {tagArray.map(tag => (
                        <span key={tag} className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded-md">{tag.replace(/_/g, ' ')}</span>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 text-slate-700">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                {renderTags('Type', details.type)}
                {renderTags('Propriétés', details.properties)}
                {renderTags('Concepts', details.concepts)}
                {renderTags('Capacités op.', details.processes)}
                {details.functionalProcess && renderTags('Processus fonc.', details.functionalProcess)}
                {renderTags('Domaines', details.domains)}
            </div>

            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Mesure de sécurité</h3>
                <p>{details.measure}</p>
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Objectif</h3>
                <p>{details.objective}</p>
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Recommandations</h3>
                <div className="iso-details-content" dangerouslySetInnerHTML={{ __html: details.recommendations }} />
            </div>
            {details.extraInfo && (
                 <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Informations supplémentaires</h3>
                    <div className="iso-details-content" dangerouslySetInnerHTML={{ __html: details.extraInfo }} />
                </div>
            )}
        </div>
    );
};


const Iso27002: React.FC = () => {
  // FIX: The useLocation hook in react-router-dom v6 does not accept a generic type argument.
  const location = useLocation();
  const locationState = location.state as any;
  const [selectedMeasure, setSelectedMeasure] = useState<IsoMeasure | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterByCoverage, setFilterByCoverage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [codeFilter, setCodeFilter] = useState<string[] | null>(null);

  const allMeasures: IsoMeasure[] = useMemo(() => ISO_MEASURES_DATA.map(m => ({ ...m, id: m.code, details: (m as any).details })), []);

  useEffect(() => {
    const measureCodeToOpen = locationState?.openMeasure;
    if (measureCodeToOpen) {
      const measure = allMeasures.find(m => m.code === measureCodeToOpen);
      if (measure) {
        setSelectedMeasure(measure);
      }
      window.history.replaceState({}, document.title)
    }
    
    if (locationState?.filter === 'covered' && locationState?.coveredMeasuresCodes) {
        setCodeFilter(locationState.coveredMeasuresCodes);
        setFilterByCoverage(false);
        window.history.replaceState({}, document.title);
    } else if (locationState?.filter === 'covered') {
        setFilterByCoverage(true);
        setCodeFilter(null);
        setShowFilters(false);
        setSearchTerm('');
        window.history.replaceState({}, document.title)
    }
  }, [locationState, allMeasures]);

  const filterOptions = useMemo((): Record<'type' | 'properties' | 'concepts' | 'processes' | 'functionalProcess' | 'domains', string[]> => {
    const options = {
        type: new Set<string>(),
        properties: new Set<string>(),
        concepts: new Set<string>(),
        processes: new Set<string>(),
        functionalProcess: new Set<string>(),
        domains: new Set<string>(),
    };

    allMeasures.forEach(measure => {
        if (measure.details) {
            measure.details.type.forEach(val => options.type.add(val));
            measure.details.properties.forEach(val => options.properties.add(val));
            measure.details.concepts.forEach(val => options.concepts.add(val));
            measure.details.processes.forEach(val => options.processes.add(val));
            if(measure.details.functionalProcess) {
              options.functionalProcess.add(measure.details.functionalProcess);
            }
            measure.details.domains.forEach(val => options.domains.add(val));
        }
    });

    return {
        type: Array.from(options.type).sort(),
        properties: Array.from(options.properties).sort(),
        concepts: Array.from(options.concepts).sort(),
        processes: Array.from(options.processes).sort(),
        functionalProcess: Array.from(options.functionalProcess).sort(),
        domains: Array.from(options.domains).sort(),
    };
  }, [allMeasures]);

  // FIX: Explicitly define FilterableDetailKey as a union of string literals
  // to prevent TypeScript from inferring a `symbol` type from `keyof`.
  type FilterableDetailKey = 'type' | 'properties' | 'concepts' | 'processes' | 'functionalProcess' | 'domains';

  const [activeFilters, setActiveFilters] = useState<Record<FilterableDetailKey, string[]>>({
    type: [],
    properties: [],
    concepts: [],
    processes: [],
    functionalProcess: [],
    domains: [],
  });

  const { activities } = useData();
  const coveredMeasuresCodes = useMemo(() => new Set(activities.flatMap(a => a.isoMeasures)), [activities]);

  const filteredMeasures = useMemo(() => {
    let measures = allMeasures;

    if (codeFilter) {
      const codeSet = new Set(codeFilter);
      measures = measures.filter(measure => codeSet.has(measure.code));
    }

    if (searchTerm) {
        const lowercasedTerm = searchTerm.toLowerCase();
        return measures.filter(measure => {
            const fullText = [
                measure.code,
                measure.title,
                measure.description,
                measure.details?.measure,
                measure.details?.objective,
                measure.details?.recommendations,
                measure.details?.extraInfo,
                measure.details?.type.join(' '),
                measure.details?.properties.join(' '),
                measure.details?.concepts.join(' '),
                measure.details?.processes.join(' '),
                measure.details?.functionalProcess,
                measure.details?.domains.join(' '),
            ].filter(Boolean).join(' ').toLowerCase();
            return fullText.includes(lowercasedTerm);
        });
    }

    const isAnyDetailFilterActive = Object.values(activeFilters).some(arr => (arr as string[]).length > 0);

    if (filterByCoverage) {
      measures = measures.filter(measure => coveredMeasuresCodes.has(measure.code));
    }
    
    if (!isAnyDetailFilterActive) {
        return measures;
    }

    return measures.filter(measure => {
        if (!measure.details) return false;

        return (Object.keys(activeFilters) as FilterableDetailKey[]).every(category => {
            const selectedValues = activeFilters[category];
            if (selectedValues.length === 0) {
                return true;
            }
            
            const measureValues = measure.details?.[category as keyof IsoMeasureDetails];
            if (!measureValues) return false;

            if (Array.isArray(measureValues)) {
                return measureValues.some(measureValue => selectedValues.includes(measureValue));
            }
            return selectedValues.includes(measureValues as string);
        });
    });
  }, [allMeasures, activeFilters, filterByCoverage, coveredMeasuresCodes, searchTerm, codeFilter]);

  const filterCounts = useMemo(() => {
    const counts: Record<string, Record<string, number>> = {};

    (Object.keys(filterOptions) as FilterableDetailKey[]).forEach(category => {
      counts[category] = {};

      const relevantMeasures = filteredMeasures; // Count within already filtered measures

      const options = filterOptions[category];
      options.forEach(value => {
        counts[category][value] = relevantMeasures.filter(measure => {
            const prop = measure.details?.[category as keyof IsoMeasureDetails];
            if (Array.isArray(prop)) {
              return prop.includes(value);
            }
            return prop === value;
        }).length;
      });
    });

    return counts;
  }, [filteredMeasures, filterOptions]);

  const handleFilterChange = (category: FilterableDetailKey, value: string) => {
    setSearchTerm(''); // Clear search when applying detail filters
    setFilterByCoverage(false);
    setCodeFilter(null);
    setActiveFilters(prev => {
        const currentCategoryFilters = prev[category] || [];
        const newCategoryFilters = currentCategoryFilters.includes(value)
            ? currentCategoryFilters.filter(item => item !== value)
            : [...currentCategoryFilters, value];
        return {
            ...prev,
            [category]: newCategoryFilters,
        };
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term) {
        // Reset other filters when searching
        setFilterByCoverage(false);
        setCodeFilter(null);
        setActiveFilters({ type: [], properties: [], concepts: [], processes: [], functionalProcess: [], domains: [] });
        setShowFilters(false);
    }
  };

  const resetFilters = () => {
      setSearchTerm('');
      setFilterByCoverage(false);
      setCodeFilter(null);
      setActiveFilters({
        type: [],
        properties: [],
        concepts: [],
        processes: [],
        functionalProcess: [],
        domains: [],
      });
  };
  
    const filterLabels: Record<string, string> = {
    type: 'Type de mesure',
    properties: 'Propriétés',
    concepts: 'Concepts de cybersécurité',
    processes: 'Capacités opérationnelles',
    functionalProcess: 'Processus fonctionnels',
    domains: 'Domaines de sécurité'
  };

  const activeFiltersForDisplay = useMemo(() => {
    const filters: { [key: string]: string } = {};
    if (filterByCoverage) filters['Couverture'] = 'Mesures couvertes';
    if (codeFilter) filters['Code Mesure'] = `${codeFilter.length} spécifique(s)`;
    
    (Object.keys(activeFilters) as FilterableDetailKey[]).forEach(category => {
        const selected = activeFilters[category];
        if (selected.length > 0) {
            const label = filterLabels[category] || category;
            filters[label] = selected.length > 1 ? `${selected.length} sélectionnés` : selected[0];
        }
    });

    return filters;
  }, [filterByCoverage, codeFilter, activeFilters, filterLabels]);
  
  const handleRemoveFilter = (key: string) => {
    if (key === 'Couverture') setFilterByCoverage(false);
    else if (key === 'Code Mesure') setCodeFilter(null);
    else {
        const categoryKey = (Object.keys(filterLabels) as FilterableDetailKey[]).find(k => filterLabels[k] === key);
        if (categoryKey) {
            setActiveFilters(prev => ({...prev, [categoryKey]: []}));
        }
    }
  };


  const measuresByChapter = useMemo(() => {
    return filteredMeasures.reduce<Record<string, IsoMeasure[]>>((acc, measure) => {
      if (!acc[measure.chapter]) {
        acc[measure.chapter] = [];
      }
      acc[measure.chapter].push(measure);
      return acc;
    }, {} as Record<string, IsoMeasure[]>);
  }, [filteredMeasures]);

  const totalFilteredMeasures = filteredMeasures.length;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex-shrink-0">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-3xl font-bold text-slate-800">Référentiel ISO 27002:2022</h1>
          <div className="flex items-center gap-2">
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                      type="text"
                      placeholder="Recherche plein texte..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="w-full sm:w-64 pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
              </div>
              <button 
                  onClick={() => { setShowFilters(!showFilters); setSearchTerm(''); setCodeFilter(null); }} 
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors shadow-sm"
                  aria-expanded={showFilters}
              >
                  <SlidersHorizontal size={18} />
                  <span>Filtrer</span>
              </button>
          </div>
        </div>
        <p className="text-slate-600 mt-2">
          Explorez les 93 mesures de sécurité de l'information, organisées en 4 chapitres. Cliquez sur une mesure pour voir le détail.
        </p>

        {showFilters && (
          <Card className="my-4">
              <CardHeader>
                  <CardTitle>Filtrer les mesures</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                      {(Object.keys(filterOptions) as FilterableDetailKey[]).map((category) => (
                          <div key={category}>
                              <h4 className="font-semibold text-slate-700 mb-2">{filterLabels[category]}</h4>
                              <div className="space-y-1 max-h-48 overflow-y-auto pr-2">
                                  {(filterOptions[category]).map(value => (
                                      <div key={value} className="flex items-center justify-between">
                                          <label className="flex items-center cursor-pointer select-none" htmlFor={`${category}-${value}`}>
                                              <input
                                                  type="checkbox"
                                                  id={`${category}-${value}`}
                                                  checked={activeFilters[category]?.includes(value) || false}
                                                  onChange={() => handleFilterChange(category, value)}
                                                  className="sr-only peer"
                                              />
                                              <div className="w-4 h-4 bg-white border border-slate-300 rounded flex-shrink-0 flex items-center justify-center peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-blue-500 transition-colors">
                                                  <svg className="hidden peer-checked:block w-3 h-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                                                      <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                                                  </svg>
                                              </div>
                                              <span className="ml-2 text-sm text-slate-600">
                                                  {value.replace(/_/g, ' ')}
                                              </span>
                                          </label>
                                          <span className="text-xs text-slate-500 font-medium">
                                              {filterCounts[category]?.[value] || 0}
                                          </span>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      ))}
                  </div>
                  <div className="mt-6 flex justify-end">
                      <button onClick={resetFilters} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 border border-transparent rounded-md hover:bg-slate-300">
                          Réinitialiser les filtres
                      </button>
                  </div>
              </CardContent>
          </Card>
        )}

        <ActiveFiltersDisplay filters={activeFiltersForDisplay} onRemoveFilter={handleRemoveFilter} onClearAll={resetFilters} />

        <div className="text-sm text-slate-500 font-medium mt-4">
          {searchTerm 
              ? `${totalFilteredMeasures} mesure(s) trouvée(s) pour "${searchTerm}".`
              : `${totalFilteredMeasures} sur ${allMeasures.length} mesure(s) affichée(s).`
          }
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto space-y-6 pr-2">
        {totalFilteredMeasures > 0 ? (
          Object.entries(measuresByChapter).map(([chapter, measures]) => (
              (measures as IsoMeasure[]).length > 0 && (
                  <div key={chapter}>
                      <h2 className={`text-xl font-semibold text-slate-700 mb-3 pl-3 border-l-4 ${CHAPTER_COLORS[chapter as IsoChapter]}`}>
                          {chapter}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {(measures as IsoMeasure[]).map((measure) => (
                          <Card key={measure.code} className="cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={() => setSelectedMeasure(measure)}>
                              <CardContent>
                              <div className="font-semibold text-slate-800">
                                  <span className="font-mono text-blue-600">{measure.code}</span> - {measure.title}
                              </div>
                              <p className="text-sm text-slate-500 mt-2">{measure.description}</p>
                              </CardContent>
                          </Card>
                          ))}
                      </div>
                  </div>
              )
          ))
        ) : (
          <Card>
              <CardContent className="text-center text-slate-500 py-16">
                  <p className="font-semibold">
                    {searchTerm 
                      ? `Aucune mesure ne correspond à votre recherche "${searchTerm}".`
                      : "Aucune mesure ne correspond aux filtres sélectionnés."
                    }
                  </p>
                  <p className="text-sm mt-1">Essayez d'ajuster ou de réinitialiser vos filtres.</p>
              </CardContent>
          </Card>
        )}
      </div>


      {selectedMeasure && (
        <Modal 
          isOpen={!!selectedMeasure} 
          onClose={() => setSelectedMeasure(null)}
          title={`${selectedMeasure.code} - ${selectedMeasure.title}`}
        >
          <MeasureDetails measure={selectedMeasure} />
        </Modal>
      )}
    </div>
  );
};

export default Iso27002;