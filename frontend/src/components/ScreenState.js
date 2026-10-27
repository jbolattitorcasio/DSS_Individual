import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export default function ScreenState({ loading, title, message, actionLabel, onAction }) {
  return (
    <View style={styles.container}>
      {loading ? <ActivityIndicator size="large" color={colors.primary} /> : null}
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {onAction ? (
        <Pressable onPress={onAction} style={styles.button} accessibilityRole="button">
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  title: { color: colors.text, fontSize: 19, fontWeight: '700', textAlign: 'center', marginTop: 14 },
  message: { color: colors.textMuted, fontSize: 15, textAlign: 'center', marginTop: 8, lineHeight: 21 },
  button: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 11, marginTop: 20 },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
});
