
import { useEffect, useState } from 'react'
import { ArrowLeft, Pill, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
    buscarTodasReceitasMedicas,
    excluirMedicamentoCompleto
} from '../services/api.js'
import './MedicamentosPaciente.css'
import './DashboardPaciente.css'

function MedicamentosPaciente({
    pacienteSelecionado,
    aoVoltar,
    aoEditar
}) {
    const [medicamentos, setMedicamentos] = useState([])
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState(null)
    const [expandidoId, setExpandidoId] = useState(null)
    const [excluindoId, setExcluindoId] = useState(null)
    const [medicamentoParaExcluir, setMedicamentoParaExcluir] = useState(null)

    const idPaciente =
        pacienteSelecionado?.id ?? pacienteSelecionado?.id_usuario

    useEffect(() => {
        let ativo = true

        async function carregarMedicamentos() {
            setCarregando(true)
            setErro(null)

            try {
                const receitas = await buscarTodasReceitasMedicas()

                if (!ativo) return

                setMedicamentos(
                    receitas.filter(receita =>
                        Number(receita.id_usuario) === Number(idPaciente)
                    )
                )
            } catch (erro) {
                if (!ativo) return

                setErro(erro.message)
            } finally {
                if (ativo) setCarregando(false)
            }
        }

        if (idPaciente != null) {
            carregarMedicamentos()
        } else {
            setCarregando(false)
            setErro('Paciente não identificado.')
        }

        return () => {
            ativo = false
        }
    }, [idPaciente])


    async function excluirMedicamento(medicamento) {
        if (excluindoId !== null) return false

        setExcluindoId(medicamento.id_receita_medica)

        try {
            await excluirMedicamentoCompleto(
                medicamento.id_receita_medica,
                idPaciente
            )

            setMedicamentos(anteriores =>
                anteriores.filter(item =>
                    Number(item.id_receita_medica) !==
                    Number(medicamento.id_receita_medica)
                )
            )

            setExpandidoId(null)
            toast.success('Medicamento excluído com sucesso!')
            return true

        } catch (erro) {
            toast.error('Não foi possível excluir o medicamento.', {
                description: erro.message
            })
            return false

        } finally {
            setExcluindoId(null)
        }
    }


    return (
        <section className="medicamentos-paciente">
            <button
                type="button"
                className="medicamentos-voltar"
                onClick={aoVoltar}
            >
                <ArrowLeft size={18} aria-hidden="true" />
                Voltar ao Dashboard
            </button>

            <header className="medicamentos-cabecalho">
                <h1>Medicamentos cadastrados</h1>
                <p>
                    Consulte e gerencie os medicamentos de{' '}
                    {pacienteSelecionado?.nome}
                </p>
            </header>

            {carregando ? (
                <p>Carregando medicamentos...</p>
            ) : erro ? (
                <p role="alert">{erro}</p>
            ) : medicamentos.length === 0 ? (
                <div className="medicamentos-vazio">
                    <Pill size={32} aria-hidden="true" />
                    <p>Nenhum medicamento cadastrado para este paciente.</p>
                </div>
            ) : (
                <div className="medicamentos-grid">
                    {medicamentos.map(medicamento => {
                        const id = medicamento.id_receita_medica
                        const expandido = expandidoId === id
                        const excluindo = excluindoId === id

                        return (
                            <article className="medicamento-item" key={id}>
                                <button
                                    type="button"
                                    className="medicamento-visualizar"
                                    aria-expanded={expandido}
                                    onClick={() =>
                                        setExpandidoId(expandido ? null : id)
                                    }
                                >
                                    <div className="medicamento-imagem">
                                        {medicamento.imagem ? (
                                            <img
                                                src={medicamento.imagem}
                                                alt={`Imagem de ${medicamento.nome_medicamento}`}
                                                loading="lazy"
                                            />
                                        ) : (
                                            <Pill size={34} aria-hidden="true" />
                                        )}
                                    </div>

                                    <div className="medicamento-resumo">
                                        <h2>{medicamento.nome_medicamento}</h2>
                                        <p>
                                            Dose: {Number(medicamento.dosagem)}{' '}
                                            {medicamento.sigla_dose}
                                        </p>
                                        <span>
                                            {expandido
                                                ? 'Ocultar informações'
                                                : 'Ver informações'}
                                        </span>
                                    </div>
                                </button>

                                {expandido && (
                                    <div className="medicamento-detalhes">
                                        <p>
                                            <strong>Apresentação:</strong>{' '}
                                            {medicamento.tipo_dosagem || 'Não informada'}
                                        </p>
                                        <p>
                                            <strong>Concentração:</strong>{' '}
                                            {medicamento.concentracao ?? 'Não informada'}
                                        </p>
                                        <p>
                                            <strong>Estoque:</strong>{' '}
                                            {medicamento.quantidade_em_estoque ?? 'Não informado'}{' '}
                                            {medicamento.sigla_embalagem}
                                        </p>
                                        <p>
                                            <strong>Observações:</strong>{' '}
                                            {medicamento.descricao || 'Nenhuma'}
                                        </p>
                                    </div>
                                )}

                                <div className="medicamento-acoes">
                                    <button
                                        type="button"
                                        onClick={() => aoEditar(medicamento)}
                                        disabled={excluindoId !== null}
                                    >
                                        <Pencil size={16} aria-hidden="true" />
                                        Editar
                                    </button>

                                    <button
                                        type="button"
                                        className="medicamento-excluir"
                                        onClick={() => setMedicamentoParaExcluir(medicamento)}
                                        disabled={excluindoId !== null}
                                    >
                                        <Trash2 size={16} aria-hidden="true" />
                                        {excluindo ? 'Excluindo...' : 'Excluir'}
                                    </button>
                                </div>
                            </article>
                        )
                    })}
                </div>
            )}

            {medicamentoParaExcluir && (
                <div className="modal-exclusao-overlay">
                    <div
                        className="modal-exclusao"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="titulo-exclusao"
                        aria-describedby="descricao-exclusao"
                    >
                        <h2 id="titulo-exclusao">
                            Excluir medicamento?
                        </h2>

                        <p id="descricao-exclusao">
                            Você está prestes a excluir{' '}
                            <strong>
                                {medicamentoParaExcluir.nome_medicamento}
                            </strong>
                            {' '}e suas programações.
                        </p>

                        <div className="modal-exclusao-acoes">
                            <button
                                type="button"
                                className="modal-botao-cancelar"
                                onClick={() => setMedicamentoParaExcluir(null)}
                                disabled={excluindoId !== null}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="modal-botao-excluir"
                                disabled={excluindoId !== null}
                                onClick={async () => {
                                    const sucesso = await excluirMedicamento(medicamentoParaExcluir)
                                
                                    if (sucesso) {
                                        setMedicamentoParaExcluir(null)
                                    }
                                }}
                            >
                                {excluindoId !== null
                                    ? 'Excluindo...'
                                    : 'Excluir medicamento'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </section>
    )
}

export default MedicamentosPaciente
