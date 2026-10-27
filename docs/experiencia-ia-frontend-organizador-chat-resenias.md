# Experiencia con IA — organizador, chat y reseñas en frontend

## Intención

Completar en React Native los casos de uso del organizador, la conversación por
compra y la calificación posterior a la utilización, conservando los contratos del
backend en memoria.

## Resultado

Se incorporaron pantallas Expo Router para publicar eventos, consultar ventas y
disponibilidad, registrar uso, intercambiar mensajes y crear una única reseña.
También se integraron las acciones a la navegación y al detalle de compra.

## Decisiones e intervención

- Se inspeccionaron rutas, servicios y pruebas del backend antes de crear clientes
  HTTP para evitar inventar campos.
- Como no existe `GET /usuarios/:id/eventos`, los eventos del organizador se
  filtran en el cliente usando `organizadorId`.
- Los permisos se anticipan en la interfaz, pero se conserva el manejo de 403 del
  backend. Los IDs explícitos siguen siendo una simulación, no autenticación.
- La fecha del formulario se recibe como texto ISO para no sumar una dependencia
  visual/nativa solo para este flujo académico.
- El chat usa refresco manual y no incorpora WebSockets.

## Verificación y aprendizaje

Lint detectó inicialmente tres expresiones ternarias usadas solo por sus efectos;
se reemplazaron por condicionales explícitos. La revisión de contratos confirmó
que el detalle del evento ya contiene reputación y reseñas históricas, por lo que
esa lógica se reutilizó en vez de duplicarla en el frontend.
