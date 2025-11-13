
import { SecurityDomain, ActivityStatus, Priority, IsoChapter, IsoMeasure } from './types';
import { organizationalControls } from './data/iso/organizationalControls';
import { peopleControls } from './data/iso/peopleControls';
import { physicalControls } from './data/iso/physicalControls';
import { technologicalControls } from './data/iso/technologicalControls';

export const DOMAIN_COLORS: { [key in SecurityDomain]: string } = {
  [SecurityDomain.GOUVERNANCE]: 'bg-purple-200 text-purple-800 border-purple-300',
  [SecurityDomain.PROTECTION]: 'bg-blue-200 text-blue-800 border-blue-300',
  [SecurityDomain.DEFENSE]: 'bg-red-200 text-red-800 border-red-300',
  [SecurityDomain.RESILIENCE]: 'bg-green-200 text-green-800 border-green-300',
};

export const DOMAIN_BG_COLORS: { [key in SecurityDomain]: string } = {
  [SecurityDomain.GOUVERNANCE]: '#e9d5ff', // purple-200
  [SecurityDomain.PROTECTION]: '#bfdbfe', // blue-200
  [SecurityDomain.DEFENSE]: '#fecaca',   // red-200
  [SecurityDomain.RESILIENCE]: '#bbf7d0',  // green-200
};

export const STATUS_COLORS: { [key in ActivityStatus]: string } = {
  [ActivityStatus.NOT_STARTED]: 'bg-slate-200 text-slate-800',
  [ActivityStatus.IN_PROGRESS]: 'bg-sky-200 text-sky-800',
  [ActivityStatus.ON_HOLD]: 'bg-yellow-200 text-yellow-800',
  [ActivityStatus.COMPLETED]: 'bg-emerald-200 text-emerald-800',
  [ActivityStatus.CANCELLED]: 'bg-rose-200 text-rose-800',
};

export const STATUS_HEX_COLORS: { [key in ActivityStatus]: string } = {
  [ActivityStatus.NOT_STARTED]: '#e2e8f0', // slate-200
  [ActivityStatus.IN_PROGRESS]: '#bae6fd', // sky-200
  [ActivityStatus.ON_HOLD]: '#fef08a',    // yellow-200
  [ActivityStatus.COMPLETED]: '#a7f3d0',  // emerald-200
  [ActivityStatus.CANCELLED]: '#fecaca',   // rose-200
};


export const PRIORITY_COLORS: { [key in Priority]: string } = {
  [Priority.LOW]: 'bg-gray-200 text-gray-800',
  [Priority.MEDIUM]: 'bg-blue-200 text-blue-800',
  [Priority.HIGH]: 'bg-orange-200 text-orange-800',
  [Priority.CRITICAL]: 'bg-red-300 text-red-900',
};

export const CHAPTER_COLORS: { [key in IsoChapter]: string } = {
    [IsoChapter.ORGANIZATIONAL]: 'border-purple-500',
    [IsoChapter.PEOPLE]: 'border-blue-500',
    [IsoChapter.PHYSICAL]: 'border-green-500',
    [IsoChapter.TECHNOLOGICAL]: 'border-yellow-500',
}

export const ISO_MEASURES_DATA: Omit<IsoMeasure, 'id'>[] = [
  ...organizationalControls,
  ...peopleControls,
  ...physicalControls,
  ...technologicalControls,
];