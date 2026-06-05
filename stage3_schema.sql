-- ==========================================
-- SCRIPT DE MIGRACIÓN: ETAPA 3 (MULTIMEDIA Y NOTIFICACIONES)
-- ==========================================

-- 1. TABLA VIDEOS
CREATE TABLE IF NOT EXISTS public.videos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  jardin_id uuid REFERENCES public.jardines(id) ON DELETE CASCADE NOT NULL,
  docente_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  titulo text NOT NULL,
  sala text NOT NULL,
  video_url text NOT NULL,
  thumbnail_url text,
  fecha date DEFAULT CURRENT_DATE,
  created_at timestamp DEFAULT now()
);

-- RLS Videos
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Superadmin ve videos" ON public.videos FOR ALL USING (public.is_superadmin());
CREATE POLICY "Usuarios del jardin ven videos" ON public.videos FOR SELECT USING (jardin_id = public.get_user_jardin_id());
CREATE POLICY "Docentes suben videos" ON public.videos FOR INSERT WITH CHECK (
  jardin_id = public.get_user_jardin_id() AND 
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol IN ('docente', 'admin_jardin')))
);

-- 2. TABLA NOTIFICACIONES
CREATE TABLE IF NOT EXISTS public.notificaciones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  jardin_id uuid REFERENCES public.jardines(id) ON DELETE CASCADE NOT NULL,
  usuario_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  titulo text NOT NULL,
  mensaje text NOT NULL,
  tipo text NOT NULL, -- 'registro', 'mensaje', 'aviso', 'video'
  referencia_id uuid, -- ID del registro o mensaje relacionado
  leida boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- RLS Notificaciones
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Superadmin ve notificaciones" ON public.notificaciones FOR ALL USING (public.is_superadmin());
CREATE POLICY "Usuarios ven sus notificaciones" ON public.notificaciones FOR SELECT USING (usuario_id = auth.uid());
CREATE POLICY "Usuarios pueden marcar como leidas" ON public.notificaciones FOR UPDATE USING (usuario_id = auth.uid());
CREATE POLICY "Staff crea notificaciones" ON public.notificaciones FOR INSERT WITH CHECK (
  jardin_id = public.get_user_jardin_id() AND 
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol IN ('docente', 'admin_jardin', 'superadmin')))
);
-- Familias tambien pueden crear notificaciones para docentes al enviar mensajes
CREATE POLICY "Familias crean notificaciones para docentes" ON public.notificaciones FOR INSERT WITH CHECK (
  jardin_id = public.get_user_jardin_id() AND 
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol = 'familia'))
);

-- 3. BUCKET DE STORAGE "multimedia"
-- Requiere privilegios de admin en Supabase. Si esto falla en el editor SQL estándar por falta de permisos,
-- deberás crear el bucket manualmente desde la UI de Supabase Storage marcándolo como "Public".
INSERT INTO storage.buckets (id, name, public) 
VALUES ('multimedia', 'multimedia', true)
ON CONFLICT (id) DO NOTHING;

-- RLS para Storage (Bucket multimedia)
CREATE POLICY "Cualquiera del jardin puede ver multimedia" ON storage.objects FOR SELECT USING (bucket_id = 'multimedia');
CREATE POLICY "Docentes pueden subir multimedia" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'multimedia' AND 
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND rol IN ('docente', 'admin_jardin', 'superadmin')))
);
