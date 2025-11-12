import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, TrendingUp, Hourglass, AlertCircle, TrendingDown } from 'lucide-react';
import { useData } from '../../../contexts/DataContext';
import { Project, ActivityStatus, Activity } from '../../../types';
import Tooltip from '../../ui/Tooltip';

type KpiType = 'scheduleSlippage' | 'budgetForecast' | 'avgActivityAge';

interface KpiCardWidgetProps {
  type: KpiType;
  isEditMode?: boolean;
}

const getScheduleSlippage = (projects: Project[]): { value: number, count: number } => {
  let totalSlippage = 0;
  let completedOrInProgressProjects = 0;
  
  projects.forEach(p => {
    if ((p.status === ActivityStatus.COMPLETED || p.status === ActivityStatus.IN_PROGRESS) && p.projectEndDate && p.goLiveDate) {
      const endDate = new Date(p.projectEndDate);
      const plannedDate = new Date(p.goLiveDate);
      
      // Si la date de fin est dans le futur mais que la date prévisionnelle est déjà passée, c'est un retard
      const effectiveEndDate = p.status === ActivityStatus.COMPLETED ? endDate : new Date();
      
      if (!isNaN(endDate.getTime()) && !isNaN(plannedDate.getTime())) {
        const diffTime = effectiveEndDate.getTime() - plannedDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        totalSlippage += diffDays;
        completedOrInProgressProjects++;
      }
    }
  });

  if (completedOrInProgressProjects === 0) return { value: 0, count: 0 };
  return { value: Math.round(totalSlippage / completedOrInProgressProjects), count: completedOrInProgressProjects };
};

const getBudgetForecast = (projects: Project[]): { value: number, count: number } => {
    let totalPAB = 0;
    let projectCount = 0;

    projects.forEach(p => {
        if (p.budgetApproved && p.completedPV && p.budgetCommitted && p.budgetCommitted > 0) {
            const performanceIndex = p.completedPV / p.budgetCommitted;
            if(performanceIndex > 0) {
                const pab = p.budgetApproved / performanceIndex;
                totalPAB += pab;
                projectCount++;
            }
        }
    });

    if (projectCount === 0) return { value: 0, count: 0 };
    return { value: Math.round(totalPAB / projectCount), count: projectCount };
};


const getAvgActivityAge = (activities: Activity[]): { value: number, count: number } => {
  const inProgressActivities = activities.filter(a => a.status === ActivityStatus.IN_PROGRESS && a.startDate);
  if (inProgressActivities.length === 0) return { value: 0, count: 0 };
  
  const now = new Date().getTime();
  const totalAge = inProgressActivities.reduce((sum, a) => {
    const startTime = new Date(a.startDate!).getTime();
    return sum + (now - startTime);
  }, 0);

  const avgAgeInMillis = totalAge / inProgressActivities.length;
  return { value: Math.round(avgAgeInMillis / (1000 * 60 * 60 * 24)), count: inProgressActivities.length };
};


const KpiCardWidget: React.FC<KpiCardWidgetProps> = ({ type, isEditMode }) => {
  const { projects, activities, lastCsvImportDate } = useData();
  const navigate = useNavigate();

  const kpiData = useMemo(() => {
    const dateInfo = lastCsvImportDate ? ` Données FDR du ${new Date(lastCsvImportDate).toLocaleDateString('fr-FR')}.` : '';

    switch (type) {
      case 'scheduleSlippage': {
        const { value, count } = getScheduleSlippage(projects);
        const isLate = value > 0;
        return {
          title: 'Dérive calendrier moyenne',
          value: `${value} jours`,
          icon: isLate ? <AlertCircle className="text-red-500" /> : <CalendarClock />,
          onClick: () => navigate('/projects-timeline'),
          colorClass: isLate ? 'text-red-500' : 'text-green-600',
          tooltip: `Sur ${count} projet(s) analysé(s).` + dateInfo
        };
      }
      case 'budgetForecast': {
        const { value, count } = getBudgetForecast(projects);
         return {
          title: 'Atterrissage budgétaire prévu',
          value: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', notation: 'compact' }).format(value),
          icon: <TrendingUp />,
          onClick: () => navigate('/projects-budget'),
          colorClass: 'text-slate-900',
          tooltip: `Estimation moyenne sur ${count} projet(s) avec données budgétaires.` + dateInfo
        };
      }
      case 'avgActivityAge': {
        const { value, count } = getAvgActivityAge(activities);
        const isHigh = value > 30; // Threshold for "old" activities
        return {
          title: 'Âge moyen des activités "en cours"',
          value: `${value} jours`,
          icon: <Hourglass />,
          onClick: () => navigate('/activities', { state: { statusFilter: ActivityStatus.IN_PROGRESS } }),
          colorClass: isHigh ? 'text-amber-600' : 'text-slate-900',
          tooltip: `${count} activité(s) "En cours" analysée(s).`
        };
      }
      default:
        return null;
    }
  }, [type, projects, activities, navigate, lastCsvImportDate]);

  if (!kpiData) return null;

  return (
    <Tooltip text={kpiData.tooltip}>
      <div 
          className={`h-full w-full p-4 flex flex-col justify-center ${!isEditMode ? 'cursor-pointer' : 'cursor-default'}`}
          onClick={!isEditMode ? kpiData.onClick : undefined}
      >
          <div className="flex w-full items-start justify-between gap-4">
              <div className="flex flex-col gap-0 items-start">
                  <p className="text-sm font-medium text-slate-500 non-draggable">{kpiData.title}</p>
                  <p className={`text-3xl font-bold non-draggable leading-tight ${kpiData.colorClass}`}>{kpiData.value}</p>
              </div>
              <div className="p-3 bg-slate-100 rounded-lg text-slate-600 non-draggable flex items-center justify-center">
                  {React.cloneElement(kpiData.icon as React.ReactElement<{ size: number }>, { size: 24 })}
              </div>
          </div>
      </div>
    </Tooltip>
  );
};

export default KpiCardWidget;