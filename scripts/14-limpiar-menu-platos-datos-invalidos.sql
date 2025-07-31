-- Limpiar datos inválidos en menu_platos antes de crear foreign keys

-- Eliminar registros con plato_id que no existen en la tabla platos
DELETE FROM menu_platos 
WHERE plato_id NOT IN (SELECT id FROM platos);

-- Eliminar registros con menu_semanal_id que no existen en la tabla menus_semanales
DELETE FROM menu_platos 
WHERE menu_semanal_id NOT IN (SELECT id FROM menus_semanales);

-- Mostrar cuántos registros quedan
SELECT COUNT(*) as registros_restantes FROM menu_platos;

-- Mostrar los registros que quedan para verificar
SELECT 
  mp.id,
  mp.menu_semanal_id,
  mp.plato_id,
  mp.dia_semana,
  ms.fecha_inicio,
  p.nombre as plato_nombre
FROM menu_platos mp
LEFT JOIN menus_semanales ms ON mp.menu_semanal_id = ms.id
LEFT JOIN platos p ON mp.plato_id = p.id
ORDER BY mp.created_at DESC;
