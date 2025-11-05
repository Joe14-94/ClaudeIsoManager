import { StrategicOrientation, Chantier, Objective } from '../types';

export const loadReferenceData = async (): Promise<{
  orientations: StrategicOrientation[];
  chantiers: Chantier[];
  objectives: Objective[];
}> => {
  try {
    const [orientationsRes, chantiersRes, objectivesRes] = await Promise.all([
      fetch('/data/orientations.json'),
      fetch('/data/chantiers.json'),
      fetch('/data/objectives.json')
    ]);

    if (!orientationsRes.ok || !chantiersRes.ok || !objectivesRes.ok) {
      throw new Error('Failed to fetch one or more reference data files.');
    }

    const orientations = await orientationsRes.json();
    const chantiers = await chantiersRes.json();
    const objectives = await objectivesRes.json();

    return { orientations, chantiers, objectives };
  } catch (error) {
    console.error("Error loading reference data:", error);
    // Retourner des tableaux vides en cas d'erreur pour éviter de bloquer l'application
    return {
      orientations: [],
      chantiers: [],
      objectives: [],
    };
  }
};
