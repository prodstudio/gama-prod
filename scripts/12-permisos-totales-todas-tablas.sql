-- Deshabilitar RLS en todas las tablas para desarrollo
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sucursales DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.planes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.platos DISABLE ROW LEVEL SECURITY;

-- Crear tabla plato_ingredientes si no existe
CREATE TABLE IF NOT EXISTS public.plato_ingredientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plato_id UUID NOT NULL REFERENCES public.platos(id) ON DELETE CASCADE,
    ingrediente_id UUID NOT NULL REFERENCES public.ingredientes(id) ON DELETE CASCADE,
    cantidad DECIMAL(10,2) NOT NULL DEFAULT 0,
    unidad_medida TEXT DEFAULT 'gramos',
    es_opcional BOOLEAN DEFAULT false,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(plato_id, ingrediente_id)
);

-- Deshabilitar RLS en la nueva tabla
ALTER TABLE public.plato_ingredientes DISABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Enable read access for all users" ON public.usuarios;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.usuarios;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.usuarios;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.usuarios;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.empresas;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.empresas;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.empresas;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.empresas;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.sucursales;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.sucursales;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.sucursales;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.sucursales;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.planes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.planes;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.planes;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.planes;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.ingredientes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.ingredientes;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.ingredientes;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.ingredientes;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.platos;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.platos;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.platos;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.platos;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.plato_ingredientes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.plato_ingredientes;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.plato_ingredientes;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.plato_ingredientes;

-- Otorgar permisos completos a todos los roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Permisos específicos para la tabla plato_ingredientes
GRANT ALL ON public.plato_ingredientes TO postgres, anon, authenticated, service_role;

-- Insertar algunos ingredientes de prueba si no existen
INSERT INTO public.ingredientes (nombre, categoria, unidad_de_medida, activo) 
VALUES 
    ('Pollo', 'proteina', 'gramos', true),
    ('Arroz', 'carbohidrato', 'gramos', true),
    ('Cebolla', 'verdura', 'gramos', true),
    ('Tomate', 'verdura', 'gramos', true),
    ('Aceite de oliva', 'grasa', 'ml', true),
    ('Sal', 'condimento', 'gramos', true),
    ('Pimienta', 'condimento', 'gramos', true),
    ('Ajo', 'condimento', 'gramos', true),
    ('Zanahoria', 'verdura', 'gramos', true),
    ('Pasta', 'carbohidrato', 'gramos', true)
ON CONFLICT (nombre) DO NOTHING;

-- Insertar algunos platos de prueba si no existen
INSERT INTO public.platos (nombre, descripcion, tipo, activo) 
VALUES 
    ('Arroz con Pollo', 'Delicioso arroz con pollo y verduras', 'principal', true),
    ('Pasta Carbonara', 'Pasta cremosa con huevo y queso', 'principal', true),
    ('Ensalada César', 'Ensalada fresca con aderezo césar', 'entrada', true)
ON CONFLICT (nombre) DO NOTHING;

-- Crear algunas relaciones de ejemplo entre platos e ingredientes
DO $$
DECLARE
    plato_arroz_id UUID;
    plato_pasta_id UUID;
    ingrediente_pollo_id UUID;
    ingrediente_arroz_id UUID;
    ingrediente_pasta_id UUID;
    ingrediente_cebolla_id UUID;
    ingrediente_tomate_id UUID;
BEGIN
    -- Obtener IDs de platos
    SELECT id INTO plato_arroz_id FROM public.platos WHERE nombre = 'Arroz con Pollo' LIMIT 1;
    SELECT id INTO plato_pasta_id FROM public.platos WHERE nombre = 'Pasta Carbonara' LIMIT 1;
    
    -- Obtener IDs de ingredientes
    SELECT id INTO ingrediente_pollo_id FROM public.ingredientes WHERE nombre = 'Pollo' LIMIT 1;
    SELECT id INTO ingrediente_arroz_id FROM public.ingredientes WHERE nombre = 'Arroz' LIMIT 1;
    SELECT id INTO ingrediente_pasta_id FROM public.ingredientes WHERE nombre = 'Pasta' LIMIT 1;
    SELECT id INTO ingrediente_cebolla_id FROM public.ingredientes WHERE nombre = 'Cebolla' LIMIT 1;
    SELECT id INTO ingrediente_tomate_id FROM public.ingredientes WHERE nombre = 'Tomate' LIMIT 1;
    
    -- Insertar relaciones para Arroz con Pollo
    IF plato_arroz_id IS NOT NULL AND ingrediente_pollo_id IS NOT NULL THEN
        INSERT INTO public.plato_ingredientes (plato_id, ingrediente_id, cantidad, unidad_medida)
        VALUES (plato_arroz_id, ingrediente_pollo_id, 300, 'gramos')
        ON CONFLICT (plato_id, ingrediente_id) DO NOTHING;
    END IF;
    
    IF plato_arroz_id IS NOT NULL AND ingrediente_arroz_id IS NOT NULL THEN
        INSERT INTO public.plato_ingredientes (plato_id, ingrediente_id, cantidad, unidad_medida)
        VALUES (plato_arroz_id, ingrediente_arroz_id, 200, 'gramos')
        ON CONFLICT (plato_id, ingrediente_id) DO NOTHING;
    END IF;
    
    IF plato_arroz_id IS NOT NULL AND ingrediente_cebolla_id IS NOT NULL THEN
        INSERT INTO public.plato_ingredientes (plato_id, ingrediente_id, cantidad, unidad_medida)
        VALUES (plato_arroz_id, ingrediente_cebolla_id, 100, 'gramos')
        ON CONFLICT (plato_id, ingrediente_id) DO NOTHING;
    END IF;
    
    -- Insertar relaciones para Pasta Carbonara
    IF plato_pasta_id IS NOT NULL AND ingrediente_pasta_id IS NOT NULL THEN
        INSERT INTO public.plato_ingredientes (plato_id, ingrediente_id, cantidad, unidad_medida)
        VALUES (plato_pasta_id, ingrediente_pasta_id, 250, 'gramos')
        ON CONFLICT (plato_id, ingrediente_id) DO NOTHING;
    END IF;
    
    IF plato_pasta_id IS NOT NULL AND ingrediente_tomate_id IS NOT NULL THEN
        INSERT INTO public.plato_ingredientes (plato_id, ingrediente_id, cantidad, unidad_medida)
        VALUES (plato_pasta_id, ingrediente_tomate_id, 150, 'gramos')
        ON CONFLICT (plato_id, ingrediente_id) DO NOTHING;
    END IF;
END $$;

-- Verificar que todo funciona
SELECT 'Platos creados:' as info, COUNT(*) as cantidad FROM public.platos;
SELECT 'Ingredientes creados:' as info, COUNT(*) as cantidad FROM public.ingredientes;
SELECT 'Relaciones plato-ingredientes:' as info, COUNT(*) as cantidad FROM public.plato_ingredientes;

-- Consulta de prueba para verificar las relaciones
SELECT 
    p.nombre as plato,
    i.nombre as ingrediente,
    pi.cantidad,
    pi.unidad_medida
FROM public.platos p
JOIN public.plato_ingredientes pi ON p.id = pi.plato_id
JOIN public.ingredientes i ON pi.ingrediente_id = i.id
ORDER BY p.nombre, i.nombre;
