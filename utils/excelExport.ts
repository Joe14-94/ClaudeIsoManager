import * as XLSX from 'xlsx';
import { Project, Activity, Objective, Chantier, Initiative, Resource } from '../types/models';

interface ExportColumn {
  key: string;
  header: string;
  width?: number;
}

/**
 * Exports projects data to Excel format
 */
export function exportProjectsToExcel(projects: Project[], filename: string = 'projets.xlsx') {
  const columns: ExportColumn[] = [
    { key: 'id', header: 'ID', width: 10 },
    { key: 'title', header: 'Titre', width: 40 },
    { key: 'status', header: 'Statut', width: 15 },
    { key: 'description', header: 'Description', width: 50 },
    { key: 'startDate', header: 'Date de début', width: 15 },
    { key: 'endDate', header: 'Date de fin', width: 15 },
    { key: 'budgetRequested', header: 'Budget demandé', width: 18 },
    { key: 'budgetApproved', header: 'Budget approuvé', width: 18 },
    { key: 'budgetCommitted', header: 'Budget engagé', width: 18 },
    { key: 'budgetPurchaseOrders', header: 'Bons de commande', width: 18 },
    { key: 'budgetPv', header: 'PV', width: 12 },
    { key: 'workloadInternalRequested', header: 'Charge interne demandée', width: 20 },
    { key: 'workloadInternalEngaged', header: 'Charge interne engagée', width: 20 },
    { key: 'workloadInternalConsumed', header: 'Charge interne consommée', width: 20 },
    { key: 'workloadExternalRequested', header: 'Charge externe demandée', width: 20 },
    { key: 'workloadExternalEngaged', header: 'Charge externe engagée', width: 20 },
    { key: 'workloadExternalConsumed', header: 'Charge externe consommée', width: 20 },
    { key: 'isoMeasures', header: 'Mesures ISO', width: 30 },
    { key: 'objectives', header: 'Objectifs', width: 30 },
    { key: 'manager', header: 'Responsable', width: 20 },
  ];

  const data = projects.map(project => ({
    id: project.id,
    title: project.title,
    status: project.status,
    description: project.description || '',
    startDate: project.projectStartDate || '',
    endDate: project.projectEndDate || '',
    budgetRequested: project.budgetRequested || 0,
    budgetApproved: project.budgetApproved || 0,
    budgetCommitted: project.budgetCommitted || 0,
    budgetPurchaseOrders: project.validatedPurchaseOrders || 0,
    budgetPv: project.completedPV || 0,
    workloadInternalRequested: project.internalWorkloadRequested || 0,
    workloadInternalEngaged: project.internalWorkloadEngaged || 0,
    workloadInternalConsumed: project.internalWorkloadConsumed || 0,
    workloadExternalRequested: project.externalWorkloadRequested || 0,
    workloadExternalEngaged: project.externalWorkloadEngaged || 0,
    workloadExternalConsumed: project.externalWorkloadConsumed || 0,
    isoMeasures: (project.isoMeasures || []).join(', '),
    objectives: '',
    manager: project.projectManagerMOA || '',
  }));

  createExcelFile(data, columns, filename, 'Projets');
}

/**
 * Exports activities data to Excel format
 */
export function exportActivitiesToExcel(activities: Activity[], filename: string = 'activites.xlsx') {
  const columns: ExportColumn[] = [
    { key: 'id', header: 'ID', width: 10 },
    { key: 'name', header: 'Nom', width: 40 },
    { key: 'status', header: 'Statut', width: 15 },
    { key: 'priority', header: 'Priorité', width: 12 },
    { key: 'securityDomain', header: 'Domaine sécurité', width: 20 },
    { key: 'isoChapter', header: 'Chapitre ISO', width: 20 },
    { key: 'startDate', header: 'Date de début', width: 15 },
    { key: 'endDate', header: 'Date de fin', width: 15 },
    { key: 'responsable', header: 'Responsable', width: 20 },
    { key: 'description', header: 'Description', width: 50 },
    { key: 'isoMeasures', header: 'Mesures ISO', width: 30 },
  ];

  const data = activities.map(activity => ({
    id: activity.id,
    name: activity.title,
    status: activity.status,
    priority: activity.priority,
    securityDomain: activity.securityDomain || '',
    isoChapter: '',
    startDate: activity.startDate || '',
    endDate: activity.endDatePlanned || '',
    responsable: activity.owner || '',
    description: activity.description || '',
    isoMeasures: (activity.isoMeasures || []).join(', '),
  }));

  createExcelFile(data, columns, filename, 'Activités');
}

/**
 * Exports objectives data to Excel format
 */
export function exportObjectivesToExcel(objectives: Objective[], filename: string = 'objectifs.xlsx') {
  const columns: ExportColumn[] = [
    { key: 'id', header: 'ID', width: 10 },
    { key: 'name', header: 'Nom', width: 40 },
    { key: 'description', header: 'Description', width: 50 },
    { key: 'complexity', header: 'Complexité', width: 15 },
    { key: 'priority', header: 'Priorité', width: 12 },
    { key: 'category', header: 'Catégorie', width: 20 },
    { key: 'stakeholders', header: 'Parties prenantes', width: 30 },
  ];

  const data = objectives.map(objective => ({
    id: objective.id,
    name: objective.label,
    description: objective.description || '',
    complexity: objective.complexite || '',
    priority: objective.priorite || '',
    category: '',
    stakeholders: (objective.parties_prenantes || []).join(', '),
  }));

  createExcelFile(data, columns, filename, 'Objectifs');
}

/**
 * Exports chantiers data to Excel format
 */
export function exportChantiersToExcel(chantiers: Chantier[], filename: string = 'chantiers.xlsx') {
  const columns: ExportColumn[] = [
    { key: 'id', header: 'ID', width: 10 },
    { key: 'name', header: 'Nom', width: 40 },
    { key: 'description', header: 'Description', width: 50 },
    { key: 'objectives', header: 'Objectifs', width: 40 },
    { key: 'dependencies', header: 'Dépendances', width: 30 },
  ];

  const data = chantiers.map(chantier => ({
    id: chantier.id,
    name: chantier.label,
    description: chantier.description || '',
    objectives: '',
    dependencies: '',
  }));

  createExcelFile(data, columns, filename, 'Chantiers');
}

/**
 * Exports initiatives data to Excel format
 */
export function exportInitiativesToExcel(initiatives: Initiative[], filename: string = 'initiatives.xlsx') {
  const columns: ExportColumn[] = [
    { key: 'id', header: 'ID', width: 10 },
    { key: 'name', header: 'Nom', width: 40 },
    { key: 'description', header: 'Description', width: 50 },
    { key: 'isoMeasures', header: 'Mesures ISO', width: 30 },
    { key: 'status', header: 'Statut', width: 15 },
  ];

  const data = initiatives.map(initiative => ({
    id: initiative.id,
    name: initiative.label,
    description: initiative.description || '',
    isoMeasures: (initiative.isoMeasureIds || []).join(', '),
    status: '',
  }));

  createExcelFile(data, columns, filename, 'Initiatives');
}

/**
 * Exports resources data to Excel format
 */
export function exportResourcesToExcel(resources: Resource[], filename: string = 'ressources.xlsx') {
  const columns: ExportColumn[] = [
    { key: 'id', header: 'ID', width: 10 },
    { key: 'name', header: 'Nom', width: 30 },
    { key: 'type', header: 'Type', width: 15 },
    { key: 'capacity', header: 'Capacité', width: 12 },
    { key: 'unit', header: 'Unité', width: 12 },
  ];

  const data = resources.map(resource => ({
    id: resource.id,
    name: resource.name,
    type: resource.entity || '',
    capacity: 0,
    unit: '',
  }));

  createExcelFile(data, columns, filename, 'Ressources');
}

/**
 * Core function to create Excel file with styling
 */
function createExcelFile(
  data: any[],
  columns: ExportColumn[],
  filename: string,
  sheetName: string
) {
  const workbook = XLSX.utils.book_new();

  // Create header row
  const headers = columns.map(col => col.header);

  // Create data rows
  const rows = data.map(row =>
    columns.map(col => row[col.key] !== undefined ? row[col.key] : '')
  );

  // Combine headers and data
  const wsData = [headers, ...rows];

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  worksheet['!cols'] = columns.map(col => ({ wch: col.width || 15 }));

  // Style header row (bold)
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddress]) continue;

    worksheet[cellAddress].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: 'E2E8F0' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    };
  }

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, filename);
}

/**
 * Export all data to a multi-sheet Excel file
 */
export function exportAllDataToExcel(
  projects: Project[],
  activities: Activity[],
  objectives: Objective[],
  chantiers: Chantier[],
  initiatives: Initiative[],
  resources: Resource[],
  filename: string = `iso-manager-export-${new Date().toISOString().split('T')[0]}.xlsx`
) {
  const workbook = XLSX.utils.book_new();

  // Projects sheet
  const projectsData = projects.map(p => ({
    'ID': p.id,
    'Titre': p.title,
    'Statut': p.status,
    'Description': p.description || '',
    'Date début': p.projectStartDate || '',
    'Date fin': p.projectEndDate || '',
    'Budget demandé': p.budgetRequested || 0,
    'Budget approuvé': p.budgetApproved || 0,
    'Budget engagé': p.budgetCommitted || 0,
    'Bons de commande': p.validatedPurchaseOrders || 0,
    'PV': p.completedPV || 0,
    'Charge int. demandée': p.internalWorkloadRequested || 0,
    'Charge int. engagée': p.internalWorkloadEngaged || 0,
    'Charge int. consommée': p.internalWorkloadConsumed || 0,
    'Charge ext. demandée': p.externalWorkloadRequested || 0,
    'Charge ext. engagée': p.externalWorkloadEngaged || 0,
    'Charge ext. consommée': p.externalWorkloadConsumed || 0,
    'Mesures ISO': (p.isoMeasures || []).join(', '),
    'Objectifs': '',
    'Responsable': p.projectManagerMOA || '',
  }));
  const wsProjects = XLSX.utils.json_to_sheet(projectsData);
  XLSX.utils.book_append_sheet(workbook, wsProjects, 'Projets');

  // Activities sheet
  const activitiesData = activities.map(a => ({
    'ID': a.id,
    'Nom': a.title,
    'Statut': a.status,
    'Priorité': a.priority,
    'Domaine sécurité': a.securityDomain || '',
    'Chapitre ISO': '',
    'Date début': a.startDate || '',
    'Date fin': a.endDatePlanned || '',
    'Responsable': a.owner || '',
    'Description': a.description || '',
    'Mesures ISO': (a.isoMeasures || []).join(', '),
  }));
  const wsActivities = XLSX.utils.json_to_sheet(activitiesData);
  XLSX.utils.book_append_sheet(workbook, wsActivities, 'Activités');

  // Objectives sheet
  const objectivesData = objectives.map(o => ({
    'ID': o.id,
    'Nom': o.label,
    'Description': o.description || '',
    'Complexité': o.complexite || '',
    'Priorité': o.priorite || '',
    'Catégorie': '',
    'Parties prenantes': (o.parties_prenantes || []).join(', '),
  }));
  const wsObjectives = XLSX.utils.json_to_sheet(objectivesData);
  XLSX.utils.book_append_sheet(workbook, wsObjectives, 'Objectifs');

  // Chantiers sheet
  const chantiersData = chantiers.map(c => ({
    'ID': c.id,
    'Nom': c.label,
    'Description': c.description || '',
    'Objectifs': '',
    'Dépendances': '',
  }));
  const wsChantiers = XLSX.utils.json_to_sheet(chantiersData);
  XLSX.utils.book_append_sheet(workbook, wsChantiers, 'Chantiers');

  // Initiatives sheet
  const initiativesData = initiatives.map(i => ({
    'ID': i.id,
    'Nom': i.label,
    'Description': i.description || '',
    'Mesures ISO': (i.isoMeasureIds || []).join(', '),
    'Statut': '',
  }));
  const wsInitiatives = XLSX.utils.json_to_sheet(initiativesData);
  XLSX.utils.book_append_sheet(workbook, wsInitiatives, 'Initiatives');

  // Resources sheet
  const resourcesData = resources.map(r => ({
    'ID': r.id,
    'Nom': r.name,
    'Type': r.entity || '',
    'Capacité': 0,
    'Unité': '',
  }));
  const wsResources = XLSX.utils.json_to_sheet(resourcesData);
  XLSX.utils.book_append_sheet(workbook, wsResources, 'Ressources');

  // Generate and download
  XLSX.writeFile(workbook, filename);
}
