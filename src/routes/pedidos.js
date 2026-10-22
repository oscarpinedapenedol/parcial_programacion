const router = require('express').Router();
const Pedidos = require('../models/pedidos');

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarPedido(body) {
  const { cliente, items } = body || {};
  if (!cliente || typeof cliente.nombre !== 'string' || !cliente.nombre.trim() || cliente.nombre.trim().length > 120) {
    return 'El nombre del cliente es obligatorio y no puede superar 120 caracteres';
  }
  if (typeof cliente.correo !== 'string' || !CORREO.test(cliente.correo.trim()) || cliente.correo.trim().length > 160) {
    return 'El correo no es válido';
  }
  if (!Array.isArray(items) || items.length === 0) {
    return 'El pedido debe tener al menos un producto';
  }
  for (const item of items) {
    if (!item || !Number.isInteger(item.producto_id) || item.producto_id <= 0 ||
        !Number.isInteger(item.cantidad) || item.cantidad <= 0) {
      return 'Cada producto necesita producto_id y cantidad enteros positivos';
    }
  }
  return null;
}

router.post('/', async (req, res, next) => {
  const mensaje = validarPedido(req.body);
  if (mensaje) {
    return res.status(400).json({ error: 'DATOS_INVALIDOS', mensaje });
  }

  try {
    const pedido = await Pedidos.crear(req.body);
    res.status(201).json(pedido);
  } catch (error) {
    if (error instanceof Pedidos.ErrorNegocio) {
      return res.status(error.status).json({ error: error.codigo, mensaje: error.message });
    }
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  const { estado } = req.query;
  if (estado && !Pedidos.ESTADOS.includes(estado)) {
    return res.status(400).json({ error: 'ESTADO_INVALIDO', mensaje: 'Estado no válido' });
  }

  try {
    res.json(await Pedidos.listar(estado));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID_INVALIDO', mensaje: 'El id debe ser un entero positivo' });
  }

  try {
    const pedido = await Pedidos.obtenerPorId(id);
    if (!pedido) return res.status(404).json({ error: 'PEDIDO_NO_ENCONTRADO' });
    res.json(pedido);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  const { estado } = req.body || {};
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID_INVALIDO', mensaje: 'El id debe ser un entero positivo' });
  }
  if (!Pedidos.ESTADOS.includes(estado)) {
    return res.status(400).json({ error: 'ESTADO_INVALIDO', mensaje: 'Estado no válido' });
  }

  try {
    const existe = await Pedidos.cambiarEstado(id, estado);
    if (!existe) return res.status(404).json({ error: 'PEDIDO_NO_ENCONTRADO' });
    res.json({ id, estado });
  } catch (error) {
    next(error);
  }
});

module.exports = router;