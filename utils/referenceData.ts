import { StrategicOrientation, Chantier, Objective, IsoLink } from '../types';
import { ISO_MEASURES_DATA } from '../constants';

interface JsonEntry {
  axe: { numero: string; titre: string };
  objectif: { numero: string; description: string };
  chantier: { numero: string; description: string };
  orientation_strategique: { numero: string; description: string };
  mapping_iso_27002: {
    domaine: string;
    numero_mesure: string;
    synthese_mesure: string;
    titre?: string;
  };
}

export const loadReferenceData = async () => {
  const response = await fetch('/OrientationsEtISO.json');
  if (!response.ok) {
    throw new Error(`Failed to fetch reference data: ${response.statusText}`);
  }
  const rawData: { strategie_cybersecurite: JsonEntry[] } = await response.json();

  const orientationsMap = new Map<string, Omit<StrategicOrientation, 'color'>>();
  const chantiersMap = new Map<string, Chantier>();
  const objectivesMap = new Map<string, Objective>();

  // Create a map for quick lookup of ISO measure titles
  const isoMeasuresMap = new Map(ISO_MEASURES_DATA.map(m => [m.code, m.title]));

  rawData.strategie_cybersecurite.forEach(entry => {
    const orientationNumero = entry.orientation_strategique.numero;
    if (!orientationsMap.has(orientationNumero)) {
      orientationsMap.set(orientationNumero, {
        id: `so-${orientationNumero}`,
        code: orientationNumero,
        label: entry.orientation_strategique.description,
        description: '',
        createdAt: new Date().toISOString(),
      });
    }

    const chantierNumero = entry.chantier.numero;
    if (!chantiersMap.has(chantierNumero)) {
      chantiersMap.set(chantierNumero, {
        id: `ch-${chantierNumero}`,
        code: chantierNumero,
        label: entry.chantier.description,
        description: '',
        strategicOrientationId: `so-${orientationNumero}`,
        createdAt: new Date().toISOString(),
      });
    }

    const objectifNumero = entry.objectif.numero;
    if (!objectivesMap.has(objectifNumero)) {
      objectivesMap.set(objectifNumero, {
        id: `obj-${objectifNumero}`,
        code: objectifNumero,
        label: entry.objectif.description,
        description: '',
        strategicOrientations: [],
        mesures_iso: [],
        createdAt: new Date().toISOString(),
      });
    }
    
    const currentObjective = objectivesMap.get(objectifNumero)!;

    // Link objective to orientations
    const orientationId = `so-${orientationNumero}`;
    if (!currentObjective.strategicOrientations.includes(orientationId)) {
      currentObjective.strategicOrientations.push(orientationId);
    }

    // Add ISO link(s) to objective
    const isoCodes = entry.mapping_iso_27002.numero_mesure.split(',').map(code => code.trim()).filter(Boolean);

    isoCodes.forEach(code => {
        const isoLink: IsoLink = {
            domaine: entry.mapping_iso_27002.domaine,
            numero_mesure: code,
            titre: isoMeasuresMap.get(code) || "Titre non trouvé",
            description: entry.mapping_iso_27002.synthese_mesure,
            niveau_application: "",
        };
        
        if (!currentObjective.mesures_iso!.some(m => m.numero_mesure === isoLink.numero_mesure)) {
            currentObjective.mesures_iso!.push(isoLink);
        }
    });
  });

  const finalOrientations: StrategicOrientation[] = Array.from(orientationsMap.values()).map(o => ({
      ...o,
      color: '#3b82f6' // Default blue color, can be omitted if not used elsewhere
  }));

  return { 
    orientations: finalOrientations, 
    chantiers: Array.from(chantiersMap.values()), 
    objectives: Array.from(objectivesMap.values())
  };
};