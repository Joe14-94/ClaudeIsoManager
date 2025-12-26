import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Project, Activity, Objective, Chantier, Initiative, Resource } from '../types/models';

/**
 * Exports projects data to PDF format
 */
export function exportProjectsToPDF(projects: Project[], filename: string = 'projets.pdf') {
  const doc = new jsPDF({ orientation: 'landscape' });

  // Add title
  doc.setFontSize(18);
  doc.text('Rapport des Projets', 14, 20);

  // Add export date
  doc.setFontSize(10);
  doc.text(`Date d'export: ${new Date().toLocaleDateString('fr-FR')}`, 14, 28);

  // Define table columns
  const columns = [
    { header: 'ID', dataKey: 'id' },
    { header: 'Titre', dataKey: 'title' },
    { header: 'Statut', dataKey: 'status' },
    { header: 'Début', dataKey: 'startDate' },
    { header: 'Fin', dataKey: 'endDate' },
    { header: 'Budget demandé', dataKey: 'budgetRequested' },
    { header: 'Budget approuvé', dataKey: 'budgetApproved' },
    { header: 'Charge int.', dataKey: 'workloadInternal' },
    { header: 'Charge ext.', dataKey: 'workloadExternal' },
    { header: 'Responsable', dataKey: 'manager' },
  ];

  // Prepare data
  const data = projects.map(project => ({
    id: project.id,
    title: project.title,
    status: project.status,
    startDate: project.projectStartDate || '-',
    endDate: project.projectEndDate || '-',
    budgetRequested: formatNumber(project.budgetRequested),
    budgetApproved: formatNumber(project.budgetApproved),
    workloadInternal: formatNumber(project.internalWorkloadRequested),
    workloadExternal: formatNumber(project.externalWorkloadRequested),
    manager: project.projectManagerMOA || '-',
  }));

  // Generate table
  autoTable(doc, {
    head: [columns.map(col => col.header)],
    body: data.map(row => columns.map(col => row[col.dataKey as keyof typeof row])),
    startY: 35,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202], fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    styles: { cellPadding: 2 },
    margin: { top: 35 },
  });

  // Add footer
  addFooter(doc, projects.length);

  // Save PDF
  doc.save(filename);
}

/**
 * Exports activities data to PDF format
 */
export function exportActivitiesToPDF(activities: Activity[], filename: string = 'activites.pdf') {
  const doc = new jsPDF({ orientation: 'landscape' });

  // Add title
  doc.setFontSize(18);
  doc.text('Rapport des Activités', 14, 20);

  // Add export date
  doc.setFontSize(10);
  doc.text(`Date d'export: ${new Date().toLocaleDateString('fr-FR')}`, 14, 28);

  // Define table columns
  const columns = [
    { header: 'ID', dataKey: 'id' },
    { header: 'Nom', dataKey: 'name' },
    { header: 'Statut', dataKey: 'status' },
    { header: 'Priorité', dataKey: 'priority' },
    { header: 'Domaine', dataKey: 'securityDomain' },
    { header: 'Chapitre ISO', dataKey: 'isoChapter' },
    { header: 'Début', dataKey: 'startDate' },
    { header: 'Fin', dataKey: 'endDate' },
    { header: 'Responsable', dataKey: 'responsable' },
  ];

  // Prepare data
  const data = activities.map(activity => ({
    id: activity.id,
    name: activity.title,
    status: activity.status,
    priority: activity.priority,
    securityDomain: activity.securityDomain || '-',
    isoChapter: '-',
    startDate: activity.startDate || '-',
    endDate: activity.endDatePlanned || '-',
    responsable: activity.owner || '-',
  }));

  // Generate table
  autoTable(doc, {
    head: [columns.map(col => col.header)],
    body: data.map(row => columns.map(col => row[col.dataKey as keyof typeof row])),
    startY: 35,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202], fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    styles: { cellPadding: 2 },
    margin: { top: 35 },
  });

  // Add footer
  addFooter(doc, activities.length);

  // Save PDF
  doc.save(filename);
}

/**
 * Exports objectives data to PDF format
 */
export function exportObjectivesToPDF(objectives: Objective[], filename: string = 'objectifs.pdf') {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text('Rapport des Objectifs', 14, 20);

  // Add export date
  doc.setFontSize(10);
  doc.text(`Date d'export: ${new Date().toLocaleDateString('fr-FR')}`, 14, 28);

  // Define table columns
  const columns = [
    { header: 'ID', dataKey: 'id' },
    { header: 'Nom', dataKey: 'name' },
    { header: 'Complexité', dataKey: 'complexity' },
    { header: 'Priorité', dataKey: 'priority' },
    { header: 'Catégorie', dataKey: 'category' },
  ];

  // Prepare data
  const data = objectives.map(objective => ({
    id: objective.id,
    name: objective.label,
    complexity: objective.complexite || '-',
    priority: objective.priorite || '-',
    category: '-',
  }));

  // Generate table
  autoTable(doc, {
    head: [columns.map(col => col.header)],
    body: data.map(row => columns.map(col => row[col.dataKey as keyof typeof row])),
    startY: 35,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202], fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    styles: { cellPadding: 3 },
    margin: { top: 35 },
  });

  // Add footer
  addFooter(doc, objectives.length);

  // Save PDF
  doc.save(filename);
}

/**
 * Exports chantiers data to PDF format
 */
export function exportChantiersToPDF(chantiers: Chantier[], filename: string = 'chantiers.pdf') {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text('Rapport des Chantiers', 14, 20);

  // Add export date
  doc.setFontSize(10);
  doc.text(`Date d'export: ${new Date().toLocaleDateString('fr-FR')}`, 14, 28);

  // Define table columns
  const columns = [
    { header: 'ID', dataKey: 'id' },
    { header: 'Nom', dataKey: 'name' },
    { header: 'Description', dataKey: 'description' },
  ];

  // Prepare data
  const data = chantiers.map(chantier => ({
    id: chantier.id,
    name: chantier.label,
    description: chantier.description || '-',
  }));

  // Generate table
  autoTable(doc, {
    head: [columns.map(col => col.header)],
    body: data.map(row => columns.map(col => row[col.dataKey as keyof typeof row])),
    startY: 35,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202], fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    styles: { cellPadding: 3 },
    columnStyles: {
      2: { cellWidth: 100 }
    },
    margin: { top: 35 },
  });

  // Add footer
  addFooter(doc, chantiers.length);

  // Save PDF
  doc.save(filename);
}

/**
 * Exports initiatives data to PDF format
 */
export function exportInitiativesToPDF(initiatives: Initiative[], filename: string = 'initiatives.pdf') {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text('Rapport des Initiatives', 14, 20);

  // Add export date
  doc.setFontSize(10);
  doc.text(`Date d'export: ${new Date().toLocaleDateString('fr-FR')}`, 14, 28);

  // Define table columns
  const columns = [
    { header: 'ID', dataKey: 'id' },
    { header: 'Nom', dataKey: 'name' },
    { header: 'Description', dataKey: 'description' },
    { header: 'Statut', dataKey: 'status' },
  ];

  // Prepare data
  const data = initiatives.map(initiative => ({
    id: initiative.id,
    name: initiative.label,
    description: initiative.description || '-',
    status: '-',
  }));

  // Generate table
  autoTable(doc, {
    head: [columns.map(col => col.header)],
    body: data.map(row => columns.map(col => row[col.dataKey as keyof typeof row])),
    startY: 35,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202], fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    styles: { cellPadding: 3 },
    columnStyles: {
      2: { cellWidth: 80 }
    },
    margin: { top: 35 },
  });

  // Add footer
  addFooter(doc, initiatives.length);

  // Save PDF
  doc.save(filename);
}

/**
 * Exports resources data to PDF format
 */
export function exportResourcesToPDF(resources: Resource[], filename: string = 'ressources.pdf') {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text('Rapport des Ressources', 14, 20);

  // Add export date
  doc.setFontSize(10);
  doc.text(`Date d'export: ${new Date().toLocaleDateString('fr-FR')}`, 14, 28);

  // Define table columns
  const columns = [
    { header: 'ID', dataKey: 'id' },
    { header: 'Nom', dataKey: 'name' },
    { header: 'Type', dataKey: 'type' },
    { header: 'Capacité', dataKey: 'capacity' },
    { header: 'Unité', dataKey: 'unit' },
  ];

  // Prepare data
  const data = resources.map(resource => ({
    id: resource.id,
    name: resource.name,
    type: resource.entity || '-',
    capacity: 0,
    unit: '-',
  }));

  // Generate table
  autoTable(doc, {
    head: [columns.map(col => col.header)],
    body: data.map(row => columns.map(col => row[col.dataKey as keyof typeof row])),
    startY: 35,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202], fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    styles: { cellPadding: 3 },
    margin: { top: 35 },
  });

  // Add footer
  addFooter(doc, resources.length);

  // Save PDF
  doc.save(filename);
}

/**
 * Export comprehensive dashboard report with multiple sections
 */
export function exportDashboardReportToPDF(
  projects: Project[],
  activities: Activity[],
  objectives: Objective[],
  filename: string = `rapport-dashboard-${new Date().toISOString().split('T')[0]}.pdf`
) {
  const doc = new jsPDF();

  // Cover page
  doc.setFontSize(24);
  doc.text('Rapport ISO Manager', 105, 60, { align: 'center' });

  doc.setFontSize(16);
  doc.text('Tableau de Bord Complet', 105, 75, { align: 'center' });

  doc.setFontSize(12);
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 90, { align: 'center' });

  // Summary statistics
  doc.setFontSize(14);
  doc.text('Statistiques Générales', 14, 110);

  doc.setFontSize(11);
  doc.text(`Total Projets: ${projects.length}`, 20, 125);
  doc.text(`Total Activités: ${activities.length}`, 20, 135);
  doc.text(`Total Objectifs: ${objectives.length}`, 20, 145);

  // Projects status breakdown
  const projectsByStatus = projects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  doc.text('Répartition des Projets par Statut:', 20, 160);
  let yPos = 170;
  Object.entries(projectsByStatus).forEach(([status, count]) => {
    doc.setFontSize(10);
    doc.text(`  • ${status}: ${count}`, 25, yPos);
    yPos += 8;
  });

  // Activities status breakdown
  const activitiesByStatus = activities.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  doc.text('Répartition des Activités par Statut:', 20, yPos + 10);
  yPos += 20;
  Object.entries(activitiesByStatus).forEach(([status, count]) => {
    doc.setFontSize(10);
    doc.text(`  • ${status}: ${count}`, 25, yPos);
    yPos += 8;
  });

  // Add new page for projects table
  doc.addPage();
  doc.setFontSize(16);
  doc.text('Liste des Projets', 14, 20);

  const projectsData = projects.slice(0, 50).map(p => ({
    id: p.id,
    title: truncate(p.title, 30),
    status: p.status,
    budget: formatNumber(p.budgetApproved),
  }));

  autoTable(doc, {
    head: [['ID', 'Titre', 'Statut', 'Budget approuvé']],
    body: projectsData.map(p => [p.id, p.title, p.status, p.budget]),
    startY: 30,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202] },
  });

  // Add new page for activities table
  doc.addPage();
  doc.setFontSize(16);
  doc.text('Liste des Activités', 14, 20);

  const activitiesData = activities.slice(0, 50).map(a => ({
    id: a.id,
    name: truncate(a.title, 40),
    status: a.status,
    priority: a.priority,
  }));

  autoTable(doc, {
    head: [['ID', 'Nom', 'Statut', 'Priorité']],
    body: activitiesData.map(a => [a.id, a.name, a.status, a.priority]),
    startY: 30,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202] },
  });

  // Add footer to all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.text(
      `Page ${i} sur ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save PDF
  doc.save(filename);
}

/**
 * Helper function to add footer to PDF pages
 */
function addFooter(doc: jsPDF, totalItems: number) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.text(
      `Page ${i} sur ${pageCount} | Total: ${totalItems} éléments`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
}

/**
 * Helper function to format numbers
 */
function formatNumber(value: number | undefined): string {
  if (value === undefined || value === null) return '-';
  return new Intl.NumberFormat('fr-FR').format(value);
}

/**
 * Helper function to truncate text
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}
