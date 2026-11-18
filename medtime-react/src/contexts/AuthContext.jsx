
import { useCallback, useMemo, useState } from 'react'
import { AuthContext } from './AuthContextDefinition.js'
import { obterPerfilUsuario } from '../utils/obterPerfilUsuario.js'

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)

  const token = usuario?.jwt ?? null

  const perfil = useMemo(
    () => obterPerfilUsuario(token),
    [token]
  )

  const entrar = useCallback((dadosUsuario) => {
    setUsuario(dadosUsuario)
  }, [])

  const sair = useCallback(() => {
    setUsuario(null)
  }, [])

  const valor = useMemo(
    () => ({
      usuario,
      token,
      perfil,
      entrar,
      sair
    }),
    [usuario, token, perfil, entrar, sair]
  )

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  )
}
