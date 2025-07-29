-- =====================================================================
-- SCRIPT DE PERMISOS TOTALES PARA MODO DESARROLLO
-- =====================================================================
-- ADVERTENCIA: Este script otorga permisos completos a todas las tablas.
-- Solo usar en desarrollo. En producción, usar políticas más restrictivas.
-- =====================================================================

-- Deshabilitar RLS temporalmente en todas las tablas
ALTER TABLE public.planes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sucursales DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.platos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.plato_ingredientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus_semanales DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_platos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos DISABLE ROW LEVEL SECURITY;

-- Eliminar TODAS las políticas existentes para empezar limpio
DROP POLICY IF EXISTS "Cualquier usuario puede leer planes" ON public.planes;
DROP POLICY IF EXISTS "Solo Gama admin puede gestionar planes" ON public.planes;
DROP POLICY IF EXISTS "Permitir lectura pública de planes" ON public.planes;
DROP POLICY IF EXISTS "Los administradores de Gama pueden gestionar los planes" ON public.planes;

DROP POLICY IF EXISTS "Cualquier usuario puede leer empresas" ON public.empresas;
DROP POLICY IF EXISTS "Permitir todas las operaciones en empresas" ON public.empresas;
DROP POLICY IF EXISTS "Los administradores pueden ver los datos de su propia empresa" ON public.empresas;

DROP POLICY IF EXISTS "Cualquier usuario puede leer sucursales" ON public.sucursales;
DROP POLICY IF EXISTS "Permitir todas las operaciones en sucursales" ON public.sucursales;

DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON public.users;
DROP POLICY IF EXISTS "Los administradores pueden gestionar todos los perfiles" ON public.users;
DROP POLICY IF EXISTS "Los administradores de Gama pueden gestionar todos los perfiles" ON public.users;

DROP POLICY IF EXISTS "Permitir todas las operaciones en ingredientes" ON public.ingredientes;
DROP POLICY IF EXISTS "Permitir todas las operaciones en platos" ON public.platos;
DROP POLICY IF EXISTS "Permitir lectura pública de platos" ON public.platos;
DROP POLICY IF EXISTS "Permitir todas las operaciones en plato_ingredientes" ON public.plato_ingredientes;
DROP POLICY IF EXISTS "Permitir todas las operaciones en menus_semanales" ON public.menus_semanales;
DROP POLICY IF EXISTS "Permitir todas las operaciones en menu_platos" ON public.menu_platos;

-- Eliminar la función de ayuda si existe
DROP FUNCTION IF EXISTS get_my_role();

-- =====================================================================
-- OPCIÓN 1: DESHABILITAR RLS COMPLETAMENTE (MÁS SIMPLE)
-- =====================================================================
-- Con RLS deshabilitado, no hay restricciones de acceso

-- =====================================================================
-- OPCIÓN 2: HABILITAR RLS CON POLÍTICAS TOTALMENTE PERMISIVAS
-- =====================================================================
-- Si prefieres mantener RLS habilitado pero sin restricciones:

-- Habilitar RLS en todas las tablas
ALTER TABLE public.planes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sucursales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plato_ingredientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus_semanales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_platos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- Crear políticas que permiten TODO a TODOS
CREATE POLICY "desarrollo_total_planes" ON public.planes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "desarrollo_total_empresas" ON public.empresas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "desarrollo_total_sucursales" ON public.sucursales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "desarrollo_total_users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "desarrollo_total_ingredientes" ON public.ingredientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "desarrollo_total_platos" ON public.platos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "desarrollo_total_plato_ingredientes" ON public.plato_ingredientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "desarrollo_total_menus_semanales" ON public.menus_semanales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "desarrollo_total_menu_platos" ON public.menu_platos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "desarrollo_total_pedidos" ON public.pedidos FOR ALL USING (true) WITH CHECK (true);

-- =====================================================================
-- OTORGAR PERMISOS ADICIONALES AL USUARIO ANÓNIMO Y AUTENTICADO
-- =====================================================================

-- Otorgar permisos completos a usuarios autenticados
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Otorgar permisos completos a usuarios anónimos (para casos edge)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- Otorgar permisos al rol service_role (usado por el cliente admin)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- =====================================================================
-- VERIFICACIÓN DE PERMISOS
-- =====================================================================

-- Mostrar el estado de RLS en todas las tablas
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) as policy_count
FROM pg_tables t 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Mostrar todas las políticas activas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'PERMISOS TOTALES CONFIGURADOS EXITOSAMENTE';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'RLS: Habilitado con políticas permisivas';
    RAISE NOTICE 'Permisos: Otorgados a authenticated, anon y service_role';
    RAISE NOTICE 'Estado: MODO DESARROLLO - NO USAR EN PRODUCCIÓN';
    RAISE NOTICE '==============================================';
END $$;
