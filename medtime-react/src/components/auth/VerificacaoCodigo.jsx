
import { MailCheck } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import {
    cadastrarUsuarioAPI,
    solicitarCodigoVerificacao
} from '../../services/authService.js'
import './VerificacaoCodigo.css'

function VerificacaoCodigo({
    finalidade = 'cadastro',
    email,
    dadosCadastro,
    aoConcluir
}) {
    const [codigo, setCodigo] = useState(
        Array(6).fill('')
    )
    const [carregando, setCarregando] = useState(false)
    const [reenviando, setReenviando] = useState(false)

    const inputsRef = useRef([])

    const titulo = finalidade === 'cadastro'
        ? 'Confirme seu e-mail'
        : 'Recupere sua conta'

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

        const novosDigitos = Array.from(
            { length: 6 },
            (_, indice) => texto[indice] || ''
        )

        setCodigo(novosDigitos)
        inputsRef.current[Math.min(texto.length, 5)]?.focus()
    }

    async function confirmarCodigo() {
        const codigoCompleto = codigo.join('')

        if (!/^\d{6}$/.test(codigoCompleto)) {
            toast.warning('Digite os seis dígitos do código.')
            return
        }

        if (finalidade !== 'cadastro') return

        try {
            setCarregando(true)

            await cadastrarUsuarioAPI({
                ...dadosCadastro,
                codigo: codigoCompleto
            })

            toast.success('Conta criada com sucesso!')
            aoConcluir()
        } catch (erro) {
            toast.error(erro.message || 'Código inválido ou expirado.')
        } finally {
            setCarregando(false)
        }
    }

    async function reenviarCodigo() {
        if (!email || reenviando) return

        try {
            setReenviando(true)

            await solicitarCodigoVerificacao(email)

            setCodigo(Array(6).fill(''))
            toast.success('Novo código enviado!')
            inputsRef.current[0]?.focus()
        } catch (erro) {
            toast.error(erro.message || 'Erro ao reenviar código.')
        } finally {
            setReenviando(false)
        }
    }



    return (
        <section className="verificacao-codigo">
            <div className="verificacao-codigo-icone">
                <MailCheck size={34} aria-hidden="true" />
            </div>

            <h3>{titulo}</h3>

            <p>
                Para continuar, será necessário confirmar
                sua identidade com um código de seis dígitos.
            </p>

            {email && (
                <p className="verificacao-codigo-email">
                    E-mail informado: <strong>{email}</strong>
                </p>
            )}

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
                        maxLength={6}
                        value={digito}
                        onChange={(evento) =>
                            atualizarCodigo(indice, evento.target.value)
                        }
                        onKeyDown={(evento) =>
                            controlarTecla(evento, indice)
                        }
                        onPaste={colarCodigo}
                        aria-label={`Dígito ${indice + 1} de 6`}
                    />
                ))}
            </div>
            <div className="verificacao-codigo-acoes">
                {finalidade === 'cadastro' && (
                    <button
                        type="button"
                        onClick={reenviarCodigo}
                        disabled={reenviando || carregando}
                    >
                        {reenviando ? 'Enviando...' : 'Reenviar código'}
                    </button>
                )}
                <button
                    type="button"
                    className="verificacao-codigo-confirmar"
                    onClick={confirmarCodigo}
                    disabled={
                        carregando ||
                        codigo.join('').length !== 6 ||
                        finalidade !== 'cadastro'
                    }
                >
                    {carregando ? 'Verificando...' : 'Verificar código'}
                </button>
            </div>
        </section>
    )
}

export default VerificacaoCodigo
