# AI Ticket It

Backend del Trabajo Práctico Individual de Desarrollo con Inteligencia Artificial de DDS
(UTN). Expone una API REST para publicar eventos, comprar entradas, administrar estados,
conversar y registrar reseñas.

## Tecnologías y requisitos

- Node.js 22 o superior y npm.
- Express 5.
- Persistencia exclusivamente en memoria: los datos se pierden al reiniciar.
- Jest y Supertest para pruebas.

No se utiliza base de datos, autenticación real, pagos externos ni servicios pagos.

## Instalación y ejecución

Desde `backend/`:

```sh
npm install
npm start
```

Para reinicio automático durante el desarrollo se usa `npm run dev`. El puerto
predeterminado es `3000` y puede cambiarse con la variable `PORT`.

### Datos de demostración

Sin configuración adicional se precargan usuarios y categorías, pero no eventos ni
compras. Para iniciar un escenario completo en memoria:

```powershell
# PowerShell
$env:DEMO_DATA='true'
npm start
```

```bat
:: CMD
set DEMO_DATA=true
npm start
```

```sh
# macOS/Linux
DEMO_DATA=true npm start
```

El escenario usa fechas relativas al arranque e incluye organizadores, compradores,
categorías, eventos futuros e históricos, tipos de entrada, los cinco estados de
compra, mensajes, reseñas y organizadores con y sin reputación. Reiniciar el servidor
restaura el escenario desde cero.

## Pruebas

```sh
npm test
```

## Endpoints

### Infraestructura y datos auxiliares

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Estado del servidor |
| GET | `/usuarios` | Usuarios disponibles para la simulación |
| GET | `/usuarios/:id` | Detalle de un usuario |
| GET | `/categorias` | Categorías disponibles |

### Eventos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/eventos` | Lista, busca, filtra y ordena eventos |
| GET | `/eventos/:id` | Detalle, entradas, disponibilidad y reseñas anteriores |
| POST | `/eventos` | Crea un evento con sus tipos de entrada |
| GET | `/eventos/:id/compras` | Compras y disponibilidad para gestión |
| GET | `/eventos/:id/resenias` | Reseñas del evento |

`GET /eventos` admite `q`, `categoriaId` y los órdenes `fecha_asc`, `fecha_desc`,
`precio_asc`, `precio_desc`, `puntaje_asc` y `puntaje_desc`. Los eventos sin
reputación tienen `puntajeOrganizador: null` y quedan al final por puntaje.

### Compras, estados y mensajería

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/compras` | Crea una compra pendiente de pago |
| GET | `/compras/:id` | Detalle de una compra |
| GET | `/compras?compradorId=:id` | Compras de un comprador |
| PATCH | `/compras/:id/confirmar` | Simula la confirmación del pago |
| PATCH | `/compras/:id/utilizar` | Registra la utilización |
| PATCH | `/compras/:id/cancelar` | Cancela y, si corresponde, reembolsa |
| GET | `/compras/:id/mensajes?usuarioId=:id` | Conversación de la compra |
| POST | `/compras/:id/mensajes` | Envía un mensaje |
| POST | `/compras/:id/resenia` | Reseña una compra utilizada |

### Organizadores

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/organizadores/:id/resenias` | Reseñas y reputación promedio |

## Ejemplos

Crear un evento:

```http
POST /eventos
Content-Type: application/json

{
  "nombre": "Festival de Jazz",
  "descripcion": "Música en vivo",
  "fecha": "2099-11-20T21:00:00.000Z",
  "ubicacion": "Anfiteatro",
  "organizadorId": 1,
  "categoriaId": 1,
  "tiposEntrada": [
    { "nombre": "General", "precio": 12000, "cupo": 100 },
    { "nombre": "VIP", "precio": 25000, "cupo": 20 }
  ]
}
```

Crear una compra:

```http
POST /compras
Content-Type: application/json

{
  "compradorId": 3,
  "eventoId": 2,
  "tipoEntradaId": 3,
  "cantidad": 2
}
```

Enviar un mensaje:

```http
POST /compras/3/mensajes
Content-Type: application/json

{
  "autorId": 3,
  "contenido": "¿A qué hora abren las puertas?"
}
```

## Estados de compra

- `PENDIENTE_PAGO`
- `CONFIRMADA`
- `UTILIZADA`
- `CANCELADA`
- `REEMBOLSADA`

```text
PENDIENTE_PAGO -> CONFIRMADA
PENDIENTE_PAGO -> CANCELADA
CONFIRMADA     -> UTILIZADA
CONFIRMADA     -> CANCELADA -> REEMBOLSADA
```

Pendiente, confirmada y utilizada ocupan cupo. Cancelada y reembolsada liberan
cupo. Los pagos y reembolsos son simulaciones.

## Errores HTTP

Todas las respuestas de error usan `{ "error": "descripción" }`:

- `400`: datos o JSON inválidos.
- `403`: operación no permitida para el usuario indicado.
- `404`: recurso o ruta inexistente.
- `409`: cupo insuficiente, transición inválida o recurso duplicado.
- `500`: error inesperado.

## Uso desde React Native

`localhost` dentro del teléfono o emulador no apunta siempre a la computadora:

- Dispositivo físico: conectar ambos equipos a la misma red y usar
  `http://IP_LAN_DE_LA_COMPUTADORA:3000`. Puede ser necesario habilitar Node.js
  en el firewall.
- Emulador Android estándar: usar `http://10.0.2.2:3000`.
- Simulador iOS: normalmente puede usar `http://localhost:3000`.

La URL base debería configurarse mediante una variable de entorno de Expo. React
Native nativo no aplica CORS del navegador, por lo que el backend no configura
CORS. Si se agrega Expo Web, habrá que evaluarlo.

## Limitaciones de seguridad

No existe autenticación ni autorización real. `compradorId`, `organizadorId`,
`autorId` y `usuarioId` simulan identidad para fines académicos y pueden ser
falsificados. El sistema no debe exponerse públicamente ni utilizar datos reales.
