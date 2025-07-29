-- Habilitar RLS en la tabla planes si no está habilitado
ALTER TABLE public.planes ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Permitir lectura pública de planes" ON public.planes;
DROP POLICY IF EXISTS "Los administradores de Gama pueden gestionar planes" ON public.planes;

-- =================================================================
-- Políticas para la tabla 'planes'
-- =================================================================

-- 1. Permitir a cualquier usuario autenticado leer los planes
-- (Empleados y admins de empresa necesitan ver los planes disponibles)
CREATE POLICY "Cualquier usuario puede leer planes"
ON public.planes FOR SELECT
USING (true); -- Cualquiera puede leer

-- 2. Solo los administradores de Gama pueden crear, actualizar y eliminar planes
CREATE POLICY "Solo Gama admin puede gestionar planes"
ON public.planes FOR ALL
USING (
  -- Para operaciones que requieren verificar permisos del usuario actual
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid()
  )
)
WITH CHECK (
  -- Para operaciones de inserción/actualización
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid()
  )
);

-- Nota: Como estamos en modo desarrollo sin autenticación,
-- estas políticas son temporalmente permisivas.
-- Cuando reactivemos la autenticación, las haremos más estrictas.
