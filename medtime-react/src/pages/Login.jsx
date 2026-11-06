
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, LockKeyhole, Eye, EyeOff, HeartPulse } from 'lucide-react'
import PainelAutenticacao from '../components/auth/PainelAutenticacao'
import { toast } from 'sonner'
import './Login.css'

const loginSchema = z.object({
  email: z.email('Informe um e-mail válido'),
  senha: z.string().min(1, 'Informe sua senha')
})

function Login({
  aoCadastrar,
  aoRecuperarSenha,
  aoEntrarDemo
}) {
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      senha: ''
    }
  })

  async function realizarLogin(dados) {
    // Integração com a API será adicionada posteriormente.
    // Não armazenamos credenciais nem simulamos uma sessão.
    toast.info('A autenticação estará disponível após a integração com a API.')
  }

  return (
    <main className="login-pagina">
      <div className="login-container">

 
          <PainelAutenticacao
            etiqueta="Cuidado e organização"
            titulo="Cuidar é estar presente."
            descricao="Organize medicamentos e acompanhe cada cuidado com mais tranquilidade."
          />

        <section className="login-area-formulario">
          <div className="login-formulario-conteudo">

            <div className="login-topo-mobile">
              <HeartPulse size={28} aria-hidden="true" />
              <strong>MedTime</strong>
            </div>

            <div className="login-cabecalho">
              <h2>Bem-vindo de volta!</h2>
              <p>Entre com seus dados para acessar sua conta.</p>
            </div>

            <form
              className="login-formulario"
              onSubmit={handleSubmit(realizarLogin)}
              noValidate
            >
              <div className="login-campo">
                <label htmlFor="login-email">
                  E-mail
                </label>

                <div className={`login-input-container ${errors.email ? 'login-input-erro' : ''}`}>
                  <Mail size={20} aria-hidden="true" />

                  <input
                    id="login-email"
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    autoComplete="username"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'erro-login-email' : undefined}
                    {...register('email')}
                  />
                </div>

                {errors.email && (
                  <p
                    id="erro-login-email"
                    className="login-mensagem-erro"
                    role="alert"
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="login-campo">
                <label htmlFor="login-senha">
                  Senha
                </label>

                <div className={`login-input-container ${errors.senha ? 'login-input-erro' : ''}`}>
                  <LockKeyhole size={20} aria-hidden="true" />

                  <input
                    id="login-senha"
                    type={mostrarSenha ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    autoComplete="current-password"
                    aria-invalid={!!errors.senha}
                    aria-describedby={errors.senha ? 'erro-login-senha' : undefined}
                    {...register('senha')}
                  />

                  <button
                    type="button"
                    className="login-mostrar-senha"
                    aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                    aria-pressed={mostrarSenha}
                    onClick={() => setMostrarSenha(valor => !valor)}
                  >
                    {mostrarSenha
                      ? <EyeOff size={20} aria-hidden="true" />
                      : <Eye size={20} aria-hidden="true" />}
                  </button>
                </div>

                {errors.senha && (
                  <p
                    id="erro-login-senha"
                    className="login-mensagem-erro"
                    role="alert"
                  >
                    {errors.senha.message}
                  </p>
                )}
              </div>

              <div className="login-opcoes">
                <button
                  type="button"
                  className="login-link"
                  onClick={aoRecuperarSenha}
                  disabled={!aoRecuperarSenha}
                  title={!aoRecuperarSenha ? 'Funcionalidade em desenvolvimento' : undefined}
                >
                  Esqueceu sua senha?
                </button>
              </div>

              <button
                className="login-botao-entrar"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Verificando...' : 'Entrar'}
              </button>

              {import.meta.env.DEV && (
                <button
                  type="button"
                  className="login-botao-demo"
                  onClick={aoEntrarDemo}
                >
                  Visualizar MedTime (demonstração)
                </button>
              )}
            </form>

            <div className="login-cadastro">
              <span>Ainda não possui uma conta?</span>

              <button
                type="button"
                className="login-link"
                onClick={aoCadastrar}
                disabled={!aoCadastrar}
                title={!aoCadastrar ? 'Cadastro em desenvolvimento' : undefined}
              >
                Cadastre-se
              </button>
            </div>

            <p className="login-aviso-desenvolvimento">
              Interface em desenvolvimento. A autenticação ainda não está habilitada.
            </p>

          </div>
        </section>
      </div>
    </main>
  )
}

export default Login
