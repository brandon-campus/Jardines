import React from 'react';
import { salaColors } from '../../lib/utils';
import type { Sala } from '../../types';

// Generic pill badge
interface BadgeProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export function Badge({ children, style, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}

// Sala pill with color coding
interface SalaBadgeProps {
  sala: Sala;
  size?: 'sm' | 'md';
}
export function SalaBadge({ sala, size = 'sm' }: SalaBadgeProps) {
  const colors = salaColors(sala);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}
      style={{ background: colors.bg, color: colors.text }}
    >
      <span
        className="inline-block rounded-full"
        style={{ width: 7, height: 7, background: colors.dot }}
      />
      {sala}
    </span>
  );
}

// Status badge (registrado / pendiente)
interface StatusBadgeProps {
  done: boolean;
}
export function StatusBadge({ done }: StatusBadgeProps) {
  return done ? (
    <span className="text-xs font-bold text-green-600">✅ Registrado</span>
  ) : (
    <span className="text-xs font-bold text-amber-500">⏳ Pendiente</span>
  );
}

// Alergia badge
interface AlergiaBadgeProps {
  alergias: string;
}
export function AlergiaBadge({ alergias }: AlergiaBadgeProps) {
  if (!alergias || alergias === 'Ninguna') return null;
  return (
    <Badge style={{ background: '#fee2e2', color: '#991b1b' }}>
      ⚠️ {alergias}
    </Badge>
  );
}

// Chip compacto para tarjetas de registro
interface ChipProps {
  children: React.ReactNode;
  bg?: string;
  color?: string;
}
export function Chip({ children, bg = '#f3f4f6', color = '#374151' }: ChipProps) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
      style={{ background: bg, color }}
    >
      {children}
    </span>
  );
}
