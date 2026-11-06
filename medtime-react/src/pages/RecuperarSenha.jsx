
import { useState } from 'react'
import { ArrowLeft, Mail } from 'lucide-react'
import PainelAutenticacao from '../components/auth/PainelAutenticacao'
import './Login.css'
import './RecuperarSenha.css'

function RecuperarSenha({
    aoVoltarLogin,
    aoVisualizarVerificacao
}) {
    const [email, setEmail] = useState('')

    function avancar(evento) {
        evento.preventDefault()

        if (!email.trim()) return

        aoVisualizarVerificacao?.(email.trim())
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
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="login-botao-entrar"
                            >
                                Visualizar verificação
                            </button>

                            <p className="login-aviso-desenvolvimento">
                                Modo de demonstração:
                                nenhum código será enviado
                                por e-mail nesta etapa.
                            </p>
                        </form>

                    </div>
                </section>

            </div>
        </main>
    )
}

export default RecuperarSenha
