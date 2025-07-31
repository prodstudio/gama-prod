-- Limpiar datos inválidos en menu_platos antes de crear foreign keys
-- Eliminar registros con plato_id que no existen en la tabla platos
DELETE FROM menu_platos 
WHERE plato_id NOT IN (SELECT id FROM platos);

-- Eliminar registros con menu_semanal_id que no existen en la tabla menus_semanales
DELETE FROM menu_platos 
WHERE menu_semanal_id NOT IN (SELECT id FROM menus_semanales);

-- Verificar que no queden registros inválidos
SELECT 
  COUNT(*) as total_registros,
  COUNT(CASE WHEN plato_id IN (SELECT id FROM platos) THEN 1 END) as platos_validos,
  COUNT(CASE WHEN menu_semanal_id IN (SELECT id FROM menus_semanales) THEN 1 END) as menus_validos
FROM menu_platos;
