-- Crear tipos enum para roles y estados
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('gama_admin', 'empresa_admin', 'empleado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE pedido_estado AS ENUM ('solicitado', 'en_preparacion', 'entregado', 'cancelado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabla de planes
CREATE TABLE IF NOT EXISTS planes (
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

-- Tabla de empresas
CREATE TABLE IF NOT EXISTS empresas (
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

-- Tabla de sucursales
CREATE TABLE IF NOT EXISTS sucursales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    direccion TEXT NOT NULL,
    telefono VARCHAR(20),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de usuarios (extiende auth.users)
CREATE TABLE IF NOT EXISTS users (
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

-- Tabla de ingredientes
CREATE TABLE IF NOT EXISTS ingredientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    unidad_de_medida VARCHAR(50) NOT NULL,
    categoria VARCHAR(100),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de platos
CREATE TABLE IF NOT EXISTS platos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(50),
    imagen_url TEXT,
    calorias INTEGER,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de relación platos-ingredientes (N:N)
CREATE TABLE IF NOT EXISTS plato_ingredientes (
    plato_id UUID REFERENCES platos(id) ON DELETE CASCADE,
    ingrediente_id UUID REFERENCES ingredientes(id) ON DELETE CASCADE,
    cantidad DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (plato_id, ingrediente_id)
);

-- Tabla de menús semanales
CREATE TABLE IF NOT EXISTS menus_semanales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activo BOOLEAN DEFAULT true,
    publicado BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fecha_fin_mayor_inicio CHECK (fecha_fin > fecha_inicio)
);

-- Tabla de relación menús-platos (N:N)
CREATE TABLE IF NOT EXISTS menu_platos (
    menu_semanal_id UUID REFERENCES menus_semanales(id) ON DELETE CASCADE,
    plato_id UUID REFERENCES platos(id) ON DELETE CASCADE,
    dia_semana INTEGER NOT NULL CHECK (dia_semana >= 1 AND dia_semana <= 7),
    PRIMARY KEY (menu_semanal_id, plato_id, dia_semana)
);

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
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

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_users_empresa ON users(empresa_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_pedidos_user ON pedidos(user_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha_entrega ON pedidos(fecha_entrega);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_sucursales_empresa ON sucursales(empresa_id);
CREATE INDEX IF NOT EXISTS idx_menu_platos_menu ON menu_platos(menu_semanal_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at (solo si no existen)
DO $$ BEGIN
    CREATE TRIGGER update_planes_updated_at BEFORE UPDATE ON planes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON empresas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_sucursales_updated_at BEFORE UPDATE ON sucursales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_ingredientes_updated_at BEFORE UPDATE ON ingredientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_platos_updated_at BEFORE UPDATE ON platos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_menus_semanales_updated_at BEFORE UPDATE ON menus_semanales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON pedidos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
