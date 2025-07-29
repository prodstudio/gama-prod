-- Recrear tablas platos y plato_ingredientes desde cero
-- Con políticas RLS correctas para desarrollo

-- 1. Eliminar tablas existentes (CASCADE elimina dependencias)
DROP TABLE IF EXISTS plato_ingredientes CASCADE;
DROP TABLE IF EXISTS platos CASCADE;

-- 2. Recrear tabla platos
CREATE TABLE platos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(50) CHECK (tipo IN ('entrada', 'principal', 'postre', 'bebida')),
    imagen_url TEXT,
    calorias INTEGER CHECK (calorias >= 0),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Recrear tabla plato_ingredientes (relación N:N)
CREATE TABLE plato_ingredientes (
    plato_id UUID REFERENCES platos(id) ON DELETE CASCADE,
    ingrediente_id UUID REFERENCES ingredientes(id) ON DELETE CASCADE,
    cantidad DECIMAL(10,2) NOT NULL CHECK (cantidad > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (plato_id, ingrediente_id)
);

-- 4. Crear índices para optimizar consultas
CREATE INDEX idx_platos_activo ON platos(activo);
CREATE INDEX idx_platos_tipo ON platos(tipo);
CREATE INDEX idx_plato_ingredientes_plato_id ON plato_ingredientes(plato_id);
CREATE INDEX idx_plato_ingredientes_ingrediente_id ON plato_ingredientes(ingrediente_id);

-- 5. Habilitar RLS
ALTER TABLE platos ENABLE ROW LEVEL SECURITY;
ALTER TABLE plato_ingredientes ENABLE ROW LEVEL SECURITY;

-- 6. Crear políticas RLS para desarrollo (permiten todo acceso)
CREATE POLICY "Permitir todo en platos durante desarrollo" ON platos
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir todo en plato_ingredientes durante desarrollo" ON plato_ingredientes
    FOR ALL USING (true) WITH CHECK (true);

-- 7. Insertar datos de prueba
INSERT INTO platos (nombre, descripcion, tipo, calorias) VALUES
('Milanesa con Puré', 'Milanesa de carne con puré de papas casero', 'principal', 650),
('Ensalada César', 'Ensalada fresca con pollo, crutones y aderezo césar', 'entrada', 320),
('Pasta Bolognesa', 'Fideos con salsa bolognesa casera', 'principal', 580),
('Tarta de Manzana', 'Tarta casera de manzana con canela', 'postre', 280),
('Agua Mineral', 'Agua mineral sin gas 500ml', 'bebida', 0),
('Pollo al Horno', 'Pollo al horno con hierbas y verduras', 'principal', 420),
('Sopa de Verduras', 'Sopa casera de verduras de estación', 'entrada', 150);

-- 8. Crear algunas relaciones de ejemplo con ingredientes existentes
-- (Esto asume que ya tienes ingredientes en la tabla)
INSERT INTO plato_ingredientes (plato_id, ingrediente_id, cantidad)
SELECT 
    p.id,
    i.id,
    CASE 
        WHEN i.nombre LIKE '%carne%' THEN 200
        WHEN i.nombre LIKE '%papa%' THEN 300
        WHEN i.nombre LIKE '%pollo%' THEN 150
        WHEN i.nombre LIKE '%tomate%' THEN 100
        ELSE 50
    END
FROM platos p
CROSS JOIN ingredientes i
WHERE 
    (p.nombre = 'Milanesa con Puré' AND i.nombre IN ('Carne molida', 'Papa', 'Huevo', 'Pan rallado'))
    OR (p.nombre = 'Ensalada César' AND i.nombre IN ('Lechuga', 'Pollo', 'Queso parmesano'))
    OR (p.nombre = 'Pasta Bolognesa' AND i.nombre IN ('Fideos', 'Carne molida', 'Tomate', 'Cebolla'))
    OR (p.nombre = 'Pollo al Horno' AND i.nombre IN ('Pollo', 'Zanahoria', 'Cebolla'))
LIMIT 20;

-- 9. Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_platos_updated_at BEFORE UPDATE ON platos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Comentarios para las políticas finales
/*
POLÍTICAS FINALES (cuando reactivemos auth):

DROP POLICY "Permitir todo en platos durante desarrollo" ON platos;
DROP POLICY "Permitir todo en plato_ingredientes durante desarrollo" ON plato_ingredientes;

-- Solo gama_admin puede gestionar platos
CREATE POLICY "Solo gama_admin gestiona platos" ON platos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'gama_admin'
    )
  );

-- Todos pueden leer platos activos
CREATE POLICY "Todos leen platos activos" ON platos
  FOR SELECT USING (activo = true);

-- Solo gama_admin puede gestionar plato_ingredientes
CREATE POLICY "Solo gama_admin gestiona plato_ingredientes" ON plato_ingredientes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'gama_admin'
    )
  );

-- Todos pueden leer relaciones de platos activos
CREATE POLICY "Todos leen ingredientes de platos activos" ON plato_ingredientes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM platos 
      WHERE platos.id = plato_ingredientes.plato_id 
      AND platos.activo = true
    )
  );
*/
