# Focalize — Arquitectura y Alcance del Proyecto

Aplicación personal de productividad mono-usuario desplegada en Vercel como app serverless.

---

## Alcance de la aplicación

### Funcionalidades principales

- Registro y gestión de tareas categorizadas por la **Matriz Eisenhower** (4 cuadrantes)
- Cada tarea puede tener una **sublista de actividades** (checklist interno)
- Registro de **eventos con fecha** (preparado para integración futura con Google Calendar)
- **Notificaciones al final del día** para tareas importantes incompletas (vía WhatsApp y/o Gmail, configurable por el usuario)
- **Vista Kanban por día** y **vista Calendario** mensual/semanal
- **PWA instalable** en móvil sin necesidad de App Store ni Play Store
- **Magic link por email** como método de autenticación
- Soporte completo **Light / Dark mode** (sigue la preferencia del sistema)

### Matriz Eisenhower

| | Urgente | No urgente |
|---|---|---|
| **Importante** | Q1 — Hacer ya | Q3 — Planificar |
| **No importante** | Q2 — Delegar | Q4 — Eliminar |

### Reglas de notificaciones

- Las tareas en **Q1 (Urgente + Importante)** que no se completen en el día disparan el recordatorio nocturno
- Las tareas en otros cuadrantes **no envían notificación**
- El usuario configura en Settings: canal (WhatsApp / Email / ambos) y hora del envío

---

## Stack tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| Frontend + Backend | **Next.js 15** (App Router) | Un solo repo, serverless nativo en Vercel, API Routes integradas |
| Base de datos | **Neon** (Serverless Postgres) | Free tier 0.5 GB, integración nativa con Vercel, auto-pause sin costos idle |
| ORM | **Prisma** | Type-safe, migraciones automáticas, soporte perfecto con Neon |
| Autenticación | **Auth.js v5** + proveedor Email | Magic link sin contraseña, cookie httpOnly segura, sin registro público |
| Email | **Resend** | 3000 emails/mes gratis, SDK sencillo, usado para magic link y notificaciones |
| WhatsApp | **CallMeBot** | Gratuito para uso personal, sin cuenta de negocio, integración en 1 línea |
| Cron jobs | **Vercel Cron Jobs** | Incluido en plan Hobby, dispara el recordatorio nocturno diario |
| PWA | **next-pwa** | Instalable en móvil desde el navegador, sin App Store |
| Estilos | **Tailwind CSS + shadcn/ui** | Sistema de diseño coherente, dark/light mode nativo |
| Iconos | **Lucide React** | SVG vectoriales, consistentes, soportan theming |

### Por qué Neon y no otras bases de datos

| Base de datos | Decisión | Razón |
|---|---|---|
| **Neon** | ✅ Elegida | Postgres real, free tier generoso, Vercel add-on directo |
| Supabase | ❌ | Demasiadas features innecesarias, más complejo de operar |
| PlanetScale | ❌ | Eliminó el free tier |
| Turso | ❌ | SQLite edge, menos maduro con Prisma |
| MongoDB Atlas | ❌ | NoSQL no encaja bien con DDD y relaciones |

---

## Arquitectura DDD — Estructura de carpetas

```
src/
├── domain/                              # Núcleo de negocio puro (sin dependencias externas)
│   ├── task/
│   │   ├── Task.ts                      # Entidad principal
│   │   ├── SubItem.ts                   # Entidad sublista de actividades
│   │   ├── EisenhowerQuadrant.ts        # Value Object: Q1 | Q2 | Q3 | Q4
│   │   └── ITaskRepository.ts           # Interfaz del repositorio
│   ├── event/
│   │   ├── Event.ts                     # Entidad evento con fecha y hora
│   │   └── IEventRepository.ts
│   └── notification/
│       ├── NotificationConfig.ts        # Configuración: canal, hora, teléfono
│       └── INotificationService.ts      # Interfaz del servicio de notificación
│
├── application/                         # Casos de uso (orquestan el dominio)
│   ├── task/
│   │   ├── CreateTaskUseCase.ts
│   │   ├── UpdateTaskUseCase.ts
│   │   ├── CompleteTaskUseCase.ts
│   │   ├── DeleteTaskUseCase.ts
│   │   ├── GetTasksByQuadrantUseCase.ts
│   │   └── GetTasksByDateUseCase.ts
│   ├── event/
│   │   ├── CreateEventUseCase.ts
│   │   └── GetEventsByMonthUseCase.ts
│   └── notification/
│       ├── SendDailyReminderUseCase.ts
│       └── UpdateNotificationConfigUseCase.ts
│
├── infrastructure/                      # Implementaciones concretas
│   ├── db/
│   │   ├── prisma/
│   │   │   └── schema.prisma            # Esquema de base de datos
│   │   ├── PrismaTaskRepository.ts      # Implementa ITaskRepository
│   │   └── PrismaEventRepository.ts     # Implementa IEventRepository
│   └── notifications/
│       ├── ResendEmailService.ts        # Implementa INotificationService via Resend
│       └── CallMeBotWhatsAppService.ts  # Implementa INotificationService via CallMeBot
│
└── presentation/                        # Next.js: UI + API Routes
    ├── app/
    │   ├── (auth)/
    │   │   └── login/
    │   │       └── page.tsx             # Pantalla de magic link
    │   ├── (app)/
    │   │   ├── layout.tsx               # Layout autenticado con nav
    │   │   ├── page.tsx                 # Dashboard: tablero Eisenhower
    │   │   ├── calendar/
    │   │   │   └── page.tsx             # Vista calendario mensual/semanal
    │   │   └── settings/
    │   │       └── page.tsx             # Config de notificaciones
    │   └── api/
    │       ├── auth/[...nextauth]/      # Auth.js magic link
    │       ├── tasks/                   # CRUD de tareas y subitems
    │       ├── events/                  # CRUD de eventos
    │       └── cron/
    │           └── daily-reminder/      # Endpoint invocado por Vercel Cron
    └── components/
        ├── ui/                          # shadcn/ui: Button, Card, Dialog, etc.
        ├── eisenhower/                  # Tablero 4 cuadrantes con drag & drop
        ├── calendar/                    # Componente calendario
        ├── task/                        # TaskCard, SubItemList, TaskSheet
        └── layout/                      # Navbar, Sidebar, BottomNav (mobile)
```

---

## Pantallas de la aplicación

| Pantalla | Ruta | Descripción |
|---|---|---|
| Login | `/login` | Campo de email, envío de magic link, confirmación |
| Dashboard Eisenhower | `/` | 4 cuadrantes con tareas, drag & drop entre cuadrantes |
| Vista Día / Kanban | `/` (toggle) | Tareas del día en columnas: Pendiente → En progreso → Hecho |
| Vista Calendario | `/calendar` | Eventos y tareas con fecha en vista mensual/semanal |
| Detalle de tarea | Modal/Sheet | Título, cuadrante, sublista de items, fecha límite, notas |
| Settings | `/settings` | Toggle WhatsApp/Email, teléfono, hora del recordatorio |

---

## Flujo de notificaciones nocturnas

```
Vercel Cron (hora configurable, ej: 20:00)
  → POST /api/cron/daily-reminder
  → SendDailyReminderUseCase
      → Consulta tareas Q1 (Urgente + Importante) incompletas del día actual
      → Si hay tareas pendientes:
          → Lee NotificationConfig del usuario
          → Si canal = Email  → ResendEmailService.send()
          → Si canal = WhatsApp → CallMeBotWhatsAppService.send()
          → Si canal = Ambos   → ambos servicios
      → Si no hay tareas pendientes → no envía nada
```

---

## Esquema de base de datos (Prisma)

```prisma
model Task {
  id          String            @id @default(cuid())
  title       String
  description String?
  quadrant    EisenhowerQuadrant
  status      TaskStatus        @default(PENDING)
  dueDate     DateTime?
  completedAt DateTime?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  subItems    SubItem[]
}

model SubItem {
  id        String   @id @default(cuid())
  title     String
  done      Boolean  @default(false)
  order     Int
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
}

model Event {
  id          String   @id @default(cuid())
  title       String
  description String?
  startAt     DateTime
  endAt       DateTime?
  allDay      Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model NotificationConfig {
  id            String  @id @default(cuid())
  emailEnabled  Boolean @default(true)
  whatsappEnabled Boolean @default(false)
  whatsappPhone String?
  reminderHour  Int     @default(20)  // 0-23
}

enum EisenhowerQuadrant {
  Q1  // Urgente + Importante
  Q2  // No urgente + Importante
  Q3  // Urgente + No importante
  Q4  // No urgente + No importante
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  DONE
}
```

---

## PWA — Instalación en móvil

- Se instala desde el navegador sin App Store ni Play Store
- **iOS Safari**: Compartir → "Agregar a pantalla de inicio"
- **Android Chrome**: Menú → "Instalar app" o banner automático
- Abre sin barra del navegador, se ve como app nativa
- Service Worker cachea la última sesión para uso offline parcial
- No se requiere cuenta de desarrollador Apple ni Android

---

## Variables de entorno necesarias

```env
# Base de datos
DATABASE_URL=

# Auth.js
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Resend (email)
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# CallMeBot (WhatsApp - se configura desde Settings en la app)
# No requiere API key, solo el número verificado del usuario

# Vercel Cron (protección del endpoint)
CRON_SECRET=
```

---

## Despliegue en Vercel

1. Push del repo a GitHub
2. Importar proyecto en Vercel
3. Agregar **Neon Postgres** desde el Marketplace de Vercel (un click, configura `DATABASE_URL` automáticamente)
4. Configurar las demás variables de entorno en el dashboard de Vercel
5. Configurar el Cron Job en `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-reminder",
      "schedule": "0 20 * * *"
    }
  ]
}
```

6. `vercel deploy` — listo

---

## Integraciones futuras planificadas

- **Google Calendar**: los eventos ya tienen la estructura de datos compatible (`startAt`, `endAt`, `allDay`), solo faltará agregar el OAuth de Google y la sincronización bidireccional
- **Notificaciones push nativas** (Web Push API): complemento a las notificaciones nocturnas para alertas en tiempo real

---

## Diseño UI/UX

- **Skill activo**: ui-ux-pro-max
- **Tema**: Light / Dark mode (sigue preferencia del sistema)
- **Mobile-first**: diseño desde 375px hacia arriba
- **Breakpoints**: 375 / 768 / 1024 / 1440
- **Espaciado**: sistema 4/8dp
- **Touch targets**: mínimo 44×44px
- **Iconos**: Lucide React (SVG, sin emojis como íconos estructurales)
- **Navegación móvil**: Bottom Navigation Bar (máx 4 items)
- **Navegación desktop**: Sidebar colapsable
