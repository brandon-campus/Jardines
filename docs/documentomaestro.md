# 🌼 Jardín Maternal — Documento Maestro del Proyecto

> Sistema de Seguimiento Diario para Jardines Maternales

| Campo | Detalle |
|---|---|
| **Cliente** | Jorge Santos |
| **Desarrollador** | Brandon Candia — Academia Labora |
| **Versión** | 1.0 — Documento inicial |
| **Stack** | React + Vite + TypeScript + Tailwind + Supabase + Vercel |
| **Modelo de negocio** | SaaS — El jardín paga suscripción mensual/anual |

---

## 1. Visión y Contexto del Producto

Jardín Maternal es una plataforma SaaS multi-tenant que conecta a docentes con las familias de los niños de jardines maternales. Reemplaza el cuaderno de comunicaciones físico —que el 50% de los padres ignora— por un sistema digital con notificaciones en tiempo real.

### Problema que resuelve

- Los padres no leen el cuaderno de comunicaciones del jardín
- Las directoras tienen que insistir repetidamente para que las familias se enteren de novedades
- No existe un canal digital directo entre docentes y familias dentro del contexto del jardín

### Propuesta de valor

- Reporte diario visual del niño (alimentación, siesta, estado de ánimo, temperatura)
- Mensajería directa docente-familia dentro de la app
- Notificaciones push/email cuando se carga el reporte del día o llega un mensaje
- Cada jardín puede personalizar su nombre y logo — modelo white-label
- La directora gestiona de forma autónoma a su equipo docente y a las familias

---

## 2. Arquitectura del Sistema

### 2.1 Modelo Multi-Tenant

La plataforma soporta múltiples jardines de forma aislada. Cada jardín es un tenant independiente: sus docentes, familias, niños y registros no se mezclan con los de otros jardines. El aislamiento se garantiza mediante **Row Level Security (RLS)** en Supabase.

**Flujo de alta de un jardín nuevo:**

1. Jorge (Superadmin) recibe el pago/acuerdo con el jardín
2. Jorge entra al panel Superadmin y crea el jardín con nombre, logo y datos del admin
3. El sistema crea automáticamente la cuenta de Admin Jardín (directora) con sus credenciales
4. La directora entra, configura su jardín y empieza a cargar docentes y familias

### 2.2 Roles del Sistema

| Rol | Descripción | Permisos clave |
|---|---|---|
| **Superadmin** | Jorge Santos — dueño de la plataforma | Crear/activar/desactivar jardines, ver métricas globales, gestionar suscripciones |
| **Admin Jardín** | Directora de cada jardín | Crear docentes y familias, configurar jardín (nombre, logo), ver todos los registros de su jardín |
| **Docente** | Maestra/maestro | Cargar registros diarios, gestionar niños de sus salas, leer mensajes de familias, subir videos |
| **Familia** | Padre o madre del niño | Ver reporte diario de su hijo, ver historial, enviar mensajes a la maestra |

### 2.3 Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | React + Vite + TypeScript + Tailwind CSS |
| **Routing** | React Router v6 |
| **Estado del servidor** | TanStack Query (React Query) |
| **Backend / DB** | Supabase (Auth + PostgreSQL + Storage + Realtime) |
| **Notificaciones** | Supabase Edge Functions + Web Push API o Resend (email) |
| **Deploy** | Vercel (frontend) + Supabase (backend) |
| **Íconos** | Lucide React |
| **Diseño** | Mobile-first, max-w-[480px], paleta naranja + violeta |

---

## 3. Base de Datos (Supabase)

### 3.1 Esquema de Tablas

#### `jardines`
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Identificador único del jardín |
| `nombre` | text | Nombre del jardín maternal |
| `logo_url` | text | URL del logo subido a Supabase Storage |
| `activo` | boolean | Si el jardín está activo (lo activa/desactiva Jorge) |
| `suscripcion` | text | Estado: `activa` / `vencida` / `prueba` |
| `created_at` | timestamp | Fecha de creación |

#### `profiles`
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Igual al `auth.uid()` de Supabase |
| `jardin_id` | uuid FK | Jardín al que pertenece (`null` para Superadmin) |
| `rol` | text | `superadmin` / `admin_jardin` / `docente` / `familia` |
| `nombre` | text | Nombre completo del usuario |
| `avatar_url` | text | Foto de perfil (opcional) |
| `created_at` | timestamp | Fecha de creación |

#### `ninos`
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Identificador único del niño |
| `jardin_id` | uuid FK | Jardín al que pertenece |
| `familia_id` | uuid FK | Profile del familiar vinculado |
| `nombre` | text | Nombre completo del niño |
| `sala` | text | Sala asignada (Maternal, Sala 1, 2, 3...) |
| `foto_url` | text | Foto del niño (opcional) |
| `activo` | boolean | Si el niño está activo en el jardín |
| `created_at` | timestamp | Fecha de alta |

#### `docente_sala`
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Identificador |
| `docente_id` | uuid FK | Profile del docente |
| `jardin_id` | uuid FK | Jardín al que pertenece |
| `sala` | text | Sala que gestiona el docente |

> Un docente puede estar en múltiples salas. Esta tabla es la relación N:N entre docente y sala.

#### `registros_diarios`
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Identificador del registro |
| `nino_id` | uuid FK | Niño al que pertenece el registro |
| `docente_id` | uuid FK | Docente que cargó el registro |
| `jardin_id` | uuid FK | Jardín (para queries rápidas con RLS) |
| `fecha` | date | Fecha del registro (una por día por niño) |
| `desayuno` | text | `todo` / `poco` / `nada` |
| `almuerzo` | text | `todo` / `poco` / `nada` |
| `merienda` | text | `todo` / `poco` / `nada` |
| `popo` | boolean | Si hizo deposición |
| `control_pis` | boolean | Control de pis realizado |
| `siesta_inicio` | time | Hora de inicio de la siesta |
| `siesta_fin` | time | Hora de fin de la siesta |
| `estado_animo` | text | `muy_bien` / `bien` / `regular` / `mal` |
| `temperatura` | decimal | Temperatura en grados (opcional) |
| `medicacion` | boolean | Si recibió medicación |
| `medicacion_obs` | text | Detalle de la medicación administrada |
| `foto_url` | text | Foto del día (Supabase Storage) |
| `observaciones` | text | Observaciones libres de la maestra |
| `created_at` | timestamp | Fecha/hora de carga |

#### `mensajes`
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Identificador del mensaje |
| `jardin_id` | uuid FK | Jardín al que pertenece |
| `remitente_id` | uuid FK | Profile de quien envía |
| `destinatario_id` | uuid FK | Profile de quien recibe |
| `nino_id` | uuid FK | Niño al que refiere el mensaje (opcional) |
| `contenido` | text | Texto del mensaje |
| `leido` | boolean | Si fue leído por el destinatario |
| `created_at` | timestamp | Fecha/hora de envío |

#### `videos`
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Identificador del video |
| `jardin_id` | uuid FK | Jardín al que pertenece |
| `docente_id` | uuid FK | Docente que subió el video |
| `titulo` | text | Título descriptivo del video |
| `video_url` | text | URL en Supabase Storage |
| `thumbnail_url` | text | Miniatura del video (opcional) |
| `created_at` | timestamp | Fecha de subida |

#### `notificaciones`
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Identificador |
| `usuario_id` | uuid FK | Destinatario de la notificación |
| `tipo` | text | `nuevo_reporte` / `nuevo_mensaje` / `aviso_jardin` |
| `referencia_id` | uuid | ID del registro o mensaje relacionado |
| `leida` | boolean | Si fue leída en la app |
| `created_at` | timestamp | Fecha/hora de creación |

### 3.2 Políticas RLS

- **Superadmin:** acceso total a todas las tablas
- **Admin Jardín:** lectura y escritura de todo lo que tenga su `jardin_id`
- **Docente:** lectura/escritura de registros y niños de sus salas asignadas; lectura de mensajes que le llegaron
- **Familia:** solo lectura de los registros de su hijo (vía `nino_id`); escritura de mensajes hacia docentes
- **Regla crítica:** ningún usuario puede ver datos de un jardín distinto al suyo

---

## 4. Pantallas y Flujos

### 4.1 Autenticación

- Login único con email + password (Supabase Auth)
- Al loguearse, el sistema lee el campo `rol` de la tabla `profiles`
- Redirección automática según rol: `/superadmin` | `/admin` | `/teacher` | `/parent`
- Logout disponible en todos los paneles

### 4.2 Panel Superadmin (Jorge)

#### Dashboard
- Total de jardines activos / inactivos
- Total de docentes y familias en la plataforma
- Lista de jardines con: nombre, fecha de alta, estado de suscripción, cantidad de niños

#### Gestión de Jardines
- Crear jardín nuevo: nombre, logo, datos del admin (directora)
- El sistema crea automáticamente la cuenta de Auth + profile de la directora
- Activar / desactivar un jardín (si está inactivo, sus usuarios no pueden entrar)
- Editar datos del jardín

#### Métricas globales
- Jardines creados por mes
- Registros diarios cargados en los últimos 7/30 días

### 4.3 Panel Admin Jardín (Directora)

#### Configuración del Jardín
- Editar nombre e imagen de logo
- Ver estado de suscripción

#### Gestión de Docentes
- Crear cuenta de docente: nombre, email, password temporal, salas asignadas
- Desactivar docente
- Ver registros cargados por cada docente

#### Gestión de Familias
- Crear cuenta de familia: nombre, email, password temporal, niño vinculado
- Cada cuenta de familia se vincula a **un solo niño**
- Desactivar familia

#### Gestión de Niños
- Alta/baja de niños: nombre, sala, foto, familia vinculada
- Ver historial de registros de cada niño

### 4.4 Panel Docente

#### Tab: Hoy
- Lista de niños de sus salas con indicador: ✅ Registrado / ⏳ Pendiente
- Filtro rápido por sala
- Tap en un niño abre el formulario de registro diario

#### Formulario de Registro Diario
- **Alimentación:** desayuno / almuerzo / merienda → `todo` / `poco` / `nada`
- **Control de pañal:** popó (sí/no) + control de pis (sí/no)
- **Siesta:** hora de inicio y hora de fin
- **Estado de ánimo:** selector de emojis (muy bien / bien / regular / mal)
- **Temperatura:** campo numérico (opcional)
- **Medicación:** toggle + campo de observación si aplica
- **Foto del día:** upload a Supabase Storage
- **Observaciones libres:** textarea
- Al guardar: INSERT en `registros_diarios` + dispara notificación a la familia

#### Tab: Historial
- Todos los registros guardados, filtro por fecha y por niño

#### Tab: Mensajes
- Bandeja de entrada con mensajes de familias
- Responder mensaje (crea nuevo mensaje con destinatario invertido)
- Indicador de no leídos

#### Tab: Videos
- Subir video: título + archivo
- Galería de videos del jardín

### 4.5 Panel Familia

#### Tab: Hoy
- Reporte visual del día de su hijo
- Muestra: foto del día, alimentación con colores, siesta, estado de ánimo, temperatura, observaciones
- Si no hay reporte aún: mensaje *"La maestra todavía no cargó el reporte de hoy"*

#### Tab: Historial
- Lista de reportes anteriores ordenados por fecha
- Tap en un día abre el detalle del reporte

#### Tab: Mensajes
- Redactar mensaje a la maestra
- Ver respuestas de la maestra
- Indicador de no leídos

---

## 5. Notificaciones

El sistema envía notificaciones en dos canales: **push (web)** y **email**. Se disparan mediante Supabase Edge Functions o triggers de base de datos.

### Eventos que generan notificación

| Evento | Destinatario | Canal |
|---|---|---|
| Docente guarda registro diario | Familia del niño | Push + Email |
| Familia envía mensaje al docente | Docente correspondiente | Push |
| Docente responde mensaje a familia | Familia | Push + Email |
| Aviso del jardín (admin) | Todas las familias | Push + Email |

### Implementación recomendada

- **Resend** para emails transaccionales (vía Supabase Edge Functions)
- **Web Push API** para notificaciones push en el navegador mobile
- Tabla `notificaciones` para historial y estado de lectura in-app

---

## 6. Roadmap de Desarrollo

### Fase 1 — Base (Semana 1)
1. Setup: React + Vite + TypeScript + Tailwind + Supabase
2. Esquema de base de datos completo con RLS
3. Sistema de Auth con redirección por rol
4. Panel Docente: Tab Hoy + Formulario de Registro
5. Panel Familia: Tab Hoy (reporte del día)

### Fase 2 — Gestión (Semana 2)
1. Panel Admin Jardín: gestión de docentes, familias y niños
2. Panel Docente: Tabs Historial y Mensajes
3. Panel Familia: Tabs Historial y Mensajes
4. Sistema de mensajería bidireccional

### Fase 3 — Superadmin + Notificaciones (Semana 3)
1. Panel Superadmin: dashboard + gestión de jardines
2. Creación automática de cuenta admin al dar de alta un jardín
3. Notificaciones push y email con Supabase Edge Functions
4. Tab Videos en panel docente
5. Testing, ajustes y deploy en Vercel

### ⚠️ Decisiones pendientes (consensuar con Jorge)
- Precio de la suscripción por jardín y modelo de cobro (MercadoPago / transferencia)
- Cantidad máxima de niños o docentes por plan
- Período de prueba gratuita para jardines nuevos
- Dominio propio de la app (ej: `jardinmaternal.app`)
- Soporte para múltiples familiares por niño en el futuro

---

## 7. Prompt Maestro para Antigravity

> Pegar este prompt junto con el archivo `jardin-v2.html` como referencia visual al iniciar el proyecto.

```
Quiero construir una aplicación web SaaS multi-tenant llamada "Jardín Maternal".
El archivo HTML adjunto es el prototipo de referencia visual y lógica.

Stack: React + Vite + TypeScript + Tailwind CSS + Supabase + Vercel.

Tiene 4 roles: superadmin, admin_jardin, docente, familia.
Cada jardín es un tenant aislado con RLS en Supabase.
Un docente puede estar en múltiples salas (tabla docente_sala).
Una familia se vincula a un solo niño.
Las notificaciones se envían vía Supabase Edge Functions + Resend (email) y Web Push API.

Empezá por:
1. Configuración del proyecto (Vite + React + TS + Tailwind + Supabase client)
2. Esquema de base de datos completo con RLS (ver documento maestro)
3. Sistema de Auth con contexto de usuario y redirección por rol
4. Layout base mobile-first con bottom navigation (max-w-[480px])
5. Panel Docente — Tab "Hoy": lista de niños con estado registrado/pendiente
```