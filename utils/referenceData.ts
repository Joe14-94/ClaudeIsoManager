
import { StrategicOrientation, Chantier, Objective, Initiative, Resource, SecurityProcess } from '../types';
import { orientations } from '../data/orientations';
import { chantiers } from '../data/chantiers';
import { objectives } from '../data/objectives';
import { initiatives } from '../data/initiatives';
import { resources } from '../data/resources';
import { securityProcesses } from '../data/securityProcesses';

export const loadReferenceData = async (): Promise<{
  orientations: StrategicOrientation[];
  chantiers: Chantier[];
  objectives: Objective[];
  initiatives: Initiative[];
  resources: Resource[];
  securityProcesses: SecurityProcess[];
}> => {
    // On retourne directement les données importées statiquement.
    // L'asynchronisme est conservé pour ne pas casser la signature attendue par les composants existants.
    // Utilisation de JSON.parse(JSON.stringify(...)) pour créer une copie profonde et éviter 
    // que les modifications de l'état n'affectent les données sources importées (car les modules JS mettent en cache les exports).
    return Promise.resolve({
        orientations: JSON.parse(JSON.stringify(orientations)),
        chantiers: JSON.parse(JSON.stringify(chantiers)),
        objectives: JSON.parse(JSON.stringify(objectives)),
        initiatives: JSON.parse(JSON.stringify(initiatives)),
        resources: JSON.parse(JSON.stringify(resources)),
        securityProcesses: JSON.parse(JSON.stringify(securityProcesses)),
    });
};
