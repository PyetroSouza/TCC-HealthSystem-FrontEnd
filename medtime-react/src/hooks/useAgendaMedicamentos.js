import { useCallback, useEffect, useRef, useState } from 'react'
import { buscarAgendaMedicamentos } from '../services/api.js'
import { useAutoRefresh } from './useAutoRefresh.js'

function obterDataLocal() {
  const hoje = new Date()

  return [
    hoje.getFullYear(),
    String(hoje.getMonth() + 1).padStart(2, '0'),
    String(hoje.getDate()).padStart(2, '0')
  ].join('-')
}

export function useAgendaMedicamentos(idUsuario, dataConsulta, token) {
  const [agenda, setAgenda] = useState([])
  const [carregandoAgenda, setCarregandoAgenda] = useState(false)
  const [erroAgenda, setErroAgenda] = useState(null)

  const ultimaRequisicao = useRef(0)

  const carregarAgenda = useCallback(async (silencioso = false) => {
    const requisicaoAtual = ++ultimaRequisicao.current

    if (!idUsuario || !token) {
      setAgenda([])
      setErroAgenda(idUsuario && !token ? 'Sessão não autenticada.' : null)
      setCarregandoAgenda(false)
      return
    }

    if (!silencioso) {
      setCarregandoAgenda(true)
      setErroAgenda(null)
    }

    try {
      const data = dataConsulta || obterDataLocal()
      const medicamentosAPI = await buscarAgendaMedicamentos(idUsuario, data, token)

      if (requisicaoAtual !== ultimaRequisicao.current) return

      setAgenda(medicamentosAPI)
      setErroAgenda(null)
    } catch (erro) {
      if (requisicaoAtual !== ultimaRequisicao.current) return

      console.error('Erro ao carregar agenda:', erro)
      if (!silencioso) setAgenda([])
      setErroAgenda(erro.message || 'Erro ao carregar agenda')
    } finally {
      if (requisicaoAtual === ultimaRequisicao.current) {
        setCarregandoAgenda(false)
      }
    }
  }, [idUsuario, dataConsulta, token])

  const recarregarAgenda = useCallback(() => {
    return carregarAgenda(false)
  }, [carregarAgenda])

  useEffect(() => {
    const controle = ultimaRequisicao
    return () => {
      controle.current++
    }
  }, [idUsuario, dataConsulta, token])

  useAutoRefresh(
    useCallback(
      ({ inicial } = {}) => carregarAgenda(!inicial),
      [carregarAgenda]
    ),
    {
      enabled: Boolean(idUsuario && token),
      intervalMs: 60_000,
      minFocusIntervalMs: 10_000,
      refreshKey: `${idUsuario}:${dataConsulta ?? 'hoje'}`
    }
  )

  return {
    agenda,
    carregandoAgenda,
    erroAgenda,
    recarregarAgenda
  }
}