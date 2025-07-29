-- 1. Crear una función de ayuda para obtener el rol del usuario actual de forma segura.
-- SECURITY DEFINER es la clave para evitar la recursión infinita.
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER -- MUY IMPORTANTE
SET search_path = public
AS $$
BEGIN
  -- Si el usuario no está autenticado, devuelve 'anon'
  IF auth.uid() IS NULL THEN
    RETURN 'anon';
  ELSE
    -- Devuelve el rol del usuario autenticado desde la tabla 'users'
    RETURN (SELECT role FROM public.users WHERE id = auth.uid());
  END IF;
END;
$$;

-- Otorgar permiso de ejecución de la función a los usuarios autenticados
GRANT EXECUTE ON FUNCTION get_my_role() TO authenticated;


-- Habilitar RLS en las tablas si aún no está habilitado
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sucursales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planes ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas antiguas para reemplazarlas con las versiones corregidas
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON public.users;
DROP POLICY IF EXISTS "Los administradores pueden gestionar todos los perfiles" ON public.users;
DROP POLICY IF EXISTS "Cualquier usuario autenticado puede ver los planes" ON public.planes;
DROP POLICY IF EXISTS "Los administradores de Gama pueden gestionar los planes" ON public.planes;


-- =================================================================
-- Políticas para la tabla 'users' (CORREGIDAS)
-- =================================================================

-- 1. Política: Permitir a los usuarios leer su propio perfil. (Sin cambios)
CREATE POLICY "Los usuarios pueden ver su propio perfil"
ON public.users FOR SELECT
USING (auth.uid() = id);

-- 2. Política: Permitir a los administradores de Gama gestionar todos los perfiles.
--    USA LA NUEVA FUNCIÓN get_my_role() para evitar la recursión.
CREATE POLICY "Los administradores pueden gestionar todos los perfiles"
ON public.users FOR ALL
USING ( get_my_role() = 'gama_admin' )
WITH CHECK ( get_my_role() = 'gama_admin' );


-- =================================================================
-- Políticas para la tabla 'planes' (CORREGIDAS)
-- =================================================================

-- 1. Política: Permitir a cualquier usuario autenticado ver los planes. (Sin cambios)
CREATE POLICY "Cualquier usuario autenticado puede ver los planes"
ON public.planes FOR SELECT
USING (auth.role() = 'authenticated');

-- 2. Política: Permitir a los administradores de Gama gestionar los planes.
--    USA LA NUEVA FUNCIÓN get_my_role() para evitar la recursión.
CREATE POLICY "Los administradores de Gama pueden gestionar los planes"
ON public.planes FOR ALL
USING ( get_my_role() = 'gama_admin' )
WITH CHECK ( get_my_role() = 'gama_admin' );
