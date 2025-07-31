-- Script para configurar menús semanales
-- Crear tabla menus_semanales si no existe
CREATE TABLE IF NOT EXISTS menus_semanales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  activo BOOLEAN DEFAULT true,
  publicado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Validaciones
  CONSTRAINT valid_date_range CHECK (fecha_fin >= fecha_inicio),
  CONSTRAINT valid_week_range CHECK (fecha_fin - fecha_inicio <= 6)
);

-- Crear tabla menu_platos para la relación N:N
CREATE TABLE IF NOT EXISTS menu_platos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_semanal_id UUID NOT NULL REFERENCES menus_semanales(id) ON DELETE CASCADE,
  plato_id UUID NOT NULL REFERENCES platos(id) ON DELETE CASCADE,
  dia_semana INTEGER NOT NULL CHECK (dia_semana >= 1 AND dia_semana <= 7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Evitar duplicados: mismo plato en el mismo día del mismo menú
  UNIQUE(menu_semanal_id, plato_id, dia_semana)
);

-- Deshabilitar RLS para desarrollo
ALTER TABLE menus_semanales DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_platos DISABLE ROW LEVEL SECURITY;

-- Otorgar permisos completos
GRANT ALL ON menus_semanales TO authenticated;
GRANT ALL ON menu_platos TO authenticated;
GRANT ALL ON menus_semanales TO anon;
GRANT ALL ON menu_platos TO anon;

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_menus_semanales_fecha_inicio ON menus_semanales(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_menus_semanales_activo ON menus_semanales(activo);
CREATE INDEX IF NOT EXISTS idx_menus_semanales_publicado ON menus_semanales(publicado);
CREATE INDEX IF NOT EXISTS idx_menu_platos_menu_id ON menu_platos(menu_semanal_id);
CREATE INDEX IF NOT EXISTS idx_menu_platos_plato_id ON menu_platos(plato_id);
CREATE INDEX IF NOT EXISTS idx_menu_platos_dia_semana ON menu_platos(dia_semana);

-- Insertar datos de prueba
INSERT INTO menus_semanales (fecha_inicio, fecha_fin, activo, publicado) VALUES
  ('2024-02-05', '2024-02-11', true, true),
  ('2024-02-12', '2024-02-18', true, false),
  ('2024-02-19', '2024-02-25', false, false)
ON CONFLICT DO NOTHING;

-- Obtener IDs para los datos de prueba
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
  
  -- Obtener IDs de platos (asumiendo que existen)
  SELECT id INTO plato1_id FROM platos WHERE nombre ILIKE '%pollo%' LIMIT 1;
  SELECT id INTO plato2_id FROM platos WHERE nombre ILIKE '%pasta%' LIMIT 1;
  SELECT id INTO plato3_id FROM platos WHERE nombre ILIKE '%ensalada%' LIMIT 1;
  
  -- Si no encontramos platos, usar los primeros disponibles
  IF plato1_id IS NULL THEN
    SELECT id INTO plato1_id FROM platos WHERE activo = true LIMIT 1;
  END IF;
  
  IF plato2_id IS NULL THEN
    SELECT id INTO plato2_id FROM platos WHERE activo = true AND id != plato1_id LIMIT 1;
  END IF;
  
  IF plato3_id IS NULL THEN
    SELECT id INTO plato3_id FROM platos WHERE activo = true AND id NOT IN (plato1_id, plato2_id) LIMIT 1;
  END IF;
  
  -- Insertar relaciones menu-platos
  IF menu1_id IS NOT NULL AND plato1_id IS NOT NULL THEN
    INSERT INTO menu_platos (menu_semanal_id, plato_id, dia_semana) VALUES
    (menu1_id, plato1_id, 1), -- Lunes
    (menu1_id, plato2_id, 2), -- Martes
    (menu1_id, plato3_id, 3), -- Miércoles
    (menu1_id, plato1_id, 4), -- Jueves
    (menu1_id, plato2_id, 5)  -- Viernes
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF menu2_id IS NOT NULL AND plato2_id IS NOT NULL THEN
    INSERT INTO menu_platos (menu_semanal_id, plato_id, dia_semana) VALUES
    (menu2_id, plato2_id, 1), -- Lunes
    (menu2_id, plato3_id, 2), -- Martes
    (menu2_id, plato1_id, 3)  -- Miércoles
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Verificar que todo se creó correctamente
SELECT 'Menús semanales creados:' as info, count(*) as cantidad FROM menus_semanales;
SELECT 'Relaciones menu-platos creadas:' as info, count(*) as cantidad FROM menu_platos;

-- Mostrar datos de prueba
SELECT 
  ms.fecha_inicio,
  ms.fecha_fin,
  ms.activo,
  ms.publicado,
  count(mp.id) as platos_asignados
FROM menus_semanales ms
LEFT JOIN menu_platos mp ON ms.id = mp.menu_semanal_id
GROUP BY ms.id, ms.fecha_inicio, ms.fecha_fin, ms.activo, ms.publicado
ORDER BY ms.fecha_inicio;

COMMIT;
