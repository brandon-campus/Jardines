import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://enghmaiixdtsjpmnyojk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuZ2htYWlpeGR0c2pwbW55b2prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMzA2MDQsImV4cCI6MjA5NTkwNjYwNH0.Y5of6OB9LaYJjaNQMd154Eh87JlQjQz-6Cfp7x7hD1g';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DEFAULT_JARDIN_ID = '00000000-0000-0000-0000-000000000001';

async function createUsers() {
  console.log('Creando docente...');
  const res1 = await supabase.auth.signUp({
    email: 'brandoncandia.labora@gmail.com',
    password: '123456',
    options: {
      data: { nombre: 'Maestra Ana', rol: 'docente', jardin_id: DEFAULT_JARDIN_ID }
    }
  });
  console.log('Docente creado:', res1.error ? res1.error.message : 'OK');

  console.log('Creando familia...');
  const res2 = await supabase.auth.signUp({
    email: 'universidad.candia@gmail.com',
    password: '123456',
    options: {
      data: { nombre: 'Familia Candia', rol: 'familia', jardin_id: DEFAULT_JARDIN_ID }
    }
  });
  console.log('Familia creada:', res2.error ? res2.error.message : 'OK');
}

createUsers();
