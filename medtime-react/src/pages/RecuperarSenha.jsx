
import { useState } from 'react'
import { motion, MotionConfig } from 'motion/react'
import { ArrowLeft, Mail } from 'lucide-react'
import { toast } from 'sonner'

import PainelAutenticacao from '../components/auth/PainelAutenticacao'
import { solicitarCodigoRecuperacao } from '../services/authService.js'

import './Login.css'
import './RecuperarSenha.css'

function RecuperarSenha({
  aoVoltarLogin,
  aoVisualizarVerificacao
}) {
  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function avancar(evento) {
    evento.preventDefault()

    const emailNormalizado = email.trim().toLowerCase()

    if (!emailNormalizado || enviando) return

    try {
      setEnviando(true)

      await solicitarCodigoRecuperacao(emailNormalizado)

      toast.success(
        'Se o e-mail estiver cadastrado, enviaremos um código.'
      )

      aoVisualizarVerificacao?.(emailNormalizado)

    } catch (erro) {
      toast.error(
        erro.message ||
        'Não foi possível solicitar a recuperação de senha.'
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <MotionConfig reducedMotion="user">
    <motion.main className="login-pagina" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="login-container">

        <PainelAutenticacao
          etiqueta="Segurança da sua conta"
          titulo="Seu cuidado continua aqui."
          descricao="Recupere o acesso à sua conta e continue acompanhando os medicamentos com tranquilidade."
        />

        <motion.section className="login-area-formulario" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}>
          <motion.div className="login-formulario-conteudo" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } } }}>

            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              className="recuperar-voltar"
              onClick={aoVoltarLogin}
              disabled={enviando}
            >
              <ArrowLeft size={18} aria-hidden="true" />
              Voltar para o login
            </motion.button>

            <motion.header className="login-cabecalho" variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.35 }}>
              <h2>Esqueceu sua senha?</h2>

              <p>
                Informe seu e-mail cadastrado
                para recuperar o acesso à sua conta.
              </p>
            </motion.header>

            <form
              className="login-formulario"
              onSubmit={avancar}
            >
              <div className="login-campo">
                <label htmlFor="email-recuperacao">
                  E-mail
                </label>

                <div className="login-input-container">
                  <Mail size={20} aria-hidden="true" />

                  <input
                    id="email-recuperacao"
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    autoComplete="email"
                    value={email}
                    onChange={(evento) =>
                      setEmail(evento.target.value)
                    }
                    disabled={enviando}
                    required
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                whileTap={{ scale: 0.985 }}
                className="login-botao-entrar"
                disabled={enviando}
              >
                {enviando
                  ? 'Enviando código...'
                  : 'Enviar código de recuperação'}
              </motion.button>

              <p className="login-aviso-desenvolvimento">
                Se o e-mail estiver cadastrado,
                você receberá um código válido
                por 10 minutos.
              </p>
            </form>

          </motion.div>
        </motion.section>

      </div>
    </motion.main>
    </MotionConfig>
  )
}

export default RecuperarSenha
