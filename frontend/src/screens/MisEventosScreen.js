import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import MainNavigation from '../components/MainNavigation';
import ScreenState from '../components/ScreenState';
import UsuarioSelector from '../components/UsuarioSelector';
import { useUsuario } from '../context/UsuarioContext';
import { ROUTES } from '../navigation/routes';
import { obtenerEventos } from '../services/eventosApi';
import { colors } from '../theme/colors';
import { formatearFecha } from '../utils/formatters';

export default function MisEventosScreen() {
  const { usuarioActivo, loading: loadingUsuario } = useUsuario();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (refrescar = false) => {
    if (!usuarioActivo) return;
    if (refrescar) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const todos = await obtenerEventos({ orden: 'fecha_asc' });
      setEventos(todos.filter((evento) => evento.organizadorId === usuarioActivo.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [usuarioActivo]);

  useFocusEffect(useCallback(() => {
    if (loadingUsuario) return undefined;
    const timer = setTimeout(cargar, 0);
    return () => clearTimeout(timer);
  }, [cargar, loadingUsuario]));

  if ((loading || loadingUsuario) && eventos.length === 0) return <ScreenState loading title="Cargando tus eventos…" />;
  if (error && eventos.length === 0) return <ScreenState title="No pudimos cargar tus eventos" message={error} actionLabel="Reintentar" onAction={cargar} />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <FlatList
        data={eventos}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={(
          <View>
            <UsuarioSelector />
            <MainNavigation active="organizador" />
            <Text style={styles.eyebrow}>GESTIÓN DEL ORGANIZADOR</Text>
            <Text style={styles.title}>Mis eventos</Text>
            <Text style={styles.note}>Solo podés administrar eventos cuyo organizador coincide con la identidad simulada.</Text>
            <Pressable style={styles.primary} onPress={() => router.push(ROUTES.CREAR_EVENTO)}>
              <Text style={styles.primaryText}>Crear evento</Text>
            </Pressable>
          </View>
        )}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            onPress={() => router.push({ pathname: ROUTES.COMPRAS_EVENTO, params: { id: item.id } })}
          >
            <Text style={styles.eventName}>{item.nombre}</Text>
            <Text style={styles.meta}>{formatearFecha(item.fecha)}</Text>
            <Text style={styles.meta}>{item.ubicacion}</Text>
            <Text style={styles.link}>Ver compras y disponibilidad →</Text>
          </Pressable>
        )}
        ListEmptyComponent={<ScreenState title="No organizás eventos" message="Podés publicar el primero desde esta pantalla." />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => cargar(true)} tintColor={colors.primary} />}
        contentContainerStyle={[styles.content, eventos.length === 0 && styles.empty]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 36 },
  empty: { flexGrow: 1 },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  title: { color: colors.text, fontSize: 31, fontWeight: '900', marginTop: 4 },
  note: { color: colors.textMuted, lineHeight: 20, marginTop: 8 },
  primary: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginVertical: 18 },
  primaryText: { color: '#FFFFFF', fontWeight: '900', fontSize: 16 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 17, padding: 16, marginBottom: 12 },
  pressed: { opacity: 0.75 },
  eventName: { color: colors.text, fontSize: 19, fontWeight: '900' },
  meta: { color: colors.textMuted, marginTop: 5 },
  link: { color: colors.primary, fontWeight: '800', marginTop: 13 },
});
