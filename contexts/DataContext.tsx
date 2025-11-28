
import React, { createContext, useState, useContext, useEffect, ReactNode, PropsWithChildren } from 'react';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/storage';
import { activities as initialActivities } from '../data/activities';
import { resources as initialResources } from '../data/resources';
import { securityProcesses as initialSecurityProcesses } from '../data/securityProcesses';
import { initiatives as initialInitiatives } from '../data/initiatives';
import { projects as initialProjects } from '../data/projects';
import { majorRisks as initialMajorRisks } from '../data/majorRisks';
import { Activity, Chantier, Objective, StrategicOrientation, Resource, SecurityProcess, Initiative, Project, MajorRisk } from '../types';
import { loadReferenceData } from '../utils/referenceData';
import type { Layout } from 'react-grid-layout';

interface DataContextType {
    activities: Activity[];
    setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
    chantiers: Chantier[];
    setChantiers: React.Dispatch<React.SetStateAction<Chantier[]>>;
    objectives: Objective[];
    setObjectives: React.Dispatch<React.SetStateAction<Objective[]>>;
    orientations: StrategicOrientation[];
    setOrientations: React.Dispatch<React.SetStateAction<StrategicOrientation[]>>;
    initiatives: Initiative[];
    setInitiatives: React.Dispatch<React.SetStateAction<Initiative[]>>;
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    resources: Resource[];
    setResources: React.Dispatch<React.SetStateAction<Resource[]>>;
    securityProcesses: SecurityProcess[];
    setSecurityProcesses: React.Dispatch<React.SetStateAction<SecurityProcess[]>>;
    majorRisks: MajorRisk[];
    setMajorRisks: React.Dispatch<React.SetStateAction<MajorRisk[]>>;
    dashboardLayouts: { [breakpoint: string]: Layout[] };
    setDashboardLayouts: React.Dispatch<React.SetStateAction<{ [breakpoint: string]: Layout[] }>>;
    lastCsvImportDate: string | null;
    setLastCsvImportDate: React.Dispatch<React.SetStateAction<string | null>>;
    lastImportWeek: string | null;
    setLastImportWeek: React.Dispatch<React.SetStateAction<string | null>>;
    lastImportYear: string | null;
    setLastImportYear: React.Dispatch<React.SetStateAction<string | null>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const REFERENCE_DATA_VERSION = '2.4';
const VERSION_KEY = 'reference_data_version';

const initialLayouts = {
    lg: [
        { i: 'consolidatedWorkload', x: 0, y: 0, w: 12, h: 4, minW: 6, minH: 4 },
        { i: 'consolidatedBudget', x: 0, y: 4, w: 12, h: 4, minW: 6, minH: 4 },
        { i: 'projectSCurve', x: 0, y: 8, w: 6, h: 5, minW: 4, minH: 4 },
        { i: 'riskMatrix', x: 6, y: 8, w: 6, h: 6, minW: 6, minH: 4 },
    ]
};

export const DataProvider = ({ children }: PropsWithChildren) => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [securityProcesses, setSecurityProcesses] = useState<SecurityProcess[]>([]);
    const [orientations, setOrientations] = useState<StrategicOrientation[]>([]);
    const [chantiers, setChantiers] = useState<Chantier[]>([]);
    const [objectives, setObjectives] = useState<Objective[]>([]);
    const [initiatives, setInitiatives] = useState<Initiative[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [majorRisks, setMajorRisks] = useState<MajorRisk[]>([]);
    const [dashboardLayouts, setDashboardLayouts] = useState<{ [breakpoint: string]: Layout[] }>(() => loadFromLocalStorage('dashboardLayouts', initialLayouts));
    const [lastCsvImportDate, setLastCsvImportDate] = useState<string | null>(() => loadFromLocalStorage('lastCsvImportDate', null));
    const [lastImportWeek, setLastImportWeek] = useState<string | null>(() => loadFromLocalStorage('lastImportWeek', null));
    const [lastImportYear, setLastImportYear] = useState<string | null>(() => loadFromLocalStorage('lastImportYear', null));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeData = async () => {
            setActivities(loadFromLocalStorage('activities', initialActivities));
            setProjects(loadFromLocalStorage('projects', initialProjects));
            setMajorRisks(loadFromLocalStorage('majorRisks', initialMajorRisks));
            setDashboardLayouts(loadFromLocalStorage('dashboardLayouts', initialLayouts));
            setLastCsvImportDate(loadFromLocalStorage('lastCsvImportDate', null));
            setLastImportWeek(loadFromLocalStorage('lastImportWeek', null));
            setLastImportYear(loadFromLocalStorage('lastImportYear', null));

            const storedVersion = loadFromLocalStorage<string>(VERSION_KEY, '1.0');

            if (storedVersion !== REFERENCE_DATA_VERSION) {
                try {
                    const data = await loadReferenceData();
                    setOrientations(data.orientations);
                    setChantiers(data.chantiers);
                    setObjectives(data.objectives);
                    setInitiatives(data.initiatives);
                    setResources(data.resources);
                    setSecurityProcesses(data.securityProcesses);
                    
                    saveToLocalStorage('orientations', data.orientations);
                    saveToLocalStorage('chantiers', data.chantiers);
                    saveToLocalStorage('objectives', data.objectives);
                    saveToLocalStorage('initiatives', data.initiatives);
                    saveToLocalStorage('resources', data.resources);
                    saveToLocalStorage('securityProcesses', data.securityProcesses);
                    
                    saveToLocalStorage(VERSION_KEY, REFERENCE_DATA_VERSION);
                } catch (error) {
                    setOrientations(loadFromLocalStorage('orientations', []));
                    setChantiers(loadFromLocalStorage('chantiers', []));
                    setObjectives(loadFromLocalStorage('objectives', []));
                    setInitiatives(loadFromLocalStorage('initiatives', []));
                    setResources(loadFromLocalStorage('resources', []));
                    setSecurityProcesses(loadFromLocalStorage('securityProcesses', []));
                }
            } else {
                setOrientations(loadFromLocalStorage('orientations', []));
                setChantiers(loadFromLocalStorage('chantiers', []));
                setObjectives(loadFromLocalStorage('objectives', []));
                setInitiatives(loadFromLocalStorage('initiatives', initialInitiatives));
                setResources(loadFromLocalStorage('resources', initialResources));
                setSecurityProcesses(loadFromLocalStorage('securityProcesses', initialSecurityProcesses));
            }
            setIsLoading(false);
        };
        initializeData();
    }, []);

    useEffect(() => { if (!isLoading) saveToLocalStorage('activities', activities); }, [activities, isLoading]);
    useEffect(() => { if (!isLoading) saveToLocalStorage('resources', resources); }, [resources, isLoading]);
    useEffect(() => { if (!isLoading) saveToLocalStorage('securityProcesses', securityProcesses); }, [securityProcesses, isLoading]);
    useEffect(() => { if (!isLoading) saveToLocalStorage('initiatives', initiatives); }, [initiatives, isLoading]);
    useEffect(() => { if (!isLoading) saveToLocalStorage('projects', projects); }, [projects, isLoading]);
    useEffect(() => { if (!isLoading) saveToLocalStorage('majorRisks', majorRisks); }, [majorRisks, isLoading]);
    useEffect(() => { if (!isLoading) saveToLocalStorage('dashboardLayouts', dashboardLayouts); }, [dashboardLayouts, isLoading]);
    useEffect(() => { if (!isLoading) saveToLocalStorage('lastCsvImportDate', lastCsvImportDate); }, [lastCsvImportDate, isLoading]);
    useEffect(() => { if (!isLoading) saveToLocalStorage('lastImportWeek', lastImportWeek); }, [lastImportWeek, isLoading]);
    useEffect(() => { if (!isLoading) saveToLocalStorage('lastImportYear', lastImportYear); }, [lastImportYear, isLoading]);
    useEffect(() => { if (!isLoading) saveToLocalStorage('orientations', orientations); }, [orientations, isLoading]);
    useEffect(() => { if (!isLoading) saveToLocalStorage('chantiers', chantiers); }, [chantiers, isLoading]);
    useEffect(() => { if (!isLoading) saveToLocalStorage('objectives', objectives); }, [objectives, isLoading]);
    
    const value = {
        activities, setActivities,
        chantiers, setChantiers,
        objectives, setObjectives,
        orientations, setOrientations,
        initiatives, setInitiatives,
        projects, setProjects,
        resources, setResources,
        securityProcesses, setSecurityProcesses,
        majorRisks, setMajorRisks,
        dashboardLayouts, setDashboardLayouts,
        lastCsvImportDate, setLastCsvImportDate,
        lastImportWeek, setLastImportWeek,
        lastImportYear, setLastImportYear,
    };

    if (isLoading) return <div className="flex h-screen w-full items-center justify-center bg-slate-100"><p>Chargement...</p></div>;

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) throw new Error('useData must be used within a DataProvider');
    return context;
};
