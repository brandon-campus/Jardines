-- ==========================================
-- SCRIPT DE MIGRACIÓN A SUPABASE AUTH
-- ==========================================

-- CUIDADO: Esto borrará las tablas anteriores (las de prueba) para rehacerlas con la estructura oficial
DROP TABLE IF EXISTS public.mensajes CASCADE;
DROP TABLE IF EXISTS public.registros CASCADE;
DROP TABLE IF EXISTS public.ninos CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.jardin CASCADE;

-- 1. Nueva Tabla de Perfiles vinculada a Supabase Auth
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  rol text NOT NULL CHECK (rol IN ('docente', 'familia')),
  nombre text NOT NULL,
  child_id uuid -- Referencia al niño
);

-- 2. Trigger Automático
-- Cuando creas un usuario desde "Authentication", este código crea su Perfil instantáneamente
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre, rol)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nombre', 'Usuario Nuevo'),
    COALESCE(new.raw_user_meta_data->>'rol', 'familia')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar el trigger si existía y crearlo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Rehacer Tablas (apuntando a profiles en lugar de users)
CREATE TABLE public.ninos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL,
  apellido text NOT NULL,
  sala text NOT NULL,
  avatar text NOT NULL,
  fecha_nacimiento date,
  alergias text,
  familia_id uuid REFERENCES public.profiles(id),
  activo boolean DEFAULT true
);

-- Ahora sí agregamos la clave foránea a perfiles
ALTER TABLE public.profiles ADD CONSTRAINT fk_child FOREIGN KEY (child_id) REFERENCES public.ninos(id) ON DELETE SET NULL;

CREATE TABLE public.registros (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nino_id uuid REFERENCES public.ninos(id) ON DELETE CASCADE,
  docente_id uuid REFERENCES public.profiles(id),
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

CREATE TABLE public.mensajes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nino_id uuid REFERENCES public.ninos(id) ON DELETE CASCADE,
  remitente_id uuid REFERENCES public.profiles(id),
  remitente_nombre text,
  sala text,
  turno text,
  contenido text NOT NULL,
  leido boolean DEFAULT false,
  fecha date NOT NULL,
  hora text
);

CREATE TABLE public.jardin (
  id integer PRIMARY KEY DEFAULT 1,
  nombre text NOT NULL,
  logo_url text
);
INSERT INTO public.jardin (id, nombre, logo_url) VALUES (1, 'Jardín Maternal', null);
