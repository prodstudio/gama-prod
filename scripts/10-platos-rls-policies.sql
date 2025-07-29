-- Políticas RLS para tabla platos
-- Permitir acceso completo durante desarrollo (temporal)

-- Habilitar RLS en la tabla platos
ALTER TABLE platos ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Desarrollo - Acceso completo a platos" ON platos;

-- Política temporal para desarrollo - permitir todo acceso
CREATE POLICY "Desarrollo - Acceso completo a platos" ON platos
  FOR ALL USING (true)
  WITH CHECK (true);

-- Habilitar RLS en la tabla plato_ingredientes
ALTER TABLE plato_ingredientes ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Desarrollo - Acceso completo a plato_ingredientes" ON plato_ingredientes;

-- Política temporal para desarrollo - permitir todo acceso a plato_ingredientes
CREATE POLICY "Desarrollo - Acceso completo a plato_ingredientes" ON plato_ingredientes
  FOR ALL USING (true)
  WITH CHECK (true);

-- Comentarios para recordar las políticas finales
/*
POLÍTICAS FINALES (cuando reactivemos auth):

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
*/
