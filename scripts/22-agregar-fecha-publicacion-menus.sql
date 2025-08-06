-- Agregar campo fecha_publicacion a la tabla menus_semanales
ALTER TABLE menus_semanales 
ADD COLUMN IF NOT EXISTS fecha_publicacion DATE;

-- Agregar comentario para documentar el campo
COMMENT ON COLUMN menus_semanales.fecha_publicacion IS 'Fecha en que el menú será visible para los usuarios';

-- Actualizar menús existentes con fecha de publicación igual a fecha de inicio
UPDATE menus_semanales 
SET fecha_publicacion = fecha_inicio 
WHERE fecha_publicacion IS NULL;
