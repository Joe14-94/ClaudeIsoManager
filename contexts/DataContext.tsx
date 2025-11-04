import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/storage';
import { activities as initialActivities } from '../data/activities';
import { resources as initialResources } from '../data/resources';
import { securityProcesses as initialSecurityProcesses } from '../data/securityProcesses';
import { Activity, Chantier, Objective, StrategicOrientation, Resource, SecurityProcess } from '../types';
import { loadReferenceData } from '../utils/referenceData';

interface DataContextType {
    activities: Activity[];
    setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
    chantiers: Chantier[];
    setChantiers: React.Dispatch<React.SetStateAction<Chantier[]>>;
    objectives: Objective[];
    setObjectives: React.Dispatch<React.SetStateAction<Objective[]>>;
    orientations: StrategicOrientation[];
    setOrientations: React.Dispatch<React.SetStateAction<StrategicOrientation[]>>;
    resources: Resource[];
    setResources: React.Dispatch<React.SetStateAction<Resource[]>>;
    securityProcesses: SecurityProcess[];
    setSecurityProcesses: React.Dispatch<React.SetStateAction<SecurityProcess[]>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Version pour les données de référence. Incrémenter cette version forcera le rechargement du JSON.
const REFERENCE_DATA_VERSION = '1.1';
const VERSION_KEY = 'reference_data_version';


export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [securityProcesses, setSecurityProcesses] = useState<SecurityProcess[]>([]);
    const [orientations, setOrientations] = useState<StrategicOrientation[]>([]);
    const [chantiers, setChantiers] = useState<Chantier[]>([]);
    const [objectives, setObjectives] = useState<Objective[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeData = async () => {
            // Charger les données modifiables par l'utilisateur depuis le localStorage
            setActivities(loadFromLocalStorage('activities', initialActivities));
            setResources(loadFromLocalStorage('resources', initialResources));
            setSecurityProcesses(loadFromLocalStorage('securityProcesses', initialSecurityProcesses));

            // Gérer les données de référence avec versionnement
            // FIX: Explicitly set the generic type to string to prevent TypeScript from inferring a narrow literal type ('1.0'), which causes a type comparison error on the next line.
            const storedVersion = loadFromLocalStorage<string>(VERSION_KEY, '1.0');

            if (storedVersion !== REFERENCE_DATA_VERSION) {
                // Version différente : le cache est invalide. On force le rechargement.
                try {
                    console.log(`Mise à jour des données de référence de la version ${storedVersion} à ${REFERENCE_DATA_VERSION}...`);
                    const data = await loadReferenceData();
                    setOrientations(data.orientations);
                    setChantiers(data.chantiers);
                    setObjectives(data.objectives);
                    
                    // Sauvegarder les nouvelles données et la nouvelle version
                    saveToLocalStorage('orientations', data.orientations);
                    saveToLocalStorage('chantiers', data.chantiers);
                    saveToLocalStorage('objectives', data.objectives);
                    saveToLocalStorage(VERSION_KEY, REFERENCE_DATA_VERSION);
                } catch (error) {
                    console.error("Échec du chargement des nouvelles données de référence:", error);
                    // En cas d'erreur (ex: hors ligne), on charge quand même les anciennes données si elles existent
                    setOrientations(loadFromLocalStorage('orientations', []));
                    setChantiers(loadFromLocalStorage('chantiers', []));
                    setObjectives(loadFromLocalStorage('objectives', []));
                }
            } else {
                // La version est correcte, on charge depuis le localStorage.
                setOrientations(loadFromLocalStorage('orientations', []));
                setChantiers(loadFromLocalStorage('chantiers', []));
                setObjectives(loadFromLocalStorage('objectives', []));
            }

            setIsLoading(false);
        };
        initializeData();
    }, []);

    // Persist all data to localStorage on change
    useEffect(() => { if (!isLoading) saveToLocalStorage('activities', activities); }, [activities, isLoading]);
    useEffect(() => { if (!isLoading) saveToLocalStorage('resources', resources); }, [resources, isLoading]);
    useEffect(() => { if (!isLoading) saveToLocalStorage('securityProcesses', securityProcesses); }, [securityProcesses, isLoading]);
    
    // Les données de référence ne sont sauvegardées qu'au chargement initial pour éviter
    // que l'utilisateur ne puisse les modifier accidentellement.
    // useEffect(() => { if (!isLoading) saveToLocalStorage('orientations', orientations); }, [orientations, isLoading]);
    // useEffect(() => { if (!isLoading) saveToLocalStorage('chantiers', chantiers); }, [chantiers, isLoading]);
    // useEffect(() => { if (!isLoading) saveToLocalStorage('objectives', objectives); }, [objectives, isLoading]);
    
    const value = {
        activities, setActivities,
        chantiers, setChantiers,
        objectives, setObjectives,
        orientations, setOrientations,
        resources, setResources,
        securityProcesses, setSecurityProcesses,
    };

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-100">
                <div className="text-center">
                    <p className="text-lg font-semibold text-slate-700">Chargement des données...</p>
                    <p className="text-sm text-slate-500">Veuillez patienter.</p>
                </div>
            </div>
        );
    }

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};