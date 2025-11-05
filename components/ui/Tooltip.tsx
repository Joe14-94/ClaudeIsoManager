
import React, { useState, useRef, useLayoutEffect } from 'react';

interface TooltipProps {
  children: React.ReactElement;
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, text }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (isVisible && tooltipRef.current && targetRef.current) {
      const tooltip = tooltipRef.current;
      const target = targetRef.current;
      const targetRect = target.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();

      const buffer = 8; // 8px buffer from viewport edges

      // Reset styles before recalculating
      tooltip.style.transform = 'none';

      // --- Vertical Positioning ---
      // Decide whether to place it above or below.
      if (targetRect.top - tooltipRect.height < buffer) {
        // Not enough space above, position below
        tooltip.style.top = `${targetRect.height + buffer / 2}px`;
        tooltip.style.bottom = 'auto';
      } else {
        // Default: position above
        tooltip.style.bottom = `${targetRect.height + buffer / 2}px`;
        tooltip.style.top = 'auto';
      }
      
      // --- Horizontal Positioning ---
      const targetCenter = targetRect.left + targetRect.width / 2;
      let tooltipLeft = targetCenter - tooltipRect.width / 2;
      
      // Adjust if it overflows the right edge of the viewport
      if (tooltipLeft + tooltipRect.width > window.innerWidth - buffer) {
        tooltipLeft = window.innerWidth - tooltipRect.width - buffer;
      }
      
      // Adjust if it overflows the left edge of the viewport
      if (tooltipLeft < buffer) {
        tooltipLeft = buffer;
      }
      
      // The `left` property is relative to the offset parent.
      // The parent `div` (with targetRef) is `position: relative`, so it is the offset parent.
      const parentRect = target.getBoundingClientRect();
      tooltip.style.left = `${tooltipLeft - parentRect.left}px`;
    }
  }, [isVisible, text]);

  return (
    <div 
      ref={targetRef}
      className="relative flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <div 
        ref={tooltipRef}
        className="absolute w-max max-w-xs px-3 py-2 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg shadow-lg transition-opacity duration-300 pointer-events-none z-10"
        style={{ opacity: isVisible ? 1 : 0 }}
      >
        {text}
      </div>
    </div>
  );
};

export default Tooltip;
