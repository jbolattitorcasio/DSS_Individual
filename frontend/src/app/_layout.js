import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme/colors';
import { UsuarioProvider } from '../context/UsuarioContext';

export default function RootLayout() {
  return (
    <UsuarioProvider>
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
        <Stack.Screen name="eventos/[id]/comprar" options={{ title: 'Comprar entradas' }} />
        <Stack.Screen name="compras/index" options={{ title: 'Mis compras' }} />
        <Stack.Screen name="compras/[id]" options={{ title: 'Detalle de compra' }} />
      </Stack>
    </UsuarioProvider>
  );
}
