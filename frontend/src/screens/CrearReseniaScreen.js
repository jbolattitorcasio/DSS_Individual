import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenState from '../components/ScreenState';
import UsuarioSelector from '../components/UsuarioSelector';
import { useUsuario } from '../context/UsuarioContext';
import { obtenerDetalleCompra } from '../services/comprasApi';
import { crearResenia, obtenerReseniasEvento } from '../services/reseniasApi';
import { colors } from '../theme/colors';

export default function CrearReseniaScreen() {
  const { id } = useLocalSearchParams();
  const { usuarioActivo } = useUsuario();
  const [compra, setCompra] = useState(null);
  const [existente, setExistente] = useState(null);
  const [puntaje, setPuntaje] = useState(5);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const detalle = await obtenerDetalleCompra(id);
      const resenias = await obtenerReseniasEvento(detalle.eventoId);
      setCompra(detalle);
      setExistente(resenias.find((item) => item.compraId === detalle.id) || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(useCallback(() => {
    const timer = setTimeout(cargar, 0);
    return () => clearTimeout(timer);
  }, [cargar]));

  async function enviar() {
    if (enviando || !comentario.trim()) return;
    setEnviando(true);
    setError(null);
    try {
      const creada = await crearResenia(compra.id, usuarioActivo.id, puntaje, comentario.trim());
      setExistente(creada);
      setExito(true);
    } catch (err) {
      setError(err.status === 409 ? 'Esta compra ya tiene una reseña y no admite una segunda.' : err.message);
      if (err.status === 409) await cargar();
    } finally {
      setEnviando(false);
    }
  }

  if (loading && !compra) return <ScreenState loading title="Verificando la compra…" />;
  if (!compra) return <ScreenState title="No pudimos cargar la compra" message={error} actionLabel="Reintentar" onAction={cargar} />;
  if (compra.compradorId !== usuarioActivo?.id) return <ScreenState title="Reseña no permitida" message="Solo el comprador propietario puede reseñar esta compra." />;
  if (compra.estado !== 'UTILIZADA') return <ScreenState title="Reseña todavía no disponible" message="La compra debe estar en estado UTILIZADA." />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <UsuarioSelector />
        <Text style={styles.eyebrow}>TU EXPERIENCIA</Text>
        <Text style={styles.title}>{compra.evento.nombre}</Text>
        {existente ? (
          <View style={styles.existing}>
            <Text style={styles.score}>{'★'.repeat(existente.puntaje)}{'☆'.repeat(5 - existente.puntaje)}</Text>
            <Text style={styles.comment}>{existente.comentario}</Text>
            <Text style={styles.note}>{exito ? '¡Gracias! Tu reseña fue publicada.' : 'Esta compra ya fue reseñada.'}</Text>
          </View>
        ) : (
          <>
            <Text style={styles.label}>Puntaje</Text>
            <View style={styles.stars}>{[1, 2, 3, 4, 5].map((valor) => <Pressable key={valor} onPress={() => setPuntaje(valor)} accessibilityLabel={`${valor} estrellas`}><Text style={[styles.star, valor <= puntaje && styles.starActive]}>★</Text></Pressable>)}</View>
            <Text style={styles.label}>Comentario</Text>
            <TextInput value={comentario} onChangeText={setComentario} multiline placeholder="Contanos cómo fue el evento" placeholderTextColor="#8B8D97" style={styles.input} />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable disabled={enviando || !comentario.trim()} onPress={enviar} style={[styles.primary, (enviando || !comentario.trim()) && styles.disabled]}>
              {enviando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Publicar reseña</Text>}
            </Pressable>
          </>
        )}
        <Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>Volver a la compra</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background }, content: { padding: 18, paddingBottom: 36 }, eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '900' }, title: { color: colors.text, fontSize: 29, fontWeight: '900', marginTop: 5 }, label: { color: colors.text, fontWeight: '900', marginTop: 24, marginBottom: 9 },
  stars: { flexDirection: 'row', gap: 8 }, star: { color: colors.border, fontSize: 38 }, starActive: { color: colors.warning }, input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, minHeight: 130, padding: 14, textAlignVertical: 'top', color: colors.text, fontSize: 16 },
  error: { color: colors.danger, backgroundColor: '#FDECEA', padding: 12, borderRadius: 10, marginTop: 13 }, primary: { backgroundColor: colors.primary, paddingVertical: 15, borderRadius: 14, alignItems: 'center', marginTop: 17 }, primaryText: { color: '#FFFFFF', fontWeight: '900', fontSize: 16 }, disabled: { opacity: 0.5 },
  existing: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 18, marginTop: 22 }, score: { color: colors.warning, fontSize: 25 }, comment: { color: colors.text, fontSize: 16, lineHeight: 23, marginTop: 9 }, note: { color: colors.success, fontWeight: '800', marginTop: 15 }, back: { alignItems: 'center', padding: 15, marginTop: 10 }, backText: { color: colors.primary, fontWeight: '800' },
});
