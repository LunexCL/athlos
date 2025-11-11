# 🏋️ Athlos - SaaS para Profesores, Kinesiólogos y Entrenadores

Plataforma multiusuario para gestión de agenda, pagos por clase y planificación de rutinas.

## 📚 Stack Tecnológico

- **Frontend:** Ionic + React + TypeScript
- **Estilos:** Tailwind CSS + shadcn/ui
- **Backend:** Firebase (Auth, Firestore, Functions, Hosting)
- **Pagos:** Flow (Chile - CLP)
- **Integración:** Google Calendar (OAuth 2.0)

---

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js 18+ (recomendado: v20 LTS)
- npm o pnpm
- Firebase CLI (`npm install -g firebase-tools`)
- Cuenta de Firebase activa

### 1. Instalación

```bash
# Clonar repositorio
git clone https://github.com/sebaguerrerof/athlos.git
cd athlos

# Instalar dependencias del frontend
npm install

# Instalar dependencias de Functions
cd functions
npm install
cd ..
```

### 2. Configuración de Variables de Entorno

Copia el archivo `.env.example` y renómbralo a `.env.local`:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales de Firebase:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_FIREBASE_MEASUREMENT_ID=tu_measurement_id

# Activar emuladores en desarrollo
VITE_USE_FIREBASE_EMULATOR=true
```

### 3. Configurar Firebase

```bash
# Login a Firebase (solo primera vez)
firebase login

# Seleccionar proyecto
firebase use --add

# Descargar emulators (solo primera vez)
firebase setup:emulators:firestore
firebase setup:emulators:functions
```

---

## 🛠️ Comandos de Desarrollo

### Frontend (Ionic + React)

```bash
# Modo desarrollo con hot reload
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Tests
npm run test

# Lint
npm run lint
```

### Firebase Emulators

⚠️ **Requisito:** Instalar Java JDK 11+ ([Adoptium](https://adoptium.net/))

```bash
# Iniciar todos los emulators
npm run emulators

# O manualmente
firebase emulators:start

# Solo Firestore y Auth
firebase emulators:start --only firestore,auth

# Con importación de datos (seed)
firebase emulators:start --import=./emulator-data --export-on-exit
```

**Emulators disponibles:**
- **Auth:** http://localhost:9099
- **Firestore:** http://localhost:8080
- **Functions:** http://localhost:5001
- **Hosting:** http://localhost:5000
- **Emulator UI:** http://localhost:4000

### Firebase Functions

```bash
cd functions

# Compilar TypeScript
npm run build

# Watch mode (auto-compile)
npm run build:watch

# Deploy a producción
firebase deploy --only functions

# Deploy función específica
firebase deploy --only functions:onUserCreated
```

---

## 📂 Estructura del Proyecto

```
athlos/
├── .github/
│   └── workflows/              # CI/CD con GitHub Actions
├── functions/
│   ├── src/
│   │   ├── auth/               # Auth triggers (onUserCreated)
│   │   ├── clients/            # Client management functions
│   │   ├── calendar/           # Calendar & appointments
│   │   ├── payments/           # Flow payment integration
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── public/
│   └── assets/                 # Static assets
├── src/
│   ├── app/
│   │   └── features/
│   │       ├── auth/           # Authentication (login, register)
│   │       ├── tenants/        # Multi-tenant management
│   │       ├── clients/        # Client CRUD
│   │       ├── calendar/       # Agenda & availability
│   │       ├── payments/       # Payment flow
│   │       ├── activities/     # Activity tracking
│   │       └── routines/       # Routine planning
│   ├── components/
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/
│   │   ├── firebase.ts         # Firebase initialization
│   │   ├── auth.ts             # Auth helpers
│   │   ├── firestore.ts        # Firestore helpers
│   │   └── utils.ts            # Utility functions
│   ├── theme/
│   │   └── variables.css       # Ionic CSS variables
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example                # Environment template
├── .env.local                  # Local environment (gitignored)
├── firebase.json               # Firebase configuration
├── firestore.rules             # Firestore security rules
├── firestore.indexes.json      # Firestore indexes
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
├── package.json
├── AGENT_ROLE.md               # Rol del agente IA
├── SPRINTS.md                  # Planificación de sprints
└── README.md
```

---

## 🔥 Firebase Setup

### Firestore Collections Structure

```
users/
  {uid}/
    - email: string
    - displayName: string
    - role: 'owner' | 'instructor' | 'client'
    - tenantId: string
    - createdAt: Timestamp
    - updatedAt: Timestamp

tenants/
  {tenantId}/
    - name: string
    - ownerId: string
    - plan: 'free' | 'pro'
    - settings: {}
    - createdAt: Timestamp

    /clients/
      {clientId}/
        - email: string
        - name: string
        - phone: string
        - status: 'invited' | 'active' | 'inactive'

    /appointments/
      {appointmentId}/
        - clientId: string
        - startTime: Timestamp
        - endTime: Timestamp
        - status: 'pending' | 'confirmed' | 'completed'
```

### Security Rules

Las reglas de Firestore validan:
- Usuario autenticado
- Acceso solo a su tenant (`tenantId` en custom claims)
- Roles y permisos específicos

Ver `firestore.rules` para más detalles.

---

## 🧪 Testing

### Emulators (Recomendado)

```bash
# Iniciar emulators en una terminal
firebase emulators:start

# En otra terminal, correr la app
npm run dev
```

### Unit Tests

```bash
# Correr tests con Vitest
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

---

## 🚢 Deployment

### Build Producción

```bash
# Build del frontend
npm run build

# Build de functions
cd functions && npm run build && cd ..
```

### Deploy a Firebase Hosting

```bash
# Deploy completo (hosting + functions + rules)
firebase deploy

# Solo hosting
firebase deploy --only hosting

# Solo functions
firebase deploy --only functions

# Solo rules
firebase deploy --only firestore:rules
```

### Deploy con GitHub Actions

Los workflows automáticos están en `.github/workflows/`:
- **Pull Request:** Preview deploy
- **Merge a main:** Production deploy

---

## 📖 Documentación Adicional

- [AGENT_ROLE.md](./AGENT_ROLE.md) - Rol y responsabilidades del agente IA
- [SPRINTS.md](./SPRINTS.md) - Planificación detallada de sprints
- [Ionic Docs](https://ionicframework.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

---

## 🐛 Troubleshooting

### Error: "Firebase emulator not found"

```bash
firebase setup:emulators:firestore
firebase setup:emulators:functions
```

### Error: "CORS" en emulators

Asegúrate de que `VITE_USE_FIREBASE_EMULATOR=true` en `.env.local`

### Build falla en Windows

```bash
# Usar npm en lugar de npx
npm run build
```

### TypeScript errors en path alias

Verifica que `tsconfig.json` y `vite.config.ts` tengan configurado `@/*` correctamente.

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea una branch para tu feature (`git checkout -b feat/amazing-feature`)
3. Commit tus cambios (`git commit -m 'feat: add amazing feature'`)
4. Push a la branch (`git push origin feat/amazing-feature`)
5. Abre un Pull Request

### Convenciones de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Bug fix
- `chore:` Cambios menores (deps, config)
- `docs:` Documentación
- `test:` Tests
- `refactor:` Refactorización

---

## 📄 Licencia

Este proyecto es privado. Todos los derechos reservados © 2025 Athlos.

---

## 👤 Autor

**Sebastian Guerrero**  
GitHub: [@sebaguerrerof](https://github.com/sebaguerrerof)

---

## 🗓️ Status del Proyecto

- [x] Sprint 0: Setup & Arquitectura Base ✅
- [x] Sprint 1: Autenticación & Tenant Base ✅
- [ ] Sprint 2: Gestión de Clientes
- [ ] Sprint 3: Agenda & Disponibilidad
- [ ] Sprint 4: Pagos con Flow
- [ ] Sprint 5: Rutinas & Actividades
- [ ] Sprint 6: Dashboard & Analytics
- [ ] Sprint 7: UX/UI Polish & Testing
- [ ] Sprint 8: Deploy & Production Ready

Ver [SPRINTS.md](./SPRINTS.md) para detalles de cada sprint.

### 📋 Sprint 1 - Completado

**Implementado:**
- ✅ Sistema de tipos TypeScript completo (User, Tenant, AuthUser, AuthState)
- ✅ Componentes UI: Button, Input, Card, Label, Toast
- ✅ Páginas de autenticación: Login, Register, ResetPassword
- ✅ AuthContext con gestión de estado (user, userProfile, tenant)
- ✅ PrivateRoute para protección de rutas
- ✅ Cloud Function `onUserCreated` para crear tenant y asignar custom claims
- ✅ HomePage temporal para testing
- ✅ Integración react-hook-form + zod para validación
- ✅ Flujo completo de registro con Firestore temporal (_pendingTenants)

**Próximo Sprint:** Gestión de Clientes (CRUD, invitaciones, filtros)

Ver [SPRINT_1_SUMMARY.md](./SPRINT_1_SUMMARY.md) para detalles completos.

---

**Última actualización:** 10 de enero de 2025  
**Versión:** 0.2.0 (Sprint 1 completado)
