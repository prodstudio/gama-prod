-- Limpiar datos inválidos en menu_platos antes de crear foreign key

-- Ver qué registros tienen plato_id inválidos
SELECT mp.*, p.id as plato_existe
FROM menu_platos mp
LEFT JOIN platos p ON mp.plato_id = p.id
WHERE p.id IS NULL;

-- Eliminar registros con plato_id que no existen en la tabla platos
DELETE FROM menu_platos 
WHERE plato_id NOT IN (
    SELECT id FROM platos
);

-- Verificar que no queden registros inválidos
SELECT COUNT(*) as registros_invalidos
FROM menu_platos mp
LEFT JOIN platos p ON mp.plato_id = p.id
WHERE p.id IS NULL;

-- Si el resultado es 0, entonces ya puedes crear la foreign key en Supabase
