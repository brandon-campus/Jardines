import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables")
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar autenticación del solicitante
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error("No authorization header")
    
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { action, payload } = await req.json()

    // 1. Acción: create-jardin (Solo Superadmin)
    if (action === 'create-jardin') {
      const { data: callerProfile } = await supabase.from('profiles').select('rol').eq('id', user.id).single()
      if (callerProfile?.rol !== 'superadmin') {
        throw new Error('Solo superadmins pueden crear jardines')
      }

      const { nombre, logo_url, admin_nombre, admin_email, admin_password } = payload

      // Crear el jardín
      const { data: jardinData, error: jardinError } = await supabase
        .from('jardines')
        .insert([{ nombre, logo_url }])
        .select()
        .single()
        
      if (jardinError) throw jardinError

      // Crear cuenta del Admin del jardín
      const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
        email: admin_email,
        password: admin_password,
        email_confirm: true,
        user_metadata: {
          nombre: admin_nombre,
          rol: 'admin_jardin',
          jardin_id: jardinData.id
        }
      })

      // Si falla la creación del user, idealmente se haría rollback del jardín, pero para este MVP:
      if (adminError) throw adminError

      return new Response(JSON.stringify({ success: true, jardin: jardinData, admin: adminData.user }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. Acción: create-user (Admin Jardín o Superadmin)
    if (action === 'create-user') {
      const { data: callerProfile } = await supabase.from('profiles').select('rol, jardin_id').eq('id', user.id).single()
      if (callerProfile?.rol !== 'admin_jardin' && callerProfile?.rol !== 'superadmin') {
        throw new Error('No tienes permisos para crear usuarios')
      }

      const { nombre, email, password, rol, salas, child_id } = payload
      const targetJardinId = payload.jardin_id || callerProfile?.jardin_id

      // Crear cuenta de auth
      const { data: newUserData, error: newUserError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          nombre,
          rol,
          jardin_id: targetJardinId
        }
      })

      if (newUserError) throw newUserError

      // Si es docente y tiene salas, asignarlas
      if (rol === 'docente' && salas && salas.length > 0) {
        const docenteSalas = salas.map((s: string) => ({
          docente_id: newUserData.user.id,
          jardin_id: targetJardinId,
          sala: s
        }))
        const { error: salaError } = await supabase.from('docente_sala').insert(docenteSalas)
        if (salaError) console.error("Error insertando docente_sala", salaError)
      }

      // Si es familia y tiene un child_id, vincularlos mutuamente
      if (rol === 'familia' && child_id) {
         // El trigger handle_new_user corre asincrónicamente o antes, asegurémonos de que el profile exista
         // usando un pequeño delay o simplemente un update con upsert false.
         await supabase.from('profiles').update({ child_id }).eq('id', newUserData.user.id)
         await supabase.from('ninos').update({ familia_id: newUserData.user.id }).eq('id', child_id)
      }

      return new Response(JSON.stringify({ success: true, user: newUserData.user }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Acción desconocida' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
