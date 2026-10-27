import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { combinarFechaHora, esFechaFutura, formatearFecha, formatearHora } from '../utils/fechaEvento';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FilterChip from '../components/FilterChip';
import UsuarioSelector from '../components/UsuarioSelector';
import { useUsuario } from '../context/UsuarioContext';
import { crearEvento, obtenerCategorias } from '../services/eventosApi';
import { colors } from '../theme/colors';

const tipoVacio = () => ({ key: `${Date.now()}-${Math.random()}`, nombre: '', precio: '', cupo: '' });

export default function CrearEventoScreen() {
  const { usuarioActivo } = useUsuario();
  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(null);
  const [hora, setHora] = useState(null);
  const [selector, setSelector] = useState(null);
  const [borrador, setBorrador] = useState(new Date());
  const [ubicacion, setUbicacion] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [tipos, setTipos] = useState([tipoVacio()]);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    obtenerCategorias().then(setCategorias).catch((err) => setError(err.message));
  }, []);

  function cambiarTipo(key, campo, valor) {
    setTipos((actuales) => actuales.map((tipo) => (tipo.key === key ? { ...tipo, [campo]: valor } : tipo)));
  }

  function abrirSelector(modo) {
    const ahora = new Date();
    const valor = combinarFechaHora(fecha || ahora, hora || ahora);
    if (Platform.OS === 'android') {
      const inicioHoy = new Date(ahora);
      inicioHoy.setHours(0, 0, 0, 0);
      DateTimePickerAndroid.open({
        value: modo === 'date' && valor < inicioHoy ? inicioHoy : valor,
        mode: modo,
        display: modo === 'date' ? 'calendar' : 'clock',
        minimumDate: modo === 'date' ? inicioHoy : undefined,
        is24Hour: true,
        onValueChange: (_, seleccionado) => {
          if (modo === 'date') setFecha(seleccionado);
          else setHora(seleccionado);
        },
        onDismiss: () => {}, // Cancelar o volver conserva ambos valores.
        onError: () => setError('No se pudo abrir el selector. Intentá nuevamente.'),
      });
      return;
    }
    setBorrador(valor);
    setSelector(modo);
  }

  function confirmarSelector(valor) {
    if (selector === 'date') setFecha(valor);
    else setHora(valor);
    setSelector(null);
  }

  const inicioHoy = new Date();
  inicioHoy.setHours(0, 0, 0, 0);
  const picker = selector ? (
    <DateTimePicker
      value={borrador}
      mode={selector}
      display={Platform.OS === 'ios' ? (selector === 'date' ? 'inline' : 'spinner') : (selector === 'date' ? 'calendar' : 'clock')}
      minimumDate={selector === 'date' ? inicioHoy : undefined}
      is24Hour
      locale={Platform.OS === 'ios' ? 'es-AR' : undefined}
      themeVariant="light"
      onValueChange={(_, valor) => Platform.OS === 'ios' ? setBorrador(valor) : confirmarSelector(valor)}
      onDismiss={() => setSelector(null)}
    />
  ) : null;

  async function publicar() {
    if (procesando) return;
    setError(null);
    const fechaNormalizada = combinarFechaHora(fecha, hora);
    if (!usuarioActivo) return setError('Seleccioná una identidad simulada.');
    if (!categoriaId) return setError('Seleccioná una categoría.');
    if (!esFechaFutura(fechaNormalizada)) {
      return setError('Seleccioná una fecha y hora posteriores al momento actual.');
    }
    const entradas = tipos.map((tipo) => ({
      nombre: tipo.nombre.trim(),
      precio: Number(tipo.precio),
      cupo: Number(tipo.cupo),
    }));
    if (entradas.some((tipo) => !tipo.nombre || !Number.isFinite(tipo.precio) || tipo.precio < 0 || !Number.isInteger(tipo.cupo) || tipo.cupo <= 0)) {
      return setError('Cada entrada necesita nombre, precio mayor o igual a cero y cupo entero positivo.');
    }
    setProcesando(true);
    try {
      const creado = await crearEvento({
        nombre, descripcion, fecha: fechaNormalizada.toISOString(), ubicacion,
        organizadorId: usuarioActivo.id, categoriaId,
        imagenUrl: imagenUrl.trim() || undefined,
        tiposEntrada: entradas,
      });
      router.replace({ pathname: '/organizador/eventos/[id]/compras', params: { id: creado.id } });
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <UsuarioSelector />
        <Text style={styles.title}>Publicar evento</Text>
        <Text style={styles.note}>La identidad simulada seleccionada quedará registrada como organizador.</Text>
        <Field label="Nombre" value={nombre} onChangeText={setNombre} />
        <Field label="Descripción" value={descripcion} onChangeText={setDescripcion} multiline />
        <View style={styles.row}>
          <View style={styles.half}><SelectorField label="Fecha del evento" value={fecha && formatearFecha(fecha)} placeholder="DD/MM/AAAA" onPress={() => abrirSelector('date')} /></View>
          <View style={styles.half}><SelectorField label="Hora del evento" value={hora && formatearHora(hora)} placeholder="HH:mm" onPress={() => abrirSelector('time')} /></View>
        </View>
        {Platform.OS === 'ios' ? (
          <Modal visible={selector !== null} transparent animationType="slide" onRequestClose={() => setSelector(null)}>
            <View style={styles.modalBackdrop}>
              <View style={styles.modalContent}>
                <Text style={styles.sectionTitle}>{selector === 'date' ? 'Seleccionar fecha' : 'Seleccionar hora'}</Text>
                {picker}
                <View style={styles.ticketHeader}>
                  <Pressable accessibilityRole="button" onPress={() => setSelector(null)} style={styles.modalAction}><Text style={styles.remove}>Cancelar</Text></Pressable>
                  <Pressable accessibilityRole="button" onPress={() => confirmarSelector(borrador)} style={styles.modalAction}><Text style={styles.add}>Aceptar</Text></Pressable>
                </View>
              </View>
            </View>
          </Modal>
        ) : picker}
        <Field label="Ubicación" value={ubicacion} onChangeText={setUbicacion} />
        <Field label="URL de imagen (opcional)" value={imagenUrl} onChangeText={setImagenUrl} autoCapitalize="none" keyboardType="url" />

        <Text style={styles.label}>Categoría</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {categorias.map((categoria) => <FilterChip key={categoria.id} label={categoria.nombre} selected={categoriaId === categoria.id} onPress={() => setCategoriaId(categoria.id)} />)}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tipos de entrada</Text>
          <Pressable onPress={() => setTipos((actuales) => [...actuales, tipoVacio()])}><Text style={styles.add}>+ Agregar</Text></Pressable>
        </View>
        {tipos.map((tipo, index) => (
          <View key={tipo.key} style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
              <Text style={styles.ticketTitle}>Entrada {index + 1}</Text>
              {tipos.length > 1 ? <Pressable onPress={() => setTipos((actuales) => actuales.filter((item) => item.key !== tipo.key))}><Text style={styles.remove}>Quitar</Text></Pressable> : null}
            </View>
            <Field label="Nombre" value={tipo.nombre} onChangeText={(value) => cambiarTipo(tipo.key, 'nombre', value)} compact />
            <View style={styles.row}>
              <View style={styles.half}><Field label="Precio" value={tipo.precio} onChangeText={(value) => cambiarTipo(tipo.key, 'precio', value)} keyboardType="decimal-pad" compact /></View>
              <View style={styles.half}><Field label="Cupo" value={tipo.cupo} onChangeText={(value) => cambiarTipo(tipo.key, 'cupo', value)} keyboardType="number-pad" compact /></View>
            </View>
          </View>
        ))}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable disabled={procesando} onPress={publicar} style={[styles.primary, procesando && styles.disabled]}>
          {procesando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Publicar evento</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function SelectorField({ label, value, placeholder, onPress }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${value || 'sin seleccionar'}`} onPress={onPress} style={styles.input}>
        <Text style={[styles.selectorText, !value && styles.placeholder]}>{value || placeholder}</Text>
      </Pressable>
    </View>
  );
}

function Field({ label, compact, multiline, ...props }) {
  return <View style={!compact && styles.field}><Text style={styles.label}>{label}</Text><TextInput {...props} multiline={multiline} placeholderTextColor="#8B8D97" style={[styles.input, multiline && styles.multiline]} /></View>;
}

const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  modalContent: { backgroundColor: colors.surface, padding: 24, paddingBottom: 40, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalAction: { padding: 14 }, selectorText: { color: colors.text, fontSize: 15 }, placeholder: { color: '#8B8D97' },
  safeArea: { flex: 1, backgroundColor: colors.background }, content: { padding: 18, paddingBottom: 40 },
  title: { color: colors.text, fontSize: 30, fontWeight: '900' }, note: { color: colors.textMuted, lineHeight: 20, marginTop: 7, marginBottom: 8 },
  field: { marginTop: 13 }, label: { color: colors.text, fontWeight: '800', marginBottom: 7, marginTop: 10 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 12, color: colors.text, fontSize: 15 },
  multiline: { minHeight: 92, textAlignVertical: 'top' }, chips: { gap: 8, paddingRight: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25 }, sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '900' }, add: { color: colors.primary, fontWeight: '900' },
  ticketCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 15, padding: 14, marginTop: 12 }, ticketHeader: { flexDirection: 'row', justifyContent: 'space-between' }, ticketTitle: { color: colors.text, fontWeight: '900' }, remove: { color: colors.danger, fontWeight: '800' },
  row: { flexDirection: 'row', gap: 10 }, half: { flex: 1 }, error: { color: colors.danger, backgroundColor: '#FDECEA', padding: 12, borderRadius: 10, marginTop: 15 },
  primary: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 20 }, disabled: { opacity: 0.6 }, primaryText: { color: '#FFFFFF', fontWeight: '900', fontSize: 16 },
});
