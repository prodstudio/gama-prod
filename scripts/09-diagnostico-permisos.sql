-- =====================================================================
-- SCRIPT DE DIAGNÓSTICO DE PERMISOS
-- =====================================================================
-- Este script te ayuda a entender el estado actual de los permisos
-- en tu base de datos de Supabase.
-- =====================================================================

-- 1. Estado de RLS en todas las tablas
SELECT 
    '=== ESTADO DE ROW LEVEL SECURITY ===' as info;

SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ HABILITADO' 
        ELSE '❌ DESHABILITADO' 
    END as rls_status,
    (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) as total_policies
FROM pg_tables t 
WHERE schemaname = 'public' 
    AND tablename IN ('planes', 'empresas', 'sucursales', 'users', 'ingredientes', 'platos', 'plato_ingredientes', 'menus_semanales', 'menu_platos', 'pedidos')
ORDER BY tablename;

-- 2. Políticas activas por tabla
SELECT 
    '=== POLÍTICAS ACTIVAS ===' as info;

SELECT 
    tablename,
    policyname,
    CASE cmd
        WHEN 'ALL' THEN '🔓 TODAS LAS OPERACIONES'
        WHEN 'SELECT' THEN '👁️ SOLO LECTURA'
        WHEN 'INSERT' THEN '➕ SOLO INSERCIÓN'
        WHEN 'UPDATE' THEN '✏️ SOLO ACTUALIZACIÓN'
        WHEN 'DELETE' THEN '🗑️ SOLO ELIMINACIÓN'
    END as operations,
    CASE 
        WHEN qual = 'true' THEN '🌍 ACCESO TOTAL'
        ELSE '🔒 RESTRINGIDO'
    END as access_level
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Permisos por rol
SELECT 
    '=== PERMISOS POR ROL ===' as info;

SELECT 
    grantee as role_name,
    table_name,
    string_agg(privilege_type, ', ') as permissions
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
    AND table_name IN ('planes', 'empresas', 'sucursales', 'users', 'ingredientes', 'platos', 'plato_ingredientes', 'menus_semanales', 'menu_platos', 'pedidos')
    AND grantee IN ('authenticated', 'anon', 'service_role')
GROUP BY grantee, table_name
ORDER BY grantee, table_name;

-- 4. Resumen del estado de seguridad
SELECT 
    '=== RESUMEN DE SEGURIDAD ===' as info;

WITH security_summary AS (
    SELECT 
        COUNT(*) as total_tables,
        COUNT(CASE WHEN rowsecurity THEN 1 END) as tables_with_rls,
        COUNT(CASE WHEN NOT rowsecurity THEN 1 END) as tables_without_rls
    FROM pg_tables 
    WHERE schemaname = 'public' 
        AND tablename IN ('planes', 'empresas', 'sucursales', 'users', 'ingredientes', 'platos', 'plato_ingredientes', 'menus_semanales', 'menu_platos', 'pedidos')
),
policy_summary AS (
    SELECT COUNT(*) as total_policies
    FROM pg_policies 
    WHERE schemaname = 'public'
)
SELECT 
    s.total_tables as "📊 Total de Tablas",
    s.tables_with_rls as "🔒 Tablas con RLS",
    s.tables_without_rls as "🔓 Tablas sin RLS",
    p.total_policies as "📋 Total de Políticas",
    CASE 
        WHEN s.tables_without_rls = s.total_tables THEN '🚨 MODO DESARROLLO - SIN RESTRICCIONES'
        WHEN s.tables_with_rls = s.total_tables AND p.total_policies > 0 THEN '✅ MODO SEGURO - CON POLÍTICAS'
        ELSE '⚠️ CONFIGURACIÓN MIXTA'
    END as "🛡️ Estado de Seguridad"
FROM security_summary s, policy_summary p;

-- 5. Verificación de acceso para el usuario actual
SELECT 
    '=== VERIFICACIÓN DE ACCESO ACTUAL ===' as info;

SELECT 
    current_user as "👤 Usuario Actual",
    session_user as "🔑 Usuario de Sesión",
    CASE 
        WHEN current_user = 'postgres' THEN '🔥 SUPERUSUARIO - ACCESO TOTAL'
        WHEN current_user = 'service_role' THEN '🛠️ SERVICE ROLE - ACCESO ADMINISTRATIVO'
        WHEN current_user = 'authenticated' THEN '✅ USUARIO AUTENTICADO'
        WHEN current_user = 'anon' THEN '👻 USUARIO ANÓNIMO'
        ELSE '❓ USUARIO DESCONOCIDO'
    END as "🏷️ Tipo de Usuario";
