import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenState from '../components/ScreenState';
import UsuarioSelector from '../components/UsuarioSelector';
import { useUsuario } from '../context/UsuarioContext';
import { obtenerDetalleCompra } from '../services/comprasApi';
import { enviarMensaje, obtenerMensajes } from '../services/mensajesApi';
import { colors } from '../theme/colors';
import { formatearFecha } from '../utils/formatters';

export default function ChatCompraScreen() {
  const { id } = useLocalSearchParams();
  const { usuarioActivo, usuarios } = useUsuario();
  const [compra, setCompra] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [contenido, setContenido] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (refrescar = false) => {
    if (!usuarioActivo) return;
    if (refrescar) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const detalle = await obtenerDetalleCompra(id);
      const participante = usuarioActivo.id === detalle.compradorId || usuarioActivo.id === detalle.evento.organizadorId;
      setCompra(detalle);
      if (!participante) throw new Error('Solo el comprador y el organizador pueden acceder a esta conversación.');
      const resultado = await obtenerMensajes(id, usuarioActivo.id);
      setMensajes([...resultado].sort((a, b) => new Date(a.fechaEnvio) - new Date(b.fechaEnvio)));
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

  async function enviar() {
    const texto = contenido.trim();
    if (!texto || enviando) return;
    setEnviando(true);
    setError(null);
    try {
      await enviarMensaje(id, usuarioActivo.id, texto);
      setContenido('');
      await cargar(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (loading && !compra) return <ScreenState loading title="Cargando conversación…" />;
  const permitido = compra && usuarioActivo && (compra.compradorId === usuarioActivo.id || compra.evento.organizadorId === usuarioActivo.id);
  if (!permitido) return <ScreenState title="Conversación no disponible" message={error || 'La identidad activa no participa de esta compra.'} actionLabel="Reintentar" onAction={cargar} />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.content}>
        <UsuarioSelector />
        <Text style={styles.eyebrow}>COMPRA #{compra.id}</Text>
        <Text style={styles.title}>{compra.evento.nombre}</Text>
        <Text style={styles.disclaimer}>La identidad se simula mediante IDs; no constituye autorización segura.</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <FlatList
          data={mensajes}
          keyExtractor={(item) => String(item.id)}
          style={styles.list}
          contentContainerStyle={mensajes.length === 0 && styles.emptyList}
          renderItem={({ item }) => {
            const propio = item.autorId === usuarioActivo.id;
            const autor = usuarios.find((usuario) => usuario.id === item.autorId);
            return <View style={[styles.message, propio ? styles.own : styles.other]}><Text style={styles.author}>{propio ? 'Vos' : (autor?.nombre || `Usuario #${item.autorId}`)}</Text><Text style={styles.messageText}>{item.contenido}</Text><Text style={styles.date}>{formatearFecha(item.fechaEnvio)}</Text></View>;
          }}
          ListEmptyComponent={<ScreenState title="Sin mensajes" message="Iniciá la conversación sobre esta compra." />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => cargar(true)} tintColor={colors.primary} />}
        />
        <View style={styles.composer}>
          <TextInput value={contenido} onChangeText={setContenido} placeholder="Escribí un mensaje" placeholderTextColor="#8B8D97" multiline style={styles.input} />
          <Pressable disabled={enviando || !contenido.trim()} onPress={enviar} style={[styles.send, (enviando || !contenido.trim()) && styles.disabled]}>
            {enviando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.sendText}>Enviar</Text>}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background }, content: { flex: 1, padding: 16 }, eyebrow: { color: colors.primary, fontSize: 11, fontWeight: '900' }, title: { color: colors.text, fontSize: 23, fontWeight: '900', marginTop: 3 }, disclaimer: { color: colors.textMuted, fontSize: 12, marginTop: 5 },
  error: { color: colors.danger, backgroundColor: '#FDECEA', borderRadius: 10, padding: 10, marginTop: 10 }, list: { flex: 1, marginTop: 12 }, emptyList: { flexGrow: 1 },
  message: { maxWidth: '84%', padding: 12, borderRadius: 15, marginBottom: 10 }, own: { alignSelf: 'flex-end', backgroundColor: colors.primarySoft }, other: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, author: { color: colors.primaryDark, fontSize: 12, fontWeight: '900' }, messageText: { color: colors.text, fontSize: 15, lineHeight: 21, marginTop: 3 }, date: { color: colors.textMuted, fontSize: 10, marginTop: 6 },
  composer: { flexDirection: 'row', gap: 9, alignItems: 'flex-end', paddingTop: 9 }, input: { flex: 1, maxHeight: 100, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 13, paddingVertical: 11, color: colors.text }, send: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 17, paddingVertical: 13 }, sendText: { color: '#FFFFFF', fontWeight: '900' }, disabled: { opacity: 0.5 },
});
