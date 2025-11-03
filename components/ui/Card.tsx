import React from 'react';

interface CardProps {
  // Fix: Make children optional to allow card components to be used without content.
  children?: React.ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div className={`bg-white border border-slate-200 rounded-lg shadow-sm ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={`p-4 border-b border-slate-200 ${className}`}>{children}</div>;
};

export const CardContent: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={`p-4 ${className}`}>{children}</div>;
};

export const CardTitle: React.FC<CardProps> = ({ children, className = '' }) => {
    return <h3 className={`text-lg font-semibold text-slate-800 ${className}`}>{children}</h3>
}


export default Card;