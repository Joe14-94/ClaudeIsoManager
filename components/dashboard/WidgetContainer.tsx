import React, { useState, useRef, useLayoutEffect, Children, cloneElement } from 'react';

interface WidgetContainerProps {
  children: React.ReactElement<{ width?: number; height?: number; }>;
}

const WidgetContainer: React.FC<WidgetContainerProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  if (Children.count(children) !== 1) {
    return <div ref={containerRef} className="w-full h-full">{children}</div>;
  }

  const child = Children.only(children);
  const childWithProps = cloneElement(child, {
    width: dimensions.width,
    height: dimensions.height,
  });

  return <div ref={containerRef} className="w-full h-full">{childWithProps}</div>;
};

export default WidgetContainer;
