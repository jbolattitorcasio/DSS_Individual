import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useUsuario } from '../context/UsuarioContext';
import { colors } from '../theme/colors';

export default function UsuarioSelector() {
  const [visible, setVisible] = useState(false);
  const {
    usuarios,
    usuarioActivo,
    seleccionarUsuario,
    loading,
    error,
    recargarUsuarios,
  } = useUsuario();

  if (loading) {
    return <ActivityIndicator color={colors.primary} style={styles.loader} />;
  }

  if (error) {
    return (
      <Pressable onPress={recargarUsuarios} style={styles.errorBox}>
        <Text style={styles.errorText}>No se pudo cargar la identidad. Tocá para reintentar.</Text>
      </Pressable>
    );
  }

  return (
    <>
      <Pressable accessibilityRole="button" onPress={() => setVisible(true)} style={styles.selector}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{usuarioActivo?.nombre?.charAt(0) || '?'}</Text>
        </View>
        <View style={styles.identityText}>
          <Text style={styles.simulated}>IDENTIDAD SIMULADA</Text>
          <Text style={styles.name}>{usuarioActivo?.nombre || 'Seleccionar usuario'}</Text>
        </View>
        <Text style={styles.change}>Cambiar</Text>
      </Pressable>

      <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.title}>Elegí una identidad</Text>
            <Text style={styles.disclaimer}>
              Esta selección simula al usuario activo. No es autenticación y no ofrece seguridad real.
            </Text>
            <ScrollView>
              {usuarios.map((usuario) => (
                <Pressable
                  key={usuario.id}
                  onPress={() => {
                    seleccionarUsuario(usuario);
                    setVisible(false);
                  }}
                  style={[
                    styles.userRow,
                    usuarioActivo?.id === usuario.id && styles.selectedUser,
                  ]}
                >
                  <Text style={styles.userName}>{usuario.nombre}</Text>
                  <Text style={styles.userEmail}>{usuario.email}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable onPress={() => setVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  loader: { marginVertical: 12 },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 12,
    marginBottom: 18,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.primary, fontSize: 18, fontWeight: '900' },
  identityText: { flex: 1, marginLeft: 11 },
  simulated: { color: colors.warning, fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  name: { color: colors.text, fontSize: 15, fontWeight: '800', marginTop: 2 },
  change: { color: colors.primary, fontSize: 13, fontWeight: '800' },
  errorBox: { backgroundColor: '#FDECEA', borderRadius: 12, padding: 12, marginBottom: 18 },
  errorText: { color: colors.danger, fontWeight: '700' },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(20, 20, 28, 0.45)' },
  sheet: { backgroundColor: colors.surface, maxHeight: '78%', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 18 },
  title: { color: colors.text, fontSize: 23, fontWeight: '900' },
  disclaimer: { color: colors.textMuted, lineHeight: 20, marginTop: 7, marginBottom: 16 },
  userRow: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 14, marginBottom: 10 },
  selectedUser: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  userName: { color: colors.text, fontSize: 16, fontWeight: '800' },
  userEmail: { color: colors.textMuted, fontSize: 13, marginTop: 3 },
  closeButton: { alignItems: 'center', paddingVertical: 13, marginTop: 4 },
  closeText: { color: colors.primary, fontWeight: '800' },
});
