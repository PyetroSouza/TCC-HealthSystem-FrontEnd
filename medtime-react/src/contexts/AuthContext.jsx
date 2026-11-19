
import { useCallback, useMemo, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import { AuthContext } from './AuthContextDefinition.js'
import { obterPerfilUsuario } from '../utils/obterPerfilUsuario.js'

const CHAVE_SESSAO = 'medtime_usuario'

function tokenValido(token) {
  if (!token) return false

  try {
    const dados = jwtDecode(token)

    return typeof dados.exp === 'number' &&
      dados.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

function recuperarUsuario() {
  try {
    const salvo = sessionStorage.getItem(CHAVE_SESSAO)

    if (!salvo) return null

    const dados = JSON.parse(salvo)

    if (!dados || !tokenValido(dados.jwt)) {
      sessionStorage.removeItem(CHAVE_SESSAO)
      return null
    }

    return dados
  } catch {
    sessionStorage.removeItem(CHAVE_SESSAO)
    return null
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(recuperarUsuario)

  const token = usuario?.jwt ?? null

  const perfil = useMemo(
    () => obterPerfilUsuario(token),
    [token]
  )

  const entrar = useCallback((dadosUsuario) => {
    if (!tokenValido(dadosUsuario?.jwt)) {
      sessionStorage.removeItem(CHAVE_SESSAO)
      setUsuario(null)
      return
    }

    sessionStorage.setItem(
      CHAVE_SESSAO,
      JSON.stringify(dadosUsuario)
    )

    setUsuario(dadosUsuario)
  }, [])

  const sair = useCallback(() => {
    sessionStorage.removeItem(CHAVE_SESSAO)
    setUsuario(null)
  }, [])

  const atualizarUsuario = useCallback((dadosAtualizados) => {
    setUsuario(atual => {
      if (!atual) return null

      const atualizado = {
        ...atual,
        ...dadosAtualizados,
        jwt: atual.jwt
      }

      sessionStorage.setItem(
        CHAVE_SESSAO,
        JSON.stringify(atualizado)
      )

      return atualizado
    })
  }, [])

  const valor = useMemo(
    () => ({
      usuario,
      token,
      perfil,
      entrar,
      sair,
      atualizarUsuario
    }),
    [usuario, token, perfil, entrar, sair, atualizarUsuario]
  )

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  )
}
