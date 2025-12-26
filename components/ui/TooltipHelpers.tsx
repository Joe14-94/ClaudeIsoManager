import React, { ReactNode } from 'react';
import { RichTooltip, TooltipVariant, TooltipPosition } from './RichTooltip';

interface QuickTooltipProps {
  children: React.ReactElement;
  title?: string;
  content: ReactNode;
  variant?: TooltipVariant;
  position?: TooltipPosition;
}

/**
 * Tooltip d'information
 */
export function InfoTooltip({ children, title, content, position }: QuickTooltipProps) {
  return (
    <RichTooltip
      variant="info"
      title={title}
      content={content}
      position={position}
      showIcon={true}
    >
      {children}
    </RichTooltip>
  );
}

/**
 * Tooltip d'avertissement
 */
export function WarningTooltip({ children, title, content, position }: QuickTooltipProps) {
  return (
    <RichTooltip
      variant="warning"
      title={title}
      content={content}
      position={position}
      showIcon={true}
    >
      {children}
    </RichTooltip>
  );
}

/**
 * Tooltip de succès
 */
export function SuccessTooltip({ children, title, content, position }: QuickTooltipProps) {
  return (
    <RichTooltip
      variant="success"
      title={title}
      content={content}
      position={position}
      showIcon={true}
    >
      {children}
    </RichTooltip>
  );
}

/**
 * Tooltip d'erreur
 */
export function ErrorTooltip({ children, title, content, position }: QuickTooltipProps) {
  return (
    <RichTooltip
      variant="error"
      title={title}
      content={content}
      position={position}
      showIcon={true}
    >
      {children}
    </RichTooltip>
  );
}

/**
 * Tooltip d'aide
 */
export function HelpTooltip({ children, content, position }: Omit<QuickTooltipProps, 'title' | 'variant'>) {
  return (
    <RichTooltip
      variant="help"
      title="Aide"
      content={content}
      position={position}
      showIcon={true}
    >
      {children}
    </RichTooltip>
  );
}

/**
 * Tooltip pour les statuts de projet
 */
export function ProjectStatusTooltip({
  children,
  status,
  description,
  lastUpdate,
}: {
  children: React.ReactElement;
  status: string;
  description?: string;
  lastUpdate?: string;
}) {
  const content = (
    <div className="space-y-1">
      <div>
        <span className="font-semibold">Statut : </span>
        {status}
      </div>
      {description && (
        <div className="text-xs opacity-90">
          {description}
        </div>
      )}
      {lastUpdate && (
        <div className="text-xs opacity-75 mt-2 pt-2 border-t border-current border-opacity-20">
          Dernière mise à jour : {lastUpdate}
        </div>
      )}
    </div>
  );

  return (
    <RichTooltip
      variant="info"
      title="Détails du statut"
      content={content}
      maxWidth={280}
    >
      {children}
    </RichTooltip>
  );
}

/**
 * Tooltip pour les métriques avec évolution
 */
export function MetricTooltip({
  children,
  metricName,
  currentValue,
  previousValue,
  unit = '',
  trend,
}: {
  children: React.ReactElement;
  metricName: string;
  currentValue: number;
  previousValue?: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
}) {
  const getTrendInfo = () => {
    if (!previousValue || trend === 'stable') {
      return { text: 'Stable', color: 'text-slate-600', symbol: '→' };
    }

    const change = ((currentValue - previousValue) / previousValue) * 100;
    const isPositive = trend === 'up';

    return {
      text: `${isPositive ? '+' : ''}${change.toFixed(1)}%`,
      color: isPositive ? 'text-green-600' : 'text-red-600',
      symbol: isPositive ? '↑' : '↓',
    };
  };

  const trendInfo = getTrendInfo();

  const content = (
    <div className="space-y-2">
      <div>
        <div className="text-xs opacity-75 mb-1">{metricName}</div>
        <div className="text-lg font-bold">
          {currentValue.toLocaleString('fr-FR')} {unit}
        </div>
      </div>
      {previousValue !== undefined && (
        <div className="text-xs flex items-center gap-2 pt-2 border-t border-current border-opacity-20">
          <span className="opacity-75">vs période précédente :</span>
          <span className={`font-semibold ${trendInfo.color}`}>
            {trendInfo.symbol} {trendInfo.text}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <RichTooltip
      variant="default"
      content={content}
      maxWidth={240}
      showIcon={false}
    >
      {children}
    </RichTooltip>
  );
}

/**
 * Tooltip pour afficher des listes d'éléments
 */
export function ListTooltip({
  children,
  title,
  items,
  maxItems = 5,
}: {
  children: React.ReactElement;
  title: string;
  items: string[];
  maxItems?: number;
}) {
  const displayItems = items.slice(0, maxItems);
  const remainingCount = items.length - displayItems.length;

  const content = (
    <div className="space-y-1">
      <ul className="list-disc list-inside space-y-0.5">
        {displayItems.map((item, index) => (
          <li key={index} className="text-xs">
            {item}
          </li>
        ))}
      </ul>
      {remainingCount > 0 && (
        <div className="text-xs opacity-75 italic mt-2 pt-2 border-t border-current border-opacity-20">
          +{remainingCount} autre{remainingCount > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );

  return (
    <RichTooltip
      variant="default"
      title={title}
      content={content}
      maxWidth={300}
    >
      {children}
    </RichTooltip>
  );
}

/**
 * Tooltip pour les dates avec information contextuelle
 */
export function DateTooltip({
  children,
  date,
  label,
  showRelative = true,
}: {
  children: React.ReactElement;
  date: Date | string;
  label?: string;
  showRelative?: boolean;
}) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const getRelativeText = () => {
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    if (diffDays === -1) return 'Demain';
    if (diffDays > 0) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    return `Dans ${Math.abs(diffDays)} jour${Math.abs(diffDays) > 1 ? 's' : ''}`;
  };

  const content = (
    <div className="space-y-1">
      {label && <div className="text-xs opacity-75">{label}</div>}
      <div className="font-semibold">
        {dateObj.toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </div>
      <div className="text-xs">
        {dateObj.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
      {showRelative && (
        <div className="text-xs opacity-75 italic mt-2 pt-2 border-t border-current border-opacity-20">
          {getRelativeText()}
        </div>
      )}
    </div>
  );

  return (
    <RichTooltip
      variant="default"
      content={content}
      maxWidth={260}
      showIcon={false}
    >
      {children}
    </RichTooltip>
  );
}
