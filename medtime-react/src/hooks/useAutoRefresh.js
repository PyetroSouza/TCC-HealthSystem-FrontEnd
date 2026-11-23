import { useEffect, useRef } from 'react'

/**
 * Executa uma consulta inicialmente e depois periodicamente.
 * Também atualiza ao voltar para a aba ou janela, sem sobrepor requisições.
 */
export function useAutoRefresh(
  callback,
  {
    enabled = true,
    intervalMs = 60_000,
    minFocusIntervalMs = 10_000,
    refreshKey = null
  } = {}
) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!enabled) return undefined

    let ativo = true
    let executando = false
    let primeiraExecucao = true
    let ultimaExecucao = 0

    async function executar({ forcar = false } = {}) {
      if (!ativo || document.visibilityState !== 'visible' || executando) {
        return
      }

      const agora = Date.now()
      const intervaloMinimo = forcar
        ? minFocusIntervalMs
        : intervalMs

      if (
        !primeiraExecucao &&
        agora - ultimaExecucao < intervaloMinimo
      ) {
        return
      }

      executando = true
      ultimaExecucao = agora

      const inicial = primeiraExecucao
      primeiraExecucao = false

      try {
        await callbackRef.current({ inicial })
      } catch (erro) {
        console.error('Erro na atualização automática:', erro)
      } finally {
        executando = false
      }
    }

    void executar()

    const intervalo = window.setInterval(() => {
      void executar()
    }, intervalMs)

    function atualizarAoRetornar() {
      void executar({ forcar: true })
    }

    function tratarVisibilidade() {
      if (document.visibilityState === 'visible') {
        atualizarAoRetornar()
      }
    }

    window.addEventListener('focus', atualizarAoRetornar)
    document.addEventListener('visibilitychange', tratarVisibilidade)

    return () => {
      ativo = false
      window.clearInterval(intervalo)
      window.removeEventListener('focus', atualizarAoRetornar)
      document.removeEventListener('visibilitychange', tratarVisibilidade)
    }
  }, [enabled, intervalMs, minFocusIntervalMs, refreshKey])
}
