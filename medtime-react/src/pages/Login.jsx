
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, MotionConfig } from 'motion/react'
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import PainelAutenticacao from '../components/auth/PainelAutenticacao'
import LogoMedTime from '../components/LogoMedTime'
import { GoogleLogin } from '@react-oauth/google'
import { entrarComGoogleAPI } from '../services/authService'
import { entrarUsuarioAPI } from '../services/authService'
import './Login.css'

const loginSchema = z.object({
  email: z.email('Informe um e-mail válido'),
  senha: z.string().min(1, 'Informe sua senha')
})

function Login({
  aoCadastrar,
  aoRecuperarSenha,
  aoEntrar,
  aoCadastrarGoogle
}) {
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const areaGoogleRef = useRef(null)
  const [larguraGoogle, setLarguraGoogle] = useState(320)

  // O botão do Google só aceita largura em px: mede o espaço disponível
  useEffect(() => {
    const elemento = areaGoogleRef.current
    if (!elemento) return

    const medir = () => {
      const largura = Math.floor(elemento.clientWidth)
      setLarguraGoogle(Math.min(400, Math.max(200, largura)))
    }

    medir()

    const observador = new ResizeObserver(medir)
    observador.observe(elemento)

    return () => observador.disconnect()
  }, [])

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
    try {
      const usuario = await entrarUsuarioAPI(dados)

      toast.success('Login realizado com sucesso!')

      aoEntrar(usuario)
    } catch (erro) {
      toast.error(erro.message || 'Erro ao realizar login.')
    }
  }

  async function realizarLoginGoogle(respostaGoogle) {
    try {
      if (!respostaGoogle.credential) {
        throw new Error('O Google não retornou uma credencial.')
      }

      const resultado = await entrarComGoogleAPI(
        respostaGoogle.credential
      )

      if (resultado.cadastroNecessario) {
        aoCadastrarGoogle?.({
          ...resultado.dadosGoogle,
          token: respostaGoogle.credential
        })

        toast.info('Complete seu cadastro para continuar.')
        return
      }

      aoEntrar(resultado.usuario)

      toast.success('Login com Google realizado!')
    } catch (erro) {
      toast.error(
        erro.message || 'Erro ao entrar com Google.'
      )
    }
  }


  return (
    <MotionConfig reducedMotion="user">
    <motion.main className="login-pagina" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="login-container">


        <PainelAutenticacao
          etiqueta="Cuidado e organização"
          titulo="Cuidar é estar presente."
          descricao="Organize medicamentos e acompanhe cada cuidado com mais tranquilidade."
        />

        <motion.section className="login-area-formulario" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}>
          <motion.div className="login-formulario-conteudo" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } } }}>

            <div className="login-topo-mobile">
              <LogoMedTime largura={150} />
            </div>

            <motion.div className="login-cabecalho" variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.35 }}>
              <h2>Bem-vindo de volta!</h2>
              <p>Entre com seus dados para acessar sua conta.</p>
            </motion.div>

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

              <motion.button
                whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.15 }}
                className="login-botao-entrar"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Verificando...' : 'Entrar'}
              </motion.button>
            </form>


            <div className="login-google">
              <div className="login-divisor">
                <span>ou</span>
              </div>

              <div ref={areaGoogleRef} className="login-google-botao">
                <GoogleLogin
                  onSuccess={realizarLoginGoogle}
                  onError={() => {
                    toast.error('Não foi possível autenticar com Google.')
                  }}
                  theme="outline"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                  logo_alignment="center"
                  locale="pt-BR"
                  width={larguraGoogle}
                />
              </div>
            </div>


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

          </motion.div>
        </motion.section>
      </div>
    </motion.main>
    </MotionConfig>
  )
}

export default Login
