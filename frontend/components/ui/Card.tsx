import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export default function Card({ children, className = '', title }: CardProps) {
  return (
    <div className={`bg-theme-secondary rounded-2xl shadow-card overflow-hidden ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-theme bg-theme-tertiary/30">
          <h3 className="text-lg font-semibold text-theme-primary">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
