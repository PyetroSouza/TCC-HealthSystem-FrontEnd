
import { useMemo, useState } from 'react'
import { AuthContext } from './AuthContextDefinition.js'
import { obterPerfilUsuario } from '../utils/obterPerfilUsuario.js'

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)

  const token = usuario?.jwt ?? null

  const perfil = useMemo(
    () => obterPerfilUsuario(token),
    [token]
  )

  function entrar(dadosUsuario) {
    setUsuario(dadosUsuario)
  }

  function sair() {
    setUsuario(null)
  }

  const valor = useMemo(
    () => ({
      usuario,
      token,
      perfil,
      entrar,
      sair
    }),
    [usuario, token, perfil]
  )

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  )
}
