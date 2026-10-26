function validarId(id, campo = 'id') {
  if (!Number.isInteger(id) || id <= 0) {
    throw new TypeError(`${campo} debe ser un entero positivo`);
  }
}

function validarTextoObligatorio(valor, campo) {
  if (typeof valor !== 'string' || valor.trim().length === 0) {
    throw new TypeError(`${campo} no puede estar vacío`);
  }
}

module.exports = { validarId, validarTextoObligatorio };
