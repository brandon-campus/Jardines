// ============================================================
// TYPES — Jardín Maternal
// ============================================================

export type Sala = 'Maternal' | 'Sala de 1' | 'Sala de 2' | 'Sala de 3';
export type ComidaOpcion = 'todo' | 'poco' | 'nada';
export type EstadoAnimo = 'muy_bien' | 'feliz' | 'tranquilo' | 'lloron' | 'irritable';
export type PopoOpcion = 'no' | 'poco' | 'mucho';
export type Rol = 'docente' | 'familia' | 'superadmin' | 'admin_jardin';

export interface Jardin {
  id: string;
  nombre: string;
  logo_url: string | null;
  activo?: boolean;
  suscripcion?: string;
}

export interface Usuario {
  id: string;
  jardin_id?: string;
  nombre: string;
  rol: Rol;
  childId?: string; // solo para familias
  email: string;
  password: string;
  avatar_url?: string;
}

export interface Nino {
  id: string;
  jardin_id?: string;
  nombre: string;
  apellido: string;
  sala: Sala;
  avatar: string;
  fecha_nacimiento: string;
  alergias: string;
  familia_id: string | null;
  activo: boolean;
}

export interface RegistroDiario {
  id: string;
  jardin_id?: string;
  nino_id: string;
  docente_id: string;
  fecha: string;
  hora: string;
  desayuno: ComidaOpcion | null;
  almuerzo: ComidaOpcion | null;
  merienda: ComidaOpcion | null;
  popo: PopoOpcion;
  control_pis: boolean;
  siesta_inicio: string;
  siesta_fin: string;
  estado_animo: EstadoAnimo | null;
  temperatura: string;
  medicacion: string;
  foto_url: string | null;
  observaciones: string;
  maestro: string;
}

export interface Mensaje {
  id: string;
  jardin_id?: string;
  nino_id: string;
  remitente_id: string;
  destinatario_id?: string;
  remitente_nombre: string;
  sala: Sala;
  turno: string;
  contenido: string;
  leido: boolean;
  fecha: string;
  hora: string;
}

export interface Video {
  id: string;
  jardin_id?: string;
  docente_id: string;
  titulo: string;
  sala: string;
  video_url: string;
  thumbnail_url?: string;
  fecha: string;
  created_at: string;
}

export interface Notificacion {
  id: string;
  jardin_id?: string;
  usuario_id: string;
  titulo: string;
  mensaje: string;
  tipo: 'registro' | 'mensaje' | 'aviso' | 'video';
  referencia_id?: string;
  leida: boolean;
  created_at: string;
}

// Configuración de colores por sala
export const SALA_COLORS: Record<Sala, { bg: string; text: string; dot: string; border: string }> = {
  'Maternal':   { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B', border: '#F59E0B' },
  'Sala de 1':  { bg: '#DCFCE7', text: '#166534', dot: '#22C55E', border: '#22C55E' },
  'Sala de 2':  { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6', border: '#3B82F6' },
  'Sala de 3':  { bg: '#F3E8FF', text: '#6B21A8', dot: '#A855F7', border: '#A855F7' },
};

export const SALAS: Sala[] = ['Maternal', 'Sala de 1', 'Sala de 2', 'Sala de 3'];

export const COMIDA_OPTIONS: { v: ComidaOpcion; l: string; e: string; color: string; bg: string }[] = [
  { v: 'todo',  l: 'Todo',  e: '🍽️', color: '#16a34a', bg: '#dcfce7' },
  { v: 'poco',  l: 'Poco',  e: '🥄', color: '#d97706', bg: '#fef3c7' },
  { v: 'nada',  l: 'Nada',  e: '😔', color: '#dc2626', bg: '#fee2e2' },
];

export const ANIMO_OPTIONS: { v: EstadoAnimo; l: string; e: string }[] = [
  { v: 'muy_bien',  l: 'Muy bien',  e: '🌟' },
  { v: 'feliz',     l: 'Feliz',     e: '😊' },
  { v: 'tranquilo', l: 'Tranquilo', e: '😌' },
  { v: 'lloron',    l: 'Llorón',    e: '😢' },
  { v: 'irritable', l: 'Irritable', e: '😤' },
];

export const POPO_OPTIONS: { v: PopoOpcion; l: string; e: string }[] = [
  { v: 'no',    l: 'No',    e: '🚫' },
  { v: 'poco',  l: 'Poco',  e: '💩' },
  { v: 'mucho', l: 'Mucho', e: '💩💩' },
];

export const COMIDAS_DEL_DIA = [
  { key: 'desayuno' as const, label: 'Desayuno', icon: '☀️' },
  { key: 'almuerzo' as const, label: 'Almuerzo', icon: '🍛' },
  { key: 'merienda' as const, label: 'Merienda', icon: '🍪' },
];

// Mapa sala → maestra
export const SALA_MAESTRA: Record<Sala, { maestro: string; turno: string }> = {
  'Maternal':   { maestro: 'Maestra Ana',   turno: 'Mañana' },
  'Sala de 1':  { maestro: 'Maestra Ana',   turno: 'Mañana' },
  'Sala de 2':  { maestro: 'Maestra Laura', turno: 'Mañana' },
  'Sala de 3':  { maestro: 'Maestra Laura', turno: 'Tarde'  },
};
