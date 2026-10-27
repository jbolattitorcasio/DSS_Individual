# Experiencia con IA: frontend de compras

## Intención

Completar desde React Native el flujo de selección de usuario, compra, pago
simulado y seguimiento de estados utilizando exclusivamente la API existente.

## Resultado y decisiones

- La identidad simulada se mantiene en un contexto React y se puede cambiar
  desde las pantallas principales.
- El servicio de compras compone los IDs de cada compra con `GET /eventos/:id`
  para presentar nombres y tipos sin inventar campos del backend.
- Las acciones se bloquean mientras hay una solicitud activa, evitando compras
  o transiciones duplicadas.
- Después de comprar, confirmar o cancelar se reconsultan evento o compra para
  mantener disponibilidad, estado e historial sincronizados.
- Las cancelaciones confirmadas informan explícitamente el reembolso simulado.

## Intervención humana y aprendizaje

El contrato de detalle de compra no incluye información descriptiva del evento,
por lo que la composición se resolvió en el servicio HTTP del frontend. Esta
decisión mantiene el backend estable, aunque agrega solicitudes y podría
revisarse si el volumen de datos creciera.
