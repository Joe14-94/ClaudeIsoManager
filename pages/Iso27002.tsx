import React, { useState, useMemo } from 'react';
import { ISO_MEASURES_DATA, CHAPTER_COLORS } from '../constants';
import { IsoChapter, IsoMeasure, IsoMeasureDetails } from '../types';
import Card, { CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { SlidersHorizontal } from 'lucide-react';

const MeasureDetails: React.FC<{ measure: IsoMeasure }> = ({ measure }) => {
    if (!measure.details) {
        return <p>Détails non disponibles.</p>;
    }

    const { details } = measure;

    const renderTags = (title: string, tags: string[]) => (
        <div className="mb-2">
            <h4 className="font-semibold text-sm text-slate-600">{title}</h4>
            <div className="flex flex-wrap gap-2 mt-1">
                {tags.map(tag => (
                    <span key={tag} className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded-md">{tag.replace(/_/g, ' ')}</span>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-4 text-slate-700">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                {renderTags('Type', details.type)}
                {renderTags('Propriétés', details.properties)}
                {renderTags('Concepts', details.concepts)}
                {renderTags('Capacités', details.capabilities)}
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
  const [selectedMeasure, setSelectedMeasure] = useState<IsoMeasure | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const allMeasures: IsoMeasure[] = useMemo(() => ISO_MEASURES_DATA.map(m => ({ ...m, id: m.code, details: (m as any).details })), []);

  const filterOptions = useMemo(() => {
    const options: Record<string, Set<string>> = {
        type: new Set(),
        properties: new Set(),
        concepts: new Set(),
        capabilities: new Set(),
        domains: new Set(),
    };

    allMeasures.forEach(measure => {
        if (measure.details) {
            measure.details.type.forEach(val => options.type.add(val));
            measure.details.properties.forEach(val => options.properties.add(val));
            measure.details.concepts.forEach(val => options.concepts.add(val));
            measure.details.capabilities.forEach(val => options.capabilities.add(val));
            measure.details.domains.forEach(val => options.domains.add(val));
        }
    });

    return {
        type: Array.from(options.type).sort(),
        properties: Array.from(options.properties).sort(),
        concepts: Array.from(options.concepts).sort(),
        capabilities: Array.from(options.capabilities).sort(),
        domains: Array.from(options.domains).sort(),
    };
  }, [allMeasures]);

  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({
    type: [],
    properties: [],
    concepts: [],
    capabilities: [],
    domains: [],
  });

  const filterCounts = useMemo(() => {
    const counts: Record<string, Record<string, number>> = {};

    Object.keys(filterOptions).forEach(category => {
      counts[category] = {};

      const relevantMeasures = allMeasures.filter(measure => {
        if (!measure.details) return false;
        
        return (Object.keys(activeFilters) as Array<keyof typeof activeFilters>).every(cat => {
          if (cat === category) return true;
          
          const selectedValues = activeFilters[cat];
          if (selectedValues.length === 0) return true;

          const measureValues = measure.details?.[cat as keyof IsoMeasureDetails];
          if (!Array.isArray(measureValues)) return false;

          return measureValues.some(measureValue => selectedValues.includes(measureValue));
        });
      });

      const options = filterOptions[category as keyof typeof filterOptions];
      options.forEach(value => {
        counts[category][value] = relevantMeasures.filter(measure => 
          measure.details?.[category as keyof IsoMeasureDetails]?.includes(value)
        ).length;
      });
    });

    return counts;
  }, [allMeasures, activeFilters, filterOptions]);

  const handleFilterChange = (category: string, value: string) => {
    setActiveFilters(prev => {
        const currentCategoryFilters = prev[category] || [];
        const newCategoryFilters = currentCategoryFilters.includes(value)
            ? currentCategoryFilters.filter(item => item !== value) // uncheck
            : [...currentCategoryFilters, value]; // check
        return {
            ...prev,
            [category]: newCategoryFilters,
        };
    });
  };

  const resetFilters = () => {
      setActiveFilters({
        type: [],
        properties: [],
        concepts: [],
        capabilities: [],
        domains: [],
      });
  };

  const filteredMeasures = useMemo(() => {
    const isAnyFilterActive = Object.values(activeFilters).some(arr => arr.length > 0);
    if (!isAnyFilterActive) {
        return allMeasures;
    }

    return allMeasures.filter(measure => {
        if (!measure.details) return false;

        return (Object.keys(activeFilters) as Array<keyof typeof activeFilters>).every(category => {
            const selectedValues = activeFilters[category];
            if (selectedValues.length === 0) {
                return true;
            }

            const measureValues = measure.details?.[category as keyof IsoMeasureDetails];
            if (!Array.isArray(measureValues)) return false;

            return measureValues.some(measureValue => selectedValues.includes(measureValue));
        });
    });
  }, [allMeasures, activeFilters]);

  const measuresByChapter = useMemo(() => {
    return filteredMeasures.reduce((acc, measure) => {
      if (!acc[measure.chapter]) {
        acc[measure.chapter] = [];
      }
      acc[measure.chapter].push(measure);
      return acc;
    }, {} as Record<IsoChapter, typeof filteredMeasures>);
  }, [filteredMeasures]);

  const totalFilteredMeasures = filteredMeasures.length;

  const filterLabels: Record<string, string> = {
    type: 'Type de mesure',
    properties: 'Propriétés',
    concepts: 'Concepts de cybersécurité',
    capabilities: 'Capacités opérationnelles',
    domains: 'Domaines de sécurité'
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Référentiel ISO 27002:2022</h1>
        <button 
          onClick={() => setShowFilters(!showFilters)} 
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors shadow-sm"
          aria-expanded={showFilters}
        >
          <SlidersHorizontal size={18} />
          <span>Filtrer</span>
        </button>
      </div>
      <p className="text-slate-600">
        Explorez les 93 mesures de sécurité de l'information, organisées en 4 chapitres. Cliquez sur une mesure pour voir le détail.
      </p>

      {showFilters && (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Filtrer les mesures</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    {Object.keys(filterOptions).map((category) => (
                        <div key={category}>
                            <h4 className="font-semibold text-slate-700 mb-2">{filterLabels[category]}</h4>
                            <div className="space-y-1 max-h-48 overflow-y-auto pr-2">
                                {(filterOptions[category as keyof typeof filterOptions]).map(value => (
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

      <div className="text-sm text-slate-500 font-medium">
        {totalFilteredMeasures} sur {allMeasures.length} mesure(s) affichée(s).
      </div>

      {totalFilteredMeasures > 0 ? (
        Object.entries(measuresByChapter).map(([chapter, measures]) => (
            measures.length > 0 && (
                <div key={chapter}>
                    <h2 className={`text-xl font-semibold text-slate-700 mb-3 pl-3 border-l-4 ${CHAPTER_COLORS[chapter as IsoChapter]}`}>
                        {chapter}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {measures.map((measure) => (
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
                <p className="font-semibold">Aucune mesure ne correspond aux filtres sélectionnés.</p>
                <p className="text-sm mt-1">Essayez d'ajuster ou de réinitialiser vos filtres.</p>
            </CardContent>
        </Card>
      )}


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