-- Este script inserta o actualiza el perfil del usuario 'admin@gama.com'.
-- Asegúrate de que el usuario con este email EXACTO exista en la sección 'Authentication' de Supabase.

INSERT INTO public.users (id, email, nombre, apellido, role, activo)
SELECT
    id,
    'admin@gama.com',
    'Admin',
    'Gama',
    'gama_admin',
    true
FROM auth.users
WHERE email = 'admin@gama.com'
ON CONFLICT (id) DO UPDATE 
SET 
    email = EXCLUDED.email,
    nombre = EXCLUDED.nombre,
    apellido = EXCLUDED.apellido,
    role = EXCLUDED.role,
    activo = EXCLUDED.activo,
    updated_at = NOW();
