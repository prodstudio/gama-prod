-- Habilitar RLS en las tablas relacionadas con empresas
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sucursales ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Permitir lectura pública de empresas" ON public.empresas;
DROP POLICY IF EXISTS "Solo Gama admin puede gestionar empresas" ON public.empresas;
DROP POLICY IF EXISTS "Los administradores pueden ver los datos de su propia empresa" ON public.empresas;
DROP POLICY IF EXISTS "Permitir lectura pública de sucursales" ON public.sucursales;
DROP POLICY IF EXISTS "Solo Gama admin puede gestionar sucursales" ON public.sucursales;

-- =================================================================
-- Políticas para la tabla 'empresas'
-- =================================================================

-- 1. Permitir a cualquier usuario autenticado leer las empresas
-- (Los empleados necesitan ver información de su empresa)
CREATE POLICY "Cualquier usuario puede leer empresas"
ON public.empresas FOR SELECT
USING (true); -- Cualquiera puede leer

-- 2. Solo los administradores de Gama pueden crear, actualizar y eliminar empresas
-- Como estamos en modo desarrollo sin autenticación, permitimos todas las operaciones
CREATE POLICY "Permitir todas las operaciones en empresas"
ON public.empresas FOR ALL
USING (true)
WITH CHECK (true);

-- =================================================================
-- Políticas para la tabla 'sucursales'
-- =================================================================

-- 1. Permitir a cualquier usuario autenticado leer las sucursales
CREATE POLICY "Cualquier usuario puede leer sucursales"
ON public.sucursales FOR SELECT
USING (true);

-- 2. Permitir todas las operaciones en sucursales (modo desarrollo)
CREATE POLICY "Permitir todas las operaciones en sucursales"
ON public.sucursales FOR ALL
USING (true)
WITH CHECK (true);

-- =================================================================
-- Políticas adicionales para otras tablas que podrían necesitarlas
-- =================================================================

-- Asegurar que ingredientes y platos sean accesibles
ALTER TABLE public.ingredientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plato_ingredientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus_semanales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_platos ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para modo desarrollo
DROP POLICY IF EXISTS "Permitir lectura de ingredientes" ON public.ingredientes;
CREATE POLICY "Permitir todas las operaciones en ingredientes"
ON public.ingredientes FOR ALL
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir lectura de plato_ingredientes" ON public.plato_ingredientes;
CREATE POLICY "Permitir todas las operaciones en plato_ingredientes"
ON public.plato_ingredientes FOR ALL
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir lectura de menus_semanales" ON public.menus_semanales;
CREATE POLICY "Permitir todas las operaciones en menus_semanales"
ON public.menus_semanales FOR ALL
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir lectura de menu_platos" ON public.menu_platos;
CREATE POLICY "Permitir todas las operaciones en menu_platos"
ON public.menu_platos FOR ALL
USING (true)
WITH CHECK (true);

-- Nota: Estas políticas son temporalmente permisivas para el modo desarrollo.
-- Cuando reactivemos la autenticación, las haremos más restrictivas basadas en roles.
