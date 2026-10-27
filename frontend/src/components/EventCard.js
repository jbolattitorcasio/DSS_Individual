import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { formatearFecha, formatearPrecio, obtenerPrecioMinimoDisponible } from '../utils/formatters';

export default function EventCard({ evento, categoria, onPress }) {
  const precioMinimo = obtenerPrecioMinimoDisponible(evento.tiposEntrada);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver detalle de ${evento.nombre}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{categoria || 'Sin categoría'}</Text>
      </View>
      <Text style={styles.title}>{evento.nombre}</Text>
      <Text style={styles.date}>{formatearFecha(evento.fecha)}</Text>
      <View style={styles.footer}>
        <View>
          <Text style={styles.caption}>Desde</Text>
          <Text style={styles.price}>
            {precioMinimo === null ? 'Sin disponibilidad' : formatearPrecio(precioMinimo)}
          </Text>
        </View>
        <Text style={styles.score}>
          {evento.puntajeOrganizador === null ? 'Nuevo' : `★ ${evento.puntajeOrganizador.toFixed(1)}`}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 12,
  },
  badgeText: { color: colors.primaryDark, fontSize: 12, fontWeight: '700' },
  title: { color: colors.text, fontSize: 20, fontWeight: '800', marginBottom: 7 },
  date: { color: colors.textMuted, fontSize: 14, marginBottom: 18 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  caption: { color: colors.textMuted, fontSize: 12 },
  price: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 2 },
  score: { color: colors.warning, fontSize: 15, fontWeight: '700' },
});
