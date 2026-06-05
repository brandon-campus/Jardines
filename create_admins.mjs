import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://enghmaiixdtsjpmnyojk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuZ2htYWlpeGR0c2pwbW55b2prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMzA2MDQsImV4cCI6MjA5NTkwNjYwNH0.Y5of6OB9LaYJjaNQMd154Eh87JlQjQz-6Cfp7x7hD1g';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DEFAULT_JARDIN_ID = '00000000-0000-0000-0000-000000000001';

async function createAdmins() {
  console.log('Creando Superadmin...');
  const res1 = await supabase.auth.signUp({
    email: 'jorge@superadmin.com',
    password: '123456',
    options: {
      data: { nombre: 'Jorge (Superadmin)', rol: 'superadmin', jardin_id: DEFAULT_JARDIN_ID }
    }
  });
  console.log('Superadmin creado:', res1.error ? res1.error.message : 'OK');

  console.log('Creando Admin de Jardín...');
  const res2 = await supabase.auth.signUp({
    email: 'directora@jardin.com',
    password: '123456',
    options: {
      data: { nombre: 'Directora Marta', rol: 'admin_jardin', jardin_id: DEFAULT_JARDIN_ID }
    }
  });
  console.log('Admin Jardín creado:', res2.error ? res2.error.message : 'OK');
}

createAdmins();
