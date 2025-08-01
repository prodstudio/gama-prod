-- Revisar y arreglar el esquema completo de menús semanales
-- Este script verifica las tablas existentes y las ajusta según sea necesario

-- 1. Verificar si existe la tabla menus_semanales
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'menus_semanales') THEN
        -- Crear tabla menus_semanales si no existe
        CREATE TABLE menus_semanales (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            fecha_inicio DATE NOT NULL,
            fecha_fin DATE NOT NULL,
            activo BOOLEAN DEFAULT true,
            publicado BOOLEAN DEFAULT false,
            estado VARCHAR(20) DEFAULT 'borrador' CHECK (estado IN ('borrador', 'publicado')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
        
        RAISE NOTICE 'Tabla menus_semanales creada';
    ELSE
        RAISE NOTICE 'Tabla menus_semanales ya existe';
        
        -- Verificar y agregar columnas faltantes
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'menus_semanales' AND column_name = 'estado') THEN
            ALTER TABLE menus_semanales ADD COLUMN estado VARCHAR(20) DEFAULT 'borrador' CHECK (estado IN ('borrador', 'publicado'));
            RAISE NOTICE 'Columna estado agregada a menus_semanales';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'menus_semanales' AND column_name = 'nombre') THEN
            ALTER TABLE menus_semanales ADD COLUMN nombre VARCHAR(255) NOT NULL DEFAULT 'Menú sin nombre';
            RAISE NOTICE 'Columna nombre agregada a menus_semanales';
        END IF;
    END IF;
END
$$;

-- 2. Verificar si existe la tabla menu_platos
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'menu_platos') THEN
        -- Crear tabla menu_platos si no existe
        CREATE TABLE menu_platos (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            menu_semanal_id UUID REFERENCES menus_semanales(id) ON DELETE CASCADE,
            plato_id UUID REFERENCES platos(id) ON DELETE CASCADE,
            dia_semana INTEGER NOT NULL CHECK (dia_semana >= 1 AND dia_semana <= 7),
            orden INTEGER DEFAULT 1,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            UNIQUE(menu_semanal_id, plato_id, dia_semana)
        );
        
        RAISE NOTICE 'Tabla menu_platos creada';
    ELSE
        RAISE NOTICE 'Tabla menu_platos ya existe';
        
        -- Verificar y agregar columnas faltantes
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'menu_platos' AND column_name = 'orden') THEN
            ALTER TABLE menu_platos ADD COLUMN orden INTEGER DEFAULT 1;
            RAISE NOTICE 'Columna orden agregada a menu_platos';
        END IF;
    END IF;
END
$$;

-- 3. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_menus_semanales_fecha_inicio ON menus_semanales(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_menus_semanales_estado ON menus_semanales(estado);
CREATE INDEX IF NOT EXISTS idx_menu_platos_menu_id ON menu_platos(menu_semanal_id);
CREATE INDEX IF NOT EXISTS idx_menu_platos_dia_semana ON menu_platos(dia_semana);

-- 4. Crear políticas RLS para menus_semanales
ALTER TABLE menus_semanales ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a todos los usuarios autenticados
DROP POLICY IF EXISTS "Permitir lectura de menús semanales" ON menus_semanales;
CREATE POLICY "Permitir lectura de menús semanales" ON menus_semanales
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir inserción a usuarios autenticados
DROP POLICY IF EXISTS "Permitir inserción de menús semanales" ON menus_semanales;
CREATE POLICY "Permitir inserción de menús semanales" ON menus_semanales
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir actualización a usuarios autenticados
DROP POLICY IF EXISTS "Permitir actualización de menús semanales" ON menus_semanales;
CREATE POLICY "Permitir actualización de menús semanales" ON menus_semanales
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para permitir eliminación a usuarios autenticados
DROP POLICY IF EXISTS "Permitir eliminación de menús semanales" ON menus_semanales;
CREATE POLICY "Permitir eliminación de menús semanales" ON menus_semanales
    FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Crear políticas RLS para menu_platos
ALTER TABLE menu_platos ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a todos los usuarios autenticados
DROP POLICY IF EXISTS "Permitir lectura de menu_platos" ON menu_platos;
CREATE POLICY "Permitir lectura de menu_platos" ON menu_platos
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir inserción a usuarios autenticados
DROP POLICY IF EXISTS "Permitir inserción de menu_platos" ON menu_platos;
CREATE POLICY "Permitir inserción de menu_platos" ON menu_platos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir actualización a usuarios autenticados
DROP POLICY IF EXISTS "Permitir actualización de menu_platos" ON menu_platos;
CREATE POLICY "Permitir actualización de menu_platos" ON menu_platos
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para permitir eliminación a usuarios autenticados
DROP POLICY IF EXISTS "Permitir eliminación de menu_platos" ON menu_platos;
CREATE POLICY "Permitir eliminación de menu_platos" ON menu_platos
    FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Verificar que las tablas relacionadas existan y tengan los permisos correctos
-- Verificar tabla platos
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'platos') THEN
        RAISE EXCEPTION 'La tabla platos no existe. Ejecuta primero los scripts de creación de platos.';
    END IF;
END
$$;

-- 7. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para menus_semanales
DROP TRIGGER IF EXISTS update_menus_semanales_updated_at ON menus_semanales;
CREATE TRIGGER update_menus_semanales_updated_at
    BEFORE UPDATE ON menus_semanales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Insertar algunos datos de prueba si las tablas están vacías
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM menus_semanales LIMIT 1) THEN
        -- Solo insertar si hay platos disponibles
        IF EXISTS (SELECT 1 FROM platos LIMIT 1) THEN
            INSERT INTO menus_semanales (nombre, fecha_inicio, fecha_fin, estado, publicado) VALUES
            ('Menú Semana 1 (01/01 - 05/01)', '2024-01-01', '2024-01-05', 'publicado', true),
            ('Menú Semana 2 (08/01 - 12/01)', '2024-01-08', '2024-01-12', 'borrador', false);
            
            RAISE NOTICE 'Datos de prueba insertados en menus_semanales';
        END IF;
    END IF;
END
$$;

-- 9. Mostrar resumen del esquema
SELECT 
    'menus_semanales' as tabla,
    COUNT(*) as registros
FROM menus_semanales
UNION ALL
SELECT 
    'menu_platos' as tabla,
    COUNT(*) as registros
FROM menu_platos
UNION ALL
SELECT 
    'platos' as tabla,
    COUNT(*) as registros
FROM platos;

-- 10. Verificar permisos
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('menus_semanales', 'menu_platos', 'platos')
ORDER BY tablename;

RAISE NOTICE 'Script de revisión de esquema completado exitosamente';
