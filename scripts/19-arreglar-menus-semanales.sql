-- Arreglar la tabla menus_semanales para que funcione correctamente

-- 1. Verificar si la tabla existe y recrearla si es necesario
DROP TABLE IF EXISTS menu_platos CASCADE;
DROP TABLE IF EXISTS menus_semanales CASCADE;

-- 2. Crear la tabla menus_semanales con la estructura correcta
CREATE TABLE menus_semanales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activo BOOLEAN DEFAULT true,
    publicado BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Crear la tabla menu_platos
CREATE TABLE menu_platos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    menu_semanal_id UUID REFERENCES menus_semanales(id) ON DELETE CASCADE,
    plato_id UUID REFERENCES platos(id) ON DELETE CASCADE,
    dia_semana INTEGER NOT NULL CHECK (dia_semana >= 1 AND dia_semana <= 7),
    orden INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(menu_semanal_id, plato_id, dia_semana)
);

-- 4. Crear índices
CREATE INDEX idx_menus_semanales_fecha_inicio ON menus_semanales(fecha_inicio);
CREATE INDEX idx_menus_semanales_publicado ON menus_semanales(publicado);
CREATE INDEX idx_menu_platos_menu_id ON menu_platos(menu_semanal_id);
CREATE INDEX idx_menu_platos_dia_semana ON menu_platos(dia_semana);

-- 5. Habilitar RLS
ALTER TABLE menus_semanales ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_platos ENABLE ROW LEVEL SECURITY;

-- 6. Crear políticas RLS para menus_semanales
CREATE POLICY "Permitir todo a usuarios autenticados en menus_semanales" ON menus_semanales
    FOR ALL USING (auth.role() = 'authenticated');

-- 7. Crear políticas RLS para menu_platos
CREATE POLICY "Permitir todo a usuarios autenticados en menu_platos" ON menu_platos
    FOR ALL USING (auth.role() = 'authenticated');

-- 8. Crear función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Crear trigger para menus_semanales
CREATE TRIGGER update_menus_semanales_updated_at
    BEFORE UPDATE ON menus_semanales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Insertar datos de prueba
INSERT INTO menus_semanales (nombre, fecha_inicio, fecha_fin, publicado) VALUES
('Menú de Prueba 1', '2024-02-05', '2024-02-09', true),
('Menú de Prueba 2', '2024-02-12', '2024-02-16', false);

-- 11. Mostrar estructura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'menus_semanales'
ORDER BY ordinal_position;
