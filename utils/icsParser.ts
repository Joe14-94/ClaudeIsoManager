
export interface CalendarEvent {
  uid: string;
  summary: string;
  description: string;
  startDate: Date;
  endDate: Date;
  durationHours: number;
  organizer: string;
  location: string;
  status: 'CONFIRMED' | 'TENTATIVE' | 'CANCELLED';
  hash: string; // Pour détecter les modifications
}

export interface ImportHistoryItem {
  uid: string;
  hash: string;
  importedOn: string;
  targetId: string; // ID du projet ou de l'activité
  targetName: string;
}

// Génère une empreinte unique du contenu de l'événement pour détecter les changements
const generateEventHash = (event: Partial<CalendarEvent>): string => {
  const content = `${event.summary}|${event.startDate?.toISOString()}|${event.endDate?.toISOString()}|${event.durationHours}`;
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
};

const parseICSDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  
  // Nettoyage (enlève TZID=...:)
  const cleanDateStr = dateStr.split(':').pop() || '';
  
  const year = parseInt(cleanDateStr.substring(0, 4));
  const month = parseInt(cleanDateStr.substring(4, 6)) - 1;
  const day = parseInt(cleanDateStr.substring(6, 8));
  const hour = parseInt(cleanDateStr.substring(9, 11)) || 0;
  const minute = parseInt(cleanDateStr.substring(11, 13)) || 0;
  const second = parseInt(cleanDateStr.substring(13, 15)) || 0;

  const date = new Date(Date.UTC(year, month, day, hour, minute, second));
  
  // Si pas de Z à la fin, c'est souvent du local, mais pour simplifier on traite tout en UTC
  // ou on laisse le navigateur gérer le décalage si nécessaire.
  return date;
};

export const parseICSFile = async (file: File): Promise<CalendarEvent[]> => {
  const text = await file.text();
  const lines = text.split(/\r\n|\n|\r/);
  const events: CalendarEvent[] = [];
  
  let currentEvent: any = null;
  let inEvent = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Gestion des lignes pliées (folding)
    while (i + 1 < lines.length && lines[i + 1].startsWith(' ')) {
      line += lines[i + 1].substring(1);
      i++;
    }

    if (line.startsWith('BEGIN:VEVENT')) {
      inEvent = true;
      currentEvent = {};
    } else if (line.startsWith('END:VEVENT')) {
      inEvent = false;
      if (currentEvent && currentEvent.DTSTART && currentEvent.DTEND) {
        const start = parseICSDate(currentEvent.DTSTART);
        const end = parseICSDate(currentEvent.DTEND);
        const durationMs = end.getTime() - start.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);

        // Ignorer les événements < 15 min ou > 24h (erreurs ou rappels)
        if (durationHours >= 0.25 && durationHours < 24) {
            const eventObj: CalendarEvent = {
                uid: currentEvent.UID || `generated-${Math.random()}`,
                summary: currentEvent.SUMMARY || 'Sans titre',
                description: currentEvent.DESCRIPTION || '',
                startDate: start,
                endDate: end,
                durationHours: parseFloat(durationHours.toFixed(2)),
                organizer: currentEvent.ORGANIZER || '',
                location: currentEvent.LOCATION || '',
                status: currentEvent.STATUS === 'CANCELLED' ? 'CANCELLED' : 'CONFIRMED',
                hash: ''
            };
            eventObj.hash = generateEventHash(eventObj);
            events.push(eventObj);
        }
      }
      currentEvent = null;
    } else if (inEvent) {
      const [key, ...values] = line.split(':');
      const value = values.join(':'); // Re-join in case value contained colons (e.g. http://)
      
      // Nettoyage des clés avec paramètres (ex: DTSTART;TZID=Europe/Paris)
      const cleanKey = key.split(';')[0];
      
      if (['UID', 'SUMMARY', 'DESCRIPTION', 'LOCATION', 'STATUS'].includes(cleanKey)) {
        // Décodage basique des caractères échappés
        currentEvent[cleanKey] = value.replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\n/g, '\n').replace(/\\N/g, '\n');
      } else if (['DTSTART', 'DTEND', 'ORGANIZER'].includes(cleanKey)) {
        currentEvent[cleanKey] = line; // On garde la ligne entière pour le parsing de date ou nettoyer plus tard
      }
    }
  }

  return events.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
};
