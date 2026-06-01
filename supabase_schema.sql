-- ==========================================
-- SCRIPT DE INICIALIZACIÓN: JARDÍN MATERNAL
-- ==========================================

-- 1. Tabla de Usuarios (Manejamos la auth manual para el prototipo)
CREATE TABLE public.users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  rol text NOT NULL,
  nombre text NOT NULL,
  child_id uuid -- Referencia al niño (se actualizará después)
);

-- 2. Tabla de Niños
CREATE TABLE public.ninos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL,
  apellido text NOT NULL,
  sala text NOT NULL,
  avatar text NOT NULL,
  fecha_nacimiento date,
  alergias text,
  familia_id uuid REFERENCES public.users(id),
  activo boolean DEFAULT true
);

-- Agregar la clave foránea de users a ninos (para child_id)
ALTER TABLE public.users ADD CONSTRAINT fk_child FOREIGN KEY (child_id) REFERENCES public.ninos(id) ON DELETE SET NULL;

-- 3. Tabla de Registros Diarios
CREATE TABLE public.registros (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nino_id uuid REFERENCES public.ninos(id) ON DELETE CASCADE,
  docente_id uuid REFERENCES public.users(id),
  fecha date NOT NULL,
  hora text,
  desayuno text,
  almuerzo text,
  merienda text,
  popo text,
  control_pis boolean,
  siesta_inicio text,
  siesta_fin text,
  estado_animo text,
  temperatura text,
  medicacion text,
  foto_url text,
  observaciones text,
  maestro text
);

-- 4. Tabla de Mensajes
CREATE TABLE public.mensajes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nino_id uuid REFERENCES public.ninos(id) ON DELETE CASCADE,
  remitente_id uuid REFERENCES public.users(id),
  remitente_nombre text,
  sala text,
  turno text,
  contenido text NOT NULL,
  leido boolean DEFAULT false,
  fecha date NOT NULL,
  hora text
);

-- 5. Tabla de Configuración del Jardín
CREATE TABLE public.jardin (
  id integer PRIMARY KEY DEFAULT 1,
  nombre text NOT NULL,
  logo_url text
);

-- ==========================================
-- DATOS DE PRUEBA (MOCK DATA)
-- ==========================================

INSERT INTO public.jardin (id, nombre, logo_url) VALUES (1, 'Jardín Maternal', null);

-- Insertamos usuarios docentes
INSERT INTO public.users (id, email, password, rol, nombre) VALUES 
('11111111-1111-1111-1111-111111111111', 'laura@jardin.com', '1234', 'docente', 'Maestra Laura'),
('22222222-2222-2222-2222-222222222222', 'ana@jardin.com', '1234', 'docente', 'Maestra Ana');

-- Insertamos usuarios familias (sin child_id aún)
INSERT INTO public.users (id, email, password, rol, nombre) VALUES 
('33333333-3333-3333-3333-333333333333', 'garcia@familia.com', '1234', 'familia', 'Familia García'),
('44444444-4444-4444-4444-444444444444', 'rodriguez@familia.com', '1234', 'familia', 'Familia Rodríguez'),
('55555555-5555-5555-5555-555555555555', 'lopez@familia.com', '1234', 'familia', 'Familia López');

-- Insertamos niños
INSERT INTO public.ninos (id, nombre, apellido, sala, avatar, fecha_nacimiento, alergias, familia_id, activo) VALUES 
('aaaaa111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sofía', 'García', 'Sala de 2', '👧', '2022-03-15', 'Ninguna', '33333333-3333-3333-3333-333333333333', true),
('bbbbb222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Mateo', 'Rodríguez', 'Sala de 1', '👦', '2023-01-20', 'Ninguna', '44444444-4444-4444-4444-444444444444', true),
('ccccc333-cccc-cccc-cccc-cccccccccccc', 'Emma', 'López', 'Sala de 2', '👧', '2022-07-08', 'Lactosa', '55555555-5555-5555-5555-555555555555', true);

-- Actualizamos los child_id de las familias
UPDATE public.users SET child_id = 'aaaaa111-aaaa-aaaa-aaaa-aaaaaaaaaaaa' WHERE id = '33333333-3333-3333-3333-333333333333';
UPDATE public.users SET child_id = 'bbbbb222-bbbb-bbbb-bbbb-bbbbbbbbbbbb' WHERE id = '44444444-4444-4444-4444-444444444444';
UPDATE public.users SET child_id = 'ccccc333-cccc-cccc-cccc-cccccccccccc' WHERE id = '55555555-5555-5555-5555-555555555555';

-- Insertamos un registro de prueba para Sofía con fecha de hoy
INSERT INTO public.registros (nino_id, docente_id, fecha, hora, desayuno, almuerzo, merienda, popo, control_pis, siesta_inicio, siesta_fin, estado_animo, temperatura, medicacion, observaciones, maestro) 
VALUES ('aaaaa111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', CURRENT_DATE, '12:30', 'todo', 'todo', 'poco', 'poco', true, '13:00', '15:00', 'feliz', '36.5', '', 'Muy activa, participó en todas las actividades.', 'Laura');
