import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ROUTES } from '../navigation/routes';
import { colors } from '../theme/colors';

export default function MainNavigation({ active }) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => router.replace(ROUTES.EXPLORAR)}
        style={[styles.button, active === 'eventos' && styles.active]}
      >
        <Text style={[styles.label, active === 'eventos' && styles.activeLabel]}>Explorar</Text>
      </Pressable>
      <Pressable
        onPress={() => router.push(ROUTES.MIS_COMPRAS)}
        style={[styles.button, active === 'compras' && styles.active]}
      >
        <Text style={[styles.label, active === 'compras' && styles.activeLabel]}>Mis compras</Text>
      </Pressable>
      <Pressable
        onPress={() => router.push(ROUTES.MIS_EVENTOS)}
        style={[styles.button, active === 'organizador' && styles.active]}
      >
        <Text style={[styles.label, active === 'organizador' && styles.activeLabel]}>Organizar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', backgroundColor: '#E9EAF0', borderRadius: 13, padding: 4, marginBottom: 18 },
  button: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 10 },
  active: { backgroundColor: colors.surface },
  label: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  activeLabel: { color: colors.primary },
});
