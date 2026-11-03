
import { useState } from 'react'
import { CalendarDays, ArrowLeft, Pill } from 'lucide-react'
import { useAgendaMedicamentos } from '../hooks/useAgendaMedicamentos.js'
import './TodosMedicamentos.css'

function obterDataHoje() {
    const hoje = new Date()

    return [
        hoje.getFullYear(),
        String(hoje.getMonth() + 1).padStart(2, '0'),
        String(hoje.getDate()).padStart(2, '0')
    ].join('-')
}

function TodosMedicamentos({ pacienteSelecionado, aoVoltar }) {
    const [dataSelecionada, setDataSelecionada] = useState(obterDataHoje)

    const { agenda, carregandoAgenda, erroAgenda } = useAgendaMedicamentos(
        pacienteSelecionado?.id,
        dataSelecionada
    )

    const medicamentosOrdenados = [...agenda].sort((a, b) =>
        a.horario_programado.localeCompare(b.horario_programado)
    )

    return (
        <section className="todos-medicamentos">
            <button
                type="button"
                className="todos-voltar"
                onClick={aoVoltar}
            >
                <ArrowLeft size={18} />
                Voltar ao Dashboard
            </button>

            <div className="todos-cabecalho">
                <div>
                    <h1>Agenda de Medicamentos</h1>
                    <p>
                        Consulte os horários de {pacienteSelecionado?.nome}
                    </p>
                </div>

                <div className="todos-filtro">
                    <label htmlFor="data-agenda">
                        <CalendarDays size={18} />
                        Selecionar data
                    </label>

                    <input
                        id="data-agenda"
                        type="date"
                        value={dataSelecionada}
                        onChange={(evento) =>
                            setDataSelecionada(evento.target.value)
                        }
                    />
                </div>
            </div>

            <div className="todos-lista">
                {carregandoAgenda ? (
                    <p>Carregando agenda...</p>
                ) : erroAgenda ? (
                    <p role="alert">
                        Não foi possível carregar a agenda.
                    </p>
                ) : medicamentosOrdenados.length === 0 ? (
                    <div className="todos-vazio">
                        <Pill size={36} />
                        <h2>Nenhuma dose programada</h2>
                        <p>
                            Não há doses previstas para a data selecionada.
                            Tente consultar outro dia.
                        </p>
                    </div>
                ) : (
                    medicamentosOrdenados.map((medicamento) => (
                        <article
                            className="todos-card"
                            key={`${medicamento.id_programacao_medicamento}-${medicamento.horario_programado}`}
                        >
                            <div className="todos-medicamento-info">
                                <Pill size={24} />
                                <div>
                                    <h2>{medicamento.nome_medicamento}</h2>
                                    <p>Dose: {Number(medicamento.dosagem)}</p>
                                </div>
                            </div>

                            <div className="todos-horario">
                                <strong>
                                    {new Date(medicamento.horario_programado).toLocaleTimeString(
                                        'pt-BR',
                                        {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }
                                    )}
                                </strong>
                                <span>
                                    {medicamento.confirmado
                                        ? 'Confirmado'
                                        : 'Não confirmado'}
                                </span>
                            </div>
                        </article>
                    ))
                )}
            </div>
        </section>
    )
}

export default TodosMedicamentos
