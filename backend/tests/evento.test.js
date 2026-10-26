const Evento = require('../src/models/Evento');
const TipoEntrada = require('../src/models/TipoEntrada');

describe('Evento', () => {
  const crearDatosValidos = () => ({
    id: 1,
    nombre: 'Festival de jazz',
    descripcion: 'Una noche de música en vivo',
    fecha: new Date('2099-11-15T21:00:00.000Z'),
    ubicacion: 'Teatro Central',
    organizadorId: 2,
    categoriaId: 3,
    imagenUrl: 'https://example.com/festival.jpg',
  });

  it('crea un evento válido con tipos de entrada inicialmente vacíos', () => {
    const datos = crearDatosValidos();
    const evento = new Evento(datos);

    expect(evento).toEqual({ ...datos, fecha: new Date(datos.fecha), tiposEntrada: [] });
    expect(evento.fecha).not.toBe(datos.fecha);
  });

  it('permite omitir la imagen', () => {
    const datos = crearDatosValidos();
    delete datos.imagenUrl;

    expect(new Evento(datos).imagenUrl).toBeUndefined();
  });

  test.each([
    ['id', 0],
    ['organizadorId', -1],
    ['categoriaId', 1.5],
  ])('rechaza %s inválido: %p', (campo, valor) => {
    expect(() => new Evento({ ...crearDatosValidos(), [campo]: valor }))
      .toThrow(`${campo} debe ser un entero positivo`);
  });

  test.each(['nombre', 'descripcion', 'ubicacion'])(
    'rechaza %s vacío',
    (campo) => {
      expect(() => new Evento({ ...crearDatosValidos(), [campo]: '   ' }))
        .toThrow(`${campo} no puede estar vacío`);
    },
  );

  test.each([new Date('fecha inválida'), '2099-11-15', null])(
    'rechaza la fecha inválida %p',
    (fecha) => {
      expect(() => new Evento({ ...crearDatosValidos(), fecha }))
        .toThrow('fecha debe ser una fecha válida');
    },
  );

  it('rechaza una fecha que no es futura', () => {
    expect(() => new Evento({ ...crearDatosValidos(), fecha: new Date(0) }))
      .toThrow('fecha debe ser futura');
  });

  it('agrega un tipo de entrada perteneciente al evento', () => {
    const evento = new Evento(crearDatosValidos());
    const tipoEntrada = new TipoEntrada({
      id: 10,
      eventoId: evento.id,
      nombre: 'VIP',
      precio: 5000,
      cupo: 20,
    });

    evento.agregarTipoEntrada(tipoEntrada);

    expect(evento.tiposEntrada).toEqual([tipoEntrada]);
  });

  it('rechaza un tipo de entrada perteneciente a otro evento', () => {
    const evento = new Evento(crearDatosValidos());
    const tipoEntrada = new TipoEntrada({
      id: 10,
      eventoId: 99,
      nombre: 'VIP',
      precio: 5000,
      cupo: 20,
    });

    expect(() => evento.agregarTipoEntrada(tipoEntrada))
      .toThrow('el tipo de entrada debe pertenecer al mismo evento');
  });

  it('rechaza tipos de entrada con IDs duplicados', () => {
    const evento = new Evento(crearDatosValidos());
    const datosEntrada = {
      id: 10,
      eventoId: evento.id,
      nombre: 'VIP',
      precio: 5000,
      cupo: 20,
    };
    evento.agregarTipoEntrada(new TipoEntrada(datosEntrada));

    expect(() => evento.agregarTipoEntrada(new TipoEntrada({
      ...datosEntrada,
      nombre: 'General',
    }))).toThrow('ya existe un tipo de entrada con el mismo id');
  });

  it('rechaza objetos que no sean tipos de entrada válidos', () => {
    const evento = new Evento(crearDatosValidos());

    expect(() => evento.agregarTipoEntrada({ id: 10, eventoId: evento.id }))
      .toThrow('tipoEntrada debe ser una instancia de TipoEntrada');
  });
});
