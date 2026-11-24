import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

const INTERVALO_VERIFICACAO = 60_000

const TELAS_COM_DADOS_NAO_SALVOS = new Set([
  'cadastro-usuario',
  'cadastro-remedio',
  'recuperar-senha',
  'verificacao-recuperacao',
  'redefinir-senha',
  'minha-conta'
])

export function useAppVersion(telaAtual) {
  const alteracoesPendentes = useRef(false)
  const novaVersao = useRef(null)
  const avisoExibido = useRef(false)

  useEffect(() => {
    alteracoesPendentes.current = false

function registrarAlteracao(evento) {
      if (!TELAS_COM_DADOS_NAO_SALVOS.has(telaAtual)) return 

      const alvo = evento.target
      const campoDeBusca = alvo?.closest?.('.search, .pacientes-pesquisa')

      if (!campoDeBusca) {
        alteracoesPendentes.current = true
      }
    }

    document.addEventListener('input', registrarAlteracao, true)
    document.addEventListener('change', registrarAlteracao, true)

    return () => {
      document.removeEventListener('input', registrarAlteracao, true)
      document.removeEventListener('change', registrarAlteracao, true)
    }
  }, [telaAtual])

  useEffect(() => {
    if (import.meta.env.DEV) return undefined

    let ativo = true
    let verificando = false

    function atualizarAgora() {
      if (!novaVersao.current) return

      const urlAtualizada = new URL(window.location.href)
      urlAtualizada.searchParams.set(
        '__medtime_build',
        novaVersao.current
      )

      window.location.replace(urlAtualizada.toString())
    }

    function podeAtualizar() {
      const dialogoAberto = document.querySelector(
        '[role="dialog"], [role="alertdialog"]'
      )
      const campoEmFoco = document.activeElement?.matches?.(
        'input, textarea, select, [contenteditable="true"]'
      )
      const telaProtegida = TELAS_COM_DADOS_NAO_SALVOS.has(telaAtual)

      return (
        document.visibilityState === 'visible' &&
        !telaProtegida &&
        !alteracoesPendentes.current &&
        !dialogoAberto &&
        !campoEmFoco
      )
    }

    function aplicarAtualizacaoSeSegura() {
      if (novaVersao.current && podeAtualizar()) {
        atualizarAgora()
        return true
      }

      return false
    }

    async function verificarVersao() {
      if (
        !ativo ||
        verificando ||
        document.visibilityState !== 'visible'
      ) {
        return
      }

      if (aplicarAtualizacaoSeSegura()) return
      if (novaVersao.current) return

      verificando = true

      try {
        const resposta = await fetch(
          `${import.meta.env.BASE_URL}version.json?check=${Date.now()}`,
          { cache: 'no-store' }
        )

        if (!resposta.ok) return

        const manifesto = await resposta.json()
        const versaoPublicada = manifesto?.version
        const versaoAtual = import.meta.env.VITE_APP_BUILD_ID

        if (!versaoPublicada || versaoPublicada === versaoAtual) {
          return
        }

        novaVersao.current = versaoPublicada

        if (!aplicarAtualizacaoSeSegura() && !avisoExibido.current) {
          avisoExibido.current = true

          toast.info('Uma nova versão do MedTime está disponível.', {
            description: 'Para não perder o que está preenchendo, a atualização será aplicada quando esta tela estiver segura.',
            duration: Infinity,
            action: {
              label: 'Atualizar agora',
              onClick: atualizarAgora
            }
          })
        }
      } catch (erro) {
        console.warn('Não foi possível verificar a versão do MedTime:', erro)
      } finally {
        verificando = false
      }
    }

    void verificarVersao()

    const intervalo = window.setInterval(
      verificarVersao,
      INTERVALO_VERIFICACAO
    )

    window.addEventListener('focus', verificarVersao)
    document.addEventListener('visibilitychange', verificarVersao)

    return () => {
      ativo = false
      window.clearInterval(intervalo)
      window.removeEventListener('focus', verificarVersao)
      document.removeEventListener('visibilitychange', verificarVersao)
    }
  }, [telaAtual])
}
