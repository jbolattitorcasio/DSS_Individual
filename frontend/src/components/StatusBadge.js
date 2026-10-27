import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

const CONFIG = {
  PENDIENTE_PAGO: { label: 'Pendiente de pago', background: '#FFF2D9', color: '#8A5100' },
  CONFIRMADA: { label: 'Confirmada', background: '#DDF5E9', color: colors.success },
  UTILIZADA: { label: 'Utilizada', background: '#E7E7EC', color: '#4E505A' },
  CANCELADA: { label: 'Cancelada', background: '#FDE4E2', color: colors.danger },
  REEMBOLSADA: { label: 'Reembolsada', background: '#E8E2FA', color: colors.primaryDark },
};

export function etiquetaEstado(estado) {
  return CONFIG[estado]?.label || estado;
}

export default function StatusBadge({ estado }) {
  const config = CONFIG[estado] || { label: estado, background: colors.border, color: colors.text };
  return (
    <View style={[styles.badge, { backgroundColor: config.background }]}>
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  label: { fontSize: 12, fontWeight: '800' },
});
