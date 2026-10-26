# AI Ticket It — Instrucciones para agentes de IA

## 1. Contexto del proyecto

AI Ticket It es el Trabajo Práctico Individual de Desarrollo con Inteligencia Artificial de DDS (UTN, segundo cuatrimestre de 2026). Consiste en una plataforma móvil de publicación de eventos y venta de entradas.

El propósito académico incluye experimentar con herramientas de IA durante el desarrollo y evaluar críticamente sus ventajas, limitaciones, errores y efecto sobre la productividad y la calidad del software.

**Fuente de verdad funcional:** la consigna oficial del TP. Si el PDF está disponible en el repositorio, consultarlo antes de diseñar una funcionalidad. Este archivo resume requisitos, pero no reemplaza la consigna. Ante ambigüedades, explicar los supuestos y consultar antes de tomar decisiones que afecten el negocio.

## 2. Tecnologías y restricciones

- Backend obligatorio: Node.js con Express.
- Frontend obligatorio: React Native; se utilizará Expo como decisión de implementación.
- Lenguaje de trabajo: JavaScript, salvo indicación contraria.
- Persistencia: exclusivamente en memoria. No introducir bases de datos, ORM ni servicios externos de persistencia.
- La aplicación debe poder ejecutarse localmente en un dispositivo móvil.
- Comunicación entre frontend y backend: API HTTP/REST como decisión de diseño inicial.
- Pruebas del backend: Jest y Supertest, ya configurados en el proyecto.
- No implementar pagos reales ni integraciones externas sin solicitud expresa.
- No agregar dependencias innecesarias ni servicios pagos.

## 3. Arquitectura actual del backend

```text
backend/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── repositories/
│   ├── routes/
│   │   └── healthRoutes.js
│   ├── services/
│   ├── app.js
│   └── server.js
├── tests/
│   └── health.test.js
├── package.json
└── package-lock.json
```

- `models/`: entidades y reglas propias del dominio.
- `repositories/`: almacenamiento y recuperación de datos en memoria.
- `services/`: coordinación de casos de uso y reglas de aplicación.
- `controllers/`: adaptación entre solicitudes/respuestas HTTP y los servicios.
- `routes/`: declaración de endpoints.
- `app.js`: configuración de Express para reutilizarla en pruebas.
- `server.js`: inicio del servidor HTTP.
- `tests/`: pruebas automatizadas.

Esta es la estructura actual conocida: verificar los archivos reales antes de modificarla. Conservar el estilo de módulos y las convenciones ya existentes. No crear capas o archivos vacíos solo por cumplir una estructura.

## 4. Alcance funcional de la consigna

La aplicación debe contemplar, según los casos de uso oficiales:

1. Visualización de compras por el comprador, mostrando estados y días faltantes cuando estén confirmadas.
2. Visualización por el organizador de compras de un evento, sus estados y cupos disponibles por tipo de entrada.
3. Búsqueda textual y exploración de eventos por categoría.
4. Creación de eventos con distintos tipos de entrada, precio y cupo.
5. Chat de mensajes asociados a cada compra entre comprador y organizador.
6. Cancelación de compras y reembolso, respetando las condiciones del dominio.
7. Calificación numérica y comentario después de utilizar una entrada.
8. Visualización de reseñas anteriores en eventos de un organizador.
9. Ordenamiento de eventos por precio, fecha y puntaje del organizador.
10. Compra de entradas eligiendo tipo y cantidad, sin exceder el cupo disponible.

Estados de compra mencionados en la consigna: pendiente de pago, confirmada, utilizada, cancelada y reembolsada. No inventar integraciones de cobro; si hay que simular un cambio de estado, documentarlo como simulación.

El diagrama de dominio de la consigna es tentativo. Incluye Usuario, Evento, Categoria, TipoEntrada, Compra, EstadoCompra, CambioEstadoCompra, Mensaje y Resenia. Validar sus atributos y relaciones antes de implementarlos; no asumir que el diagrama impone una estructura de código exacta.

## 5. Forma de trabajar

- Trabajar incrementalmente: una funcionalidad o cambio acotado por tarea.
- Antes de cambios relevantes, inspeccionar el código existente y presentar un plan breve.
- No implementar funcionalidades adicionales no solicitadas.
- Cuando algo no esté definido en la consigna, distinguir entre requisito, suposición y recomendación.
- Priorizar código sencillo, legible y fácil de explicar en una demostración académica.
- Mantener las reglas de negocio fuera de controladores y rutas.
- Validar entradas, estados y cupos en la capa correspondiente; entregar errores HTTP claros y consistentes.
- Evitar sobreingeniería, patrones innecesarios y abstracciones prematuras.
- No modificar archivos ajenos al objetivo de la tarea sin justificarlo.
- No hacer commits, push, borrados masivos ni comandos destructivos automáticamente. Solicitar aprobación antes de acciones riesgosas.
- No agregar secretos al repositorio.

## 6. Pruebas y verificación

- Mantener operativo `GET /health` y su prueba actual.
- Crear o actualizar pruebas automatizadas para las reglas de negocio modificadas.
- Cubrir casos exitosos, errores y límites relevantes (por ejemplo, cupo insuficiente o cancelación inválida).
- Ejecutar las pruebas correspondientes después de cada cambio, cuando el entorno lo permita.
- Informar qué se verificó realmente y qué quedó sin ejecutar; nunca afirmar que una prueba pasó si no fue ejecutada.

## 7. Comunicación y documentación

- Responder en español, salvo indicación contraria.
- Explicar brevemente el motivo de las decisiones técnicas importantes.
- Al terminar una tarea, resumir archivos modificados, comportamiento agregado, pruebas ejecutadas y aspectos pendientes.
- Registrar en `docs/` las decisiones relevantes y las experiencias significativas con IA: prompt o intención, resultado, errores, intervención humana y aprendizaje. No registrar automáticamente conversaciones completas ni datos sensibles.
- Tener presente la entrega final: un video de 5 a 10 minutos que demuestre un flujo completo en backend, frontend e interfaz, más una reflexión crítica sobre el uso de IA.
