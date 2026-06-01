import type { Jardin, Nino, RegistroDiario, Mensaje, Usuario } from '../types';

// ============================================================
// HOY
// ============================================================
export const TODAY = new Date().toISOString().split('T')[0];

const nowTime = () => {
  const n = new Date();
  return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`;
};

// ============================================================
// JARDÍN
// ============================================================
export const mockJardin: Jardin = {
  nombre: 'Jardín Maternal',
  logo_url: null,
};

// ============================================================
// USUARIOS DEMO
// ============================================================
export const mockUsers: Usuario[] = [
  { id: 'u1', email: 'laura@jardin.com',     password: '1234', rol: 'docente',  nombre: 'Maestra Laura' },
  { id: 'u2', email: 'ana@jardin.com',       password: '1234', rol: 'docente',  nombre: 'Maestra Ana'   },
  { id: 'u3', email: 'garcia@familia.com',   password: '1234', rol: 'familia',  nombre: 'Familia García',     childId: 'c1' },
  { id: 'u4', email: 'rodriguez@familia.com',password: '1234', rol: 'familia',  nombre: 'Familia Rodríguez',  childId: 'c2' },
  { id: 'u5', email: 'lopez@familia.com',    password: '1234', rol: 'familia',  nombre: 'Familia López',      childId: 'c3' },
  { id: 'u6', email: 'martinez@familia.com', password: '1234', rol: 'familia',  nombre: 'Familia Martínez',   childId: 'c4' },
  { id: 'u7', email: 'perez@familia.com',    password: '1234', rol: 'familia',  nombre: 'Familia Pérez',      childId: 'c5' },
];

// ============================================================
// NIÑOS
// ============================================================
export const mockNinos: Nino[] = [
  { id: 'c1', nombre: 'Sofía',     apellido: 'García',    sala: 'Sala de 2', avatar: '👧', fecha_nacimiento: '2022-03-15', alergias: 'Ninguna',  familia_id: 'u3', activo: true },
  { id: 'c2', nombre: 'Mateo',     apellido: 'Rodríguez', sala: 'Sala de 1', avatar: '👦', fecha_nacimiento: '2023-01-20', alergias: 'Ninguna',  familia_id: 'u4', activo: true },
  { id: 'c3', nombre: 'Emma',      apellido: 'López',     sala: 'Sala de 2', avatar: '👧', fecha_nacimiento: '2022-07-08', alergias: 'Lactosa',  familia_id: 'u5', activo: true },
  { id: 'c4', nombre: 'Lucas',     apellido: 'Martínez',  sala: 'Maternal',  avatar: '👶', fecha_nacimiento: '2024-02-12', alergias: 'Ninguna',  familia_id: 'u6', activo: true },
  { id: 'c5', nombre: 'Valentina', apellido: 'Pérez',     sala: 'Sala de 3', avatar: '👧', fecha_nacimiento: '2021-11-30', alergias: 'Polen',    familia_id: 'u7', activo: true },
  { id: 'c6', nombre: 'Benjamín',  apellido: 'Torres',    sala: 'Sala de 1', avatar: '👦', fecha_nacimiento: '2023-05-05', alergias: 'Ninguna',  familia_id: null, activo: true },
  { id: 'c7', nombre: 'Mía',       apellido: 'Fernández', sala: 'Maternal',  avatar: '👶', fecha_nacimiento: '2024-01-18', alergias: 'Ninguna',  familia_id: null, activo: true },
  { id: 'c8', nombre: 'Santiago',  apellido: 'Díaz',      sala: 'Sala de 3', avatar: '👦', fecha_nacimiento: '2021-08-22', alergias: 'Mariscos', familia_id: null, activo: true },
];

// ============================================================
// REGISTROS DIARIOS
// ============================================================
export const mockRegistros: RegistroDiario[] = [
  {
    id: 'r1', nino_id: 'c1', docente_id: 'u1', fecha: TODAY, hora: '12:30',
    desayuno: 'todo', almuerzo: 'todo', merienda: 'poco',
    popo: 'poco', control_pis: true,
    siesta_inicio: '13:00', siesta_fin: '15:00',
    estado_animo: 'feliz', temperatura: '36.5', medicacion: '',
    foto_url: null,
    observaciones: 'Muy activa, participó en todas las actividades del día.',
    maestro: 'Laura',
  },
  {
    id: 'r2', nino_id: 'c2', docente_id: 'u2', fecha: TODAY, hora: '12:45',
    desayuno: 'poco', almuerzo: 'poco', merienda: 'nada',
    popo: 'no', control_pis: false,
    siesta_inicio: '13:15', siesta_fin: '14:30',
    estado_animo: 'tranquilo', temperatura: '36.8', medicacion: '',
    foto_url: null,
    observaciones: 'Estuvo tranquilo, disfrutó del cuento.',
    maestro: 'Ana',
  },
  {
    id: 'r3', nino_id: 'c3', docente_id: 'u1', fecha: TODAY, hora: '11:50',
    desayuno: 'todo', almuerzo: 'poco', merienda: 'poco',
    popo: 'poco', control_pis: true,
    siesta_inicio: '13:00', siesta_fin: '14:00',
    estado_animo: 'lloron', temperatura: '36.9', medicacion: 'Ibuprofeno 5ml',
    foto_url: null,
    observaciones: 'Le costó adaptarse hoy, estuvo un poco llorosa.',
    maestro: 'Laura',
  },
  // Historial (días anteriores)
  {
    id: 'r4', nino_id: 'c1', docente_id: 'u1', fecha: '2026-05-30', hora: '12:20',
    desayuno: 'todo', almuerzo: 'todo', merienda: 'todo',
    popo: 'mucho', control_pis: true,
    siesta_inicio: '13:00', siesta_fin: '15:15',
    estado_animo: 'muy_bien', temperatura: '36.4', medicacion: '',
    foto_url: null,
    observaciones: 'Excelente día, jugó mucho con sus amigos.',
    maestro: 'Laura',
  },
  {
    id: 'r5', nino_id: 'c1', docente_id: 'u1', fecha: '2026-05-29', hora: '12:00',
    desayuno: 'todo', almuerzo: 'poco', merienda: 'todo',
    popo: 'no', control_pis: true,
    siesta_inicio: '13:00', siesta_fin: '14:45',
    estado_animo: 'feliz', temperatura: '36.6', medicacion: '',
    foto_url: null,
    observaciones: '',
    maestro: 'Laura',
  },
];

// ============================================================
// MENSAJES
// ============================================================
export const mockMensajes: Mensaje[] = [
  {
    id: 'm1', nino_id: 'c1', remitente_id: 'u3', remitente_nombre: 'Familia García',
    sala: 'Sala de 2', turno: 'Mañana',
    contenido: 'Maestra Laura, hoy Sofía trae su osito de peluche en la mochila. Por favor no se lo quiten, la ayuda a calmarse.',
    leido: false, fecha: TODAY, hora: '08:15',
  },
  {
    id: 'm2', nino_id: 'c3', remitente_id: 'u5', remitente_nombre: 'Familia López',
    sala: 'Sala de 2', turno: 'Mañana',
    contenido: 'Buenos días. Emma no pudo dormir bien anoche, puede ser que esté más irritable. Gracias.',
    leido: false, fecha: TODAY, hora: '07:45',
  },
];

export const nid = () => Math.random().toString(36).slice(2, 9);
export { nowTime as getNowTime };
