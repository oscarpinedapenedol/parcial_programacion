module.exports = (err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON_INVALIDO', mensaje: 'Revise el formato del cuerpo' });
  }
  console.error(new Date().toISOString(), req.method, req.originalUrl, err.message);
  res.status(500).json({ error: 'ERROR_INTERNO', mensaje: 'Ocurrió un error inesperado' });
};
