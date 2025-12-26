import React, { useState, useRef, useLayoutEffect, ReactNode } from 'react';
import { Info, AlertTriangle, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipVariant = 'default' | 'info' | 'warning' | 'success' | 'error' | 'help';

interface RichTooltipProps {
  children: React.ReactElement;
  content: ReactNode;
  title?: string;
  variant?: TooltipVariant;
  position?: TooltipPosition;
  delay?: number;
  maxWidth?: number;
  showIcon?: boolean;
  disabled?: boolean;
}

const variantStyles: Record<TooltipVariant, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  default: {
    bg: 'bg-white',
    border: 'border-slate-200',
    text: 'text-slate-800',
    icon: <Info size={16} className="text-slate-500" />,
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    icon: <Info size={16} className="text-blue-600" />,
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-900',
    icon: <AlertTriangle size={16} className="text-amber-600" />,
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-900',
    icon: <CheckCircle size={16} className="text-green-600" />,
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-900',
    icon: <AlertCircle size={16} className="text-red-600" />,
  },
  help: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-900',
    icon: <HelpCircle size={16} className="text-purple-600" />,
  },
};

/**
 * Tooltip enrichi avec support de contenu riche, icônes, et variantes de style
 */
export function RichTooltip({
  children,
  content,
  title,
  variant = 'default',
  position = 'top',
  delay = 300,
  maxWidth = 320,
  showIcon = true,
  disabled = false,
}: RichTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState<TooltipPosition>(position);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const styles = variantStyles[variant];

  useLayoutEffect(() => {
    if (isVisible && tooltipRef.current && targetRef.current) {
      const tooltip = tooltipRef.current;
      const target = targetRef.current;
      const targetRect = target.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let left = 0;
      let top = 0;
      let finalPosition = position;

      // Calculer la position selon la préférence
      switch (position) {
        case 'top':
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
          top = targetRect.top - tooltipRect.height - 8;
          // Si déborde en haut, basculer en bas
          if (top < 0) {
            finalPosition = 'bottom';
            top = targetRect.bottom + 8;
          }
          break;

        case 'bottom':
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
          top = targetRect.bottom + 8;
          // Si déborde en bas, basculer en haut
          if (top + tooltipRect.height > viewportHeight) {
            finalPosition = 'top';
            top = targetRect.top - tooltipRect.height - 8;
          }
          break;

        case 'left':
          left = targetRect.left - tooltipRect.width - 8;
          top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
          // Si déborde à gauche, basculer à droite
          if (left < 0) {
            finalPosition = 'right';
            left = targetRect.right + 8;
          }
          break;

        case 'right':
          left = targetRect.right + 8;
          top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
          // Si déborde à droite, basculer à gauche
          if (left + tooltipRect.width > viewportWidth) {
            finalPosition = 'left';
            left = targetRect.left - tooltipRect.width - 8;
          }
          break;
      }

      // Ajustements horizontaux pour éviter de dépasser
      if (left < 8) {
        left = 8;
      } else if (left + tooltipRect.width > viewportWidth - 8) {
        left = viewportWidth - tooltipRect.width - 8;
      }

      // Ajustements verticaux pour éviter de dépasser
      if (top < 8) {
        top = 8;
      } else if (top + tooltipRect.height > viewportHeight - 8) {
        top = viewportHeight - tooltipRect.height - 8;
      }

      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      setActualPosition(finalPosition);
    }
  }, [isVisible, content, position]);

  const handleMouseEnter = () => {
    if (disabled) return;

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  if (disabled) {
    return children;
  }

  return (
    <span
      ref={targetRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <div
        ref={tooltipRef}
        className={`fixed px-3 py-2.5 text-sm rounded-lg shadow-lg transition-opacity duration-200 pointer-events-none z-50 border ${styles.bg} ${styles.border} ${styles.text}`}
        style={{
          opacity: isVisible ? 1 : 0,
          maxWidth: `${maxWidth}px`,
        }}
      >
        {title && (
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-current border-opacity-20">
            {showIcon && styles.icon}
            <h4 className="font-semibold text-sm">{title}</h4>
          </div>
        )}
        <div className={`${title ? '' : 'flex items-start gap-2'}`}>
          {!title && showIcon && <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>}
          <div className="flex-1">{content}</div>
        </div>
        {/* Flèche du tooltip */}
        <div
          className={`absolute w-2 h-2 ${styles.bg} border ${styles.border} transform rotate-45`}
          style={getArrowStyle(actualPosition, styles.bg)}
        />
      </div>
    </span>
  );
}

/**
 * Calcule le style de la flèche selon la position
 */
function getArrowStyle(position: TooltipPosition, bgColor: string): React.CSSProperties {
  const baseStyle: React.CSSProperties = {};

  switch (position) {
    case 'top':
      return {
        ...baseStyle,
        bottom: '-5px',
        left: '50%',
        transform: 'translateX(-50%) rotate(45deg)',
        borderTop: 'none',
        borderLeft: 'none',
      };
    case 'bottom':
      return {
        ...baseStyle,
        top: '-5px',
        left: '50%',
        transform: 'translateX(-50%) rotate(45deg)',
        borderBottom: 'none',
        borderRight: 'none',
      };
    case 'left':
      return {
        ...baseStyle,
        right: '-5px',
        top: '50%',
        transform: 'translateY(-50%) rotate(45deg)',
        borderLeft: 'none',
        borderBottom: 'none',
      };
    case 'right':
      return {
        ...baseStyle,
        left: '-5px',
        top: '50%',
        transform: 'translateY(-50%) rotate(45deg)',
        borderRight: 'none',
        borderTop: 'none',
      };
  }
}

export default RichTooltip;
