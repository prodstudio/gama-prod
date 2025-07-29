-- Arreglar permisos para tabla ingredientes
-- Crear políticas RLS para desarrollo

-- 1. Verificar si RLS está habilitado en ingredientes
ALTER TABLE ingredientes ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Permitir todo en ingredientes durante desarrollo" ON ingredientes;

-- 3. Crear política temporal para desarrollo (permite todo acceso)
CREATE POLICY "Permitir todo en ingredientes durante desarrollo" ON ingredientes
    FOR ALL USING (true) WITH CHECK (true);

-- 4. Verificar que tenemos datos de prueba en ingredientes
INSERT INTO ingredientes (nombre, unidad_de_medida, categoria, activo) VALUES
('Carne molida', 'gramos', 'Proteínas', true),
('Pollo', 'gramos', 'Proteínas', true),
('Papa', 'gramos', 'Verduras', true),
('Tomate', 'gramos', 'Verduras', true),
('Cebolla', 'gramos', 'Verduras', true),
('Lechuga', 'gramos', 'Verduras', true),
('Zanahoria', 'gramos', 'Verduras', true),
('Huevo', 'unidades', 'Proteínas', true),
('Pan rallado', 'gramos', 'Cereales', true),
('Queso parmesano', 'gramos', 'Lácteos', true),
('Fideos', 'gramos', 'Cereales', true),
('Aceite de oliva', 'ml', 'Aceites', true),
('Sal', 'gramos', 'Condimentos', true),
('Pimienta', 'gramos', 'Condimentos', true),
('Ajo', 'gramos', 'Verduras', true)
ON CONFLICT (nombre) DO NOTHING;

-- 5. Comentario para políticas finales
/*
POLÍTICAS FINALES (cuando reactivemos auth):

DROP POLICY "Permitir todo en ingredientes durante desarrollo" ON ingredientes;

-- Solo gama_admin puede gestionar ingredientes
CREATE POLICY "Solo gama_admin gestiona ingredientes" ON ingredientes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'gama_admin'
    )
  );

-- Todos pueden leer ingredientes activos
CREATE POLICY "Todos leen ingredientes activos" ON ingredientes
  FOR SELECT USING (activo = true);
*/
