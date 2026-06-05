-- ==========================================
-- SCRIPT DE MIGRACIÓN: MULTI-TENANT & RLS
-- ==========================================

-- 1. Limpieza total (¡Cuidado, boACrra datos!)
DROP TABLE IF EXISTS public.mensajes CASCADE;
DROP TABLE IF EXISTS public.registros_diarios CASCADE;
DROP TABLE IF EXISTS public.registros CASCADE; -- (la tabla vieja)
DROP TABLE IF EXISTS public.docente_sala CASCADE;
DROP TABLE IF EXISTS public.ninos CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.jardines CASCADE;
DROP TABLE IF EXISTS public.jardin CASCADE; -- (la tabla vieja)

-- 2. Creación de Tablas

-- JARDINES
CREATE TABLE public.jardines (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL,
  logo_url text,
  activo boolean DEFAULT true,
  suscripcion text DEFAULT 'prueba',
  created_at timestamp DEFAULT now()
);

-- PROFILES
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  jardin_id uuid REFERENCES public.jardines(id) ON DELETE CASCADE,
  rol text NOT NULL CHECK (rol IN ('superadmin', 'admin_jardin', 'docente', 'familia')),
  nombre text NOT NULL,
  avatar_url text,
  child_id uuid, -- Para el padre (referencia circular temporal, se actualizará post-creación de niños)
  created_at timestamp DEFAULT now()
);

-- NIÑOS
CREATE TABLE public.ninos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  jardin_id uuid REFERENCES public.jardines(id) ON DELETE CASCADE NOT NULL,
  familia_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  nombre text NOT NULL,
  apellido text NOT NULL,
  sala text NOT NULL,
  avatar text NOT NULL,
  fecha_nacimiento date,
  alergias text,
  activo boolean DEFAULT true,
  created_at timestamp DEFAULT now()
);

-- Agregar FK de profiles a ninos
ALTER TABLE public.profiles ADD CONSTRAINT fk_child FOREIGN KEY (child_id) REFERENCES public.ninos(id) ON DELETE SET NULL;

-- DOCENTE_SALA (Relación N:N)
CREATE TABLE public.docente_sala (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  docente_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  jardin_id uuid REFERENCES public.jardines(id) ON DELETE CASCADE NOT NULL,
  sala text NOT NULL
);

-- REGISTROS DIARIOS
CREATE TABLE public.registros_diarios (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nino_id uuid REFERENCES public.ninos(id) ON DELETE CASCADE NOT NULL,
  docente_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  jardin_id uuid REFERENCES public.jardines(id) ON DELETE CASCADE NOT NULL,
  fecha date NOT NULL,
  hora text,
  desayuno text,
  almuerzo text,
  merienda text,
  popo boolean,
  control_pis boolean,
  siesta_inicio text,
  siesta_fin text,
  estado_animo text,
  temperatura decimal,
  medicacion boolean,
  medicacion_obs text,
  foto_url text,
  observaciones text,
  maestro text,
  created_at timestamp DEFAULT now()
);

-- MENSAJES
CREATE TABLE public.mensajes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  jardin_id uuid REFERENCES public.jardines(id) ON DELETE CASCADE NOT NULL,
  remitente_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  destinatario_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  nino_id uuid REFERENCES public.ninos(id) ON DELETE CASCADE,
  remitente_nombre text,
  sala text,
  turno text,
  contenido text NOT NULL,
  leido boolean DEFAULT false,
  fecha date NOT NULL,
  hora text,
  created_at timestamp DEFAULT now()
);

-- 3. Trigger Automático para nuevos usuarios (Auth)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, jardin_id, nombre, rol)
  VALUES (
    new.id,
    (new.raw_user_meta_data->>'jardin_id')::uuid,
    COALESCE(new.raw_user_meta_data->>'nombre', 'Usuario Nuevo'),
    COALESCE(new.raw_user_meta_data->>'rol', 'familia')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE public.jardines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ninos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.docente_sala ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_diarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes ENABLE ROW LEVEL SECURITY;

-- Funciones helper para RLS

CREATE OR REPLACE FUNCTION public.get_user_jardin_id() RETURNS uuid AS $$
  SELECT jardin_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_superadmin() RETURNS boolean AS $$
  SELECT rol = 'superadmin' FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- JARDINES:
-- Superadmin ve todos, el resto solo ve el suyo
CREATE POLICY "Superadmin ve todo" ON public.jardines FOR ALL USING (public.is_superadmin());
CREATE POLICY "Usuarios ven su propio jardin" ON public.jardines FOR SELECT USING (id = public.get_user_jardin_id());

-- PROFILES:
-- Superadmin ve todos, el resto solo ve perfiles de su propio jardín
CREATE POLICY "Superadmin ve profiles" ON public.profiles FOR ALL USING (public.is_superadmin());
CREATE POLICY "Usuarios ven profiles de su jardin" ON public.profiles FOR SELECT USING (jardin_id = public.get_user_jardin_id());
CREATE POLICY "Usuarios actualizan su perfil" ON public.profiles FOR UPDATE USING (id = auth.uid());

-- NINOS:
CREATE POLICY "Superadmin ve ninos" ON public.ninos FOR ALL USING (public.is_superadmin());
CREATE POLICY "Usuarios ven ninos de su jardin" ON public.ninos FOR SELECT USING (jardin_id = public.get_user_jardin_id());
-- Docentes y admins pueden insertar/actualizar
CREATE POLICY "Staff modifica ninos" ON public.ninos FOR ALL USING (
  jardin_id = public.get_user_jardin_id() AND 
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol IN ('docente', 'admin_jardin')))
);

-- DOCENTE_SALA:
CREATE POLICY "Usuarios ven docente_sala de su jardin" ON public.docente_sala FOR SELECT USING (jardin_id = public.get_user_jardin_id());
CREATE POLICY "Admin modifica docente_sala" ON public.docente_sala FOR ALL USING (
  jardin_id = public.get_user_jardin_id() AND 
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'admin_jardin'))
);

-- REGISTROS DIARIOS:
CREATE POLICY "Superadmin ve registros" ON public.registros_diarios FOR ALL USING (public.is_superadmin());
-- Familias ven registros de su hijo
CREATE POLICY "Familias ven registros de su hijo" ON public.registros_diarios FOR SELECT USING (
  nino_id IN (SELECT child_id FROM public.profiles WHERE id = auth.uid())
);
-- Docentes ven y modifican registros de su jardín
CREATE POLICY "Staff lee registros" ON public.registros_diarios FOR SELECT USING (
  jardin_id = public.get_user_jardin_id() AND 
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol IN ('docente', 'admin_jardin')))
);
CREATE POLICY "Staff inserta registros" ON public.registros_diarios FOR INSERT WITH CHECK (
  jardin_id = public.get_user_jardin_id() AND 
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol IN ('docente', 'admin_jardin')))
);
CREATE POLICY "Staff actualiza registros" ON public.registros_diarios FOR UPDATE USING (
  jardin_id = public.get_user_jardin_id() AND 
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol IN ('docente', 'admin_jardin')))
);

-- MENSAJES:
CREATE POLICY "Superadmin ve mensajes" ON public.mensajes FOR ALL USING (public.is_superadmin());
-- Usuarios ven mensajes donde son remitente o destinatario, o si son de su jardin (Docente)
CREATE POLICY "Staff lee todos los mensajes del jardin" ON public.mensajes FOR SELECT USING (
  jardin_id = public.get_user_jardin_id() AND 
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol IN ('docente', 'admin_jardin')))
);
CREATE POLICY "Familias leen sus mensajes" ON public.mensajes FOR SELECT USING (
  remitente_id = auth.uid() OR destinatario_id = auth.uid()
);
CREATE POLICY "Todos pueden enviar mensajes" ON public.mensajes FOR INSERT WITH CHECK (
  remitente_id = auth.uid() AND jardin_id = public.get_user_jardin_id()
);
CREATE POLICY "Destinatario puede marcar como leido" ON public.mensajes FOR UPDATE USING (
  destinatario_id = auth.uid()
);


-- ==========================================
-- DATOS SEMILLA (JARDIN POR DEFECTO Y SUPERADMIN)
-- ==========================================

-- Insertamos un jardin inicial
INSERT INTO public.jardines (id, nombre, suscripcion) VALUES ('00000000-0000-0000-0000-000000000001', 'Jardín de Prueba', 'activa');

-- Para crear al superadmin de la DB, deberás hacerlo desde Auth en Supabase y luego modificar su rol a 'superadmin' en profiles.
