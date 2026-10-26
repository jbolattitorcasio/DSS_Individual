const { validarId, validarTextoObligatorio } = require('./validaciones');

class Usuario {
  constructor({ id, nombre, email }) {
    validarId(id);
    validarTextoObligatorio(nombre, 'nombre');

    if (typeof email !== 'string' || !Usuario.EMAIL_REGEX.test(email)) {
      throw new TypeError('email debe tener un formato válido');
    }

    this.id = id;
    this.nombre = nombre;
    this.email = email;
  }
}

Usuario.EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = Usuario;
