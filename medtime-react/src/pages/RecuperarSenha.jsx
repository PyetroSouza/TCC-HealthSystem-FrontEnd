
import { useState } from 'react'
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
    <main className="login-pagina">
      <div className="login-container">

        <PainelAutenticacao
          etiqueta="Segurança da sua conta"
          titulo="Seu cuidado continua aqui."
          descricao="Recupere o acesso à sua conta e continue acompanhando os medicamentos com tranquilidade."
        />

        <section className="login-area-formulario">
          <div className="login-formulario-conteudo">

            <button
              type="button"
              className="recuperar-voltar"
              onClick={aoVoltarLogin}
              disabled={enviando}
            >
              <ArrowLeft size={18} aria-hidden="true" />
              Voltar para o login
            </button>

            <header className="login-cabecalho">
              <h2>Esqueceu sua senha?</h2>

              <p>
                Informe seu e-mail cadastrado
                para recuperar o acesso à sua conta.
              </p>
            </header>

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

              <button
                type="submit"
                className="login-botao-entrar"
                disabled={enviando}
              >
                {enviando
                  ? 'Enviando código...'
                  : 'Enviar código de recuperação'}
              </button>

              <p className="login-aviso-desenvolvimento">
                Se o e-mail estiver cadastrado,
                você receberá um código válido
                por 10 minutos.
              </p>
            </form>

          </div>
        </section>

      </div>
    </main>
  )
}

export default RecuperarSenha
