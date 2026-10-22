-- 1. Base de datos
CREATE DATABASE IF NOT EXISTS tienda
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE tienda;

-- 2. Usuario de la aplicación con permisos mínimos
-- Reemplaza el marcador por una clave segura y configura la misma en .env.
CREATE USER IF NOT EXISTS 'tienda_app'@'localhost' IDENTIFIED BY 'CAMBIA_ESTA_CLAVE_SEGURA';
CREATE USER IF NOT EXISTS 'tienda_app'@'127.0.0.1' IDENTIFIED BY 'CAMBIA_ESTA_CLAVE_SEGURA';
GRANT SELECT, INSERT, UPDATE ON tienda.* TO 'tienda_app'@'localhost';
GRANT SELECT, INSERT, UPDATE ON tienda.* TO 'tienda_app'@'127.0.0.1';

-- 3. Tablas
CREATE TABLE categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(30) NOT NULL UNIQUE,
  nombre VARCHAR(150) NOT NULL,
  precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  categoria_id INT,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id)
) ENGINE=InnoDB;

CREATE TABLE pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_nombre VARCHAR(120) NOT NULL,
  cliente_correo VARCHAR(160) NOT NULL,
  estado ENUM('pendiente','pagado','enviado','cancelado') NOT NULL DEFAULT 'pendiente',
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE pedido_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL CHECK (cantidad > 0),
  precio_unitario DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id)
) ENGINE=InnoDB;

-- 4. Datos de prueba
INSERT INTO categorias (nombre) VALUES
('Calzado'),
('Ropa'),
('Accesorios');

INSERT INTO productos (sku, nombre, precio, stock, categoria_id) VALUES
('ZAP-001', 'Zapatilla urbana', 59.90, 12, 1),
('ZAP-002', 'Sandalia de playa', 19.50, 30, 1),
('ZAP-003', 'Bota de cuero', 89.00, 5, 1),
('ROP-001', 'Camiseta de algodón', 12.99, 40, 2),
('ROP-002', 'Jeans clásicos', 39.90, 18, 2),
('ROP-003', 'Chaqueta impermeable', 64.00, 3, 2),
('ACC-001', 'Gorra deportiva', 14.00, 25, 3),
('ACC-002', 'Mochila escolar', 29.90, 10, 3),
('ACC-003', 'Reloj digital', 45.00, 2, 3),
('ACC-004', 'Lentes de sol', 22.50, 8, 3);