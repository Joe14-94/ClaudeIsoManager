
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
    return Promise.resolve({
        orientations: JSON.parse(JSON.stringify(orientations)),
        chantiers: JSON.parse(JSON.stringify(chantiers)),
        objectives: JSON.parse(JSON.stringify(objectives)),
        initiatives: JSON.parse(JSON.stringify(initiatives)),
        resources: JSON.parse(JSON.stringify(resources)),
        securityProcesses: JSON.parse(JSON.stringify(securityProcesses)),
    });
};
