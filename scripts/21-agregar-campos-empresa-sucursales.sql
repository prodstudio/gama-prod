-- Agregar campos faltantes a la tabla empresas
ALTER TABLE empresas 
ADD COLUMN IF NOT EXISTS descuento_porcentaje DECIMAL(5,2) DEFAULT 0 CHECK (descuento_porcentaje >= 0 AND descuento_porcentaje <= 100);

-- Agregar campos faltantes a la tabla sucursales
ALTER TABLE sucursales 
ADD COLUMN IF NOT EXISTS responsable_nombre VARCHAR(200),
ADD COLUMN IF NOT EXISTS responsable_telefono VARCHAR(20),
ADD COLUMN IF NOT EXISTS dias_entrega INTEGER[] DEFAULT '{1,2,3,4,5}';

-- Comentarios para documentar los campos
COMMENT ON COLUMN empresas.descuento_porcentaje IS 'Porcentaje de descuento aplicado a la empresa (0-100)';
COMMENT ON COLUMN sucursales.responsable_nombre IS 'Nombre del responsable de recibir pedidos en la sucursal';
COMMENT ON COLUMN sucursales.responsable_telefono IS 'Teléfono del responsable de la sucursal';
COMMENT ON COLUMN sucursales.dias_entrega IS 'Días de la semana para entrega (1=Lunes, 7=Domingo)';

-- Verificar la estructura actualizada
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name IN ('empresas', 'sucursales') 
ORDER BY table_name, ordinal_position;
