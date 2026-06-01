import { ANIMO_OPTIONS, COMIDA_OPTIONS } from '../types';
import type { Sala, EstadoAnimo, ComidaOpcion } from '../types';

// Formatear fecha YYYY-MM-DD → DD/MM/YYYY
export const fmtFecha = (d: string): string => {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
};

// Calcular duración entre dos horas "HH:MM"
export const calcDuracion = (desde: string, hasta: string): string => {
  try {
    const [h1, m1] = desde.split(':').map(Number);
    const [h2, m2] = hasta.split(':').map(Number);
    const total = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (total <= 0) return '—';
    return `${Math.floor(total / 60)}h ${total % 60}m`;
  } catch {
    return '—';
  }
};

// Hora actual HH:MM
export const horaActual = (): string => {
  const n = new Date();
  return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`;
};

// Emoji de ánimo
export const animoEmoji = (v: EstadoAnimo | null): string =>
  ANIMO_OPTIONS.find(a => a.v === v)?.e ?? '😊';

export const animoLabel = (v: EstadoAnimo | null): string =>
  ANIMO_OPTIONS.find(a => a.v === v)?.l ?? v ?? '';

// Label de comida
export const comidaLabel = (v: ComidaOpcion | null): string =>
  COMIDA_OPTIONS.find(c => c.v === v)?.l ?? v ?? '—';

// Color por sala (Tailwind classes no disponibles dinámicamente, usamos inline styles)
export const salaColors = (sala: Sala) => {
  const map: Record<Sala, { bg: string; text: string; dot: string }> = {
    'Maternal':   { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
    'Sala de 1':  { bg: '#DCFCE7', text: '#166534', dot: '#22C55E' },
    'Sala de 2':  { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' },
    'Sala de 3':  { bg: '#F3E8FF', text: '#6B21A8', dot: '#A855F7' },
  };
  return map[sala] ?? map['Sala de 2'];
};

// Calcular edad en meses/años desde fecha de nacimiento
export const calcEdad = (dob: string): string => {
  if (!dob) return '';
  const birth = new Date(dob);
  const now = new Date();
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());
  if (months < 12) return `${months}m`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years}a ${rem}m` : `${years}a`;
};

// ID random
export const nid = () => Math.random().toString(36).slice(2, 9);

// Temperatura color
export const tempColor = (t: string): string => {
  const n = parseFloat(t);
  if (isNaN(n)) return '#374151';
  return n >= 37.5 ? '#dc2626' : '#16a34a';
};
