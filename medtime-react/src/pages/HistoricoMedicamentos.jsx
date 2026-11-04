
import { useEffect, useState } from 'react'
import { ArrowLeft, History, CheckCircle2 } from 'lucide-react'
import { buscarHistoricoMedicamentos } from '../services/api.js'
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

function HistoricoMedicamentos({ pacienteSelecionado, aoVoltar }) {
    const [historico, setHistorico] = useState([])
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState(null)

    useEffect(() => {
        let ativo = true

        async function carregarHistorico() {
            try {
                setCarregando(true)
                setErro(null)

                const registros = await buscarHistoricoMedicamentos(
                    pacienteSelecionado.id
                )

                if (ativo) {
                    setHistorico(registros)
                }
            } catch (erro) {
                if (ativo) setErro(erro.message)
            } finally {
                if (ativo) setCarregando(false)
            }
        }

        if (pacienteSelecionado?.id) {
            carregarHistorico()
        } else {
            setCarregando(false)
        }

        return () => {
            ativo = false
        }
    }, [pacienteSelecionado?.id])

    const historicoOrdenado = [...historico].sort(
        (a, b) =>
            new Date(b.hora_ingestao) - new Date(a.hora_ingestao)
    )

    return (
        <section className="historico-pagina">
            <button
                type="button"
                className="historico-voltar"
                onClick={aoVoltar}
            >
                <ArrowLeft size={18} />
                Voltar ao Dashboard
            </button>

            <header className="historico-cabecalho">
                <History size={28} />
                <div>
                    <h1>Histórico de Medicamentos</h1>
                    <p>
                        Registros de tomadas de{' '}
                        {pacienteSelecionado?.nome}
                    </p>
                </div>
            </header>

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
                <article
                    className="historico-card"
                    key={registro.id_historico_medicamento}
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
                </article>
            ))}
        </section>
    )
}

export default HistoricoMedicamentos
