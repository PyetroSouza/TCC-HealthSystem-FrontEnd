import { useCallback, useEffect, useRef, useState } from 'react'
import { MotionConfig, motion } from 'motion/react'
import { buscarProximoMedicamento } from '../services/proximoMedicamentoService.js'
import { gerarIniciais } from '../utils/gerarIniciais.js'
import { gerarCorAvatar } from '../utils/gerarCorAvatar.js'
import { calcularIdade } from '../utils/calcularIdade.js'
import { useAutoRefresh } from '../hooks/useAutoRefresh.js'

function formatarProximoHorario(horarioProgramado) {
    if (!horarioProgramado) return ''

    const data = new Date(
        String(horarioProgramado).replace(' ', 'T')
    )

    if (Number.isNaN(data.getTime())) return ''

    const diaMes = data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
    })

    const hora = data.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    })

    return `${diaMes} às ${hora}`
}

function CardPaciente({ paciente, aoClicar, token }) {
    const corAvatar = gerarCorAvatar(paciente.nome)
    const idade = calcularIdade(paciente.data_nascimento)
    const fotoPaciente = paciente.foto
    const [fotoComErro, setFotoComErro] = useState(null)
    const [proximoMedicamento, setProximoMedicamento] = useState(null)
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState(false)

    const idPaciente = paciente.id_paciente ?? paciente.id
    const requisicaoRef = useRef(0)

    const carregarProximoMedicamento = useCallback(async ({ inicial = false } = {}) => {
        const requisicaoAtual = ++requisicaoRef.current

        if (inicial) {
            setCarregando(true)
            setErro(false)
            setProximoMedicamento(null)
        }

        try {
            const medicamento = await buscarProximoMedicamento(idPaciente, token)

            if (requisicaoAtual !== requisicaoRef.current) return

            setProximoMedicamento(medicamento)
            setErro(false)
        } catch (erro) {
            if (requisicaoAtual !== requisicaoRef.current) return

            console.error('Erro ao buscar próximo medicamento:', erro)
            setErro(true)
        } finally {
            if (requisicaoAtual === requisicaoRef.current) {
                setCarregando(false)
            }
        }
    }, [idPaciente, token])

    useEffect(() => {
        return () => {
            requisicaoRef.current += 1
        }
    }, [])

    useAutoRefresh(carregarProximoMedicamento, {
        enabled: Boolean(idPaciente && token),
        intervalMs: 5 * 60_000,
        minFocusIntervalMs: 30_000,
        refreshKey: idPaciente
    })

    return (
        <MotionConfig reducedMotion="user">
            <motion.article
                className="card_paciente"
                onClick={aoClicar}
                onKeyDown={(evento) => {
                    if (evento.target !== evento.currentTarget) return

                    if (evento.key === 'Enter' || evento.key === ' ') {
                        evento.preventDefault()
                        aoClicar?.()
                    }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Abrir dashboard de ${paciente.nome}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.24, ease: 'easeOut' }}
            >
                <div
                    className="avatar"
                    style={{
                        backgroundColor: corAvatar.fundo,
                        color: corAvatar.texto
                    }}
                >
                    {fotoPaciente && fotoComErro !== fotoPaciente ? (
                        <img
                            src={fotoPaciente}
                            alt={`Foto de ${paciente.nome}`}
                            referrerPolicy="no-referrer"
                            onError={() => setFotoComErro(fotoPaciente)}
                        />
                    ) : (
                        gerarIniciais(paciente.nome)
                    )}
                </div>

                <div className="info">
                    <h3 className="nome">{paciente.nome}</h3>

                    <p className="idade">
                        {idade !== null
                            ? `${idade} anos`
                            : 'Idade não informada'}
                    </p>

                    <ul className="tags">
                        {(paciente.condicoes ?? []).map((condicao) => (
                            <li key={condicao}>{condicao}</li>
                        ))}
                    </ul>
                </div>

                <p className="proximo_remedio">
                    <img src={import.meta.env.BASE_URL + 'assets/relogio.svg'} alt="" />
                    Próx. Med.: {
                        carregando
                            ? 'Carregando...'
                            : erro
                                ? 'Indisponível'
                                : proximoMedicamento
                                    ? `${proximoMedicamento.nome_medicamento} - ${formatarProximoHorario(proximoMedicamento.horario_programado)}`
                                    : 'Nenhuma dose nos próximos 7 dias'
                    }
                </p>
            </motion.article>
        </MotionConfig>
    )
}

export default CardPaciente
