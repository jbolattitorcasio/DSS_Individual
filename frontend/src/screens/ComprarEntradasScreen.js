import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenState from '../components/ScreenState';
import StatusBadge from '../components/StatusBadge';
import UsuarioSelector from '../components/UsuarioSelector';
import { useUsuario } from '../context/UsuarioContext';
import { ROUTES } from '../navigation/routes';
import { confirmarCompra, crearCompra } from '../services/comprasApi';
import { obtenerEvento } from '../services/eventosApi';
import { colors } from '../theme/colors';
import { formatearPrecio } from '../utils/formatters';

export default function ComprarEntradasScreen() {
  const { id } = useLocalSearchParams();
  const { usuarioActivo } = useUsuario();
  const [evento, setEvento] = useState(null);
  const [tipoSeleccionadoId, setTipoSeleccionadoId] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [compra, setCompra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const cargarEvento = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await obtenerEvento(id);
      setEvento(resultado);
      setTipoSeleccionadoId((actual) => {
        const sigueDisponible = resultado.tiposEntrada.some(
          (tipo) => tipo.id === actual && tipo.cupoDisponible > 0,
        );
        return sigueDisponible
          ? actual
          : resultado.tiposEntrada.find((tipo) => tipo.cupoDisponible > 0)?.id || null;
      });
      setCantidad(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let vigente = true;
    obtenerEvento(id)
      .then((resultado) => {
        if (!vigente) return;
        setEvento(resultado);
        setTipoSeleccionadoId(
          resultado.tiposEntrada.find((tipo) => tipo.cupoDisponible > 0)?.id || null,
        );
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

  const tipoSeleccionado = useMemo(
    () => evento?.tiposEntrada.find((tipo) => tipo.id === tipoSeleccionadoId),
    [evento, tipoSeleccionadoId],
  );
  const total = tipoSeleccionado ? tipoSeleccionado.precio * cantidad : 0;

  async function comprar() {
    if (procesando || !usuarioActivo || !tipoSeleccionado) return;
    setProcesando(true);
    setError(null);
    setMensaje(null);
    try {
      const resultado = await crearCompra({
        compradorId: usuarioActivo.id,
        eventoId: evento.id,
        tipoEntradaId: tipoSeleccionado.id,
        cantidad,
      });
      setCompra(resultado);
      setMensaje('Compra creada. El cupo quedó reservado mientras está pendiente de pago.');
      const actualizado = await obtenerEvento(id);
      setEvento(actualizado);
    } catch (err) {
      const mensajeError = err.status === 409
        ? `No pudimos reservar el cupo: ${err.message}`
        : err.message;
      try {
        setEvento(await obtenerEvento(id));
      } finally {
        setError(mensajeError);
      }
    } finally {
      setProcesando(false);
    }
  }

  async function confirmarPago() {
    if (procesando || !compra) return;
    setProcesando(true);
    setError(null);
    try {
      const actualizada = await confirmarCompra(compra.id);
      setCompra(actualizada);
      setMensaje('Pago simulado correctamente. La compra quedó confirmada.');
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  }

  if (loading) return <ScreenState loading title="Consultando disponibilidad…" />;
  if (!evento) {
    return <ScreenState title="No pudimos preparar la compra" message={error} actionLabel="Reintentar" onAction={cargarEvento} />;
  }

  if (compra) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <UsuarioSelector />
          <View style={styles.successCard}>
            <Text style={styles.successEyebrow}>COMPRA REGISTRADA</Text>
            <Text style={styles.title}>{evento.nombre}</Text>
            <StatusBadge estado={compra.estado} />
            <Text style={styles.summary}>{cantidad} × {tipoSeleccionado?.nombre}</Text>
            <Text style={styles.total}>{formatearPrecio(compra.precioUnitario * compra.cantidad)}</Text>
            {mensaje ? <Text style={styles.successMessage}>{mensaje}</Text> : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {compra.estado === 'PENDIENTE_PAGO' ? (
              <Pressable disabled={procesando} onPress={confirmarPago} style={styles.primaryButton}>
                {procesando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Simular pago</Text>}
              </Pressable>
            ) : null}
            <Pressable
              onPress={() => router.replace({ pathname: ROUTES.DETALLE_COMPRA, params: { id: compra.id } })}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryText}>Ver detalle de la compra</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <UsuarioSelector />
        <Text style={styles.eyebrow}>NUEVA COMPRA</Text>
        <Text style={styles.title}>{evento.nombre}</Text>
        <Text style={styles.sectionTitle}>Elegí el tipo de entrada</Text>
        {evento.tiposEntrada.map((tipo) => {
          const agotada = tipo.cupoDisponible <= 0;
          const selected = tipo.id === tipoSeleccionadoId;
          return (
            <Pressable
              key={tipo.id}
              disabled={agotada || procesando}
              onPress={() => {
                setTipoSeleccionadoId(tipo.id);
                setCantidad(1);
              }}
              style={[styles.ticket, selected && styles.ticketSelected, agotada && styles.disabled]}
            >
              <View>
                <Text style={styles.ticketName}>{tipo.nombre}</Text>
                <Text style={styles.availability}>{agotada ? 'Agotada' : `${tipo.cupoDisponible} disponibles`}</Text>
              </View>
              <Text style={styles.ticketPrice}>{formatearPrecio(tipo.precio)}</Text>
            </Pressable>
          );
        })}

        {tipoSeleccionado ? (
          <>
            <Text style={styles.sectionTitle}>Cantidad</Text>
            <View style={styles.quantityRow}>
              <Pressable disabled={cantidad <= 1 || procesando} onPress={() => setCantidad((valor) => valor - 1)} style={styles.quantityButton}>
                <Text style={styles.quantityButtonText}>−</Text>
              </Pressable>
              <Text style={styles.quantity}>{cantidad}</Text>
              <Pressable
                disabled={cantidad >= tipoSeleccionado.cupoDisponible || procesando}
                onPress={() => setCantidad((valor) => Math.min(valor + 1, tipoSeleccionado.cupoDisponible))}
                style={styles.quantityButton}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </Pressable>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.total}>{formatearPrecio(total)}</Text>
            </View>
          </>
        ) : <Text style={styles.error}>No hay entradas disponibles para este evento.</Text>}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          disabled={procesando || !usuarioActivo || !tipoSeleccionado}
          onPress={comprar}
          style={[styles.primaryButton, (procesando || !tipoSeleccionado) && styles.disabled]}
        >
          {procesando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Confirmar compra</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 36 },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  title: { color: colors.text, fontSize: 28, fontWeight: '900', marginTop: 5, marginBottom: 14 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '900', marginTop: 20, marginBottom: 10 },
  ticket: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 15, marginBottom: 10 },
  ticketSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  ticketName: { color: colors.text, fontSize: 16, fontWeight: '800' },
  availability: { color: colors.success, marginTop: 4, fontSize: 13 },
  ticketPrice: { color: colors.text, fontSize: 17, fontWeight: '900' },
  quantityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 },
  quantityButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  quantityButtonText: { color: colors.primary, fontSize: 26, fontWeight: '700' },
  quantity: { color: colors.text, fontSize: 24, fontWeight: '900', minWidth: 32, textAlign: 'center' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 18, borderTopWidth: 1, borderColor: colors.border },
  totalLabel: { color: colors.textMuted, fontSize: 16 },
  total: { color: colors.text, fontSize: 25, fontWeight: '900' },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 15, marginTop: 22, alignItems: 'center' },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  secondaryButton: { borderWidth: 1, borderColor: colors.primary, borderRadius: 14, paddingVertical: 14, marginTop: 12 },
  secondaryText: { color: colors.primary, textAlign: 'center', fontWeight: '800' },
  disabled: { opacity: 0.45 },
  error: { color: colors.danger, backgroundColor: '#FDECEA', borderRadius: 10, padding: 12, marginTop: 16 },
  successCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.border },
  successEyebrow: { color: colors.success, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  summary: { color: colors.textMuted, fontSize: 16, marginTop: 18, marginBottom: 5 },
  successMessage: { color: colors.success, backgroundColor: '#E7F6EE', borderRadius: 10, padding: 12, marginTop: 16, lineHeight: 20 },
});
