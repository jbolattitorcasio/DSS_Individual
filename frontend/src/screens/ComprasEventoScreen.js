import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenState from '../components/ScreenState';
import StatusBadge from '../components/StatusBadge';
import UsuarioSelector from '../components/UsuarioSelector';
import { useUsuario } from '../context/UsuarioContext';
import { ROUTES } from '../navigation/routes';
import { utilizarCompra } from '../services/comprasApi';
import { obtenerComprasEvento, obtenerEvento } from '../services/eventosApi';
import { colors } from '../theme/colors';

export default function ComprasEventoScreen() {
  const { id } = useLocalSearchParams();
  const { usuarioActivo, usuarios } = useUsuario();
  const [evento, setEvento] = useState(null);
  const [datos, setDatos] = useState({ compras: [], disponibilidad: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [procesandoId, setProcesandoId] = useState(null);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (refrescar = false) => {
    if (refrescar) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const eventoActual = await obtenerEvento(id);
      if (!usuarioActivo || eventoActual.organizadorId !== usuarioActivo.id) {
        setEvento(eventoActual);
        setDatos({ compras: [], disponibilidad: [] });
        setError('No podés administrar este evento porque no sos su organizador.');
        return;
      }
      const resultado = await obtenerComprasEvento(id);
      setEvento(eventoActual);
      setDatos(resultado);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, usuarioActivo]);

  useFocusEffect(useCallback(() => {
    const timer = setTimeout(cargar, 0);
    return () => clearTimeout(timer);
  }, [cargar]));

  async function registrarUso(compraId) {
    if (procesandoId) return;
    setProcesandoId(compraId);
    setError(null);
    try {
      await utilizarCompra(compraId);
      await cargar(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesandoId(null);
    }
  }

  if (loading && !evento) return <ScreenState loading title="Cargando gestión del evento…" />;
  if (!evento || evento.organizadorId !== usuarioActivo?.id) return <ScreenState title="Acceso no permitido" message={error || 'Este evento no pertenece a la identidad activa.'} actionLabel="Volver a mis eventos" onAction={() => router.replace(ROUTES.MIS_EVENTOS)} />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <FlatList
        data={datos.compras}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={(
          <View>
            <UsuarioSelector />
            <Text style={styles.eyebrow}>VENTAS DEL EVENTO</Text>
            <Text style={styles.title}>{evento.nombre}</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Text style={styles.sectionTitle}>Disponibilidad</Text>
            {datos.disponibilidad.map((tipo) => (
              <View key={tipo.tipoEntradaId} style={styles.availabilityRow}>
                <Text style={styles.availabilityName}>{tipo.nombre}</Text>
                <Text style={styles.availabilityValue}>{tipo.cupoDisponible} / {tipo.cupoTotal}</Text>
              </View>
            ))}
            <Text style={styles.sectionTitle}>Compras</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const comprador = usuarios.find((usuario) => usuario.id === item.compradorId);
          const entrada = evento.tiposEntrada.find((tipo) => tipo.id === item.tipoEntradaId);
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}><StatusBadge estado={item.estado} /><Text style={styles.id}>#{item.id}</Text></View>
              <Text style={styles.buyer}>{comprador?.nombre || `Comprador #${item.compradorId}`}</Text>
              <Text style={styles.meta}>{item.cantidad} × {entrada?.nombre || `Entrada #${item.tipoEntradaId}`}</Text>
              <View style={styles.actions}>
                <Pressable onPress={() => router.push({ pathname: ROUTES.CHAT_COMPRA, params: { id: item.id } })} style={styles.secondary}><Text style={styles.secondaryText}>Mensajes</Text></Pressable>
                {item.estado === 'CONFIRMADA' ? (
                  <Pressable disabled={procesandoId === item.id} onPress={() => registrarUso(item.id)} style={styles.primarySmall}>
                    {procesandoId === item.id ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Registrar uso</Text>}
                  </Pressable>
                ) : null}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<ScreenState title="Todavía no hay compras" message="La disponibilidad se actualizará cuando se registren ventas." />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => cargar(true)} tintColor={colors.primary} />}
        contentContainerStyle={[styles.content, datos.compras.length === 0 && styles.empty]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background }, content: { padding: 18, paddingBottom: 36 }, empty: { flexGrow: 1 },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '900', letterSpacing: 1 }, title: { color: colors.text, fontSize: 28, fontWeight: '900', marginTop: 5 },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '900', marginTop: 24, marginBottom: 10 }, error: { color: colors.danger, backgroundColor: '#FDECEA', padding: 12, borderRadius: 10, marginTop: 12 },
  availabilityRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 13, marginBottom: 8, borderRadius: 12 }, availabilityName: { color: colors.text, fontWeight: '800' }, availabilityValue: { color: colors.success, fontWeight: '900' },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 15, borderRadius: 15, marginBottom: 11 }, cardHeader: { flexDirection: 'row', justifyContent: 'space-between' }, id: { color: colors.textMuted, fontWeight: '700' }, buyer: { color: colors.text, fontSize: 17, fontWeight: '900', marginTop: 12 }, meta: { color: colors.textMuted, marginTop: 5 },
  actions: { flexDirection: 'row', gap: 9, marginTop: 14 }, secondary: { flex: 1, borderWidth: 1, borderColor: colors.primary, padding: 10, borderRadius: 11, alignItems: 'center' }, secondaryText: { color: colors.primary, fontWeight: '800' }, primarySmall: { flex: 1, backgroundColor: colors.primary, padding: 10, borderRadius: 11, alignItems: 'center' }, primaryText: { color: '#FFFFFF', fontWeight: '800' },
});
