# GAMA GOURMET - Sistema de Gestión de Menús Corporativos
**Plataforma de Gestión de Viandas Empresariales**

---

## Tabla de Contenidos

1. [Descripción General](#1-descripción-general)
2. [Arquitectura de Roles y Portales](#2-arquitectura-de-roles-y-portales)
3. [Stack Tecnológico](#3-stack-tecnológico)
4. [Modelo de Datos](#4-modelo-de-datos)
5. [Lógica de Negocio](#5-lógica-de-negocio)
6. [Plan de Desarrollo](#6-plan-de-desarrollo)
7. [Consideraciones Técnicas](#7-consideraciones-técnicas)
8. [Anexos](#8-anexos)

---

## 1. Descripción General

Gama Gourmet es una plataforma integral de gestión de servicios alimentarios corporativos que conecta empresas con proveedores de alimentos especializados. La plataforma facilita la planificación, gestión y entrega de menús personalizados para comedores empresariales.

---

## 2. Arquitectura de Roles y Portales

### 2.1 Portal de Administración de Gama (Super Admin)

**Rol**: `gama_admin`  
**Ruta base**: `/gama/*`

#### Funcionalidades Principales:

**Gestión de Catálogo:**
- CRUD completo de ingredientes con categorización
- CRUD de platos con asociación de ingredientes y cantidades
- Gestión de menús semanales con asignación por días
- Control de publicación de menús

**Administración de Clientes:**
- Crear y editar empresas clientes
- Gestionar múltiples sucursales por empresa
- Asignar y modificar planes de contratación
- Control de estado activo/inactivo

**Monitoreo Operativo:**
- Dashboard en tiempo real de todos los pedidos
- Filtros por empresa, sucursal, fecha y estado
- Actualización de estados de pedidos
- Gestión de rutas de entrega

**Reportes y Analytics:**
- Reportes de cocina por día y plato
- Análisis de consumo por empresa
- Métricas de eficiencia operativa
- Exportación de datos para facturación

### 2.2 Portal de Empresa Cliente (Admin de Empresa)

**Rol**: `empresa_admin`  
**Ruta base**: `/empresa/*`

#### Funcionalidades Principales:

**Gestión de Personal:**
- Alta, edición y desactivación de empleados
- Asignación de permisos y configuraciones
- Invitación de nuevos usuarios al sistema
- Control de acceso por sucursal

**Monitoreo de Pedidos:**
- Vista consolidada de pedidos de todos los empleados
- Filtros por empleado, fecha y sucursal
- Estados de entrega en tiempo real
- Historial completo de pedidos

**Facturación y Consumo:**
- Resumen mensual de consumo por empleado
- Detalle de servicios según plan contratado
- Proyecciones de facturación
- Exportación de reportes contables

### 2.3 Aplicación del Empleado (Comensal)

**Rol**: `empleado`  
**Ruta base**: `/empleado/*`

#### Funcionalidades Principales:

**Selección de Menú:**
- Visualización clara del menú semanal actual
- Información detallada de cada plato (ingredientes, calorías)
- Selección día por día con validaciones
- Elección de sucursal de entrega por pedido

**Gestión de Pedidos:**
- Confirmación y modificación de pedidos (dentro del plazo)
- Seguimiento de estado en tiempo real
- Notificaciones de cambios de estado
- Historial personal de pedidos

**Perfil Personal:**
- Actualización de datos personales
- Preferencias alimentarias y restricciones
- Configuración de notificaciones

---

## 3. Stack Tecnológico

### 3.1 Frontend

- **Framework**: Next.js 14+ (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Componentes**: shadcn/ui
- **Formularios**: React Hook Form + Zod
- **Estado**: Server Actions + Context API

### 3.2 Backend y Base de Datos

- **Backend**: Next.js API Routes + Server Actions
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Tiempo Real**: Supabase Realtime
- **Storage**: Supabase Storage (para imágenes)

### 3.3 Herramientas de Desarrollo

- **Validación**: Zod schemas
- **Linting**: ESLint + Prettier
- **Testing**: Jest + React Testing Library
- **Deployment**: Vercel

---

## 4. Modelo de Datos

### 4.1 Diagrama de Entidad-Relación

\`\`\`
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    users    │    │  empresas   │    │   planes    │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │    │ id (PK)     │    │ id (PK)     │
│ email       │    │ nombre      │    │ nombre      │
│ role        │    │ plan_id(FK) │────│ descripcion │
│ nombre      │    │ email_cont. │    │ incluye_*   │
│ apellido    │    │ telefono    │    │ precio_mens │
│ empresa_id  │────│ direccion   │    │ activo      │
│ activo      │    │ activa      │    └─────────────┘
└─────────────┘    └─────────────┘
       │                  │
       │                  │
       │           ┌─────────────┐
       │           │ sucursales  │
       │           ├─────────────┤
       │           │ id (PK)     │
       │           │ empresa_id  │────┘
       │           │ nombre      │
       │           │ direccion   │
       │           │ telefono    │
       │           │ activa      │
       │           └─────────────┘
       │                  │
       │                  │
┌─────────────┐           │
│   pedidos   │           │
├─────────────┤           │
│ id (PK)     │           │
│ user_id(FK) │───────────┘
│ sucursal_id │───────────┘
│ plato_id    │────┐
│ menu_sem_id │────┼─┐
│ fecha_ped   │    │ │
│ fecha_ent   │    │ │
│ estado      │    │ │
│ observac.   │    │ │
└─────────────┘    │ │
                   │ │
            ┌─────────────┐ │
            │   platos    │ │
            ├─────────────┤ │
            │ id (PK)     │─┘
            │ nombre      │
            │ descripcion │
            │ tipo        │
            │ imagen_url  │
            │ calorias    │
            │ activo      │
            └─────────────┘
                   │
                   │ N:N
            ┌─────────────┐
            │plato_ingred │
            ├─────────────┤
            │ plato_id    │─┘
            │ ingred_id   │─┐
            │ cantidad    │ │
            └─────────────┘ │
                           │
                    ┌─────────────┐
                    │ingredientes │
                    ├─────────────┤
                    │ id (PK)     │─┘
                    │ nombre      │
                    │ unidad_med  │
                    │ categoria   │
                    │ alergenos   │
                    │ activo      │
                    └─────────────┘

┌─────────────┐    ┌─────────────┐
│menu_semanal │    │ menu_platos │
├─────────────┤    ├─────────────┤
│ id (PK)     │────│ menu_sem_id │
│ fecha_ini   │    │ plato_id    │
│ fecha_fin   │    │ dia_semana  │
│ empresa_id  │    └─────────────┘
│ activo      │
│ publicado   │
└─────────────┘
\`\`\`

### 4.2 Entidades Principales

#### 4.2.1 Tabla `users`
Extiende la tabla `auth.users` de Supabase con información específica del negocio.

\`\`\`sql
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    nombre VARCHAR(200),
    apellido VARCHAR(200),
    role user_role NOT NULL DEFAULT 'empleado',
    empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

#### 4.2.2 Tabla `planes`
Define los tipos de contratación disponibles.

\`\`\`sql
CREATE TABLE planes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    incluye_entrada BOOLEAN DEFAULT false,
    incluye_postre BOOLEAN DEFAULT false,
    incluye_bebida BOOLEAN DEFAULT false,
    precio_mensual DECIMAL(10,2),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

#### 4.2.3 Tabla `empresas`
Empresas clientes que contratan el servicio.

\`\`\`sql
CREATE TABLE empresas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    email_contacto VARCHAR(255),
    telefono VARCHAR(20),
    direccion TEXT,
    plan_id UUID REFERENCES planes(id) ON DELETE SET NULL,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

#### 4.2.4 Tabla `sucursales`
Ubicaciones físicas de entrega por empresa.

\`\`\`sql
CREATE TABLE sucursales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    direccion TEXT NOT NULL,
    telefono VARCHAR(20),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

#### 4.2.5 Tabla `ingredientes`
Materia prima para la composición de platos.

\`\`\`sql
CREATE TABLE ingredientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    unidad_de_medida VARCHAR(50) NOT NULL,
    categoria VARCHAR(100),
    alergenos TEXT[],
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

#### 4.2.6 Tabla `platos`
Comidas disponibles en el catálogo.

\`\`\`sql
CREATE TABLE platos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(50),
    imagen_url TEXT,
    calorias INTEGER,
    tiempo_preparacion INTEGER,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

#### 4.2.7 Tabla `plato_ingredientes`
Relación N:N entre platos e ingredientes con cantidades.

\`\`\`sql
CREATE TABLE plato_ingredientes (
    plato_id UUID REFERENCES platos(id) ON DELETE CASCADE,
    ingrediente_id UUID REFERENCES ingredientes(id) ON DELETE CASCADE,
    cantidad DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (plato_id, ingrediente_id)
);
\`\`\`

#### 4.2.8 Tabla `menus_semanales`
Menús publicados semanalmente por Gama.

\`\`\`sql
CREATE TABLE menus_semanales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    activo BOOLEAN DEFAULT true,
    publicado BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fecha_fin_mayor_inicio CHECK (fecha_fin > fecha_inicio)
);
\`\`\`

#### 4.2.9 Tabla `menu_platos`
Relación N:N entre menús semanales y platos con día específico.

\`\`\`sql
CREATE TABLE menu_platos (
    menu_semanal_id UUID REFERENCES menus_semanales(id) ON DELETE CASCADE,
    plato_id UUID REFERENCES platos(id) ON DELETE CASCADE,
    dia_semana INTEGER NOT NULL CHECK (dia_semana >= 1 AND dia_semana <= 7),
    PRIMARY KEY (menu_semanal_id, plato_id, dia_semana)
);
\`\`\`

#### 4.2.10 Tabla `pedidos`
Pedidos realizados por empleados.

\`\`\`sql
CREATE TABLE pedidos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    sucursal_id UUID REFERENCES sucursales(id) ON DELETE SET NULL,
    plato_id UUID REFERENCES platos(id) ON DELETE SET NULL,
    menu_semanal_id UUID REFERENCES menus_semanales(id) ON DELETE SET NULL,
    fecha_pedido DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_entrega DATE NOT NULL,
    estado pedido_estado DEFAULT 'solicitado',
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### 4.3 Tipos TypeScript

\`\`\`typescript
// Enums
export type UserRole = 'gama_admin' | 'empresa_admin' | 'empleado';
export type PedidoEstado = 'solicitado' | 'en_preparacion' | 'entregado' | 'cancelado';

// Interfaces principales
export interface Plan {
  id: string;
  nombre: string;
  descripcion?: string;
  incluye_entrada: boolean;
  incluye_postre: boolean;
  incluye_bebida: boolean;
  precio_mensual?: number;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  nombre?: string;
  apellido?: string;
  avatar_url?: string;
  empresa_id?: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
  empresa?: Empresa;
}

export interface Empresa {
  id: string;
  nombre: string;
  plan_id: string;
  email_contacto?: string;
  telefono?: string;
  direccion?: string;
  activa: boolean;
  created_at?: string;
  updated_at?: string;
  plan?: Plan;
  sucursales?: Sucursal[];
  empleados?: UserProfile[];
}

export interface Sucursal {
  id: string;
  empresa_id: string;
  nombre: string;
  direccion: string;
  telefono?: string;
  activa: boolean;
  created_at?: string;
  updated_at?: string;
  empresa?: Empresa;
}

export interface Ingrediente {
  id: string;
  nombre: string;
  unidad_de_medida: string;
  categoria?: string;
  alergenos?: string[];
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Plato {
  id: string;
  nombre: string;
  descripcion?: string;
  tipo?: 'entrada' | 'principal' | 'postre' | 'bebida';
  imagen_url?: string;
  calorias?: number;
  tiempo_preparacion?: number;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
  ingredientes?: PlatoIngrediente[];
}

export interface PlatoIngrediente {
  plato_id: string;
  ingrediente_id: string;
  cantidad: number;
  ingrediente?: Ingrediente;
}

export interface MenuSemanal {
  id: string;
  fecha_inicio: string;
  fecha_fin: string;
  empresa_id: string;
  activo: boolean;
  publicado: boolean;
  created_at?: string;
  updated_at?: string;
  platos?: MenuPlato[];
}

export interface MenuPlato {
  menu_semanal_id: string;
  plato_id: string;
  dia_semana: number; // 1=Lunes, 7=Domingo
  plato?: Plato;
}

export interface Pedido {
  id: string;
  fecha_pedido: string;
  fecha_entrega: string;
  estado: PedidoEstado;
  user_id: string;
  plato_id: string;
  sucursal_id: string;
  menu_semanal_id: string;
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
  user?: UserProfile;
  sucursal?: Sucursal;
  plato?: Plato;
  menu_semanal?: MenuSemanal;
}
\`\`\`

---

## 5. Lógica de Negocio

### 5.1 Flujo de Gestión de Menús

#### Proceso de Creación de Menús:
1. **Gama** crea un nuevo menú semanal definiendo fechas de inicio y fin
2. Selecciona platos del catálogo y los asigna a días específicos (1-7)
3. Puede incluir múltiples platos por día según el plan de cada empresa
4. Una vez completado, marca el menú como "publicado"
5. Los empleados pueden ver y hacer pedidos del menú publicado

#### Reglas de Negocio:
- Los menús son **globales** (no específicos por empresa)
- Un menú puede tener diferentes platos para cada día de la semana
- Solo puede haber un menú activo y publicado por período
- Los menús se pueden editar hasta 48 horas antes del inicio
- Los platos inactivos no aparecen en menús nuevos

### 5.2 Flujo de Pedidos

#### Proceso del Empleado:
1. **Visualización**: Ve el menú semanal actual con platos por día
2. **Selección**: Elige un plato por cada día que desee
3. **Configuración**: Selecciona sucursal de entrega para cada pedido
4. **Confirmación**: Revisa y confirma sus pedidos semanales
5. **Seguimiento**: Monitorea el estado de cada pedido

#### Proceso de Gama:
1. **Recepción**: Ve todos los pedidos en dashboard en tiempo real
2. **Preparación**: Actualiza estado a "en_preparación"
3. **Logística**: Organiza entregas por sucursal y fecha
4. **Entrega**: Marca pedidos como "entregado"
5. **Reportes**: Genera reportes de producción y logística

#### Estados de Pedido:
- **Solicitado**: Pedido realizado por el empleado
- **En Preparación**: Gama comenzó la preparación
- **Entregado**: Pedido entregado en sucursal
- **Cancelado**: Pedido cancelado (por cualquier motivo)

### 5.3 Gestión de Planes y Facturación

#### Tipos de Plan:
- **Plan Básico**: Solo plato principal
- **Plan Completo**: Plato principal + entrada + postre
- **Plan Premium**: Plato principal + entrada + postre + bebida

#### Lógica de Facturación:
- Facturación mensual por empresa
- Cálculo basado en pedidos efectivamente entregados
- Descuentos por volumen según contrato
- Reportes detallados por empleado y sucursal

### 5.4 Control de Acceso y Seguridad

#### Matriz de Permisos:

| Recurso | Gama Admin | Empresa Admin | Empleado |
|---------|------------|---------------|----------|
| Planes | CRUD | Read | - |
| Empresas | CRUD | Read (propia) | - |
| Sucursales | CRUD | Read (propias) | Read (propias) |
| Usuarios | CRUD | CRUD (empleados) | Read (propio) |
| Ingredientes | CRUD | - | - |
| Platos | CRUD | Read | Read |
| Menús | CRUD | Read | Read |
| Pedidos | Read All | Read (empresa) | CRUD (propios) |

---

## 6. Plan de Desarrollo

### 6.1 Metodología

**Enfoque**: Desarrollo incremental por fases
**Duración estimada**: 8-12 semanas
**Metodología**: Agile con sprints de 2 semanas

### 6.2 Fases de Desarrollo

#### ✅ Fase 0: Fundación del Proyecto (COMPLETADA)
**Duración**: 1 semana
**Entregables**:
- [x] Esquema de base de datos completo
- [x] Scripts SQL de creación y datos de prueba
- [x] Tipos TypeScript definidos
- [x] Configuración inicial del proyecto
- [x] Integración con Supabase

#### ✅ Fase 1: Autenticación y Control de Acceso (COMPLETADA)
**Duración**: 1-2 semanas
**Entregables**:
- [x] Páginas de autenticación (login, signup, forgot-password)
- [x] Middleware de protección de rutas
- [x] Server Actions para gestión de auth
- [x] Hooks personalizados (useAuth, useRole)
- [x] Redirección automática por rol

#### ✅ Fase 2: Gestión de Empresas y Planes (COMPLETADA)
**Duración**: 1 semana
**Entregables**:
- [x] CRUD de Empresas
- [x] CRUD de Planes
- [x] Asignación de planes a empresas

#### ✅ Fase 3: Sistema de Ingredientes y Platos (COMPLETADA)
**Duración**: 1-2 semanas
**Entregables**:
- [x] CRUD de Ingredientes
- [x] CRUD de Platos
- [x] Gestión de ingredientes en platos

#### 🔄 Fase 4: Sistema de Menús Semanales (EN PROGRESO)
**Duración**: 2 semanas
**Entregables**:
- [ ] CRUD de Menús Semanales
- [ ] Asignación de platos a menús semanales
- [ ] Publicación de menús semanales

#### ⏳ Fase 5: Dashboard y Reportes (PENDIENTE)
**Duración**: 2 semanas
**Entregables**:
- [ ] Dashboard principal con métricas
- [ ] Reportes de consumo y facturación
- [ ] Configuración de reportes

#### ⏳ Fase 6: Funcionalidades de Empleado (PENDIENTE)
**Duración**: 2 semanas
**Entregables**:
- [ ] Visualización de menú diario
- [ ] Selección de opciones
- [ ] Historial de pedidos

#### 🚀 Fase 7: Optimización y Despliegue (PENDIENTE)
**Duración**: 1 semana
**Entregables**:
- [ ] Optimización de performance
- [ ] Testing completo
- [ ] Documentación de usuario
- [ ] Despliegue en producción
- [ ] Monitoreo y analytics

### 6.3 Criterios de Aceptación por Fase

#### Fase 1 - Autenticación:
- [x] Usuario puede registrarse y hacer login
- [x] Redirección automática según rol
- [x] Rutas protegidas funcionando
- [x] Logout funcional
- [x] Recuperación de contraseña

#### Fase 2 - Gestión de Empresas y Planes:
- [x] Gama puede crear y gestionar empresas
- [x] Puede crear planes de contratación
- [x] Asignar planes a empresas

#### Fase 3 - Sistema de Ingredientes y Platos:
- [x] Gama puede crear y gestionar ingredientes
- [x] Puede crear y gestionar platos
- [x] Asignar ingredientes a platos

#### Fase 4 - Sistema de Menús Semanales:
- [ ] Gama puede crear y gestionar menús semanales
- [ ] Asignar platos a menús semanales
- [ ] Publicar menús semanales

#### Fase 5 - Dashboard y Reportes:
- [ ] Gama ve dashboard principal con métricas
- [ ] Empresa ve dashboard con estadísticas propias
- [ ] Gama y Empresa acceden a reportes de consumo y facturación

#### Fase 6 - Funcionalidades de Empleado:
- [ ] Empleado ve menú diario
- [ ] Puede hacer pedidos por día
- [ ] Ve historial de pedidos

---

## 7. Consideraciones Técnicas

### 7.1 Arquitectura del Sistema

#### Patrón de Arquitectura:
- **Frontend**: Server-Side Rendering (SSR) con Next.js
- **Backend**: API Routes + Server Actions
- **Base de Datos**: PostgreSQL con Supabase
- **Autenticación**: Supabase Auth con Row Level Security (RLS)

#### Principios de Diseño:
- **Separation of Concerns**: Lógica separada por capas
- **DRY (Don't Repeat Yourself)**: Componentes reutilizables
- **SOLID**: Principios de programación orientada a objetos
- **Security First**: Validación en cliente y servidor

### 7.2 Estructura de Archivos

\`\`\`
gama-gourmet/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── forgot-password/
│   │       └── page.tsx
│   ├── gama/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   ├── empresas/
│   │   ├── planes/
│   │   ├── ingredientes/
│   │   ├── platos/
│   │   ├── menus/
│   │   ├── pedidos/
│   │   └── reportes/
│   ├── empresa/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   ├── empleados/
│   │   ├── pedidos/
│   │   └── facturacion/
│   ├── empleado/
│   │   ├── layout.tsx
│   │   ├── menu/
│   │   ├── pedidos/
│   │   ├── historial/
│   │   └── perfil/
│   ├── api/
│   │   └── auth/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/ (shadcn components)
│   ├── layouts/
│   │   ├── DashboardLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── forms/
│   ├── tables/
│   └── shared/
├── lib/
│   ├── types/
│   │   ├── database.ts
│   │   └── forms.ts
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── auth/
│   │   ├── roles.ts
│   │   └── middleware.ts
│   ├── utils/
│   │   ├── validations.ts
│   │   └── formatters.ts
│   └── hooks/
│       ├── useAuth.ts
│       └── useRole.ts
├── scripts/
│   ├── 01-create-database-schema.sql
│   └── 02-seed-data.sql
├── middleware.ts
├── next.config.mjs
├── tailwind.config.ts
└── package.json
\`\`\`

### 7.3 Patrones de Desarrollo

#### Server Actions:
\`\`\`typescript
// Ejemplo de Server Action para crear empresa
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createEmpresa(formData: FormData) {
  const supabase = createServerClient()
  
  const empresa = {
    nombre: formData.get('nombre') as string,
    email_contacto: formData.get('email') as string,
    plan_id: formData.get('plan_id') as string,
  }
  
  const { data, error } = await supabase
    .from('empresas')
    .insert(empresa)
    .select()
  
  if (error) throw error
  
  revalidatePath('/gama/empresas')
  return data[0]
}
\`\`\`

#### Custom Hooks:
\`\`\`typescript
// Hook para gestión de autenticación
export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const supabase = createClient()
    
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()
        
        setUser(profile)
      }
      
      setLoading(false)
    }
    
    getUser()
  }, [])
  
  return { user, loading }
}
\`\`\`

### 7.4 Seguridad

#### Row Level Security (RLS):
\`\`\`sql
-- Política para que empleados solo vean sus pedidos
CREATE POLICY "Empleados ven solo sus pedidos" ON pedidos
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('gama_admin', 'empresa_admin')
    )
  );
\`\`\`

#### Validación con Zod:
\`\`\`typescript
import { z } from 'zod'

export const empresaSchema = z.object({
  nombre: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  email_contacto: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  plan_id: z.string().uuid('Plan inválido'),
})

export type EmpresaFormData = z.infer<typeof empresaSchema>
\`\`\`

### 7.5 Performance y Optimización

#### Estrategias de Caching:
- **Next.js Cache**: Para páginas estáticas y semi-estáticas
- **Supabase Cache**: Para consultas frecuentes
- **Browser Cache**: Para assets estáticos

#### Optimización de Consultas:
- **Select específico**: Solo campos necesarios
- **Joins optimizados**: Evitar N+1 queries
- **Índices**: En campos de búsqueda frecuente
- **Paginación**: Para listas grandes

#### Lazy Loading:
- **Componentes**: Carga bajo demanda
- **Imágenes**: Next.js Image con lazy loading
- **Rutas**: Code splitting automático

---

## 8. Anexos

### 8.1 Glosario de Términos

- **Gama**: Nombre de la cocina central que administra la plataforma
- **Vianda**: Comida preparada para llevar
- **Sucursal**: Ubicación física donde se entregan los pedidos
- **Menú Semanal**: Conjunto de platos disponibles para una semana específica
- **Plan**: Tipo de contratación que define qué incluye cada pedido
- **RBAC**: Role-Based Access Control (Control de Acceso Basado en Roles)
- **RLS**: Row Level Security (Seguridad a Nivel de Fila)

### 8.2 Variables de Entorno

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Email (opcional)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
\`\`\`

### 8.3 Scripts de Utilidad

#### Backup de Base de Datos:
\`\`\`bash
# Backup completo
pg_dump -h your_host -U your_user -d your_db > backup.sql

# Restore
psql -h your_host -U your_user -d your_db < backup.sql
\`\`\`

#### Comandos de Desarrollo:
\`\`\`bash
# Desarrollo
npm run dev

# Build
npm run build

# Lint
npm run lint

# Test
npm run test

# Deploy
npm run deploy
\`\`\`

### 8.4 Recursos Adicionales

#### Documentación Técnica:
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

#### Herramientas de Desarrollo:
- [Supabase Studio](https://app.supabase.com)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Figma](https://figma.com) (para diseño)
- [Postman](https://postman.com) (para testing de APIs)

---

**Documento creado el**: [Fecha actual]  
**Versión**: 1.0  
**Autor**: Equipo de Desarrollo Gama Gourmet  
**Próxima revisión**: [Fecha + 1 mes]

---

*Este documento es un recurso vivo que se actualizará conforme evolucione el proyecto. Para sugerencias o correcciones, contactar al equipo de desarrollo.*
