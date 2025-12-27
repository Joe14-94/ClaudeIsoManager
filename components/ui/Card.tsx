import React from 'react';

// FIX: Updated CardProps to extend standard div HTML attributes, allowing passthrough of event handlers like onDrop.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  // Fix: Make children optional to allow card components to be used without content.
  children?: React.ReactNode;
  className?: string;
}

// FIX: Use React.forwardRef to allow passing refs to the underlying div element. This resolves an error in ProjectsTimelinePage and allows ProjectsDashboard to correctly get a ref to CardContent.
const Card = React.forwardRef<HTMLDivElement, CardProps>(({ children, className = '', ...props }, ref) => {
  return (
    <div ref={ref} className={`bg-white border border-slate-200 rounded-lg shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
});
Card.displayName = "Card";


// FIX: Use React.forwardRef to allow passing refs to the underlying div element.
export const CardHeader = React.forwardRef<HTMLDivElement, CardProps>(({ children, className = '', ...props }, ref) => {
  return <div ref={ref} className={`p-3 border-b border-slate-200 ${className}`} {...props}>{children}</div>;
});
CardHeader.displayName = "CardHeader";

// FIX: Use React.forwardRef to allow passing refs to the underlying div element.
export const CardContent = React.forwardRef<HTMLDivElement, CardProps>(({ children, className = '', ...props }, ref) => {
  return <div ref={ref} className={`p-4 ${className}`} {...props}>{children}</div>;
});
CardContent.displayName = "CardContent";


// FIX: Created a distinct props interface for CardTitle to correctly type its underlying h3 element.
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children?: React.ReactNode;
    className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '', ...props }) => {
    return <h3 className={`text-lg font-semibold text-slate-800 ${className}`}>{children}</h3>
}


export default Card;