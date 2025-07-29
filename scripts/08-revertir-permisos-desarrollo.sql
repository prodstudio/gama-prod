-- =====================================================================
-- SCRIPT PARA REVERTIR PERMISOS TOTALES Y RESTAURAR SEGURIDAD
-- =====================================================================
-- Este script revierte los cambios del script anterior y restaura
-- políticas de seguridad más apropiadas para producción.
-- =====================================================================

-- Eliminar todas las políticas de desarrollo
DROP POLICY IF EXISTS "desarrollo_total_planes" ON public.planes;
DROP POLICY IF EXISTS "desarrollo_total_empresas" ON public.empresas;
DROP POLICY IF EXISTS "desarrollo_total_sucursales" ON public.sucursales;
DROP POLICY IF EXISTS "desarrollo_total_users" ON public.users;
DROP POLICY IF EXISTS "desarrollo_total_ingredientes" ON public.ingredientes;
DROP POLICY IF EXISTS "desarrollo_total_platos" ON public.platos;
DROP POLICY IF EXISTS "desarrollo_total_plato_ingredientes" ON public.plato_ingredientes;
DROP POLICY IF EXISTS "desarrollo_total_menus_semanales" ON public.menus_semanales;
DROP POLICY IF EXISTS "desarrollo_total_menu_platos" ON public.menu_platos;
DROP POLICY IF EXISTS "desarrollo_total_pedidos" ON public.pedidos;

-- Revocar permisos excesivos
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;

-- Mantener permisos básicos para authenticated y service_role
-- (estos son necesarios para el funcionamiento normal)

-- Recrear políticas básicas de seguridad
-- (Aquí pondrías las políticas de producción cuando las tengas listas)

DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'PERMISOS DE DESARROLLO REVERTIDOS';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Se han eliminado las políticas permisivas';
    RAISE NOTICE 'Se han revocado permisos excesivos';
    RAISE NOTICE 'Listo para configurar políticas de producción';
    RAISE NOTICE '==============================================';
END $$;
