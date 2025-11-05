import React from 'react';

// FIX: Updated CardProps to extend standard div HTML attributes, allowing passthrough of event handlers like onDrop.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  // Fix: Make children optional to allow card components to be used without content.
  children?: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white border border-slate-200 rounded-lg shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return <div className={`p-4 border-b border-slate-200 ${className}`} {...props}>{children}</div>;
};

export const CardContent: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return <div className={`p-4 ${className}`} {...props}>{children}</div>;
};

// FIX: Created a distinct props interface for CardTitle to correctly type its underlying h3 element.
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children?: React.ReactNode;
    className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '', ...props }) => {
    return <h3 className={`text-lg font-semibold text-slate-800 ${className}`}>{children}</h3>
}


export default Card;