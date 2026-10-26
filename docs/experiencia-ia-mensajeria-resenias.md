# Experiencia con IA: mensajería y reseñas

## Intención

Agregar conversación por compra y reputación por organizador, reutilizando las
relaciones existentes y manteniendo repositorios exclusivamente en memoria.

## Resultado y decisiones

- Los IDs explícitos en mensajería y reseñas simulan la identidad del usuario;
  no constituyen autenticación ni un mecanismo seguro de autorización.
- Solo comprador y organizador acceden al chat. Los mensajes se ordenan por
  fecha y, ante fechas iguales, por ID.
- La reputación es el promedio aritmético de todas las reseñas de eventos del
  organizador y vale `null` cuando aún no existen reseñas.
- En ambos órdenes por puntaje, los organizadores sin reseñas aparecen al final;
  esto evita equiparar ausencia de reputación con una calificación de cero.
- El detalle de un evento incorpora reseñas de otros eventos del mismo
  organizador con fecha anterior a la del evento consultado.

## Intervención humana y aprendizaje

La consigna no especifica la ubicación de elementos sin reputación ni la forma
exacta del detalle enriquecido. Se hicieron explícitos ambos criterios y se
cubrieron con pruebas. La IA aceleró la generación de escenarios combinados,
pero fue necesario cuidar la inyección de repositorios para no romper el
aislamiento que ya utilizaban las pruebas de eventos y compras.
