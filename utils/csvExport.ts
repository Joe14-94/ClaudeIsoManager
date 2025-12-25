/**
 * CSV Export Utility
 * Fournit des fonctions d'export CSV avancées pour tous les tableaux de l'application
 */

export interface CsvColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => any);
  formatter?: (value: any) => string;
}

export interface CsvExportOptions {
  filename?: string;
  delimiter?: string;
  includeTimestamp?: boolean;
  encoding?: string;
}

/**
 * Échappe les caractères spéciaux CSV
 */
function escapeCsvValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // Si la valeur contient des virgules, guillemets ou sauts de ligne, on l'entoure de guillemets
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    // Doubler les guillemets internes
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Convertit des données en format CSV
 */
export function convertToCSV<T>(
  data: T[],
  columns: CsvColumn<T>[],
  options: CsvExportOptions = {}
): string {
  const { delimiter = ',', includeTimestamp = false } = options;

  if (!data || data.length === 0) {
    return '';
  }

  // En-têtes
  const headers = columns.map(col => escapeCsvValue(col.header)).join(delimiter);

  // Lignes de données
  const rows = data.map(item => {
    return columns.map(col => {
      let value: any;

      if (typeof col.accessor === 'function') {
        value = col.accessor(item);
      } else {
        value = item[col.accessor];
      }

      // Appliquer le formateur si fourni
      if (col.formatter) {
        value = col.formatter(value);
      }

      return escapeCsvValue(value);
    }).join(delimiter);
  });

  let csv = [headers, ...rows].join('\n');

  // Ajouter timestamp si demandé
  if (includeTimestamp) {
    const timestamp = `# Export généré le ${new Date().toLocaleString('fr-FR')}\n`;
    csv = timestamp + csv;
  }

  return csv;
}

/**
 * Télécharge un fichier CSV
 */
export function downloadCSV(
  csvContent: string,
  filename: string = 'export.csv',
  encoding: string = 'utf-8'
): void {
  // Ajouter BOM pour UTF-8 (améliore la compatibilité Excel)
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: `text/csv;charset=${encoding}` });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Nettoyer l'URL object
  URL.revokeObjectURL(link.href);
}

/**
 * Exporte des données en CSV et télécharge le fichier
 */
export function exportToCSV<T>(
  data: T[],
  columns: CsvColumn<T>[],
  options: CsvExportOptions = {}
): void {
  const {
    filename = `export-${Date.now()}.csv`,
    delimiter = ',',
    includeTimestamp = true,
    encoding = 'utf-8'
  } = options;

  const csvContent = convertToCSV(data, columns, { delimiter, includeTimestamp });
  downloadCSV(csvContent, filename, encoding);
}

/**
 * Formateurs de dates courants
 */
export const dateFormatters = {
  iso: (date: string | Date | undefined) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  },

  french: (date: string | Date | undefined) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR');
  },

  frenchWithTime: (date: string | Date | undefined) => {
    if (!date) return '';
    return new Date(date).toLocaleString('fr-FR');
  }
};

/**
 * Formateurs de nombres courants
 */
export const numberFormatters = {
  decimal: (value: number | undefined, decimals: number = 2) => {
    if (value === undefined || value === null) return '';
    return value.toFixed(decimals);
  },

  currency: (value: number | undefined, currency: string = '€') => {
    if (value === undefined || value === null) return '';
    return `${value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  },

  percentage: (value: number | undefined) => {
    if (value === undefined || value === null) return '';
    return `${value.toFixed(1)}%`;
  }
};

/**
 * Formateur pour tableaux
 */
export const arrayFormatter = (arr: any[] | undefined, separator: string = ', ') => {
  if (!arr || arr.length === 0) return '';
  return arr.join(separator);
};
