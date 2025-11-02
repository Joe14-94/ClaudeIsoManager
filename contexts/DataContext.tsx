import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/storage';
import { activities as initialActivities } from '../data/activities';
import { chantiers as initialChantiers } from '../data/chantiers';
import { objectives as initialObjectives } from '../data/objectives';
import { orientations as initialOrientations } from '../data/orientations';
import { resources as initialResources } from '../data/resources';
import { Activity, Chantier, Objective, StrategicOrientation, Resource } from '../types';

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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [activities, setActivities] = useState(() => loadFromLocalStorage('activities', initialActivities));
    const [chantiers, setChantiers] = useState(() => loadFromLocalStorage('chantiers', initialChantiers));
    const [objectives, setObjectives] = useState(() => loadFromLocalStorage('objectives', initialObjectives));
    const [orientations, setOrientations] = useState(() => loadFromLocalStorage('orientations', initialOrientations));
    const [resources, setResources] = useState(() => loadFromLocalStorage('resources', initialResources));

    useEffect(() => { saveToLocalStorage('activities', activities); }, [activities]);
    useEffect(() => { saveToLocalStorage('chantiers', chantiers); }, [chantiers]);
    useEffect(() => { saveToLocalStorage('objectives', objectives); }, [objectives]);
    useEffect(() => { saveToLocalStorage('orientations', orientations); }, [orientations]);
    useEffect(() => { saveToLocalStorage('resources', resources); }, [resources]);

    const value = {
        activities, setActivities,
        chantiers, setChantiers,
        objectives, setObjectives,
        orientations, setOrientations,
        resources, setResources,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
