import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenState from '../components/ScreenState';
import StatusBadge, { etiquetaEstado } from '../components/StatusBadge';
import UsuarioSelector from '../components/UsuarioSelector';
import { cancelarCompra, confirmarCompra, obtenerDetalleCompra } from '../services/comprasApi';
import { colors } from '../theme/colors';
import { formatearFecha, formatearPrecio } from '../utils/formatters';

function agregarReglasTemporales(compra) {
  return {
    ...compra,
    eventoYaOcurrio: new Date(compra.evento.fecha).getTime() <= Date.now(),
  };
}

export default function DetalleCompraScreen() {
  const { id } = useLocalSearchParams();
  const [compra, setCompra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCompra(agregarReglasTemporales(await obtenerDetalleCompra(id)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let vigente = true;
    obtenerDetalleCompra(id)
      .then((resultado) => {
        if (vigente) setCompra(agregarReglasTemporales(resultado));
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
  }, [id]);

  async function ejecutar(operacion, exito) {
    if (procesando) return;
    setProcesando(true);
    setError(null);
    setMensaje(null);
    try {
      const resultado = await operacion(compra.id);
      setMensaje(exito(resultado));
      setCompra(agregarReglasTemporales(await obtenerDetalleCompra(compra.id)));
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  }

  function solicitarCancelacion() {
    Alert.alert(
      'Cancelar compra',
      compra.estado === 'CONFIRMADA'
        ? 'La cancelación confirmada simulará también el reembolso.'
        : 'La compra pendiente se cancelará sin reembolso.',
      [
        { text: 'Volver', style: 'cancel' },
        {
          text: 'Cancelar compra',
          style: 'destructive',
          onPress: () => ejecutar(cancelarCompra, (resultado) => (
            resultado.estado === 'REEMBOLSADA'
              ? 'Compra cancelada. El reembolso fue simulado correctamente.'
              : 'Compra cancelada. No correspondía realizar un reembolso.'
          )),
        },
      ],
    );
  }

  if (loading) return <ScreenState loading title="Cargando compra…" />;
  if (!compra) {
    return <ScreenState title="No pudimos cargar la compra" message={error} actionLabel="Reintentar" onAction={cargar} />;
  }

  const puedeCancelar = ['PENDIENTE_PAGO', 'CONFIRMADA'].includes(compra.estado)
    && !compra.eventoYaOcurrio;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <UsuarioSelector />
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>COMPRA #{compra.id}</Text>
            <Text style={styles.title}>{compra.evento.nombre}</Text>
          </View>
          <StatusBadge estado={compra.estado} />
        </View>

        <View style={styles.summaryCard}>
          <DataRow label="Tipo de entrada" value={compra.tipoEntrada?.nombre || `ID ${compra.tipoEntradaId}`} />
          <DataRow label="Cantidad" value={String(compra.cantidad)} />
          <DataRow label="Precio unitario" value={formatearPrecio(compra.precioUnitario)} />
          <DataRow label="Total" value={formatearPrecio(compra.precioUnitario * compra.cantidad)} strong />
          <DataRow label="Fecha de compra" value={formatearFecha(compra.fechaCompra)} />
          {compra.estado === 'CONFIRMADA' && Number.isInteger(compra.diasRestantes) ? (
            <DataRow label="Días restantes" value={String(compra.diasRestantes)} />
          ) : null}
        </View>

        {mensaje ? <Text style={styles.success}>{mensaje}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {compra.estado === 'PENDIENTE_PAGO' ? (
          <Pressable
            disabled={procesando}
            onPress={() => ejecutar(confirmarCompra, () => 'Pago simulado. La compra quedó confirmada.')}
            style={styles.primaryButton}
          >
            {procesando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Simular pago</Text>}
          </Pressable>
        ) : null}
        {puedeCancelar ? (
          <Pressable disabled={procesando} onPress={solicitarCancelacion} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancelar compra</Text>
          </Pressable>
        ) : null}

        <Text style={styles.sectionTitle}>Historial de estados</Text>
        {(compra.historialEstados || []).map((cambio, index) => (
          <View key={`${cambio.estadoNuevo}-${cambio.fecha}-${index}`} style={styles.historyRow}>
            <View style={styles.timelineDot} />
            <View style={styles.historyText}>
              <Text style={styles.historyState}>{etiquetaEstado(cambio.estadoNuevo)}</Text>
              <Text style={styles.historyDate}>{formatearFecha(cambio.fecha)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function DataRow({ label, value, strong }) {
  return (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={[styles.dataValue, strong && styles.strong]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 36 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  title: { color: colors.text, fontSize: 26, fontWeight: '900', marginTop: 5, maxWidth: 235 },
  summaryCard: { backgroundColor: colors.surface, borderRadius: 17, borderWidth: 1, borderColor: colors.border, padding: 16, marginTop: 20 },
  dataRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 9 },
  dataLabel: { color: colors.textMuted, flex: 1 },
  dataValue: { color: colors.text, flex: 1, textAlign: 'right', fontWeight: '700' },
  strong: { fontSize: 18, fontWeight: '900' },
  success: { color: colors.success, backgroundColor: '#E7F6EE', borderRadius: 10, padding: 12, marginTop: 16, lineHeight: 20 },
  error: { color: colors.danger, backgroundColor: '#FDECEA', borderRadius: 10, padding: 12, marginTop: 16 },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 15, marginTop: 20, alignItems: 'center' },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  cancelButton: { borderWidth: 1, borderColor: colors.danger, borderRadius: 14, paddingVertical: 14, marginTop: 11 },
  cancelText: { color: colors.danger, textAlign: 'center', fontWeight: '800' },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '900', marginTop: 29, marginBottom: 14 },
  historyRow: { flexDirection: 'row', minHeight: 58 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary, marginTop: 4, marginRight: 13 },
  historyText: { flex: 1, borderBottomWidth: 1, borderColor: colors.border, paddingBottom: 13, marginBottom: 10 },
  historyState: { color: colors.text, fontSize: 15, fontWeight: '800' },
  historyDate: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
});
