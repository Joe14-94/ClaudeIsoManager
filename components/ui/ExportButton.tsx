import React from 'react';
import { Download } from 'lucide-react';
import { exportToCSV, CsvColumn, CsvExportOptions } from '../../utils/csvExport';

interface ExportButtonProps<T> {
  data: T[];
  columns: CsvColumn<T>[];
  filename?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  options?: CsvExportOptions;
}

/**
 * Bouton d'export CSV réutilisable
 */
export function ExportButton<T>({
  data,
  columns,
  filename,
  label = 'Exporter CSV',
  className = '',
  disabled = false,
  options = {}
}: ExportButtonProps<T>) {
  const handleExport = () => {
    if (data.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }

    const exportOptions: CsvExportOptions = {
      filename: filename || `export-${Date.now()}.csv`,
      includeTimestamp: true,
      ...options
    };

    exportToCSV(data, columns, exportOptions);
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled || data.length === 0}
      className={`
        inline-flex items-center gap-2 px-4 py-2
        bg-emerald-600 text-white rounded-lg
        hover:bg-emerald-700
        disabled:bg-gray-300 disabled:cursor-not-allowed
        transition-colors
        ${className}
      `}
      title={data.length === 0 ? 'Aucune donnée à exporter' : 'Télécharger au format CSV'}
    >
      <Download size={16} />
      {label}
      {data.length > 0 && (
        <span className="text-xs opacity-75">({data.length})</span>
      )}
    </button>
  );
}

export default ExportButton;
