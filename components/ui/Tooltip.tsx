
import React, { useState, useRef, useLayoutEffect } from 'react';

interface TooltipProps {
  children: React.ReactElement;
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, text }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (isVisible && tooltipRef.current && targetRef.current) {
      const tooltip = tooltipRef.current;
      const target = targetRef.current;
      const targetRect = target.getBoundingClientRect();
      
      // Position tooltip above the target
      tooltip.style.left = `${targetRect.left + targetRect.width / 2 - tooltip.offsetWidth / 2}px`;
      tooltip.style.top = `${targetRect.top - tooltip.offsetHeight - 8}px`;

      // Adjust if it overflows
      if (tooltip.getBoundingClientRect().top < 0) {
        tooltip.style.top = `${targetRect.bottom + 8}px`;
      }
    }
  }, [isVisible, text]);

  return (
    <span 
      ref={targetRef}
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <div 
        ref={tooltipRef}
        className="fixed w-max max-w-xs px-3 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg shadow-lg transition-opacity duration-300 pointer-events-none z-50"
        style={{ opacity: isVisible ? 1 : 0 }}
      >
        {text}
      </div>
    </span>
  );
};

export default Tooltip;
