# 🌼 SMOKE TEST — Jardín Maternal

**Fecha:** ___________  **Testeador:** ___________

**Ambiente:** ☐ Local  ☐ Staging  ☐ Production

**URL testeada:** ___________________________________________

---

## A) AUTENTICACIÓN Y ROLES

> Testear con 4 cuentas distintas: superadmin, admin_jardin, docente, familia

☐ Puedo iniciar sesión como **Superadmin** (Jorge) y me redirige a `/superadmin`  
☐ Puedo iniciar sesión como **Admin Jardín** (directora) y me redirige a `/admin`  
☐ Puedo iniciar sesión como **Docente** y me redirige a `/teacher`  
☐ Puedo iniciar sesión como **Familia** y me redirige a `/parent`  
☐ Las credenciales incorrectas muestran error (no rompen la app)  
☐ La sesión persiste al recargar la página  
☐ Un usuario sin sesión es redirigido al login  
☐ Un docente NO puede acceder a rutas de `/admin` ni `/superadmin`  
☐ Una familia NO puede acceder a rutas de `/teacher` ni `/admin`  
☐ Puedo cerrar sesión desde cualquier panel  

---

## B) PANEL SUPERADMIN (Jorge)

☐ Veo el dashboard con total de jardines activos/inactivos  
☐ Veo la lista de jardines con nombre, estado de suscripción y cantidad de niños  
☐ Puedo **crear un jardín nuevo** con nombre, logo y datos de la directora  
☐ Al crear el jardín, se genera automáticamente la cuenta de la directora  
☐ Puedo **activar** un jardín inactivo  
☐ Puedo **desactivar** un jardín activo  
☐ Cuando un jardín está desactivado, sus usuarios NO pueden iniciar sesión  
☐ Puedo editar el nombre o logo de un jardín existente  
☐ Las métricas (jardines por mes, registros cargados) muestran datos reales  

---

## C) PANEL ADMIN JARDÍN (Directora)

### Configuración
☐ Puedo editar el **nombre del jardín** y se actualiza en la app  
☐ Puedo subir/cambiar el **logo del jardín** y se muestra correctamente  
☐ Solo veo datos de MI jardín (no de otros jardines)  

### Gestión de Docentes
☐ Puedo **crear un docente** con nombre, email y salas asignadas  
☐ El docente creado recibe credenciales y puede iniciar sesión  
☐ Un docente puede tener **múltiples salas** asignadas  
☐ Puedo **desactivar** un docente (ya no puede entrar)  
☐ Puedo ver qué registros cargó cada docente  

### Gestión de Familias
☐ Puedo **crear una cuenta de familia** con nombre, email y niño vinculado  
☐ Cada familia está vinculada a **un solo niño** (no permite vincular dos)  
☐ Puedo **desactivar** una familia  

### Gestión de Niños
☐ Puedo **dar de alta un niño** con nombre, sala y foto  
☐ Puedo asignarle una familia al niño  
☐ Puedo **dar de baja** un niño (queda inactivo, no se borra)  
☐ Puedo ver el historial de registros de un niño específico  

---

## D) PANEL DOCENTE

### Tab: Hoy
☐ Veo la lista de niños de **mis salas asignadas** (no de otras salas)  
☐ Cada niño muestra su estado: ✅ Registrado / ⏳ Pendiente  
☐ El filtro por sala funciona correctamente  
☐ Al tocar un niño que ya tiene registro, veo el registro cargado  
☐ Al tocar un niño sin registro, abre el formulario en blanco  

### Formulario de Registro Diario
☐ Puedo seleccionar **alimentación** (desayuno/almuerzo/merienda): todo / poco / nada  
☐ Puedo registrar **popó** (sí/no) y **control de pis** (sí/no)  
☐ Puedo ingresar **hora de inicio y fin de siesta**  
☐ Puedo seleccionar **estado de ánimo** con emojis  
☐ Puedo ingresar **temperatura** (campo opcional)  
☐ Puedo activar **medicación** y agregar observación  
☐ Puedo **subir una foto** del día  
☐ Puedo escribir **observaciones libres**  
☐ Al guardar: el registro se guarda correctamente en la DB  
☐ Al guardar: el estado del niño cambia a ✅ Registrado en el tab Hoy  
☐ Al guardar: **la familia recibe una notificación** (push o email)  
☐ No puedo cargar dos registros para el mismo niño el mismo día  

### Tab: Historial
☐ Veo todos los registros anteriores ordenados por fecha  
☐ El filtro por fecha funciona  
☐ El filtro por niño funciona  
☐ Puedo ver el detalle de un registro anterior  

### Tab: Mensajes
☐ Veo los mensajes recibidos de familias  
☐ Veo indicador de mensajes **no leídos**  
☐ Puedo **responder** un mensaje y se envía correctamente  
☐ Al responder: la familia recibe notificación  
☐ Los mensajes están ordenados del más reciente al más antiguo  

### Tab: Videos
☐ Puedo **subir un video** con título  
☐ El video aparece en la galería después de subir  
☐ Puedo reproducir un video subido  

---

## E) PANEL FAMILIA

### Tab: Hoy
☐ Veo el reporte del día de **mi hijo** (solo el mío)  
☐ El reporte muestra: alimentación, siesta, estado de ánimo, temperatura, foto, observaciones  
☐ Si no hay reporte cargado, veo el mensaje *"La maestra todavía no cargó el reporte de hoy"*  
☐ NO puedo ver reportes de otros niños  

### Tab: Historial
☐ Veo los reportes anteriores de mi hijo ordenados por fecha  
☐ Puedo abrir el detalle de un reporte anterior  

### Tab: Mensajes
☐ Puedo **redactar y enviar un mensaje** a la maestra  
☐ El mensaje llega correctamente al panel del docente  
☐ Veo las **respuestas de la maestra**  
☐ Veo indicador de mensajes no leídos  

---

## F) NOTIFICACIONES

☐ La familia recibe **notificación push** cuando se carga el reporte del día  
☐ La familia recibe **email** cuando se carga el reporte del día  
☐ El docente recibe **notificación push** cuando una familia envía un mensaje  
☐ La familia recibe notificación cuando el docente responde su mensaje  
☐ Las notificaciones tienen el texto correcto (no placeholders vacíos)  

---

## G) AISLAMIENTO MULTI-TENANT (crítico)

> Este bloque requiere tener al menos 2 jardines creados con datos distintos

☐ Un docente del Jardín A **NO ve** los niños del Jardín B  
☐ Una familia del Jardín A **NO ve** registros del Jardín B  
☐ El Admin del Jardín A **NO puede** editar datos del Jardín B  
☐ Los mensajes del Jardín A **no aparecen** en el Jardín B  
☐ Las RLS de Supabase bloquean correctamente (verificar en logs de Supabase)  

---

## H) NAVEGACIÓN Y UX

☐ El bottom navigation funciona en todos los paneles  
☐ El botón "atrás" del navegador no rompe la app  
☐ No hay rutas que den error 404  
☐ La app se ve correctamente en **mobile** (max 480px)  
☐ La app se ve correctamente en **desktop** (centrada)  
☐ Las imágenes y logos cargan correctamente  
☐ Los estados de carga (loading spinners) aparecen donde corresponde  
☐ Los estados vacíos tienen mensaje claro (no pantallas en blanco)  

---

## I) CONSOLA Y BACKEND

☐ No hay errores críticos en la consola del navegador (F12)  
☐ No hay warnings rojos importantes  
☐ Las requests a Supabase responden 200/201 (no 400/500)  
☐ Las fotos y videos se guardan correctamente en **Supabase Storage**  
☐ No hay errores en los logs de Supabase Edge Functions  
☐ Las políticas RLS están activas en todas las tablas  

---

## RESULTADO FINAL

☐ ✅ **PASA** — Listo para entregar a Jorge  
☐ ⚠️ **PASA CON OBSERVACIONES** — Funciona pero hay mejoras menores  
☐ ❌ **FALLA** — Hay bugs críticos que resolver antes de entregar  

---

## Bugs encontrados

| # | Descripción | Severidad | Panel afectado |
|---|---|---|---|
| 1 | | ☐ Crítico ☐ Medio ☐ Menor | |
| 2 | | ☐ Crítico ☐ Medio ☐ Menor | |
| 3 | | ☐ Crítico ☐ Medio ☐ Menor | |
| 4 | | ☐ Crítico ☐ Medio ☐ Menor | |
| 5 | | ☐ Crítico ☐ Medio ☐ Menor | |

---

## Cuentas de prueba utilizadas

| Rol | Email | Jardín |
|---|---|---|
| Superadmin | | — |
| Admin Jardín | | |
| Docente | | |
| Familia | | |