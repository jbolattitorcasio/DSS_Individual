# AI Ticket It

Trabajo Práctico Individual de Diseño de Sistemas de la UTN.
Plataforma de venta de entradas para eventos.

## Tecnologías y alcance inicial

- Backend: Node.js y Express.
- Frontend previsto: React Native con Expo (pendiente de implementación).
- Persistencia: exclusivamente en memoria. No se utilizan bases de datos.

Esta etapa incluye únicamente la estructura del repositorio y un endpoint de
salud. No incluye funcionalidades del negocio ni autenticación.

## Estructura

```text
backend/
  src/
    app.js
    server.js
    controllers/
    models/
    repositories/
    routes/healthRoutes.js
    services/
  tests/health.test.js
  package.json
  package-lock.json
frontend/             # Reservado para React Native con Expo
docs/                 # Reservado para documentación
.gitignore
readme.md
```

Los archivos `.gitkeep` permiten conservar las carpetas vacías en Git.

## Requisitos

- Node.js 22 o superior.
- npm.

## Ejecutar el backend

Desde la raíz del repositorio:

```sh
cd backend
npm install
npm run dev
```

El modo de desarrollo reinicia el servidor cuando se modifica el código.
Para ejecutarlo sin reinicio automático:

```sh
npm start
```

El servidor escucha en `http://localhost:3000`. Se puede cambiar el puerto
mediante la variable de entorno `PORT`. Para detenerlo, presionar `Ctrl+C`.

## Probar el endpoint

Con el servidor ejecutándose, abrir `http://localhost:3000/health` en el navegador
o ejecutar en otra terminal de PowerShell:

```powershell
Invoke-RestMethod -Uri http://localhost:3000/health
```

Respuesta esperada: HTTP `200 OK` y el siguiente JSON:

```json
{
  "status": "ok"
}
```

## Ejecutar las pruebas

Desde `backend`:

```sh
npm test
```
