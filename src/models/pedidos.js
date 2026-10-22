const pool = require('./db');

const ESTADOS = ['pendiente', 'pagado', 'enviado', 'cancelado'];
exports.ESTADOS = ESTADOS;

class ErrorNegocio extends Error {
  constructor(status, codigo, mensaje) {
    super(mensaje);
    this.status = status;
    this.codigo = codigo;
  }
}
exports.ErrorNegocio = ErrorNegocio;

exports.crear = async ({ cliente, items }) => {
  const conn = await pool.getConnection();
  let transaccionIniciada = false;

  try {
    await conn.beginTransaction();
    transaccionIniciada = true;

    let totalCentavos = 0;
    const lineas = [];

    for (const item of items) {
      const [rows] = await conn.query(
        'SELECT id, nombre, precio, stock FROM productos WHERE id = ? FOR UPDATE',
        [item.producto_id]
      );
      const producto = rows[0];

      if (!producto) {
        throw new ErrorNegocio(422, 'PRODUCTO_INEXISTENTE', `No existe el producto ${item.producto_id}`);
      }
      if (producto.stock < item.cantidad) {
        throw new ErrorNegocio(422, 'STOCK_INSUFICIENTE', `Solo quedan ${producto.stock} de ${producto.nombre}`);
      }

      const precioCentavos = Math.round(Number(producto.precio) * 100);
      totalCentavos += precioCentavos * item.cantidad;
      lineas.push({
        producto_id: producto.id,
        nombre: producto.nombre,
        cantidad: item.cantidad,
        precio_unitario: Number(producto.precio)
      });

      await conn.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [item.cantidad, producto.id]);
    }

    const total = totalCentavos / 100;
    const [resultado] = await conn.query(
      'INSERT INTO pedidos (cliente_nombre, cliente_correo, total) VALUES (?, ?, ?)',
      [cliente.nombre.trim(), cliente.correo.trim(), total]
    );
    const pedidoId = resultado.insertId;

    for (const linea of lineas) {
      await conn.query(
        'INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
        [pedidoId, linea.producto_id, linea.cantidad, linea.precio_unitario]
      );
    }

    await conn.commit();
    transaccionIniciada = false;

    return {
      id: pedidoId,
      cliente_nombre: cliente.nombre.trim(),
      cliente_correo: cliente.correo.trim(),
      estado: 'pendiente',
      total,
      items: lineas
    };
  } catch (error) {
    if (transaccionIniciada) {
      await conn.rollback();
    }
    throw error;
  } finally {
    conn.release();
  }
};

exports.listar = async (estado) => {
  let sql = 'SELECT * FROM pedidos';
  const params = [];
  if (estado) {
    sql += ' WHERE estado = ?';
    params.push(estado);
  }
  sql += ' ORDER BY creado_en DESC';

  const [rows] = await pool.query(sql, params);
  return rows;
};

exports.obtenerPorId = async (id) => {
  const [pedidos] = await pool.query('SELECT * FROM pedidos WHERE id = ?', [id]);
  const pedido = pedidos[0];
  if (!pedido) return null;

  const [items] = await pool.query(
    `SELECT pi.producto_id, p.nombre, pi.cantidad, pi.precio_unitario
     FROM pedido_items pi
     JOIN productos p ON p.id = pi.producto_id
     WHERE pi.pedido_id = ?`,
    [id]
  );
  return { ...pedido, items };
};

exports.cambiarEstado = async (id, estado) => {
  const [resultado] = await pool.query('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, id]);
  if (resultado.affectedRows > 0) return true;

  const [pedidos] = await pool.query('SELECT id FROM pedidos WHERE id = ?', [id]);
  return pedidos.length > 0;
};