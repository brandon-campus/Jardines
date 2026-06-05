-- VINCULAR USUARIOS EXISTENTES A SUS PERFILES

INSERT INTO public.profiles (id, jardin_id, nombre, rol)
SELECT id, '00000000-0000-0000-0000-000000000001', 'Maestra Ana', 'docente'
FROM auth.users WHERE email = 'brandoncandia.labora@gmail.com'
ON CONFLICT (id) DO UPDATE SET jardin_id = EXCLUDED.jardin_id, rol = EXCLUDED.rol;

INSERT INTO public.profiles (id, jardin_id, nombre, rol)
SELECT id, '00000000-0000-0000-0000-000000000001', 'Familia Candia', 'familia'
FROM auth.users WHERE email = 'universidad.candia@gmail.com'
ON CONFLICT (id) DO UPDATE SET jardin_id = EXCLUDED.jardin_id, rol = EXCLUDED.rol;
