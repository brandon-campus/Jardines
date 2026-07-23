import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Read .env manually
const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.join('=').trim();
  }
});

const supabaseUrl = envVars['VITE_SUPABASE_URL'];
const supabaseKey = envVars['VITE_SUPABASE_ANON_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Fetching kids...');
  const { data: kids, error } = await supabase.from('ninos').select('*');
  if (error) {
    console.error('Error fetching kids:', error);
    return;
  }
  
  console.log(`Found ${kids.length} kids.`);
  
  for (const kid of kids) {
    if (kid.avatar && (kid.avatar.includes('avataaars') || kid.avatar.includes('adventurer'))) {
      const newAvatar = `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${kid.nombre}`;
      const { error: updateError } = await supabase.from('ninos').update({ avatar: newAvatar }).eq('id', kid.id);
      if (updateError) {
        console.error(`Error updating kid ${kid.id}:`, updateError);
      } else {
        console.log(`Updated kid ${kid.nombre} avatar to fun-emoji`);
      }
    }
  }
  console.log('Done.');
}

main();
