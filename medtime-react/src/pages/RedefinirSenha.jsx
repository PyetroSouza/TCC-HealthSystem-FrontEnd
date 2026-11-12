
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import PainelAutenticacao from '../components/auth/PainelAutenticacao'

import { redefinirSenhaSchema } from '../schemas/redefinirSenhaSchema'

import './Login.css'
import './RedefinirSenha.css'

function RedefinirSenha({ aoVoltarLogin }) {
    const [mostrarSenha, setMostrarSenha] = useState(false)
    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(redefinirSenhaSchema),
        mode: 'onBlur',
        defaultValues: {
            novaSenha: '',
            confirmarSenha: ''
        }
    })

    function validarFormulario() {
        toast.info(
            'Os dados estão válidos, mas a redefinição de senha ainda depende da API.'
        )
    }

    return (
        <main className="login-pagina">
            <div className="login-container">

                <aside className="login-apresentacao">
                    <PainelAutenticacao
                        etiqueta="Segurança da sua conta"
                        titulo="Um novo começo, com segurança."
                        descricao="Proteja sua conta e continue acompanhando seus cuidados com tranquilidade."
                    />
                </aside>

                <section className="login-area-formulario">
                    <div className="login-formulario-conteudo">

                        <button
                            type="button"
                            className="redefinir-voltar"
                            onClick={aoVoltarLogin}
                        >
                            <ArrowLeft size={18} aria-hidden="true" />
                            Voltar para o login
                        </button>

                        <header className="login-cabecalho">
                            <h2>Redefinir senha</h2>
                            <p>
                                Crie uma nova senha para sua conta.
                            </p>
                        </header>

                        <form
                            className="login-formulario"
                            onSubmit={handleSubmit(validarFormulario)}
                            noValidate
                        >
                            <div className="login-campo">
                                <label htmlFor="nova-senha">
                                    Nova senha
                                </label>

                                <div className={`login-input-container ${errors.novaSenha ? 'login-input-erro' : ''
                                    }`}>
                                    <LockKeyhole size={20} aria-hidden="true" />

                                    <input
                                        id="nova-senha"
                                        type={mostrarSenha ? 'text' : 'password'}
                                        placeholder="Digite sua nova senha"
                                        autoComplete="new-password"
                                        maxLength={70}
                                        aria-invalid={!!errors.novaSenha}
                                        aria-describedby={
                                            errors.novaSenha ? 'erro-nova-senha' : undefined
                                        }
                                        {...register('novaSenha')}
                                    />

                                    <button
                                        type="button"
                                        className="login-mostrar-senha"
                                        onClick={() => setMostrarSenha(v => !v)}
                                        aria-label={
                                            mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'
                                        }
                                        aria-pressed={mostrarSenha}
                                    >
                                        {mostrarSenha
                                            ? <EyeOff size={20} aria-hidden="true" />
                                            : <Eye size={20} aria-hidden="true" />
                                        }
                                    </button>
                                </div>

                                {errors.novaSenha && (
                                    <p
                                        id="erro-nova-senha"
                                        className="login-mensagem-erro"
                                        role="alert"
                                    >
                                        {errors.novaSenha.message}
                                    </p>
                                )}
                            </div>

                            <div className="login-campo">
                                <label htmlFor="confirmar-nova-senha">
                                    Confirmar nova senha
                                </label>

                                <div className={`login-input-container ${errors.confirmarSenha ? 'login-input-erro' : ''
                                    }`}>
                                    <LockKeyhole size={20} aria-hidden="true" />

                                    <input
                                        id="confirmar-nova-senha"
                                        type={mostrarConfirmacao ? 'text' : 'password'}
                                        placeholder="Digite novamente sua senha"
                                        autoComplete="new-password"
                                        maxLength={70}
                                        aria-invalid={!!errors.confirmarSenha}
                                        aria-describedby={
                                            errors.confirmarSenha
                                                ? 'erro-confirmar-nova-senha'
                                                : undefined
                                        }
                                        {...register('confirmarSenha')}
                                    />

                                    <button
                                        type="button"
                                        className="login-mostrar-senha"
                                        onClick={() => setMostrarConfirmacao(v => !v)}
                                        aria-label={
                                            mostrarConfirmacao
                                                ? 'Ocultar confirmação'
                                                : 'Mostrar confirmação'
                                        }
                                        aria-pressed={mostrarConfirmacao}
                                    >
                                        {mostrarConfirmacao
                                            ? <EyeOff size={20} aria-hidden="true" />
                                            : <Eye size={20} aria-hidden="true" />
                                        }
                                    </button>
                                </div>

                                {errors.confirmarSenha && (
                                    <p
                                        id="erro-confirmar-nova-senha"
                                        className="login-mensagem-erro"
                                        role="alert"
                                    >
                                        {errors.confirmarSenha.message}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="login-botao-entrar"
                            >
                                Validar nova senha
                            </button>

                            <p className="login-aviso-desenvolvimento">
                                A redefinição real será habilitada após
                                a integração com a API.
                            </p>
                        </form>

                    </div>
                </section>

            </div>
        </main>
    )
}

export default RedefinirSenha
