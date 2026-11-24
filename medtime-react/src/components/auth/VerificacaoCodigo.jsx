import { useRef, useState } from 'react'
import { MailCheck, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'motion/react'

import {
    cadastrarUsuarioAPI,
    solicitarCodigoVerificacao,
    solicitarCodigoRecuperacao,
    redefinirSenhaAPI
} from '../../services/authService.js'

import './VerificacaoCodigo.css'

function VerificacaoCodigo({
    finalidade = 'cadastro',
    email,
    dadosCadastro,
    aoVoltar,
    aoConcluir
}) {
    const [codigo, setCodigo] = useState(Array(6).fill(''))
    const [novaSenha, setNovaSenha] = useState('')
    const [confirmarSenha, setConfirmarSenha] = useState('')
    const [mostrarSenha, setMostrarSenha] = useState(false)
    const [etapaRecuperacao, setEtapaRecuperacao] = useState('codigo')
    const [carregando, setCarregando] = useState(false)
    const [reenviando, setReenviando] = useState(false)

    const inputsRef = useRef([])
    const recuperacao = finalidade === 'recuperacao'
    const mostrandoCodigo = !recuperacao || etapaRecuperacao === 'codigo'
    const codigoCompleto = codigo.join('')

    const titulo = recuperacao && !mostrandoCodigo
        ? 'Crie uma nova senha'
        : 'Confirme seu e-mail'

    function atualizarCodigo(indice, valor) {
        const digito = valor.replace(/\D/g, '').slice(-1)

        setCodigo((anterior) => {
            const atualizado = [...anterior]
            atualizado[indice] = digito
            return atualizado
        })

        if (digito && indice < 5) {
            inputsRef.current[indice + 1]?.focus()
        }
    }

    function controlarTecla(evento, indice) {
        if (evento.key === 'Backspace' && !codigo[indice] && indice > 0) {
            inputsRef.current[indice - 1]?.focus()
        }

        if (evento.key === 'ArrowLeft' && indice > 0) {
            evento.preventDefault()
            inputsRef.current[indice - 1]?.focus()
        }

        if (evento.key === 'ArrowRight' && indice < 5) {
            evento.preventDefault()
            inputsRef.current[indice + 1]?.focus()
        }
    }

    function colarCodigo(evento) {
        evento.preventDefault()

        const texto = evento.clipboardData
            .getData('text')
            .replace(/\D/g, '')
            .slice(0, 6)

        if (!texto) return

        setCodigo(
            Array.from({ length: 6 }, (_, indice) => texto[indice] || '')
        )
        inputsRef.current[Math.min(texto.length, 5)]?.focus()
    }

    function avancarParaNovaSenha() {
        if (!/^\d{6}$/.test(codigoCompleto)) {
            toast.warning('Informe os seis dígitos do código.')
            return
        }

        // A API atual valida o código somente junto da nova senha.
        // Avançar aqui NÃO significa que ele foi aprovado pelo servidor.
        setEtapaRecuperacao('senha')
    }

    async function confirmarCodigo() {
        if (carregando) return

        if (!/^\d{6}$/.test(codigoCompleto)) {
            toast.warning('Informe os seis dígitos do código.')
            return
        }

        if (recuperacao) {
            if (!email) {
                toast.error('E-mail de recuperação não informado.')
                return
            }

            if (novaSenha.length < 8) {
                toast.warning('A nova senha deve ter pelo menos 8 caracteres.')
                return
            }

            if (new TextEncoder().encode(novaSenha).length > 72) {
                toast.warning('A nova senha excede o limite de 72 bytes.')
                return
            }

            if (novaSenha !== confirmarSenha) {
                toast.warning('As duas senhas não coincidem.')
                return
            }
        } else if (!dadosCadastro) {
            toast.error('Os dados do cadastro não foram encontrados.')
            return
        }

        try {
            setCarregando(true)

            if (recuperacao) {
                await redefinirSenhaAPI({
                    email,
                    codigo: codigoCompleto,
                    novaSenha
                })

                toast.success('Senha redefinida! Entre com sua nova senha.')
            } else {
                await cadastrarUsuarioAPI({
                    ...dadosCadastro,
                    codigo: codigoCompleto
                })

                toast.success('Conta criada com sucesso!')
            }

            aoConcluir?.()
        } catch (erro) {
            toast.error(erro.message || 'Não foi possível confirmar a operação.')
        } finally {
            setCarregando(false)
        }
    }

    async function reenviarCodigo() {
        if (!email || reenviando || carregando) return

        try {
            setReenviando(true)

            if (recuperacao) {
                await solicitarCodigoRecuperacao(email)
            } else {
                await solicitarCodigoVerificacao(email)
            }

            setCodigo(Array(6).fill(''))
            inputsRef.current[0]?.focus()
            toast.success('Novo código solicitado! Confira seu e-mail.')
        } catch (erro) {
            toast.error(erro.message || 'Não foi possível reenviar o código.')
        } finally {
            setReenviando(false)
        }
    }

    function voltar() {
        if (recuperacao && !mostrandoCodigo) {
            setEtapaRecuperacao('codigo')
        } else {
            aoVoltar?.()
        }
    }

    return (
        <motion.section className="verificacao-codigo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.24 }}>
            <div className="verificacao-codigo-icone">
                <MailCheck size={34} aria-hidden="true" />
            </div>

            <h3>{titulo}</h3>

            <p>
                {mostrandoCodigo
                    ? 'Informe o código de seis dígitos enviado para seu e-mail.'
                    : 'Escolha uma nova senha. O código será validado ao confirmar a alteração.'}
            </p>

            {email && (
                <p className="verificacao-codigo-email">
                    E-mail informado: <strong>{email}</strong>
                </p>
            )}

            {mostrandoCodigo && (
                <div
                    className="verificacao-codigo-campos"
                    role="group"
                    aria-label="Código de verificação de seis dígitos"
                >
                    {codigo.map((digito, indice) => (
                        <input
                            key={indice}
                            ref={(elemento) => {
                                inputsRef.current[indice] = elemento
                            }}
                            type="text"
                            inputMode="numeric"
                            autoComplete={indice === 0 ? 'one-time-code' : 'off'}
                            maxLength={1}
                            value={digito}
                            disabled={carregando || reenviando}
                            onChange={(evento) =>
                                atualizarCodigo(indice, evento.target.value)
                            }
                            onKeyDown={(evento) => controlarTecla(evento, indice)}
                            onPaste={colarCodigo}
                            aria-label={`Dígito ${indice + 1} de 6`}
                        />
                    ))}
                </div>
            )}

            {recuperacao && !mostrandoCodigo && (
                <div className="verificacao-codigo-senhas">
                    <label htmlFor="nova-senha">Nova senha</label>

                    <div className="verificacao-codigo-senha-campo">
                        <input
                            id="nova-senha"
                            type={mostrarSenha ? 'text' : 'password'}
                            autoComplete="new-password"
                            placeholder="Mínimo de 8 caracteres"
                            value={novaSenha}
                            disabled={carregando}
                            onChange={(evento) => setNovaSenha(evento.target.value)}
                        />

                        <button
                            type="button"
                            onClick={() => setMostrarSenha((anterior) => !anterior)}
                            aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                            disabled={carregando}
                        >
                            {mostrarSenha ? <EyeOff size={19} /> : <Eye size={19} />}
                        </button>
                    </div>

                    <label htmlFor="confirmar-nova-senha">Confirmar nova senha</label>

                    <input
                        id="confirmar-nova-senha"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Repita sua nova senha"
                        value={confirmarSenha}
                        disabled={carregando}
                        onChange={(evento) => setConfirmarSenha(evento.target.value)}
                    />

                    <p className="verificacao-codigo-aviso" role="status">
                        Use pelo menos 8 caracteres e repita a mesma senha.
                    </p>
                </div>
            )}

            {mostrandoCodigo && (
                <p className="verificacao-codigo-aviso">
                    O código é válido por 10 minutos.
                </p>
            )}

            <div className="verificacao-codigo-acoes">
                <button
                    type="button"
                    className="verificacao-codigo-voltar"
                    onClick={voltar}
                    disabled={carregando || reenviando}
                >
                    <ArrowLeft size={18} aria-hidden="true" />
                    Voltar
                </button>

                {recuperacao && mostrandoCodigo ? (
                    <button
                        type="button"
                        className="verificacao-codigo-confirmar"
                        onClick={avancarParaNovaSenha}
                        disabled={carregando || reenviando}
                    >
                        Continuar
                    </button>
                ) : (
                    <button
                        type="button"
                        className="verificacao-codigo-confirmar"
                        onClick={confirmarCodigo}
                        disabled={carregando || reenviando}
                    >
                        {carregando
                            ? 'Processando...'
                            : recuperacao
                                ? 'Redefinir senha'
                                : 'Verificar código'}
                    </button>
                )}
            </div>

            {mostrandoCodigo && (
                <button
                    type="button"
                    className="verificacao-codigo-reenviar"
                    onClick={reenviarCodigo}
                    disabled={reenviando || carregando}
                >
                    {reenviando ? 'Enviando...' : 'Reenviar código'}
                </button>
            )}
        </motion.section>
    )
}

export default VerificacaoCodigo
