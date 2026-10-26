# Experiencia con IA: ajustes para integración con frontend

## Intención

Cerrar los contratos detectados en la auditoría: usuarios consultables,
disponibilidad pública, datos demo reproducibles, errores JSON y documentación
de acceso desde React Native.

## Resultado y decisiones

- La disponibilidad se extrajo a un servicio compartido para que compras y
  eventos utilicen exactamente la misma regla.
- `Evento.rehidratar` permite reconstruir explícitamente eventos históricos sin
  relajar la validación de fecha futura usada al crear eventos nuevos.
- `DEMO_DATA=true` construye un grafo coherente de entidades con fechas
  relativas; el modo normal y las pruebas permanecen sin esos datos.
- Los conflictos de cupo, transición y duplicación utilizan HTTP 409, mientras
  que entradas inválidas conservan HTTP 400.
- Las rutas desconocidas y el JSON malformado tienen respuestas JSON uniformes.

## Intervención humana y aprendizaje

La principal precaución fue no duplicar el cálculo de cupo ni fabricar estados
finales sin historial. Las compras demo se crean pendientes y atraviesan las
transiciones del modelo, lo que hace al seed más representativo y detecta
inconsistencias durante el arranque.
