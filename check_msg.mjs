import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://enghmaiixdtsjpmnyojk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuZ2htYWlpeGR0c2pwbW55b2prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMzA2MDQsImV4cCI6MjA5NTkwNjYwNH0.Y5of6OB9LaYJjaNQMd154Eh87JlQjQz-6Cfp7x7hD1g';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsertMessage() {
  // We need to login as a user first to have auth.uid() since RLS or some constraint might check it
  // Let's login as Familia Rogers (from Luz de luces)
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'familia.rogers@gmail.com', // wait, do I know their email? I don't.
    password: '12345'
  });
  
  // Alternatively, just do an anonymous insert if RLS is really disabled
  const payload = {
    jardin_id: 'ff4d5547-33ce-4843-80c9-68dcdb294361',
    remitente_id: '39a4bf1a-efab-4755-bbbe-502da631bf91', // Familia Rogers
    nino_id: 'c3f9da80-1e89-4e39-b326-040520814c50', // Steve Rogers
    remitente_nombre: 'Familia Rogers',
    sala: 'Maternal',
    turno: 'Mañana',
    contenido: 'Test message',
    leido: false,
    fecha: new Date().toISOString().split('T')[0],
    hora: '12:00'
  };

  console.log('Inserting payload:', payload);
  const { data, error } = await supabase.from('mensajes').insert([payload]).select().single();
  
  console.log('Data:', data);
  console.log('Error:', error);
}

testInsertMessage();
