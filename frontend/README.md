# Frontend de AI Ticket It

Aplicación móvil React Native con Expo SDK 58 y Expo Router.

## Configuración de la API

Copiar `.env.example` como `.env` y reemplazar la dirección por la apropiada:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

- Emulador Android estándar: `http://10.0.2.2:3000`.
- Dispositivo físico: `http://IP_LAN_DE_LA_COMPUTADORA:3000`. Ambos equipos
  deben estar en la misma red y el firewall debe permitir Node.js.
- Simulador iOS: normalmente `http://localhost:3000`.

No se usa una URL predeterminada: si falta la variable, la aplicación muestra
un error de configuración explícito. Las variables `EXPO_PUBLIC_*` se incluyen
en el bundle y no deben contener secretos.

## Ejecución

Primero iniciar el backend con datos demo desde `backend/`:

```powershell
$env:DEMO_DATA='true'
npm start
```

Luego, desde `frontend/`:

```sh
npm install
npx expo start
```

Escanear el QR con Expo Go o presionar `a` para abrir un emulador Android.

## Estructura

```text
src/
├── app/          # Rutas de Expo Router
├── components/   # Componentes visuales reutilizables
├── navigation/   # Nombres de rutas
├── screens/      # Pantallas y estado de interfaz
├── services/     # Cliente HTTP y acceso a la API
├── theme/        # Colores
└── utils/        # Formateo de fechas y precios
```

## Flujo implementado

- Explorar eventos.
- Buscar por texto y filtrar por categoría.
- Ordenar por fecha, precio o reputación.
- Consultar el detalle, entradas y disponibilidad.
- Ver reputación y reseñas históricas.
- Seleccionar una identidad simulada compartida entre pantallas.
- Comprar entradas, controlar cantidad y simular el pago.
- Consultar las compras del usuario y sus días restantes.
- Ver historial, confirmar pagos y cancelar con reembolso simulado.

La identidad se envía mediante IDs explícitos porque el proyecto todavía no
incluye autenticación real.
