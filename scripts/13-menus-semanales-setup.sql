-- Crear tabla de menús semanales
CREATE TABLE IF NOT EXISTS menus_semanales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activo BOOLEAN DEFAULT true,
    publicado BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Validaciones
    CONSTRAINT valid_date_range CHECK (fecha_fin >= fecha_inicio),
    CONSTRAINT valid_week_duration CHECK (fecha_fin - fecha_inicio <= 7)
);

-- Crear tabla de relación menú-platos
CREATE TABLE IF NOT EXISTS menu_platos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    menu_id UUID NOT NULL REFERENCES menus_semanales(id) ON DELETE CASCADE,
    plato_id UUID NOT NULL REFERENCES platos(id) ON DELETE CASCADE,
    dia_semana INTEGER NOT NULL CHECK (dia_semana >= 1 AND dia_semana <= 7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Evitar duplicados: mismo plato en el mismo día del mismo menú
    UNIQUE(menu_id, plato_id, dia_semana)
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_menus_semanales_fechas ON menus_semanales(fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_menus_semanales_activo ON menus_semanales(activo);
CREATE INDEX IF NOT EXISTS idx_menu_platos_menu_id ON menu_platos(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_platos_dia_semana ON menu_platos(dia_semana);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en menus_semanales
DROP TRIGGER IF EXISTS update_menus_semanales_updated_at ON menus_semanales;
CREATE TRIGGER update_menus_semanales_updated_at
    BEFORE UPDATE ON menus_semanales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Otorgar permisos completos (para desarrollo)
GRANT ALL ON menus_semanales TO postgres;
GRANT ALL ON menu_platos TO postgres;
GRANT ALL ON menus_semanales TO anon;
GRANT ALL ON menu_platos TO anon;
GRANT ALL ON menus_semanales TO authenticated;
GRANT ALL ON menu_platos TO authenticated;

-- Deshabilitar RLS temporalmente para desarrollo
ALTER TABLE menus_semanales DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_platos DISABLE ROW LEVEL SECURITY;

-- Datos de prueba
INSERT INTO menus_semanales (fecha_inicio, fecha_fin, activo, publicado) VALUES
('2024-02-05', '2024-02-11', true, true),
('2024-02-12', '2024-02-18', true, false),
('2024-02-19', '2024-02-25', false, false)
ON CONFLICT DO NOTHING;

-- Obtener IDs para los datos de prueba (solo si existen platos)
DO $$
DECLARE
    menu1_id UUID;
    menu2_id UUID;
    plato1_id UUID;
    plato2_id UUID;
    plato3_id UUID;
BEGIN
    -- Obtener IDs de menús
    SELECT id INTO menu1_id FROM menus_semanales WHERE fecha_inicio = '2024-02-05' LIMIT 1;
    SELECT id INTO menu2_id FROM menus_semanales WHERE fecha_inicio = '2024-02-12' LIMIT 1;
    
    -- Obtener algunos platos existentes
    SELECT id INTO plato1_id FROM platos LIMIT 1 OFFSET 0;
    SELECT id INTO plato2_id FROM platos LIMIT 1 OFFSET 1;
    SELECT id INTO plato3_id FROM platos LIMIT 1 OFFSET 2;
    
    -- Solo insertar si tenemos platos disponibles
    IF plato1_id IS NOT NULL AND menu1_id IS NOT NULL THEN
        INSERT INTO menu_platos (menu_id, plato_id, dia_semana) VALUES
        (menu1_id, plato1_id, 1), -- Lunes
        (menu1_id, plato2_id, 2), -- Martes
        (menu1_id, plato3_id, 3)  -- Miércoles
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF plato1_id IS NOT NULL AND menu2_id IS NOT NULL THEN
        INSERT INTO menu_platos (menu_id, plato_id, dia_semana) VALUES
        (menu2_id, plato1_id, 1), -- Lunes
        (menu2_id, plato3_id, 4)  -- Jueves
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
