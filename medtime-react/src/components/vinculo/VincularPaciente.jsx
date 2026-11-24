import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Copy, RefreshCw, UserPlus, X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'sonner'
import { gerarCodigoVinculo } from '../../services/vinculoService.js'
import './VincularPaciente.css'

function formatarTempo(segundos) {
  const minutos = String(Math.floor(segundos / 60)).padStart(2, '0')
  const resto = String(segundos % 60).padStart(2, '0')

  return `${minutos}:${resto}`
}

export default function VincularPaciente({ token, aoFechar }) {
  const [aberto, setAberto] = useState(false)
  const [dados, setDados] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)
  const [copiado, setCopiado] = useState(false)
  const [agora, setAgora] = useState(() => Date.now())

  const gatilhoRef = useRef(null)
  const dialogoRef = useRef(null)
  const geradoRef = useRef(false)

  const expiraEm = dados?.data_expiracao
    ? new Date(dados.data_expiracao).getTime()
    : Number.NaN

  const restante = Number.isNaN(expiraEm)
    ? null
    : Math.max(0, Math.ceil((expiraEm - agora) / 1000))

  const expirado = restante === 0

  const gerar = useCallback(async () => {
    if (!token) return

    setCarregando(true)
    setErro(null)
    setCopiado(false)

    try {
      const resultado = await gerarCodigoVinculo(token)

      if (!resultado?.codigo) {
        throw new Error('O servidor não retornou o código.')
      }

      setDados(resultado)
      setAgora(Date.now())
      geradoRef.current = true
    } catch (erroGerar) {
      setErro(erroGerar.message || 'Não foi possível gerar o código.')
    } finally {
      setCarregando(false)
    }
  }, [token])

  function abrir() {
    setAberto(true)

    const aindaValido =
      dados?.codigo &&
      new Date(dados.data_expiracao).getTime() > Date.now()

    setAgora(Date.now())

    if (!aindaValido) {
      gerar()
    }
  }

  const fechar = useCallback(() => {
    setAberto(false)
    gatilhoRef.current?.focus()

    // Avisa a tela para recarregar a lista de pacientes
    if (geradoRef.current) {
      geradoRef.current = false
      aoFechar?.()
    }
  }, [aoFechar])

  async function copiar() {
    if (!dados?.codigo) return

    try {
      await navigator.clipboard.writeText(dados.codigo)
      setCopiado(true)
      toast.success('Código copiado!')
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      toast.error('Não foi possível copiar o código.')
    }
  }

  // Contagem regressiva
  useEffect(() => {
    if (!aberto || !dados) return

    const intervalo = setInterval(() => setAgora(Date.now()), 1000)

    return () => clearInterval(intervalo)
  }, [aberto, dados])

  // Esc fecha, Tab fica preso no modal, trava a rolagem da página
  useEffect(() => {
    if (!aberto) return

    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogoRef.current?.focus()

    function aoTeclar(evento) {
      if (evento.key === 'Escape') {
        fechar()
        return
      }

      if (evento.key !== 'Tab' || !dialogoRef.current) return

      const focaveis = dialogoRef.current.querySelectorAll(
        'button:not([disabled])'
      )

      if (focaveis.length === 0) {
        evento.preventDefault()
        return
      }

      const primeiro = focaveis[0]
      const ultimo = focaveis[focaveis.length - 1]
      const ativo = document.activeElement

      if (evento.shiftKey && (ativo === primeiro || ativo === dialogoRef.current)) {
        evento.preventDefault()
        ultimo.focus()
      } else if (!evento.shiftKey && ativo === ultimo) {
        evento.preventDefault()
        primeiro.focus()
      }
    }

    document.addEventListener('keydown', aoTeclar)

    return () => {
      document.body.style.overflow = overflowAnterior
      document.removeEventListener('keydown', aoTeclar)
    }
  }, [aberto, fechar])

  const codigo = dados?.codigo ?? ''
  const urgente = restante !== null && restante > 0 && restante <= 60

  return (
    <>
      <button
        ref={gatilhoRef}
        type="button"
        className="botao-vincular-paciente"
        onClick={abrir}
        disabled={!token}
      >
        <UserPlus size={18} aria-hidden="true" />
        Vincular paciente
      </button>

      {createPortal(
        <AnimatePresence>
          {aberto && (
            <motion.div
              className="vp-fundo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onMouseDown={(evento) => {
                if (evento.target === evento.currentTarget) fechar()
              }}
            >
              <motion.div
                ref={dialogoRef}
                className="vp-modal"
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="vp-titulo"
                tabIndex={-1}
              >
                <button
                  type="button"
                  className="vp-fechar"
                  onClick={fechar}
                  aria-label="Fechar"
                >
                  <X size={20} aria-hidden="true" />
                </button>

                <h2 id="vp-titulo">Vincular paciente</h2>
                <p className="vp-subtitulo">
                  Compartilhe este código com a pessoa que você quer acompanhar.
                </p>

                {carregando && (
                  <p className="vp-status" role="status">Gerando código...</p>
                )}

                {!carregando && erro && (
                  <div className="vp-erro" role="alert">
                    <p>{erro}</p>
                    <button type="button" className="vp-botao-secundario" onClick={gerar}>
                      Tentar novamente
                    </button>
                  </div>
                )}

                {!carregando && !erro && codigo && (
                  <>
                    <div
                      className={`vp-qrcode-container ${expirado ? 'vp-qrcode-expirado' : ''}`}
                      aria-label="QR Code para vincular paciente"
                    >
                      <QRCodeSVG
                        value={codigo}
                        size={176}
                        bgColor="#FFFFFF"
                        fgColor="#20344A"
                        level="M"
                      />
                    </div>

                    <p className="vp-codigo-legenda">Ou informe o código manualmente:</p>

                    <div
                      className={`vp-codigo ${expirado ? 'vp-codigo-expirado' : ''}`}
                      role="group"
                      aria-label={`Código de vínculo: ${codigo.split('').join(' ')}`}
                    >
                      {codigo.split('').map((digito, indice) => (
                        <span key={indice} className="vp-digito" aria-hidden="true">
                          {digito}
                        </span>
                      ))}
                    </div>

                    {restante !== null && (
                      <p
                        className={`vp-validade ${urgente || expirado ? 'vp-validade-alerta' : ''}`}
                        role="timer"
                      >
                        {expirado
                          ? 'Código expirado. Gere um novo para continuar.'
                          : `Expira em ${formatarTempo(restante)}`}
                      </p>
                    )}

                    <div className="vp-acoes">
                      {expirado ? (
                        <button type="button" className="vp-botao-principal" onClick={gerar}>
                          <RefreshCw size={18} aria-hidden="true" />
                          Gerar novo código
                        </button>
                      ) : (
                        <>
                          <button type="button" className="vp-botao-principal" onClick={copiar}>
                            {copiado
                              ? <Check size={18} aria-hidden="true" />
                              : <Copy size={18} aria-hidden="true" />}
                            {copiado ? 'Copiado!' : 'Copiar código'}
                          </button>

                          <button type="button" className="vp-botao-secundario" onClick={gerar}>
                            <RefreshCw size={18} aria-hidden="true" />
                            Gerar outro
                          </button>
                        </>
                      )}
                    </div>

                    <ol className="vp-passos">
                      <li>O paciente abre o app MedTime e entra na conta dele.</li>
                      <li>Na opção “Vincular meu cuidador”, escaneia o QR Code ou digita o código acima.</li>
                      <li>Ao fechar esta janela, ele aparece em “Pacientes acompanhados”.</li>
                    </ol>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
