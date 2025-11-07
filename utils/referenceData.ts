import { StrategicOrientation, Chantier, Objective } from '../types';

export const loadReferenceData = async (): Promise<{
  orientations: StrategicOrientation[];
  chantiers: Chantier[];
  objectives: Objective[];
}> => {
  try {
    const [orientationsRes, chantiersRes, objectivesRes] = await Promise.all([
      fetch('./data/orientations.json'),
      fetch('./data/chantiers.json'),
      fetch('./data/objectives.json')
    ]);

    if (!orientationsRes.ok || !chantiersRes.ok || !objectivesRes.ok) {
        let errorMsg = 'Failed to fetch reference data files. Statuses: ';
        if(!orientationsRes.ok) errorMsg += `orientations: ${orientationsRes.status}, `;
        if(!chantiersRes.ok) errorMsg += `chantiers: ${chantiersRes.status}, `;
        if(!objectivesRes.ok) errorMsg += `objectives: ${objectivesRes.status}`;
        throw new Error(errorMsg);
    }

    const orientations = await orientationsRes.json();
    const chantiers = await chantiersRes.json();
    const objectives = await objectivesRes.json();

    return {
      orientations,
      chantiers,
      objectives
    };
  } catch (error) {
    console.error("Error loading reference data via fetch:", error);
    // En cas d'échec (ex: fichier introuvable, JSON invalide), retourner des tableaux vides.
    return {
      orientations: [],
      chantiers: [],
      objectives: [],
    };
  }
};
