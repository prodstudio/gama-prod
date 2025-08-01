-- Agregar columna 'orden' a la tabla menu_platos si no existe
DO $$
BEGIN
    -- Verificar si la columna 'orden' existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'menu_platos' 
        AND column_name = 'orden'
    ) THEN
        -- Agregar la columna 'orden'
        ALTER TABLE menu_platos ADD COLUMN orden INTEGER DEFAULT 1;
        
        -- Actualizar registros existentes con orden secuencial por día
        UPDATE menu_platos 
        SET orden = subquery.row_num
        FROM (
            SELECT id, 
                   ROW_NUMBER() OVER (PARTITION BY menu_semanal_id, dia_semana ORDER BY created_at) as row_num
            FROM menu_platos
        ) AS subquery
        WHERE menu_platos.id = subquery.id;
        
        -- Hacer la columna NOT NULL después de actualizar los datos
        ALTER TABLE menu_platos ALTER COLUMN orden SET NOT NULL;
        
    END IF;
END $$;

-- Verificar la estructura de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'menu_platos'
ORDER BY ordinal_position;

-- Mostrar algunos registros de ejemplo
SELECT id, menu_semanal_id, plato_id, dia_semana, orden, created_at
FROM menu_platos
ORDER BY menu_semanal_id, dia_semana, orden
LIMIT 10;
