import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import MainNavigation from '../components/MainNavigation';
import ScreenState from '../components/ScreenState';
import StatusBadge from '../components/StatusBadge';
import UsuarioSelector from '../components/UsuarioSelector';
import { useUsuario } from '../context/UsuarioContext';
import { ROUTES } from '../navigation/routes';
import { obtenerComprasPorComprador } from '../services/comprasApi';
import { colors } from '../theme/colors';
import { formatearFecha, formatearPrecio } from '../utils/formatters';

export default function MisComprasScreen() {
  const { usuarioActivo, loading: loadingUsuario } = useUsuario();
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async ({ refrescar = false } = {}) => {
    if (!usuarioActivo) {
      setCompras([]);
      setLoading(false);
      return;
    }
    if (refrescar) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      setCompras(await obtenerComprasPorComprador(usuarioActivo.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [usuarioActivo]);

  useFocusEffect(useCallback(() => {
    if (loadingUsuario) return undefined;
    const timer = setTimeout(() => cargar(), 0);
    return () => clearTimeout(timer);
  }, [cargar, loadingUsuario]));

  const header = (
    <View>
      <UsuarioSelector />
      <MainNavigation active="compras" />
      <Text style={styles.eyebrow}>SEGUIMIENTO</Text>
      <Text style={styles.heading}>Mis compras</Text>
    </View>
  );

  if ((loading || loadingUsuario) && compras.length === 0) {
    return <ScreenState loading title="Cargando tus compras…" />;
  }
  if (error && compras.length === 0) {
    return <ScreenState title="No pudimos cargar tus compras" message={error} actionLabel="Reintentar" onAction={() => cargar()} />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <FlatList
        data={compras}
        keyExtractor={(compra) => String(compra.id)}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: ROUTES.DETALLE_COMPRA, params: { id: item.id } })}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <View style={styles.cardHeader}>
              <StatusBadge estado={item.estado} />
              <Text style={styles.purchaseId}>#{item.id}</Text>
            </View>
            <Text style={styles.eventName}>{item.evento.nombre}</Text>
            <Text style={styles.meta}>{formatearFecha(item.evento.fecha)}</Text>
            <Text style={styles.meta}>{item.cantidad} × {item.tipoEntrada?.nombre || 'Entrada'}</Text>
            <Text style={styles.price}>{formatearPrecio(item.precioUnitario * item.cantidad)}</Text>
            {item.estado === 'CONFIRMADA' && Number.isInteger(item.diasRestantes) ? (
              <Text style={styles.days}>Faltan {item.diasRestantes} día{item.diasRestantes === 1 ? '' : 's'}</Text>
            ) : null}
          </Pressable>
        )}
        ListEmptyComponent={(
          <ScreenState
            title="Todavía no tenés compras"
            message="Explorá los eventos y elegí tus próximas entradas."
            actionLabel="Explorar eventos"
            onAction={() => router.replace(ROUTES.EXPLORAR)}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => cargar({ refrescar: true })} tintColor={colors.primary} />}
        contentContainerStyle={[styles.content, compras.length === 0 && styles.emptyContent]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 34 },
  emptyContent: { flexGrow: 1 },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  heading: { color: colors.text, fontSize: 31, fontWeight: '900', marginTop: 4, marginBottom: 17 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 17, padding: 16, marginBottom: 12 },
  pressed: { opacity: 0.76 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13 },
  purchaseId: { color: colors.textMuted, fontWeight: '700' },
  eventName: { color: colors.text, fontSize: 19, fontWeight: '900' },
  meta: { color: colors.textMuted, fontSize: 14, marginTop: 5 },
  price: { color: colors.text, fontSize: 19, fontWeight: '900', marginTop: 13 },
  days: { color: colors.success, fontSize: 14, fontWeight: '800', marginTop: 10 },
});
