import { supabase } from './supabase';

/**
 * Sube un archivo al bucket 'multimedia' de Supabase y devuelve la URL pública.
 * Genera un nombre de archivo único basado en timestamp.
 */
export async function uploadFile(file: File, folder: 'fotos' | 'videos'): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('multimedia')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return null;
    }

    // Obtener la URL pública
    const { data } = supabase.storage
      .from('multimedia')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadFile:', error);
    return null;
  }
}
