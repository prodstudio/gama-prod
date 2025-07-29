export type UserRole = "gama_admin" | "empresa_admin" | "empleado"
export type PedidoEstado = "solicitado" | "en_preparacion" | "entregado" | "cancelado"

export interface Plan {
  id: string
  nombre: string
  descripcion?: string
  incluye_entrada: boolean
  incluye_postre: boolean
  incluye_bebida: boolean
  precio_mensual?: number
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Empresa {
  id: string
  nombre: string
  email_contacto?: string
  telefono?: string
  plan_id?: string
  activa: boolean
  created_at: string
  updated_at: string
  plan?: Plan
  sucursales?: Sucursal[]
}

export interface Sucursal {
  id: string
  nombre: string
  direccion: string
  telefono?: string
  empresa_id: string
  activa: boolean
  created_at: string
  updated_at: string
  empresa?: Empresa
}

export interface User {
  id: string
  email: string
  nombre?: string
  apellido?: string
  role: UserRole
  empresa_id?: string
  activo: boolean
  created_at: string
  updated_at: string
  empresa?: Empresa
}

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  nombre?: string
  apellido?: string
  empresa_id?: string
  activo: boolean
  created_at?: string
  updated_at?: string
  empresa?: Empresa
}

export interface Ingrediente {
  id: string
  nombre: string
  unidad_de_medida: string
  categoria?: string
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Plato {
  id: string
  nombre: string
  descripcion?: string
  tipo?: string
  imagen_url?: string
  activo: boolean
  created_at: string
  updated_at: string
  ingredientes?: PlatoIngrediente[]
}

export interface PlatoIngrediente {
  plato_id: string
  ingrediente_id: string
  cantidad: number
  ingrediente?: Ingrediente
}

export interface MenuSemanal {
  id: string
  fecha_inicio: string
  fecha_fin: string
  activo: boolean
  publicado: boolean
  created_at: string
  updated_at: string
  platos?: MenuPlato[]
}

export interface MenuPlato {
  menu_semanal_id: string
  plato_id: string
  dia_semana: number
  plato?: Plato
}

export interface Pedido {
  id: string
  user_id: string
  sucursal_id?: string
  plato_id?: string
  menu_semanal_id?: string
  fecha_pedido: string
  fecha_entrega: string
  estado: PedidoEstado
  observaciones?: string
  created_at: string
  updated_at: string
  user?: User
  sucursal?: Sucursal
  plato?: Plato
  menu_semanal?: MenuSemanal
}

// Tipos para las respuestas de la base de datos
export type Database = {
  public: {
    Tables: {
      planes: {
        Row: Plan
        Insert: Omit<Plan, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Plan, "id" | "created_at" | "updated_at">>
      }
      empresas: {
        Row: Empresa
        Insert: Omit<Empresa, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Empresa, "id" | "created_at" | "updated_at">>
      }
      sucursales: {
        Row: Sucursal
        Insert: Omit<Sucursal, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Sucursal, "id" | "created_at" | "updated_at">>
      }
      users: {
        Row: User
        Insert: Omit<User, "created_at" | "updated_at">
        Update: Partial<Omit<User, "id" | "created_at" | "updated_at">>
      }
      ingredientes: {
        Row: Ingrediente
        Insert: Omit<Ingrediente, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Ingrediente, "id" | "created_at" | "updated_at">>
      }
      platos: {
        Row: Plato
        Insert: Omit<Plato, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Plato, "id" | "created_at" | "updated_at">>
      }
      plato_ingredientes: {
        Row: PlatoIngrediente
        Insert: PlatoIngrediente
        Update: Partial<PlatoIngrediente>
      }
      menus_semanales: {
        Row: MenuSemanal
        Insert: Omit<MenuSemanal, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<MenuSemanal, "id" | "created_at" | "updated_at">>
      }
      menu_platos: {
        Row: MenuPlato
        Insert: MenuPlato
        Update: Partial<MenuPlato>
      }
      pedidos: {
        Row: Pedido
        Insert: Omit<Pedido, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Pedido, "id" | "created_at" | "updated_at">>
      }
    }
    Enums: {
      user_role: UserRole
      pedido_estado: PedidoEstado
    }
  }
}
