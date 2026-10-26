# Experiencia con IA: gestión y exploración de eventos

## Intención

Construir el módulo REST de eventos sobre los modelos existentes, con
persistencia en memoria, separación por capas y pruebas unitarias y de
integración aisladas.

## Resultado y decisiones

- Se implementaron repositorios en memoria para usuarios, categorías y eventos.
- La construcción del evento y de todos sus tipos de entrada ocurre antes del
  guardado, evitando estados parciales si alguna validación falla.
- El precio usado para ordenar un evento es el menor entre sus tipos de entrada,
  interpretado como el precio de acceso al evento.
- La aplicación admite inyección de repositorios mediante `createApp`, de modo
  que cada prueba trabaja con datos independientes. La exportación anterior de
  `app` se conserva para el servidor y para la prueba de salud existente.
- Los errores esperables tienen respuestas JSON uniformes con la propiedad
  `error`: validaciones usan HTTP 400 y recursos ausentes HTTP 404.

## Errores, intervención humana y aprendizaje

La consigna no define qué precio representa a un evento con entradas de valores
distintos. Se adoptó explícitamente el mínimo porque es útil como “precio desde”
durante la exploración. La generación asistida permitió cubrir rápidamente las
combinaciones de filtros, pero se mantuvieron casos separados para verificar la
atomicidad y evitar que el estado compartido o el orden de Jest oculten errores.
