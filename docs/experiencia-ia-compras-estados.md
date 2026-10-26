# Experiencia con IA: compras, estados y cancelaciones

## Intención

Implementar compras y disponibilidad sin persistencia externa, preservando el
cupo total del tipo de entrada y registrando cada transición de estado.

## Resultado y decisiones

- La disponibilidad se calcula desde las compras: pendiente, confirmada y
  utilizada ocupan cupo; cancelada y reembolsada no lo hacen.
- Toda compra nace pendiente y su historial incluye un registro inicial desde
  `null` a `PENDIENTE_PAGO`.
- Cancelar una compra confirmada simula dos acciones explícitas en una sola
  operación HTTP: cancelación y reembolso. Ambas quedan en el historial.
- Los días restantes se calculan con redondeo hacia arriba y solo se exponen en
  el listado del comprador para compras confirmadas.
- El precio se copia desde el tipo de entrada al crear la compra para conservar
  el valor histórico.

## Intervención humana y aprendizaje

La consigna fija qué estados ocupan cupo, por lo que no se mutó `cupo` ni se
agregó un campo redundante de disponibilidad. La principal decisión no definida
fue la forma de la respuesta para compras por evento; se eligió un objeto con
`compras` y `disponibilidad`, ya que permite representar ambos resultados sin
mezclarlos ni repetir la disponibilidad en cada compra.
