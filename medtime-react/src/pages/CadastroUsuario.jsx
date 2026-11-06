import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { cadastroUsuarioSchema } from '../schemas/cadastroUsuarioSchema'
import { cadastrarUsuarioAPI } from '../services/authService'
import VerificacaoCodigo from '../components/auth/VerificacaoCodigo'
import { montarPayloadUsuario } from '../utils/montarPlayloadUsuarios'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import './CadastroUsuario.css'

function CadastroUsuario({ perfil, aoVoltarLogin, aoIrParaLogin }) {
    const [etapaAtual, setEtapaAtual] = useState(1)
    const [mostrarSenha, setMostrarSenha] = useState(false)
    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false)

    const {
        register,
        handleSubmit,
        trigger,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(cadastroUsuarioSchema),
        mode: 'onBlur',
        shouldUnregister: false,
        defaultValues: {
            nome: '',
            cpf: '',
            data_nascimento: '',
            email: '',
            telefone: '',
            senha: '',
            confirmarSenha: '',
            cuidaDeSiMesmo: false,
            aceitouTermos: false
        }
    })

    async function proximaEtapa() {
        const camposValidos = await trigger([
            'nome',
            'cpf',
            'data_nascimento'
        ])

        if (camposValidos) {
            setEtapaAtual(2)
        }
    }

    async function validarDadosAcesso() {
        const camposValidos = await trigger([
            'email',
            'telefone',
            'senha',
            'confirmarSenha'
        ])

        if (camposValidos) {
            setEtapaAtual(3)
        }
    }

    async function validarDadosAcesso() {
        const camposValidos = await trigger()

        if (camposValidos) {
            setEtapaAtual(3)
        }
    }


    async function cadastrarUsuario(dados) {
        try {
            const payload = montarPayloadUsuario(dados)
    
            await cadastrarUsuarioAPI(payload)
    
            toast.success('Conta cadastrada com sucesso!')
    
            aoIrParaLogin()
    
        } catch (erro) {
            console.error('Erro no cadastro:', erro)
            toast.error(erro.message || 'Erro ao cadastrar usuário.')
        }
    }
    

    

    function voltarEtapa() {
        if (etapaAtual === 1) {
            aoVoltarLogin()
            return
        }

        setEtapaAtual((etapa) => etapa - 1)
    }
    return (
        <main className="cadastro-usuario-pagina">
            <div className="cadastro-usuario-container">

                <aside className="cadastro-usuario-apresentacao">
                    <div className="cadastro-usuario-marca">
                        <h2>
                            Cadastro de {perfil === 'cuidador' ? 'cuidador' : 'paciente'}
                        </h2>
                    </div>

                    <div className="cadastro-usuario-mensagem">
                        <h1>Seu cuidado começa aqui.</h1>
                        <p>
                            Crie sua conta para organizar medicamentos,
                            acompanhar horários e cuidar com mais
                            tranquilidade.
                        </p>
                    </div>

                    <p className="cadastro-usuario-rodape-painel">
                        Organização e cuidado em um só lugar.
                    </p>
                </aside>

                <section className="cadastro-usuario-area-formulario">
                    <div className="cadastro-usuario-conteudo">

                        <button
                            type="button"
                            className="cadastro-usuario-voltar"
                            onClick={aoVoltarLogin}
                        >
                            <ArrowLeft size={18} />
                            Voltar para escolher perfil
                        </button>

                        <header className="cadastro-usuario-cabecalho">
                            <h2>Crie sua conta</h2>
                            <p>
                                Preencha suas informações para começar.
                            </p>


                            <nav
                                className="cadastro-usuario-progresso"
                                aria-label="Progresso do cadastro"
                            >
                                {[
                                    { numero: 1, titulo: 'Dados pessoais' },
                                    { numero: 2, titulo: 'Dados de acesso' },
                                    { numero: 3, titulo: 'Verificação' }
                                ].map((etapa) => (
                                    <div
                                        key={etapa.numero}
                                        className={`cadastro-usuario-progresso-item ${etapa.numero === etapaAtual ? 'ativo' : ''
                                            }`}
                                        aria-current={
                                            etapa.numero === etapaAtual ? 'step' : undefined
                                        }
                                    >
                                        <span
                                            className={`cadastro-usuario-etapa ${etapa.numero < etapaAtual
                                                ? 'concluida'
                                                : etapa.numero === etapaAtual
                                                    ? 'ativa'
                                                    : ''
                                                }`}
                                        >
                                            {etapa.numero < etapaAtual ? '✓' : etapa.numero}
                                        </span>

                                        <span className="cadastro-usuario-etapa-titulo">
                                            {etapa.titulo}
                                        </span>
                                    </div>
                                ))}
                            </nav>

                        </header>

                        <form
                            className="cadastro-usuario-formulario"
                            onSubmit={handleSubmit(cadastrarUsuario)}
                            noValidate
                        >
                            {etapaAtual === 1 && (
                                <>
                                    <h3>Dados pessoais</h3>

                                    {/* Nome completo */}
                                    <div className="cadastro-usuario-campo">
                                        <label htmlFor="nome-completo">
                                            Nome completo
                                        </label>

                                        <input
                                            id="nome-completo"
                                            type="text"
                                            placeholder="Digite seu nome completo"
                                            autoComplete="name"
                                            maxLength={80}
                                            aria-invalid={!!errors.nome}
                                            aria-describedby={
                                                errors.nome ? 'erro-nome' : undefined
                                            }
                                            {...register('nome')}
                                        />

                                        {errors.nome && (
                                            <p
                                                id="erro-nome"
                                                className="cadastro-usuario-erro"
                                                role="alert"
                                            >
                                                {errors.nome.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* CPF */}
                                    <div className="cadastro-usuario-campo">
                                        <label htmlFor="cpf-cadastro">
                                            CPF (opcional)
                                        </label>

                                        <input
                                            id="cpf-cadastro"
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="Digite seu CPF"
                                            maxLength={20}
                                            aria-invalid={!!errors.cpf}
                                            aria-describedby={
                                                errors.cpf ? 'erro-cpf' : undefined
                                            }
                                            {...register('cpf')}
                                        />

                                        {errors.cpf && (
                                            <p
                                                id="erro-cpf"
                                                className="cadastro-usuario-erro"
                                                role="alert"
                                            >
                                                {errors.cpf.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Data de nascimento */}
                                    <div className="cadastro-usuario-campo">
                                        <label htmlFor="nascimento-cadastro">
                                            Data de nascimento
                                        </label>

                                        <input
                                            id="nascimento-cadastro"
                                            type="date"
                                            autoComplete="bday"
                                            aria-invalid={!!errors.data_nascimento}
                                            aria-describedby={
                                                errors.data_nascimento
                                                    ? 'erro-nascimento'
                                                    : undefined
                                            }
                                            {...register('data_nascimento')}
                                        />

                                        {errors.data_nascimento && (
                                            <p
                                                id="erro-nascimento"
                                                className="cadastro-usuario-erro"
                                                role="alert"
                                            >
                                                {errors.data_nascimento.message}
                                            </p>
                                        )}
                                    </div>

                                    {perfil === 'paciente' && (
                                        <label className="cadastro-usuario-checkbox">
                                            <input
                                                type="checkbox"
                                                {...register('cuidaDeSiMesmo')}
                                            />

                                            <span>
                                                Também sou responsável pelos meus cuidados
                                            </span>
                                        </label>
                                    )}

                                    <button
                                        type="button"
                                        className="cadastro-usuario-botao"
                                        onClick={proximaEtapa}
                                    >
                                        Próximo
                                    </button>
                                </>
                            )}



                            {etapaAtual === 2 && (
                                <>
                                    <h3>Dados de acesso</h3>

                                    {/* E-mail */}
                                    <div className="cadastro-usuario-campo">
                                        <label htmlFor="email-cadastro">
                                            E-mail
                                        </label>

                                        <input
                                            id="email-cadastro"
                                            type="email"
                                            placeholder="Digite seu e-mail"
                                            autoComplete="email"
                                            maxLength={255}
                                            aria-invalid={!!errors.email}
                                            aria-describedby={
                                                errors.email ? 'erro-email' : undefined
                                            }
                                            {...register('email')}
                                        />

                                        {errors.email && (
                                            <p
                                                id="erro-email"
                                                className="cadastro-usuario-erro"
                                                role="alert"
                                            >
                                                {errors.email.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Telefone */}
                                    <div className="cadastro-usuario-campo">
                                        <label htmlFor="telefone-cadastro">
                                            Número de telefone
                                        </label>

                                        <input
                                            id="telefone-cadastro"
                                            type="tel"
                                            placeholder="(11) 99999-9999"
                                            autoComplete="tel"
                                            inputMode="tel"
                                            maxLength={20}
                                            aria-invalid={!!errors.telefone}
                                            aria-describedby={
                                                errors.telefone ? 'erro-telefone' : undefined
                                            }
                                            {...register('telefone')}
                                        />

                                        {errors.telefone && (
                                            <p
                                                id="erro-telefone"
                                                className="cadastro-usuario-erro"
                                                role="alert"
                                            >
                                                {errors.telefone.message}
                                            </p>
                                        )}
                                    </div>


                                    <div className="cadastro-usuario-campo">
                                        <label htmlFor="senha-cadastro">
                                            Senha
                                        </label>

                                        <div className="cadastro-usuario-input-senha">
                                            <input
                                                id="senha-cadastro"
                                                type={mostrarSenha ? 'text' : 'password'}
                                                placeholder="Crie uma senha"
                                                autoComplete="new-password"
                                                maxLength={70}
                                                aria-invalid={!!errors.senha}
                                                aria-describedby={
                                                    errors.senha ? 'erro-senha' : undefined
                                                }
                                                {...register('senha')}
                                            />

                                            <button
                                                type="button"
                                                className="cadastro-usuario-mostrar-senha"
                                                onClick={() => setMostrarSenha(!mostrarSenha)}
                                                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                                                aria-pressed={mostrarSenha}
                                            >
                                                {mostrarSenha
                                                    ? <EyeOff size={20} aria-hidden="true" />
                                                    : <Eye size={20} aria-hidden="true" />
                                                }
                                            </button>
                                        </div>

                                        {errors.senha && (
                                            <p
                                                id="erro-senha"
                                                className="cadastro-usuario-erro"
                                                role="alert"
                                            >
                                                {errors.senha.message}
                                            </p>
                                        )}
                                    </div>


                                    {/* Confirmar senha */}

                                    <div className="cadastro-usuario-campo">
                                        <label htmlFor="confirmar-senha">
                                            Confirmar senha
                                        </label>

                                        <div className="cadastro-usuario-input-senha">
                                            <input
                                                id="confirmar-senha"
                                                type={mostrarConfirmacao ? 'text' : 'password'}
                                                placeholder="Digite sua senha novamente"
                                                autoComplete="new-password"
                                                maxLength={70}
                                                aria-invalid={!!errors.confirmarSenha}
                                                aria-describedby={
                                                    errors.confirmarSenha
                                                        ? 'erro-confirmar-senha'
                                                        : undefined
                                                }
                                                {...register('confirmarSenha')}
                                            />

                                            <button
                                                type="button"
                                                className="cadastro-usuario-mostrar-senha"
                                                onClick={() => setMostrarConfirmacao(!mostrarConfirmacao)}
                                                aria-label={
                                                    mostrarConfirmacao
                                                        ? 'Ocultar confirmação de senha'
                                                        : 'Mostrar confirmação de senha'
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
                                                id="erro-confirmar-senha"
                                                className="cadastro-usuario-erro"
                                                role="alert"
                                            >
                                                {errors.confirmarSenha.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="cadastro-usuario-termos">
                                        <label className="cadastro-usuario-termos-label">
                                            <input
                                                type="checkbox"
                                                {...register('aceitouTermos')}
                                            />

                                            <span>
                                                Li e concordo com os Termos de Uso
                                                e declaro ter lido a Política de Privacidade
                                                do MedTime.
                                            </span>
                                        </label>
                                    </div>

                                    <div className="cadastro-usuario-acoes">
                                        <button
                                            type="button"
                                            className="cadastro-usuario-botao-voltar"
                                            onClick={() => setEtapaAtual(1)}
                                        >
                                            Voltar
                                        </button>

                                        <button
                                            type="submit"
                                            className="cadastro-usuario-botao"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Cadastrando...' : 'Criar conta'}
                                        </button>
                                    </div>
                                </>
                            )}


                            {etapaAtual === 3 && (
                                <VerificacaoCodigo
                                    finalidade="cadastro"
                                    aoVoltar={() => setEtapaAtual(2)}
                                />
                            )}
                        </form>



                        <footer className="cadastro-usuario-rodape">
                            <span>Já possui uma conta?</span>
                            <button type="button" onClick={aoIrParaLogin}>
                                Entrar
                            </button>
                        </footer>

                    </div>
                </section>

            </div>
        </main>
    )
}

export default CadastroUsuario