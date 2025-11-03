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

export const DataProvider = ({ children }: { children?: ReactNode }) => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [securityProcesses, setSecurityProcesses] = useState<SecurityProcess[]>([]);
    const [orientations, setOrientations] = useState<StrategicOrientation[]>([]);
    const [chantiers, setChantiers] = useState<Chantier[]>([]);
    const [objectives, setObjectives] = useState<Objective[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeData = async () => {
            // Load user-editable data from localStorage, with initial seed as fallback
            setActivities(loadFromLocalStorage('activities', initialActivities));
            setResources(loadFromLocalStorage('resources', initialResources));
            setSecurityProcesses(loadFromLocalStorage('securityProcesses', initialSecurityProcesses));

            // Load reference data from localStorage. If not present or empty, fetch from JSON.
            const storedOrientations = loadFromLocalStorage('orientations', []);
            if (storedOrientations && storedOrientations.length > 0) {
                setOrientations(storedOrientations);
                setChantiers(loadFromLocalStorage('chantiers', []));
                setObjectives(loadFromLocalStorage('objectives', []));
            } else {
                try {
                    const data = await loadReferenceData();
                    setOrientations(data.orientations);
                    setChantiers(data.chantiers);
                    setObjectives(data.objectives);
                    saveToLocalStorage('orientations', data.orientations);
                    saveToLocalStorage('chantiers', data.chantiers);
                    saveToLocalStorage('objectives', data.objectives);
                } catch (error) {
                    console.error("Failed to load reference data:", error);
                }
            }
            setIsLoading(false);
        };
        initializeData();
    }, []);

    // Persist all data to localStorage on change
    useEffect(() => { if (!isLoading) saveToLocalStorage('activities', activities); }, [activities, isLoading]);
    useEffect(() => { if (!isLoading) saveToLocalStorage('resources', resources); }, [resources, isLoading]);
    useEffect(() => { if (!isLoading) saveToLocalStorage('securityProcesses', securityProcesses); }, [securityProcesses, isLoading]);
    useEffect(() => { if (!isLoading) saveToLocalStorage('orientations', orientations); }, [orientations, isLoading]);
    useEffect(() => { if (!isLoading) saveToLocalStorage('chantiers', chantiers); }, [chantiers, isLoading]);
    useEffect(() => { if (!isLoading) saveToLocalStorage('objectives', objectives); }, [objectives, isLoading]);
    
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