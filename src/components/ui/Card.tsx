import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  accent?: string; // left border color
}

export function Card({ children, padding = 'md', accent, className = '', style, ...props }: CardProps) {
  const padMap = { sm: 'p-3', md: 'p-4', lg: 'p-5', none: '' };
  return (
    <div
      {...props}
      className={[
        'bg-white rounded-2xl shadow-[0_3px_12px_rgba(0,0,0,0.08)]',
        padMap[padding],
        accent ? 'border-l-4' : '',
        className,
      ].join(' ')}
      style={{ ...(accent ? { borderLeftColor: accent } : {}), ...style }}
    >
      {children}
    </div>
  );
}

interface SectionHeaderProps {
  icon: string;
  title: string;
}
export function SectionHeader({ icon, title }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 mt-5 mb-3 pb-2 border-b-2 border-dashed border-naranja-200">
      <span>{icon}</span>
      <span className="text-sm font-bold text-naranja-600">{title}</span>
    </div>
  );
}
