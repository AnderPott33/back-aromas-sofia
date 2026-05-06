import { query } from './db.js';
import bcrypt from 'bcrypt';

const USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    rol VARCHAR(20) DEFAULT 'vendedor',
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMPTZ DEFAULT NOW()
  );
`;

const PRODUCTOS_TABLE = `
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    compra NUMERIC(38,2),
    venta NUMERIC(38,2),
    img TEXT,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMPTZ DEFAULT NOW()
  );
`;

const PEDIDO_TABLE = `
CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,
    cliente_nombre VARCHAR(255),
    estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, confirmado, cancelado
    creado_en TIMESTAMPTZ DEFAULT NOW()
);
`;
const PEDIDO_ITEMS_TABLE = `
CREATE TABLE IF NOT EXISTS pedido_items (
    id SERIAL PRIMARY KEY,
    pedido_id INT REFERENCES pedidos(id),
    producto_id INT REFERENCES productos(id),
    cantidad INT NOT NULL,
    precio_unitario NUMERIC(38,2) NOT NULL -- Guardamos el precio del momento de la venta
);
`;

const HISTORIA_TABLE = `
CREATE TABLE IF NOT EXISTS carrito (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    img TEXT,
    
    creado_en TIMESTAMPTZ DEFAULT NOW()
  );
`;


export const initializeDatabase = async () => {
  try {
    console.log('⏳ Verificando tablas...');

    // 1. Crear tabla
    await query(USERS_TABLE);
    await query(PRODUCTOS_TABLE);
    await query(PEDIDO_TABLE);
    await query(PEDIDO_ITEMS_TABLE);

    // 2. Verificar si existe algún usuario
    const checkAdmin = await query('SELECT id FROM usuarios LIMIT 1');

    if (checkAdmin.rows.length === 0) {
      console.log('👤 No hay usuarios. Creando administrador inicial...');

      const saltRounds = 10;
      const plainPassword = 'admin123'; // Cambia esto después
      const hash = await bcrypt.hash(plainPassword, saltRounds);

      await query(`
        INSERT INTO usuarios (nombre, email, password_hash, rol) 
        VALUES ($1, $2, $3, $4)
      `, ['Administador Del Sistema', 'admin@admin.com', hash, 'ADMINISTRADOR']);

      console.log('✅ Usuario admin creado con contraseña encriptada.');
    }

    console.log('✅ Estructura de TiendaOnline Aromas Sofia lista.');
  } catch (error) {
    console.error('❌ Error inicializando tablas:', error);
    throw error;
  }
};