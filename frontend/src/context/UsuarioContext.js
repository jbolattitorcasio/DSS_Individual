import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { obtenerUsuarios } from '../services/usuariosApi';

const UsuarioContext = createContext(null);

export function UsuarioProvider({ children }) {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioActivo, setUsuarioActivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resultado = await obtenerUsuarios();
      setUsuarios(resultado);
      setUsuarioActivo((actual) => (
        resultado.find((usuario) => usuario.id === actual?.id) || resultado[0] || null
      ));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let vigente = true;
    obtenerUsuarios()
      .then((resultado) => {
        if (!vigente) return;
        setUsuarios(resultado);
        setUsuarioActivo(resultado[0] || null);
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
  }, []);

  const value = useMemo(() => ({
    usuarios,
    usuarioActivo,
    seleccionarUsuario: setUsuarioActivo,
    loading,
    error,
    recargarUsuarios: cargarUsuarios,
  }), [usuarios, usuarioActivo, loading, error, cargarUsuarios]);

  return <UsuarioContext.Provider value={value}>{children}</UsuarioContext.Provider>;
}

export function useUsuario() {
  const context = useContext(UsuarioContext);
  if (!context) throw new Error('useUsuario debe utilizarse dentro de UsuarioProvider');
  return context;
}
