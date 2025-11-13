# 📋 Planificación de Sprints – Athlos

## 🎯 Objetivo del MVP
Plataforma SaaS para profesores, kinesiólogos y entrenadores que permita:
- Gestionar agenda y disponibilidad
- Administrar clientes con sistema multi-tenant
- Procesar pagos por clase (Flow CLP)
- Planificar rutinas y actividades
- Integración con Google Calendar (opcional fase 1)

---

## 🏗️ Sprint 0: Setup & Arquitectura Base
**Duración estimada:** 1-2 días  
**Objetivo:** Preparar entorno de desarrollo y estructura del proyecto  
**Estado:** ✅ COMPLETADO

### 📦 Tasks
- [x] Inicializar proyecto Ionic React + TypeScript (blank template)
- [x] Configurar Tailwind CSS
- [x] Instalar y configurar shadcn/ui para Ionic
- [x] Configurar Firebase (proyecto + emulators)
- [x] Crear estructura de carpetas modular
- [x] Setup ESLint + Prettier + Git hooks (opcional)
- [x] Configurar variables de entorno (.env)
- [x] Inicializar Firebase Functions (TypeScript)
- [x] Crear archivo `firestore.rules` base
- [x] Documentar comandos en README.md

### ✅ Goals
- ✓ Proyecto compila sin errores
- ✓ Firebase emulators configurados (Auth, Firestore, Functions)
- ✓ Tailwind + shadcn/ui funcionando
- ✓ Hot reload funcional
- ✓ Git inicializado con `.gitignore` correcto

### 📁 Archivos esperados
```
.env.local
firebase.json
firestore.rules
firestore.indexes.json
functions/src/index.ts
src/lib/firebase.ts
src/lib/firestore.ts
src/lib/auth.ts
tailwind.config.js
components.json (shadcn)
README.md
```

---

## 🔐 Sprint 1: Autenticación & Tenant Base
**Duración estimada:** 3-4 días  
**Objetivo:** Sistema de registro/login con arquitectura multi-tenant
**Estado:** ✅ COMPLETADO

### 📦 Tasks
- [x] Crear tipos TypeScript para User, Tenant, Role
- [x] Implementar registro de profesor (email/password)
- [x] Crear documento de Tenant en Firestore al registrar
- [x] Asignar Custom Claim `tenantId` vía Cloud Function
- [x] Implementar login/logout
- [x] Crear contexto de autenticación (AuthContext)
- [x] Proteger rutas con PrivateRoute
- [x] UI: pantallas de Login, Register, ResetPassword
- [x] Validación de formularios con react-hook-form + zod
- [x] Toast notifications para feedback
- [x] **BONUS:** Migración completa de Ionic a Tailwind + shadcn
- [x] **BONUS:** Google OAuth implementado
- [x] **BONUS:** DashboardLayout con sidebar responsivo

### ✅ Goals
- ✓ Profesor puede registrarse y auto-crear tenant
- ✓ Login funciona y persiste sesión
- ✓ Custom claim `tenantId` se asigna correctamente
- ✓ Rutas protegidas redirigen si no hay auth
- ✓ Firestore rules validan tenantId en queries
- ✓ UI responsiva (mobile-first)

### 📁 Archivos esperados
```
src/app/features/auth/
  types.ts
  AuthContext.tsx
  useAuth.ts
  LoginPage.tsx
  RegisterPage.tsx
  ResetPasswordPage.tsx
  PrivateRoute.tsx
functions/src/auth/
  onUserCreated.ts
  setCustomClaims.ts
firestore.rules (actualizado con tenant validation)
```

### 🗄️ Colecciones Firestore
```
users/
  {uid}/
    email: string
    displayName: string
    role: 'owner' | 'instructor'
    tenantId: string
    createdAt: Timestamp
    updatedAt: Timestamp

tenants/
  {tenantId}/
    name: string
    ownerId: string
    plan: 'free' | 'pro'
    createdAt: Timestamp
    settings: {}
```

---

## 👥 Sprint 2: Gestión de Clientes
**Duración estimada:** 2-3 días  
**Objetivo:** CRUD de clientes asociados al tenant
**Estado:** ✅ COMPLETADO

### 📦 Tasks
- [x] Crear tipos TypeScript para Client
- [x] UI: Página base de lista de clientes
- [x] UI: Estructura de búsqueda y filtros
- [x] Implementar CRUD de clientes (Firestore)
- [x] UI: Formulario crear/editar cliente
- [x] Modal de confirmación para eliminar
- [x] Firestore rules con validaciones de campos
- [ ] Asignar Custom Claim `clientOf: [tenantId]` al invitar cliente
- [ ] Enviar invitación por email (Cloud Function)
- [ ] Cliente acepta invitación y crea cuenta
- [ ] Validación: cliente solo ve su tenant asignado

### ✅ Goals
- ✓ Profesor puede crear, editar, listar, eliminar clientes
- ✓ Búsqueda funciona por nombre y email
- ✓ UI optimista con loading states
- ✓ Firestore rules validan estructura de datos
- ✓ Toast notifications para feedback
- ⚠️ Invitación por email (pendiente, no bloquea Sprint 3)
- ⚠️ Cliente invitado se registra (pendiente, no bloquea Sprint 3)

### 📁 Archivos esperados
```
src/app/features/clients/
  types.ts
  useClients.ts
  ClientListPage.tsx
  ClientFormPage.tsx
  ClientCard.tsx
functions/src/clients/
  sendInvitation.ts
  onClientAccept.ts
```

### 🗄️ Colecciones Firestore
```
tenants/{tenantId}/clients/
  {clientId}/
    email: string
    name: string
    phone: string
    status: 'invited' | 'active' | 'inactive'
    invitedAt: Timestamp
    acceptedAt: Timestamp | null
    notes: string
```

---

## 📅 Sprint 3: Agenda & Disponibilidad
**Duración estimada:** 4-5 días (real: 7-8 días con features extras)
**Objetivo:** Sistema de calendario con bloques de disponibilidad y reservas
**Estado:** ✅ COMPLETADO + BONUS FEATURES

### 📦 Tasks
- [x] Crear tipos para Availability, Appointment, TimeSlot
- [x] Implementar CRUD de bloques de disponibilidad (profesor)
- [x] UI: Calendario mensual con vista de citas
- [x] UI: Modal de detalle de cita con toggle de pago
- [x] UI: Modal de nueva cita con validación de conflictos
- [x] Validación de conflictos de horario
- [x] Confirmación/cancelación de clases
- [x] **BONUS:** Sistema de clases recurrentes/periódicas
- [x] **BONUS:** Página de gestión de clases recurrentes
- [x] **BONUS:** Multi-selección de días y duraciones
- [x] **BONUS:** Quick actions para disponibilidad (Lun-Vie, Fin de semana)
- [x] **BONUS:** Toggle de pago directo sin modal de confirmación
- [x] **BONUS:** Firestore rules con dual-check (custom claims + user doc)
- [ ] Notificaciones automáticas (email/push) - POSPUESTO A SPRINT 6
- [ ] Integración con Google Calendar (OAuth 2.0) - POSPUESTO
- [ ] Sync bidireccional con Google Calendar - POSPUESTO

### ✅ Goals
- ✓ Profesor puede definir horarios disponibles por día/semana
- ✓ Multi-selección de días (Lun-Vie, Fin de semana, Todas)
- ✓ Multi-selección de duraciones (60/90/120 min)
- ✓ Profesor puede agendar clases individuales
- ✓ Profesor puede agendar clases recurrentes (series)
- ✓ No hay doble reserva (validación en frontend)
- ✓ Profesor puede marcar como pagada/completada/cancelada
- ✓ Toggle de pago actualiza en tiempo real
- ✓ Página dedicada para gestionar series recurrentes
- ✓ Firestore rules funcionan sin custom claims
- ✓ UI de calendario intuitiva y responsiva
- ⚠️ Emails de confirmación (pospuesto)
- ⚠️ Sync con Google Calendar (pospuesto)

### 📁 Archivos creados
```
src/app/features/calendar/
  types.ts ✅
  hooks/
    useAvailability.ts ✅
    useAppointments.ts ✅
  CalendarPage.tsx ✅
  AvailabilitySettings.tsx ✅
  AppointmentDetailModal.tsx ✅
  NewAppointmentModal.tsx ✅
  RecurringClassesPage.tsx ✅ (BONUS)
functions/src/calendar/
  (pospuesto a Sprint 6)
```

### 🔧 Archivos modificados
```
src/App.tsx (rutas de calendario)
src/app/layouts/DashboardLayout.tsx (menú Clases Recurrentes)
firestore.rules (función belongsToTenant actualizada)
```

### 🗄️ Colecciones Firestore
```
tenants/{tenantId}/availability/
  {availabilityId}/
    dayOfWeek: number (0-6)
    startTime: string (HH:mm)
    endTime: string (HH:mm)
    duration: number (60/90/120 minutos)
    isActive: boolean
    createdAt: Timestamp
    updatedAt: Timestamp

tenants/{tenantId}/appointments/
  {appointmentId}/
    clientId: string
    clientName: string (denormalizado)
    sportType: string
    date: string (YYYY-MM-DD)
    startTime: string (HH:mm)
    endTime: string (HH:mm, opcional)
    duration: number (minutos)
    status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
    isPaid: boolean ✅
    notes: string (opcional)
    recurringGroupId: string (UUID, opcional) ✅
    createdAt: Timestamp
    updatedAt: Timestamp
```

### 🎯 Features Clave Implementadas
1. **Multi-selección de disponibilidad**: Crear 15 bloques con 3 clics (5 días × 3 duraciones)
2. **Clases recurrentes**: Agendar series de clases con un solo formulario
3. **Validación de conflictos**: No permite doble-booking
4. **Toggle de pago**: Actualización inmediata sin confirmación
5. **Gestión de series**: Página dedicada con eliminación en masa
6. **Firestore rules flexibles**: Dual-check (custom claims OR user document)

### 📝 Notas de Implementación
- **Firestore Rules Fix**: Se actualizó `belongsToTenant()` para verificar tanto custom claims como user document, resolviendo problemas de permisos en cuentas nuevas
- **Real-time Updates**: Se implementó patrón `useMemo` + `useState(id)` para actualizaciones reactivas en modals
- **UX Multi-select**: Botones toggle + quick actions mejoraron significativamente la experiencia vs dropdowns
- **Validación de Conflictos**: Implementada en frontend con algoritmo de overlap detection
- **Clases Recurrentes**: Usa `recurringGroupId` (UUID v4) para agrupar series de clases
- **Deploy**: Se realizaron 3 deploys de Firestore rules durante el sprint para iterativamente resolver permisos

### 📄 Documentación
Ver **SPRINT_3_SUMMARY.md** para documentación completa con:
- Arquitectura detallada de componentes
- Flujos de uso paso a paso
- Problemas resueltos y soluciones
- Lecciones aprendidas
- Testing manual realizado

---

## 💳 Sprint 4: Sistema de Pagos (Mercado Pago + Manual)
**Duración estimada:** 4-5 días  
**Objetivo:** Sistema flexible de pagos con Mercado Pago (automático) y opción manual con comprobantes
**Estado:** 🔜 PRÓXIMO

### 📦 Tasks

#### Día 1: Infraestructura Base
- [ ] Crear tipos TypeScript (Payment, PaymentConfig, PaymentProvider)
- [ ] Diseñar colecciones Firestore (payments, paymentConfig)
- [ ] Hook usePayments (CRUD de pagos)
- [ ] Hook usePaymentConfig (configuración del tenant)
- [ ] Actualizar Firestore rules para payments

#### Día 2: Configuración de Pagos (Profesor)
- [ ] UI: PaymentSettingsPage (página de configuración)
- [ ] UI: Selector de proveedor (Manual / Mercado Pago)
- [ ] Formulario: Configuración manual (datos bancarios)
- [ ] Formulario: Configuración Mercado Pago (Access Token)
- [ ] UI: Configurar precios por deporte/duración
- [ ] Validación y guardado de credenciales (encriptadas)

#### Día 3: Flujo de Pago Manual
- [ ] UI: PaymentLinkPage (generar link/info de pago)
- [ ] UI: Botón "Ver datos de pago" en AppointmentDetailModal
- [ ] UI: Pantalla con datos bancarios del profesor
- [ ] UI: PaymentProofUpload (subir comprobante - foto/screenshot)
- [ ] Firebase Storage: guardar comprobantes
- [ ] UI: Dashboard de comprobantes pendientes (profesor)
- [ ] Aprobar/rechazar comprobante → actualiza isPaid

#### Día 4: Integración Mercado Pago
- [ ] Instalar Mercado Pago SDK (`npm install mercadopago`)
- [ ] Cloud Function: createMercadoPagoPreference
- [ ] UI: Botón "Pagar ahora" en cita
- [ ] Modal de pago con opciones MP (tarjeta/wallet/efectivo)
- [ ] Redirigir a checkout de Mercado Pago
- [ ] Cloud Function: mercadopagoWebhook (IPN)
- [ ] Webhook actualiza isPaid automáticamente
- [ ] Logs de transacciones en Firestore

#### Día 5: Historial y Polish
- [ ] UI: PaymentHistoryPage (vista para profesor)
- [ ] UI: PaymentHistoryPage (vista para cliente)
- [ ] PaymentCard component (card individual de pago)
- [ ] Filtros por fecha/estado/cliente
- [ ] Estadísticas: total recaudado, pendientes, completados
- [ ] Notificaciones: toast cuando se recibe pago
- [ ] Testing de flujos completos
- [ ] Documentación en SPRINT_4_SUMMARY.md

### ✅ Goals
- ✓ Profesor puede configurar método de pago preferido
- ✓ Profesor puede ingresar datos bancarios (modo manual)
- ✓ Profesor puede conectar cuenta Mercado Pago
- ✓ Profesor puede configurar precios por deporte/duración
- ✓ Cliente puede ver datos de pago y subir comprobante (manual)
- ✓ Profesor puede aprobar/rechazar comprobantes
- ✓ Cliente puede pagar con Mercado Pago (tarjeta/wallet)
- ✓ Webhook confirma pago automáticamente
- ✓ Estado `isPaid` se actualiza correctamente
- ✓ Historial de pagos completo (profesor y cliente)
- ✓ Storage de comprobantes seguro
- ✓ Manejo de errores robusto

### 📁 Archivos a crear
```
src/app/features/payments/
  types.ts
  hooks/
    usePayments.ts
    usePaymentConfig.ts
  
  # Settings
  PaymentSettingsPage.tsx
  ProviderSelector.tsx
  ManualConfigForm.tsx
  MercadoPagoConfigForm.tsx
  PricingConfigForm.tsx
  
  # Payment Flow
  PaymentLinkPage.tsx
  PaymentCheckoutModal.tsx
  PaymentProofUpload.tsx
  PendingProofsPage.tsx
  
  # History
  PaymentHistoryPage.tsx
  PaymentCard.tsx
  PaymentStats.tsx
  
  # Providers
  providers/
    mercadopago.ts
    manual.ts

functions/src/payments/
  createMercadoPagoPreference.ts
  mercadopagoWebhook.ts
  processPayment.ts
  encryptCredentials.ts
```

### 🗄️ Colecciones Firestore
```
tenants/{tenantId}/paymentConfig/
  {configId}/
    provider: 'mercadopago' | 'manual'
    isActive: boolean
    
    # Mercado Pago
    mercadoPago: {
      accessToken: string (encrypted)
      publicKey: string
    }
    
    # Manual
    bankInfo: {
      bank: string
      accountType: 'Cuenta Corriente' | 'Cuenta Vista'
      accountNumber: string
      rut: string
      name: string
    }
    
    # Pricing
    pricing: {
      'Entrenamiento Funcional': {
        60: 15000,
        90: 20000,
        120: 25000
      },
      'Pilates': { ... },
      'Kinesiología': { ... }
    }
    
    createdAt: Timestamp
    updatedAt: Timestamp

tenants/{tenantId}/payments/
  {paymentId}/
    appointmentId: string
    clientId: string
    clientName: string
    amount: number
    currency: 'CLP'
    
    provider: 'mercadopago' | 'manual'
    method: 'card' | 'transfer' | 'cash' | 'mercadopago_wallet'
    
    status: 'pending' | 'completed' | 'failed' | 'refunded' | 'under_review'
    
    # Mercado Pago
    externalId: string | null        # MP payment ID
    preferenceId: string | null      # MP preference ID
    
    # Manual
    proofUrl: string | null          # Storage URL del comprobante
    proofStatus: 'pending' | 'approved' | 'rejected' | null
    reviewedBy: string | null        # UID del profesor que revisó
    reviewedAt: Timestamp | null
    
    paidAt: Timestamp | null
    createdAt: Timestamp
    updatedAt: Timestamp
```

### 🎯 Flujos de Usuario Detallados

#### Flujo A: Configuración Inicial (Profesor)
```
1. Profesor → Settings → Pagos
2. Ve 2 opciones con cards:
   📝 Manual (Gratis)
   - "Comprobantes de transferencia"
   - "Sin comisiones"
   - "Aprobación manual"
   
   🏆 Mercado Pago (Recomendado)
   - "Pagos automáticos"
   - "Tarjetas y más"
   - "3.5% + IVA"

3. Selecciona "Manual":
   - Completa datos bancarios
   - Configura precios (ej. Entrenamiento 60min = $15.000)
   - ✅ Guarda

4. O selecciona "Mercado Pago":
   - Click "¿Cómo obtener mi Access Token?" (link tutorial)
   - Ingresa Access Token de su cuenta MP
   - Configura precios
   - ✅ Guarda
```

#### Flujo B: Pago Manual (Cliente)
```
1. Cliente ve su clase en dashboard
2. Badge rojo "Pendiente: $15.000"
3. Click en clase → AppointmentDetailModal
4. Botón "Ver datos de pago"
5. Modal muestra:
   ┌─────────────────────────────┐
   │ Clase: Entrenamiento 60min  │
   │ Monto: $15.000              │
   │                             │
   │ 🏦 Datos de transferencia:  │
   │ Banco: Banco de Chile       │
   │ Tipo: Cuenta Corriente      │
   │ Número: 12345678            │
   │ RUT: 12.345.678-9           │
   │ Nombre: Juan Pérez          │
   │                             │
   │ 📷 [Adjuntar comprobante]   │
   └─────────────────────────────┘
6. Cliente hace transferencia desde su banco
7. Vuelve a la app, sube foto del comprobante
8. Status cambia a "En revisión"
9. Profesor recibe notificación

Profesor:
10. Dashboard → "Comprobantes pendientes" (badge con número)
11. Ve lista de comprobantes con preview
12. Click en uno → modal con imagen full
13. Botones: [Aprobar] [Rechazar]
14. Al aprobar → isPaid: true, cliente recibe notificación
```

#### Flujo C: Pago con Mercado Pago (Cliente)
```
1. Cliente ve clase con "Pendiente: $15.000"
2. Botón "Pagar ahora"
3. Modal loading → genera preference en Cloud Function
4. Muestra opciones de pago:
   ┌─────────────────────────────┐
   │ Clase: Entrenamiento 60min  │
   │ Monto: $15.000              │
   │                             │
   │ 💳 Pagar con tarjeta        │
   │ 🏦 Mercado Pago wallet      │
   │ 💵 Efectivo (PagoFácil)     │
   │                             │
   │ [Continuar al pago]         │
   └─────────────────────────────┘
5. Click → redirección a checkout MP
6. Cliente completa pago
7. Webhook recibe notificación
8. Cloud Function:
   - Valida pago
   - Actualiza appointment.isPaid = true
   - Crea documento en payments/
9. Cliente vuelve a app → "✅ Pago confirmado"
10. Profesor recibe notificación "Pago recibido de Ana López"
```

### 🔐 Seguridad

#### Credenciales
- Access Token de MP se guarda encriptado en Firestore
- Solo Cloud Functions pueden desencriptar
- Frontend nunca ve el Access Token completo

#### Comprobantes
- Subidos a Firebase Storage con reglas:
  ```javascript
  match /tenants/{tenantId}/payment-proofs/{proofId} {
    allow read: if belongsToTenant(tenantId);
    allow write: if belongsToTenant(tenantId) && 
                    request.resource.size < 5 * 1024 * 1024; // 5MB max
  }
  ```

#### Webhooks
- Validar firma de Mercado Pago
- Verificar que payment pertenezca al tenant correcto
    - Idempotencia (evitar duplicados)

### 💡 Decisiones de Diseño

#### ¿Por qué Mercado Pago?
- ✅ API moderna y bien documentada
- ✅ SDK oficial TypeScript/JavaScript
- ✅ Múltiples métodos de pago (tarjetas, wallet, efectivo)
- ✅ Menor comisión que Flow (3.5% vs 4.5%)
- ✅ Más popular en LATAM
- ✅ Checkout embebido (no sale de la app)
- ✅ Webhooks confiables y bien documentados

#### ¿Por qué opción Manual?
- ✅ Cero comisiones para el profesor
- ✅ Ideal para emprendedores que empiezan
- ✅ Muchos clientes prefieren transferencia directa
- ✅ Validación con comprobante genera confianza
- ✅ No requiere configuración compleja

#### Arquitectura Flexible
El sistema está diseñado para agregar más proveedores en el futuro:
- Khipu (transferencias)
- Transbank Webpay
- Stripe (tarjetas internacionales)

Solo requiere agregar nuevo archivo en `providers/` e implementar interfaz común.

### 🎨 Wireframes Clave

#### PaymentSettingsPage
```
┌─────────────────────────────────────────┐
│ ⚙️  Configuración de Pagos              │
├─────────────────────────────────────────┤
│                                         │
│ Método de Pago Actual: Manual 📝        │
│                                         │
│ ┌──────────────┐  ┌──────────────┐     │
│ │ 📝 Manual    │  │ 🏆 Mercado   │     │
│ │              │  │    Pago       │     │
│ │ Gratis       │  │ 3.5% + IVA   │     │
│ │ Comprobantes │  │ Automático   │     │
│ │              │  │              │     │
│ │ [Activar]    │  │ [Activar]    │     │
│ └──────────────┘  └──────────────┘     │
│                                         │
│ 💰 Precios por Clase                    │
│ ┌─────────────────────────────────┐    │
│ │ Entrenamiento Funcional          │    │
│ │   60 min:  $15.000 [Editar]     │    │
│ │   90 min:  $20.000 [Editar]     │    │
│ │  120 min:  $25.000 [Editar]     │    │
│ │                                  │    │
│ │ + Agregar deporte                │    │
│ └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### 🔄 Estado de Base Existente

**Ya tenemos implementado (Sprint 3):**
- ✅ Campo `isPaid: boolean` en appointments
- ✅ Toggle de pago en AppointmentDetailModal
- ✅ Real-time updates del estado de pago
- ✅ Badge visual "Pagada" en calendario
- ✅ Relación appointment ↔ cliente establecida

**Lo que agregamos (Sprint 4):**
- 🆕 Configuración de métodos de pago
- 🆕 Pricing por deporte/duración
- 🆕 Flujo completo de pago (manual y automático)
- 🆕 Historial de transacciones
- 🆕 Storage de comprobantes
- 🆕 Webhooks de Mercado Pago

---## 🏋️ Sprint 5: Rutinas & Actividades
**Duración estimada:** 3-4 días  
**Objetivo:** Planificador de rutinas y actividades para clientes

### 📦 Tasks
- [ ] Crear tipos para Routine, Activity, Exercise
- [ ] CRUD de plantillas de rutinas
- [ ] Asignar rutina a cliente específico
- [ ] UI: builder de rutinas (drag & drop opcional)
- [ ] Cliente puede ver sus rutinas asignadas
- [ ] Marcar actividades como completadas
- [ ] Progreso y estadísticas básicas
- [ ] Adjuntar videos/imágenes a ejercicios (Firebase Storage)

### ✅ Goals
- ✓ Profesor puede crear plantillas de rutinas
- ✓ Profesor puede asignar rutina personalizada a cliente
- ✓ Cliente ve sus rutinas en su dashboard
- ✓ Cliente puede marcar ejercicios completados
- ✓ UI intuitiva para planificación
- ✓ Imágenes/videos se suben correctamente
- ✓ Validación de permisos en Firestore

### 📁 Archivos esperados
```
src/app/features/routines/
  types.ts
  useRoutines.ts
  RoutineListPage.tsx
  RoutineBuilderPage.tsx
  RoutineViewPage.tsx (cliente)
  ExerciseCard.tsx
src/app/features/activities/
  types.ts
  useActivities.ts
  ActivityTracker.tsx
```

### 🗄️ Colecciones Firestore
```
tenants/{tenantId}/routineTemplates/
  {templateId}/
    name: string
    description: string
    exercises: Exercise[]
    createdBy: string
    isPublic: boolean

tenants/{tenantId}/clientRoutines/
  {routineId}/
    clientId: string
    templateId: string | null
    name: string
    exercises: Exercise[]
    assignedAt: Timestamp
    completedExercises: string[]
    progress: number
```

---

## 🚀 Sprint 6: Dashboard & Analytics
**Duración estimada:** 2-3 días  
**Objetivo:** Dashboard con métricas clave para profesor y cliente

### 📦 Tasks
- [ ] Dashboard profesor: próximas clases, pagos del mes, clientes activos
- [ ] Dashboard cliente: próximas clases, rutinas pendientes, progreso
- [ ] Gráficos básicos (Chart.js o Recharts)
- [ ] Filtros por fecha
- [ ] Exportar reportes (CSV opcional)
- [ ] Notificaciones push (Firebase Cloud Messaging)

### ✅ Goals
- ✓ Profesor ve métricas clave en home
- ✓ Cliente ve su progreso y clases
- ✓ Gráficos cargan rápido (queries optimizadas)
- ✓ Notificaciones push funcionan (recordatorios de clase)
- ✓ UI clara y visualmente atractiva

### 📁 Archivos esperados
```
src/app/features/dashboard/
  InstructorDashboard.tsx
  ClientDashboard.tsx
  MetricsCard.tsx
  ChartComponents.tsx
src/lib/analytics/
  useMetrics.ts
  aggregations.ts
```

---

## 🎨 Sprint 7: UX/UI Polish & Testing
**Duración estimada:** 2-3 días  
**Objetivo:** Pulir experiencia de usuario y testing

### 📦 Tasks
- [ ] Revisar flujos completos (onboarding, booking, payment)
- [ ] Optimizar performance (lazy loading, code splitting)
- [ ] Skeletons y loading states consistentes
- [ ] Dark mode (opcional)
- [ ] Tests unitarios (Vitest) para utils y hooks
- [ ] Tests E2E básicos (Playwright opcional)
- [ ] Accesibilidad (a11y) con axe-core
- [ ] Revisar responsive en todos los breakpoints
- [ ] Manejo de errores global (ErrorBoundary)

### ✅ Goals
- ✓ App fluida en mobile y desktop
- ✓ Todos los estados de loading/error tienen feedback
- ✓ Tests críticos pasan
- ✓ No hay errores de consola
- ✓ Lighthouse score > 90
- ✓ WCAG 2.1 AA compliance básico

---

## 🌐 Sprint 8: Deploy & Production Ready
**Duración estimada:** 1-2 días  
**Objetivo:** Subir a producción en Firebase Hosting

### 📦 Tasks
- [ ] Configurar Firebase proyecto production
- [ ] Migrar variables de entorno
- [ ] Deploy Cloud Functions
- [ ] Deploy Firestore rules y indexes
- [ ] Deploy frontend a Firebase Hosting
- [ ] Configurar dominio custom (opcional)
- [ ] Configurar SSL
- [ ] Monitoring y alertas (Firebase Performance)
- [ ] Documentar proceso de deploy
- [ ] Backup inicial de Firestore

### ✅ Goals
- ✓ App accesible en producción
- ✓ Functions responden correctamente
- ✓ SSL activo
- ✓ Monitoring configurado
- ✓ Rollback plan documentado
- ✓ README actualizado con URLs producción

### 📋 Comandos Deploy
```bash
# Build frontend
npm run build

# Deploy functions
firebase deploy --only functions

# Deploy rules
firebase deploy --only firestore:rules

# Deploy hosting
firebase deploy --only hosting

# Deploy completo
firebase deploy
```

---

## 📊 Resumen de Sprints

| Sprint | Objetivo | Duración | Prioridad | Estado |
|--------|----------|----------|-----------|---------|
| 0 | Setup & Arquitectura | 1-2 días | 🔴 Crítico | ✅ COMPLETADO |
| 1 | Auth & Tenant | 3-4 días | 🔴 Crítico | ✅ COMPLETADO |
| 2 | Gestión Clientes | 2-3 días | 🔴 Crítico | ✅ COMPLETADO |
| 3 | Agenda & Disponibilidad | 4-5 días (real: 7-8) | 🔴 Crítico | ✅ COMPLETADO |
| 4 | Pagos (MP + Manual) | 4-5 días | 🔴 Crítico | 🔜 SIGUIENTE |
| 5 | Rutinas | 3-4 días | 🟡 Alto | ⏳ Pendiente |
| 6 | Dashboard | 2-3 días | 🟢 Medio | ⏳ Pendiente |
| 7 | UX Polish | 2-3 días | 🟢 Medio | ⏳ Pendiente |
| 8 | Deploy | 1-2 días | 🔴 Crítico | ⏳ Pendiente |

**Total estimado:** 21-30 días de desarrollo
**Completado hasta ahora:** ~15-17 días (Sprints 0-3)
**Progreso:** 4 de 9 sprints completados (44%)

### 🎯 Cambios vs Plan Original
- ✅ Sprint 4: Actualizado de "Flow" a "Mercado Pago + Manual"
  - Razones: Mejor UX, menor comisión, más métodos de pago, opción gratis
  - Arquitectura flexible para agregar más proveedores después

---

## 🔄 Metodología de trabajo

### Por cada Sprint:
1. ✅ Validar goals del sprint anterior
2. 📝 Crear branch de feature (`git checkout -b sprint-N/feature-name`)
3. 🔨 Implementar tasks uno por uno
4. ✍️ Commits atómicos con Conventional Commits
5. 🧪 Probar en emulator Firebase
6. 📸 Screenshot o video funcional
7. 🔀 Merge a `main` al completar goals
8. 📋 Actualizar checklist en este documento

### Conventional Commits:
```
feat: agregar login con email/password
fix: corregir validación de horarios
chore: actualizar dependencias
docs: documentar API de pagos
test: agregar tests para useAuth
refactor: modularizar componentes de calendario
```

---

## 📚 Recursos y Referencias

### Documentación oficial:
- [Ionic React](https://ionicframework.com/docs/react)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Firestore](https://firebase.google.com/docs/firestore)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Flow API Chile](https://www.flow.cl/docs/api.html)

### Patrones útiles:
- Custom Hooks para lógica reutilizable
- Context API para estado global (Auth, Tenant)
- Compound Components para UI compleja
- Optimistic Updates para mejor UX

---

## ⚠️ Riesgos y Consideraciones

### Técnicos:
- **Firestore Costs:** optimizar queries con índices
- **Cold Start Functions:** usar keep-alive o min instances
- **Flow Sandbox:** validar antes de producción
- **Google Calendar Quota:** manejar rate limits

### UX:
- **Onboarding:** debe ser claro y rápido (< 3 min)
- **Mobile First:** 80% de usuarios en móvil
- **Offline:** considerar Firestore offline persistence
- **Notificaciones:** no spam, solo críticas

### Seguridad:
- **Firestore Rules:** testear con emulator antes de deploy
- **Custom Claims:** validar en backend, no confiar en frontend
- **Secrets:** nunca commitear API keys
- **CORS:** configurar correctamente para Functions

---

## 🎯 Definición de "Done"

Un sprint está completo cuando:
- ✅ Todos los goals marcados como cumplidos
- ✅ Código compila sin warnings críticos
- ✅ Funciona en Firebase Emulator
- ✅ Firestore rules actualizadas y validadas
- ✅ UI responsiva y accesible
- ✅ Commits pusheados a repositorio
- ✅ README actualizado si aplica
- ✅ Screenshot/video de demostración

---

**Última actualización:** 13 de noviembre de 2025  
**Versión:** 1.1  
**Proyecto:** Athlos MVP  
**Sprint actual:** Sprint 3 ✅ COMPLETADO | Sprint 4 🔜 SIGUIENTE
