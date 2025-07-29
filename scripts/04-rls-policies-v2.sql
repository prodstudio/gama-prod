-- 1. Habilitar RLS en todas las tablas importantes si aún no está hecho.
ALTER TABLE public.planes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sucursales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- 2. Borrar políticas antiguas para evitar conflictos.
DROP POLICY IF EXISTS "Permitir lectura pública de planes" ON public.planes;
DROP POLICY IF EXISTS "Permitir lectura pública de platos" ON public.platos;
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON public.users;
DROP POLICY IF EXISTS "Los administradores de Gama pueden gestionar todos los perfiles" ON public.users;
DROP POLICY IF EXISTS "Los administradores pueden ver los datos de su propia empresa" ON public.empresas;

-- =================================================================
-- Políticas para tablas PÚBLICAS (Planes y Platos)
-- Cualquiera, incluso sin iniciar sesión, puede leer esta información.
-- =================================================================

CREATE POLICY "Permitir lectura pública de planes"
ON public.planes FOR SELECT
USING (true); -- 'true' significa que cualquiera puede ejecutar un SELECT.

CREATE POLICY "Permitir lectura pública de platos"
ON public.platos FOR SELECT
USING (true);

-- =================================================================
-- Políticas para la tabla 'users'
-- =================================================================

-- Un usuario puede ver y actualizar su propio perfil.
CREATE POLICY "Los usuarios pueden ver su propio perfil"
ON public.users FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- El admin de Gama puede ver y gestionar TODOS los perfiles.
CREATE POLICY "Los administradores de Gama pueden gestionar todos los perfiles"
ON public.users FOR ALL
USING ( (SELECT role FROM public.users WHERE id = auth.uid()) = 'gama_admin' )
WITH CHECK ( (SELECT role FROM public.users WHERE id = auth.uid()) = 'gama_admin' );

-- =================================================================
-- Políticas para la tabla 'empresas'
-- =================================================================

-- El admin de Gama puede gestionar todas las empresas.
-- Un admin de empresa puede ver los datos de SU empresa.
CREATE POLICY "Los administradores pueden ver los datos de su propia empresa"
ON public.empresas FOR SELECT
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'gama_admin'
  OR
  id = (SELECT empresa_id FROM public.users WHERE id = auth.uid())
);
