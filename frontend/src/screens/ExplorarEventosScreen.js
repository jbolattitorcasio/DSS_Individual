import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import EventCard from '../components/EventCard';
import FilterChip from '../components/FilterChip';
import ScreenState from '../components/ScreenState';
import { obtenerCategorias, obtenerEventos } from '../services/eventosApi';
import { colors } from '../theme/colors';
import { ROUTES } from '../navigation/routes';
import UsuarioSelector from '../components/UsuarioSelector';
import MainNavigation from '../components/MainNavigation';

const ORDENES = [
  { value: 'fecha_asc', label: 'Fecha ↑' },
  { value: 'fecha_desc', label: 'Fecha ↓' },
  { value: 'precio_asc', label: 'Precio ↑' },
  { value: 'precio_desc', label: 'Precio ↓' },
  { value: 'puntaje_desc', label: 'Mejor reputación' },
  { value: 'puntaje_asc', label: 'Reputación ↑' },
];

export default function ExplorarEventosScreen() {
  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaId, setCategoriaId] = useState(null);
  const [orden, setOrden] = useState('fecha_asc');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const solicitudActual = useRef(0);

  const categoriasPorId = useMemo(
    () => Object.fromEntries(categorias.map((categoria) => [categoria.id, categoria.nombre])),
    [categorias],
  );

  const cargarEventos = useCallback(async ({ refrescar = false } = {}) => {
    const solicitudId = solicitudActual.current + 1;
    solicitudActual.current = solicitudId;
    if (refrescar) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const resultado = await obtenerEventos({
        q: busqueda.trim() || undefined,
        categoriaId: categoriaId || undefined,
        orden,
      });
      if (solicitudActual.current === solicitudId) setEventos(resultado);
    } catch (err) {
      if (solicitudActual.current === solicitudId) setError(err.message);
    } finally {
      if (solicitudActual.current === solicitudId) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [busqueda, categoriaId, orden]);

  useEffect(() => {
    obtenerCategorias().then(setCategorias).catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => cargarEventos(), 350);
    return () => clearTimeout(timer);
  }, [cargarEventos]);

  const header = (
    <View>
      <UsuarioSelector />
      <MainNavigation active="eventos" />
      <Text style={styles.eyebrow}>DESCUBRÍ TU PRÓXIMO PLAN</Text>
      <Text style={styles.heading}>Eventos para vos</Text>
      <TextInput
        accessibilityLabel="Buscar eventos"
        value={busqueda}
        onChangeText={setBusqueda}
        placeholder="Buscar por nombre o descripción"
        placeholderTextColor="#8B8D97"
        returnKeyType="search"
        onSubmitEditing={Keyboard.dismiss}
        style={styles.search}
      />

      <Text style={styles.sectionLabel}>Categorías</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <FilterChip label="Todas" selected={categoriaId === null} onPress={() => setCategoriaId(null)} />
        {categorias.map((categoria) => (
          <FilterChip
            key={categoria.id}
            label={categoria.nombre}
            selected={categoriaId === categoria.id}
            onPress={() => setCategoriaId(categoria.id)}
          />
        ))}
      </ScrollView>

      <Text style={styles.sectionLabel}>Ordenar</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {ORDENES.map((opcion) => (
          <FilterChip
            key={opcion.value}
            label={opcion.label}
            selected={orden === opcion.value}
            onPress={() => setOrden(opcion.value)}
          />
        ))}
      </ScrollView>
      <Text style={styles.results}>{eventos.length} evento{eventos.length === 1 ? '' : 's'}</Text>
    </View>
  );

  if (loading && eventos.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScreenState loading title="Buscando eventos…" />
      </SafeAreaView>
    );
  }

  if (error && eventos.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScreenState
          title="No pudimos cargar los eventos"
          message={error}
          actionLabel="Reintentar"
          onAction={() => cargarEventos()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <FlatList
        data={eventos}
        keyExtractor={(evento) => String(evento.id)}
        renderItem={({ item }) => (
          <EventCard
            evento={item}
            categoria={categoriasPorId[item.categoriaId]}
            onPress={() => router.push({ pathname: ROUTES.DETALLE_EVENTO, params: { id: item.id } })}
          />
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={(
          <ScreenState
            title="No encontramos eventos"
            message="Probá con otro texto, categoría u orden."
          />
        )}
        refreshControl={(
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => cargarEventos({ refrescar: true })}
            tintColor={colors.primary}
          />
        )}
        contentContainerStyle={[styles.content, eventos.length === 0 && styles.emptyContent]}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 32 },
  emptyContent: { flexGrow: 1 },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1.2 },
  heading: { color: colors.text, fontSize: 32, fontWeight: '900', marginTop: 5, marginBottom: 18 },
  search: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    color: colors.text,
  },
  sectionLabel: { color: colors.text, fontSize: 15, fontWeight: '800', marginTop: 20, marginBottom: 10 },
  chips: { paddingRight: 12 },
  results: { color: colors.textMuted, fontSize: 14, marginTop: 22, marginBottom: 10 },
});
