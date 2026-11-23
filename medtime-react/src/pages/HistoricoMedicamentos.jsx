
import { useCallback, useEffect, useRef, useState } from 'react'
import { MotionConfig, motion } from 'motion/react'
import { ArrowLeft, History, CheckCircle2 } from 'lucide-react'
import { buscarHistoricoMedicamentos } from '../services/api.js'
import { useAutoRefresh } from '../hooks/useAutoRefresh.js'
import './HistoricoMedicamento.css'

function formatarDataHora(valor) {
    if (!valor) return 'Não informado'

    const data = new Date(valor)

    if (Number.isNaN(data.getTime())) {
        return 'Data inválida'
    }

    return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

function HistoricoMedicamentos({
    pacienteSelecionado,
    aoVoltar,
    token
}) {
    const [historico, setHistorico] = useState([])
    const [carregando, setCarregando] = useState(false)
    const [erro, setErro] = useState(null)
    const idPaciente =
        pacienteSelecionado?.id_paciente ??
        pacienteSelecionado?.id

    const historicoCarregadoRef = useRef(false)
    const requisicaoRef = useRef(0)

    const carregarHistorico = useCallback(async () => {
        if (!idPaciente || !token) return

        const requisicaoAtual = ++requisicaoRef.current
        const primeiraCarga = !historicoCarregadoRef.current

        if (primeiraCarga) {
            setCarregando(true)
            setErro(null)
        }

        try {
            const registros = await buscarHistoricoMedicamentos(
                idPaciente,
                token
            )

            if (requisicaoAtual !== requisicaoRef.current) return

            setHistorico(registros)
            setErro(null)
            historicoCarregadoRef.current = true
        } catch (erro) {
            if (requisicaoAtual !== requisicaoRef.current) return

            if (primeiraCarga) {
                setHistorico([])
                setErro(erro.message || 'Erro ao carregar histórico')
            } else {
                console.warn('Falha ao atualizar o histórico:', erro)
            }
        } finally {
            if (requisicaoAtual === requisicaoRef.current) {
                setCarregando(false)
            }
        }
    }, [idPaciente, token])

    useEffect(() => {
        historicoCarregadoRef.current = false
        requisicaoRef.current += 1

        return () => {
            requisicaoRef.current += 1
        }
    }, [idPaciente, token])

    useAutoRefresh(carregarHistorico, {
        enabled: Boolean(idPaciente && token),
        intervalMs: 60_000,
        minFocusIntervalMs: 10_000,
        refreshKey: idPaciente
    })


    const pacienteIdentificado = Boolean(idPaciente)

    const historicoOrdenado = [...historico].sort(
        (a, b) =>
            new Date(b.hora_ingestao) - new Date(a.hora_ingestao)
    )

    return (
        <MotionConfig reducedMotion="user">
        <motion.section className="historico-pagina" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
            <button
                type="button"
                className="historico-voltar"
                onClick={aoVoltar}
            >
                <ArrowLeft size={18} />
                Voltar ao Dashboard
            </button>

            <motion.header className="historico-cabecalho" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
                <History size={28} />
                <div>
                    <h1>Histórico de Medicamentos</h1>
                    <p>
                        Registros de tomadas de{' '}
                        {pacienteSelecionado?.nome}
                    </p>
                </div>
            </header>

            {!pacienteIdentificado ? (
                <p role="alert">Paciente não identificado.</p>
            ) : (
                <>
                    {carregando && <p>Carregando histórico...</p>}

                    {erro && (
                        <p role="alert" className="historico-erro">
                            Não foi possível carregar o histórico: {erro}
                        </p>
                    )}

                    {!carregando && !erro && historicoOrdenado.length === 0 && (
                        <div className="historico-vazio">
                            <History size={36} />
                            <h2>Nenhuma tomada registrada</h2>
                            <p>
                                As tomadas confirmadas aparecerão aqui.
                            </p>
                        </div>
                    )}

                    {!carregando && !erro && historicoOrdenado.map((registro) => (
                        <motion.article
                            className="historico-card"
                            key={registro.id_historico_medicamento}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.28 }}
                        >
                            <div className="historico-card-topo">
                                <div>
                                    <h2>{registro.nome_medicamento}</h2>
                                    <p>
                                        Dose ingerida: {Number(registro.dosagem_ingerida)}
                                        {' '}{registro.tipo_dosagem}
                                    </p>
                                    <p>
                                        Concentração: {Number(registro.concentracao)}
                                        {' '}{registro.unidade_concentracao}
                                    </p>
                                </div>
                                <CheckCircle2
                                    size={24}
                                    color="#007A40"
                                    aria-label="Tomada registrada"
                                />
                            </div>

                            <div className="historico-datas">
                                <div>
                                    <span>Tomada registrada em</span>
                                    <strong>
                                        {formatarDataHora(registro.hora_ingestao)}
                                    </strong>
                                </div>
                                <div>
                                    <span>Horário programado</span>
                                    <strong>
                                        {formatarDataHora(registro.horario_programado)}
                                    </strong>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </>
            )}
        </motion.section>
        </MotionConfig>
    )
}

export default HistoricoMedicamentos
