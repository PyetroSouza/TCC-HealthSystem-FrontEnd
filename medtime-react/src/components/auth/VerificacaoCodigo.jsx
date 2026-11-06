
import { useRef, useState } from 'react'
import { MailCheck, ArrowLeft } from 'lucide-react'
import './VerificacaoCodigo.css'

function VerificacaoCodigo({
    finalidade = 'cadastro',
    email,
    aoVoltar
}) {
    const [codigo, setCodigo] = useState(
        Array(6).fill('')
    )

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

            <p className="verificacao-codigo-aviso" role="status">
                A verificação por e-mail ainda não está
                disponível nesta versão do MedTime.
            </p>

            <div className="verificacao-codigo-acoes">
                <button
                    type="button"
                    className="verificacao-codigo-voltar"
                    onClick={aoVoltar}
                >
                    <ArrowLeft size={18} aria-hidden="true" />
                    Voltar
                </button>

                <button
                    type="button"
                    className="verificacao-codigo-confirmar"
                    disabled
                >
                    Verificar código
                </button>
            </div>
        </section>
    )
}

export default VerificacaoCodigo
