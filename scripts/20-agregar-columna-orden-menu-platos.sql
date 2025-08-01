-- Agregar columna orden a menu_platos si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_platos' 
        AND column_name = 'orden'
    ) THEN
        ALTER TABLE menu_platos ADD COLUMN orden INTEGER DEFAULT 1;
        
        -- Actualizar registros existentes con orden secuencial por día
        UPDATE menu_platos 
        SET orden = row_number() OVER (PARTITION BY menu_semanal_id, dia_semana ORDER BY created_at);
        
        RAISE NOTICE 'Columna orden agregada exitosamente a menu_platos';
    ELSE
        RAISE NOTICE 'La columna orden ya existe en menu_platos';
    END IF;
END $$;

-- Verificar que la columna existe y mostrar estructura
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'menu_platos' 
ORDER BY ordinal_position;

-- Mostrar algunos registros de ejemplo si existen
SELECT 
    mp.id,
    mp.menu_semanal_id,
    mp.plato_id,
    mp.dia_semana,
    mp.orden,
    p.nombre as plato_nombre
FROM menu_platos mp
LEFT JOIN platos p ON mp.plato_id = p.id
ORDER BY mp.menu_semanal_id, mp.dia_semana, mp.orden
LIMIT 10;
