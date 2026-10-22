const pool = require('./db');

exports.listar = async (categoria) => {
  let sql = `SELECT p.id, p.sku, p.nombre, p.precio, p.stock, c.nombre AS categoria
             FROM productos p
             LEFT JOIN categorias c ON c.id = p.categoria_id`;
  const params = [];

  if (categoria) {
    sql += ' WHERE c.nombre = ?';
    params.push(categoria);
  }

  const [rows] = await pool.query(`${sql} ORDER BY p.id`, params);
  return rows;
};

exports.obtenerPorId = async (id) => {
  const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [id]);
  return rows[0] || null;
};