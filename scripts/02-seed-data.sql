-- Insertar planes de ejemplo
INSERT INTO planes (nombre, descripcion, incluye_entrada, incluye_postre, incluye_bebida, precio_mensual) VALUES
('Plan Básico', 'Plato principal únicamente', false, false, false, 15000.00),
('Plan Completo', 'Plato principal + entrada + postre', true, true, false, 22000.00),
('Plan Premium', 'Plato principal + entrada + postre + bebida', true, true, true, 28000.00);

-- Insertar empresa de ejemplo
INSERT INTO empresas (nombre, email_contacto, telefono, plan_id) 
SELECT 'TechCorp SA', 'admin@techcorp.com', '+54-11-1234-5678', id 
FROM planes WHERE nombre = 'Plan Completo' LIMIT 1;

-- Insertar sucursales de ejemplo
INSERT INTO sucursales (nombre, direccion, empresa_id)
SELECT 'Oficina Central', 'Av. Corrientes 1234, CABA', id
FROM empresas WHERE nombre = 'TechCorp SA' LIMIT 1;

INSERT INTO sucursales (nombre, direccion, empresa_id)
SELECT 'Sucursal Norte', 'Av. Cabildo 5678, CABA', id
FROM empresas WHERE nombre = 'TechCorp SA' LIMIT 1;

-- Insertar ingredientes de ejemplo
INSERT INTO ingredientes (nombre, unidad_de_medida, categoria) VALUES
('Pollo', 'gramos', 'proteína'),
('Carne vacuna', 'gramos', 'proteína'),
('Pescado', 'gramos', 'proteína'),
('Arroz', 'gramos', 'carbohidrato'),
('Pasta', 'gramos', 'carbohidrato'),
('Papa', 'gramos', 'carbohidrato'),
('Lechuga', 'gramos', 'verdura'),
('Tomate', 'gramos', 'verdura'),
('Cebolla', 'gramos', 'verdura'),
('Aceite de oliva', 'ml', 'grasa'),
('Sal', 'gramos', 'condimento'),
('Pimienta', 'gramos', 'condimento');

-- Insertar platos de ejemplo
INSERT INTO platos (nombre, descripcion, tipo) VALUES
('Pollo a la plancha con arroz', 'Pechuga de pollo grillada acompañada de arroz blanco', 'principal'),
('Milanesa de carne con puré', 'Milanesa de carne vacuna con puré de papas', 'principal'),
('Pescado al horno con verduras', 'Filete de pescado al horno con mix de verduras', 'principal'),
('Ensalada mixta', 'Ensalada de lechuga, tomate y cebolla', 'entrada'),
('Flan casero', 'Flan de vainilla con dulce de leche', 'postre'),
('Agua mineral', 'Agua mineral sin gas 500ml', 'bebida');

-- Relacionar platos con ingredientes
INSERT INTO plato_ingredientes (plato_id, ingrediente_id, cantidad) 
SELECT p.id, i.id, 200
FROM platos p, ingredientes i 
WHERE p.nombre = 'Pollo a la plancha con arroz' AND i.nombre = 'Pollo';

INSERT INTO plato_ingredientes (plato_id, ingrediente_id, cantidad) 
SELECT p.id, i.id, 150
FROM platos p, ingredientes i 
WHERE p.nombre = 'Pollo a la plancha con arroz' AND i.nombre = 'Arroz';

-- Crear menú semanal de ejemplo
INSERT INTO menus_semanales (fecha_inicio, fecha_fin, activo, publicado) VALUES
(CURRENT_DATE, CURRENT_DATE + INTERVAL '6 days', true, true);

-- Asociar platos al menú semanal
INSERT INTO menu_platos (menu_semanal_id, plato_id, dia_semana)
SELECT m.id, p.id, 1
FROM menus_semanales m, platos p
WHERE m.activo = true AND p.nombre = 'Pollo a la plancha con arroz';

INSERT INTO menu_platos (menu_semanal_id, plato_id, dia_semana)
SELECT m.id, p.id, 2
FROM menus_semanales m, platos p
WHERE m.activo = true AND p.nombre = 'Milanesa de carne con puré';
