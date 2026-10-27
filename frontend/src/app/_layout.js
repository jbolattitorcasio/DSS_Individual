import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme/colors';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '800' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'AI Ticket It' }} />
        <Stack.Screen name="eventos/[id]" options={{ title: 'Detalle del evento' }} />
        <Stack.Screen name="compra-placeholder" options={{ title: 'Comprar entradas' }} />
      </Stack>
    </>
  );
}
