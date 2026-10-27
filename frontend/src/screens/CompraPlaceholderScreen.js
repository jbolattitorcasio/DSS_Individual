import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

export default function CompraPlaceholderScreen() {
  const { nombre } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <Text style={styles.badge}>PRÓXIMA ETAPA</Text>
        <Text style={styles.title}>Compra de entradas</Text>
        <Text style={styles.message}>
          El flujo de compra para {nombre || 'este evento'} todavía no está implementado.
          Esta pantalla confirma que la navegación desde el detalle funciona correctamente.
        </Text>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.button}>
          <Text style={styles.buttonText}>Volver al evento</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: 22 },
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: 24, borderWidth: 1, borderColor: colors.border },
  badge: { color: colors.primary, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  title: { color: colors.text, fontSize: 27, fontWeight: '900', marginTop: 10 },
  message: { color: colors.textMuted, fontSize: 16, lineHeight: 24, marginTop: 14 },
  button: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, marginTop: 24 },
  buttonText: { color: '#FFFFFF', fontWeight: '800', textAlign: 'center' },
});
