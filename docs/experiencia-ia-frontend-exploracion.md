# Experiencia con IA: frontend de exploración

## Intención

Inicializar React Native con Expo e integrar el primer flujo móvil contra los
contratos reales de eventos y categorías.

## Resultado y decisiones

- Se usó Expo Router según las instrucciones de la plantilla SDK 58, manteniendo
  las pantallas fuera del directorio de rutas para separar navegación e interfaz.
- El cliente `fetch` centraliza URL, timeout, errores HTTP y fallos de conexión.
- La URL no tiene fallback a `localhost`: una configuración ausente produce un
  mensaje accionable en la pantalla.
- Como `GET /eventos` no contiene disponibilidad, el servicio enriquece el
  listado con los detalles individuales. Esto permite calcular el menor precio
  realmente disponible sin inventar campos, a cambio de solicitudes adicionales.

## Errores, intervención humana y aprendizaje

La plantilla `blank` incorporó instrucciones locales que exigen Expo Router y
consulta de documentación versionada. La configuración se ajustó a esas reglas.
El linter oficial también requirió TypeScript como herramienta interna, aunque
todo el código de aplicación continúa escrito en JavaScript.
