import { useCallback, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenState from '../components/ScreenState';
import { obtenerEvento } from '../services/eventosApi';
import { colors } from '../theme/colors';
import { formatearFecha, formatearPrecio } from '../utils/formatters';
import { ROUTES } from '../navigation/routes';

function agregarEstadoTemporal(evento) {
  return { ...evento, finalizado: new Date(evento.fecha).getTime() <= Date.now() };
}

export default function DetalleEventoScreen() {
  const { id } = useLocalSearchParams();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setEvento(agregarEstadoTemporal(await obtenerEvento(id)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(useCallback(() => {
    let vigente = true;
    obtenerEvento(id)
      .then((resultado) => {
        if (vigente) {
          setEvento(agregarEstadoTemporal(resultado));
          setError(null);
        }
      })
      .catch((err) => {
        if (vigente) setError(err.message);
      })
      .finally(() => {
        if (vigente) setLoading(false);
      });
    return () => {
      vigente = false;
    };
  }, [id]));

  if (loading) {
    return <ScreenState loading title="Cargando detalle…" />;
  }
  if (error || !evento) {
    return (
      <ScreenState
        title="No pudimos cargar el evento"
        message={error}
        actionLabel="Reintentar"
        onAction={cargar}
      />
    );
  }

  const resenias = evento.reseniasAnterioresOrganizador || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {evento.imagenUrl && !imageError ? (
          <Image
            source={{ uri: evento.imagenUrl }}
            onError={() => setImageError(true)}
            style={styles.image}
            resizeMode="cover"
            accessibilityLabel={`Imagen de ${evento.nombre}`}
          />
        ) : (
          <View style={styles.imageFallback}>
            <Text style={styles.imageFallbackText}>AI TICKET IT</Text>
          </View>
        )}

        <Text style={styles.title}>{evento.nombre}</Text>
        <Text style={styles.meta}>{formatearFecha(evento.fecha)}</Text>
        <Text style={styles.meta}>⌖ {evento.ubicacion}</Text>
        <View style={styles.reputationBox}>
          <Text style={styles.reputationLabel}>Reputación del organizador</Text>
          <Text style={styles.reputationValue}>
            {evento.puntajeOrganizador === null
              ? 'Sin reseñas todavía'
              : `★ ${evento.puntajeOrganizador.toFixed(1)} / 5`}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Sobre el evento</Text>
        <Text style={styles.description}>{evento.descripcion}</Text>

        <Text style={styles.sectionTitle}>Entradas</Text>
        {evento.tiposEntrada.map((tipo) => (
          <View key={tipo.id} style={styles.ticketRow}>
            <View style={styles.ticketInfo}>
              <Text style={styles.ticketName}>{tipo.nombre}</Text>
              <Text style={styles.availability}>
                {tipo.cupoDisponible > 0
                  ? `${tipo.cupoDisponible} de ${tipo.cupoTotal} disponibles`
                  : 'Agotada'}
              </Text>
            </View>
            <Text style={styles.ticketPrice}>{formatearPrecio(tipo.precio)}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Experiencias anteriores</Text>
        {resenias.length === 0 ? (
          <Text style={styles.emptyReviews}>Este organizador todavía no tiene reseñas anteriores.</Text>
        ) : resenias.map((resenia) => (
          <View key={resenia.id} style={styles.review}>
            <Text style={styles.reviewScore}>{'★'.repeat(resenia.puntaje)}{'☆'.repeat(5 - resenia.puntaje)}</Text>
            <Text style={styles.reviewComment}>{resenia.comentario}</Text>
          </View>
        ))}

        <Pressable
          accessibilityRole="button"
          disabled={evento.finalizado}
          onPress={() => router.push({
            pathname: ROUTES.COMPRAR_ENTRADAS,
            params: { id: evento.id },
          })}
          style={({ pressed }) => [
            styles.buyButton,
            evento.finalizado && styles.disabledButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.buyButtonText}>
            {evento.finalizado ? 'Evento finalizado' : 'Comprar entradas'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 36 },
  image: { width: '100%', height: 220, borderRadius: 20, backgroundColor: colors.border },
  imageFallback: {
    height: 180,
    borderRadius: 20,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFallbackText: { color: '#FFFFFF', fontWeight: '900', letterSpacing: 2 },
  title: { color: colors.text, fontSize: 30, fontWeight: '900', marginTop: 20, marginBottom: 10 },
  meta: { color: colors.textMuted, fontSize: 15, lineHeight: 24 },
  reputationBox: { backgroundColor: colors.primarySoft, borderRadius: 14, padding: 14, marginTop: 16 },
  reputationLabel: { color: colors.primaryDark, fontSize: 12, fontWeight: '700' },
  reputationValue: { color: colors.primaryDark, fontSize: 17, fontWeight: '800', marginTop: 3 },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '900', marginTop: 28, marginBottom: 12 },
  description: { color: colors.textMuted, fontSize: 16, lineHeight: 24 },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  ticketInfo: { flex: 1, paddingRight: 10 },
  ticketName: { color: colors.text, fontSize: 16, fontWeight: '800' },
  availability: { color: colors.success, fontSize: 13, marginTop: 4 },
  ticketPrice: { color: colors.text, fontSize: 17, fontWeight: '900' },
  review: { backgroundColor: colors.surface, borderRadius: 14, padding: 15, marginBottom: 10 },
  reviewScore: { color: colors.warning, fontSize: 17, marginBottom: 6 },
  reviewComment: { color: colors.text, fontSize: 15, lineHeight: 21 },
  emptyReviews: { color: colors.textMuted, fontSize: 15, lineHeight: 22 },
  buyButton: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 15, marginTop: 30 },
  buyButtonText: { color: '#FFFFFF', textAlign: 'center', fontSize: 17, fontWeight: '800' },
  pressed: { opacity: 0.78 },
  disabledButton: { backgroundColor: colors.textMuted },
});
