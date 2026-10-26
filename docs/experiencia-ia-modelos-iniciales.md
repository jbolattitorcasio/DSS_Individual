# Experiencia con IA: modelos iniciales

## Intención

Implementar y probar los modelos iniciales `Usuario`, `Categoria`, `Evento` y
`TipoEntrada`, respetando las reglas indicadas y el estilo CommonJS existente.

## Resultado y decisiones

- Las invariantes se validan al construir cada entidad.
- `Evento` recibe una fecha futura y guarda una copia del objeto `Date` para que
  cambios externos no alteren accidentalmente su estado.
- `Evento.agregarTipoEntrada` acepta instancias de `TipoEntrada` del mismo evento
  y rechaza identificadores repetidos.
- Las validaciones comunes de identificadores y textos se extrajeron a una
  utilidad interna para evitar duplicación, sin incorporar nuevas capas.

## Intervención humana y aprendizaje

La solicitud definió explícitamente los atributos, límites y decisiones de
arquitectura. La IA contrastó esos datos con la consigna y generó la primera
implementación y sus pruebas. Como criterio adicional conservador, se exigió
una instancia de `TipoEntrada` al agregar entradas a un evento, garantizando que
el objeto agregado ya cumpla sus propias invariantes.
