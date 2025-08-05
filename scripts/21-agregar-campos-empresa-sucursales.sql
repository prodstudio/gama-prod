-- Script para agregar campos faltantes a empresas y sucursales
-- Fecha: 2025-01-08

-- Agregar campo de descuento a la tabla empresas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'empresas' AND column_name = 'descuento_porcentaje'
    ) THEN
        ALTER TABLE empresas 
        ADD COLUMN descuento_porcentaje DECIMAL(5,2) DEFAULT 0 
        CHECK (descuento_porcentaje >= 0 AND descuento_porcentaje <= 100);
        
        RAISE NOTICE 'Columna descuento_porcentaje agregada a empresas';
    ELSE
        RAISE NOTICE 'Columna descuento_porcentaje ya existe en empresas';
    END IF;
END $$;

-- Agregar campos faltantes a la tabla sucursales
DO $$ 
BEGIN
    -- Responsable nombre
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sucursales' AND column_name = 'responsable_nombre'
    ) THEN
        ALTER TABLE sucursales ADD COLUMN responsable_nombre VARCHAR(200);
        RAISE NOTICE 'Columna responsable_nombre agregada a sucursales';
    ELSE
        RAISE NOTICE 'Columna responsable_nombre ya existe en sucursales';
    END IF;

    -- Responsable teléfono
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sucursales' AND column_name = 'responsable_telefono'
    ) THEN
        ALTER TABLE sucursales ADD COLUMN responsable_telefono VARCHAR(20);
        RAISE NOTICE 'Columna responsable_telefono agregada a sucursales';
    ELSE
        RAISE NOTICE 'Columna responsable_telefono ya existe en sucursales';
    END IF;

    -- Días de entrega
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sucursales' AND column_name = 'dias_entrega'
    ) THEN
        ALTER TABLE sucursales ADD COLUMN dias_entrega INTEGER[] DEFAULT '{1,2,3,4,5}';
        RAISE NOTICE 'Columna dias_entrega agregada a sucursales';
    ELSE
        RAISE NOTICE 'Columna dias_entrega ya existe en sucursales';
    END IF;
END $$;

-- Agregar comentarios para documentar los campos
COMMENT ON COLUMN empresas.descuento_porcentaje IS 'Porcentaje de descuento aplicado a la empresa (0-100)';
COMMENT ON COLUMN sucursales.responsable_nombre IS 'Nombre del responsable de recibir pedidos en la sucursal';
COMMENT ON COLUMN sucursales.responsable_telefono IS 'Teléfono del responsable de la sucursal';
COMMENT ON COLUMN sucursales.dias_entrega IS 'Días de la semana para entrega (1=Lunes, 7=Domingo)';

-- Actualizar registros existentes con valores por defecto
UPDATE empresas SET descuento_porcentaje = 0 WHERE descuento_porcentaje IS NULL;
UPDATE sucursales SET dias_entrega = '{1,2,3,4,5}' WHERE dias_entrega IS NULL;

-- Verificar la estructura actualizada
SELECT 
    'empresas' as tabla,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'empresas' 
    AND column_name IN ('descuento_porcentaje')

UNION ALL

SELECT 
    'sucursales' as tabla,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'sucursales' 
    AND column_name IN ('responsable_nombre', 'responsable_telefono', 'dias_entrega')
ORDER BY tabla, column_name;

-- Mostrar algunos registros de ejemplo
SELECT 'Empresas con descuento:' as info;
SELECT id, nombre, descuento_porcentaje FROM empresas LIMIT 3;

SELECT 'Sucursales con nuevos campos:' as info;
SELECT id, nombre, responsable_nombre, dias_entrega FROM sucursales LIMIT 3;
