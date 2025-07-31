-- Crear tabla de menús semanales
CREATE TABLE IF NOT EXISTS menus_semanales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activo BOOLEAN DEFAULT true,
    publicado BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT menus_semanales_fecha_valida CHECK (fecha_fin >= fecha_inicio),
    CONSTRAINT menus_semanales_duracion_maxima CHECK (fecha_fin - fecha_inicio <= INTERVAL '7 days')
);

-- Crear tabla de relación menú-platos
CREATE TABLE IF NOT EXISTS menu_platos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    menu_semanal_id UUID NOT NULL REFERENCES menus_semanales(id) ON DELETE CASCADE,
    plato_id UUID NOT NULL REFERENCES platos(id) ON DELETE CASCADE,
    dia_semana INTEGER NOT NULL CHECK (dia_semana >= 1 AND dia_semana <= 7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint para evitar duplicados del mismo plato en el mismo día del mismo menú
    UNIQUE(menu_semanal_id, plato_id, dia_semana)
);

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_menus_semanales_fecha_inicio ON menus_semanales(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_menus_semanales_activo ON menus_semanales(activo);
CREATE INDEX IF NOT EXISTS idx_menus_semanales_publicado ON menus_semanales(publicado);
CREATE INDEX IF NOT EXISTS idx_menu_platos_menu_id ON menu_platos(menu_semanal_id);
CREATE INDEX IF NOT EXISTS idx_menu_platos_plato_id ON menu_platos(plato_id);
CREATE INDEX IF NOT EXISTS idx_menu_platos_dia_semana ON menu_platos(dia_semana);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en menus_semanales
DROP TRIGGER IF EXISTS update_menus_semanales_updated_at ON menus_semanales;
CREATE TRIGGER update_menus_semanales_updated_at
    BEFORE UPDATE ON menus_semanales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE menus_semanales ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_platos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para menus_semanales
DROP POLICY IF EXISTS "Permitir todo para usuarios autenticados en menus_semanales" ON menus_semanales;
CREATE POLICY "Permitir todo para usuarios autenticados en menus_semanales"
    ON menus_semanales FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Políticas RLS para menu_platos
DROP POLICY IF EXISTS "Permitir todo para usuarios autenticados en menu_platos" ON menu_platos;
CREATE POLICY "Permitir todo para usuarios autenticados en menu_platos"
    ON menu_platos FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Insertar datos de prueba si las tablas están vacías
DO $$
BEGIN
    -- Solo insertar si no hay datos
    IF NOT EXISTS (SELECT 1 FROM menus_semanales LIMIT 1) THEN
        -- Insertar un menú de ejemplo
        INSERT INTO menus_semanales (fecha_inicio, fecha_fin, activo, publicado) VALUES
        ('2024-02-05', '2024-02-11', true, true);
        
        -- Obtener el ID del menú insertado y agregar algunos platos
        INSERT INTO menu_platos (menu_semanal_id, plato_id, dia_semana)
        SELECT 
            ms.id,
            p.id,
            CASE 
                WHEN ROW_NUMBER() OVER (ORDER BY p.nombre) = 1 THEN 1 -- Lunes
                WHEN ROW_NUMBER() OVER (ORDER BY p.nombre) = 2 THEN 2 -- Martes
                WHEN ROW_NUMBER() OVER (ORDER BY p.nombre) = 3 THEN 3 -- Miércoles
                ELSE 4 -- Jueves
            END
        FROM menus_semanales ms
        CROSS JOIN (
            SELECT id, nombre FROM platos 
            WHERE activo = true 
            ORDER BY nombre 
            LIMIT 4
        ) p
        WHERE ms.fecha_inicio = '2024-02-05';
    END IF;
END $$;

-- Comentarios para documentación
COMMENT ON TABLE menus_semanales IS 'Tabla para almacenar los menús semanales';
COMMENT ON COLUMN menus_semanales.fecha_inicio IS 'Fecha de inicio del menú semanal';
COMMENT ON COLUMN menus_semanales.fecha_fin IS 'Fecha de fin del menú semanal';
COMMENT ON COLUMN menus_semanales.activo IS 'Indica si el menú está activo';
COMMENT ON COLUMN menus_semanales.publicado IS 'Indica si el menú está publicado para los empleados';

COMMENT ON TABLE menu_platos IS 'Tabla de relación entre menús semanales y platos';
COMMENT ON COLUMN menu_platos.menu_semanal_id IS 'ID del menú semanal';
COMMENT ON COLUMN menu_platos.plato_id IS 'ID del plato';
COMMENT ON COLUMN menu_platos.dia_semana IS 'Día de la semana (1=Lunes, 7=Domingo)';
