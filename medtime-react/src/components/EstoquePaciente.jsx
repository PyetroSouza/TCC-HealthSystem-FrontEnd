
import { Check, Pencil, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
    atualizarEstoqueAPI,
    buscarReceitaMedica
} from '../services/api.js'
import './EstoquePaciente.css'

function EstoquePaciente({ agenda = [], idUsuario }) {
    const [estoques, setEstoques] = useState([])
    const [carregando, setCarregando] = useState(false)
    const [erro, setErro] = useState(null)

    const [editandoId, setEditandoId] = useState(null)
    const [novaQuantidade, setNovaQuantidade] = useState('')
    const [salvando, setSalvando] = useState(false)

    const chaveReceitas = useMemo(() => {
        const ids = [...new Set(
            agenda
                .map(item => item.id_receita_medica)
                .filter(id => id != null)
        )]

        return ids.join(',')
    }, [agenda])

    const chaveConfirmacoes = useMemo(() => {
        return agenda
            .map(item => [
                item.id_receita_medica,
                item.horario_programado,
                item.confirmado,
                item.id_historico_medicamento
            ].join(':'))
            .sort()
            .join('|')
    }, [agenda])

    useEffect(() => {
        let ativo = true

        async function carregarEstoques() {
            setEstoques([])
            setErro(null)
            setEditandoId(null)

            if (!idUsuario || !chaveReceitas) {
                setCarregando(false)
                return
            }

            setCarregando(true)

            try {
                const resultados = await Promise.allSettled(
                    chaveReceitas.split(',').map(id =>
                        buscarReceitaMedica(id)
                    )
                )

                if (!ativo) return

                const encontrados = resultados
                    .filter(resultado =>
                        resultado.status === 'fulfilled' &&
                        resultado.value != null
                    )
                    .map(resultado => resultado.value)

                setEstoques(encontrados)

                if (resultados.some(r => r.status === 'rejected')) {
                    setErro('Alguns estoques não puderam ser consultados.')
                }
            } catch {
                if (ativo) {
                    setErro('Não foi possível consultar os estoques.')
                }
            } finally {
                if (ativo) setCarregando(false)
            }
        }

        carregarEstoques()

        return () => {
            ativo = false
        }
    }, [idUsuario, chaveReceitas, chaveConfirmacoes])

    function iniciarEdicao(item) {
        if (salvando || item.id_estoque == null) return

        setEditandoId(item.id_estoque)
        setNovaQuantidade(
            String(item.quantidade_em_estoque ?? '')
        )
    }

    function cancelarEdicao() {
        if (salvando) return

        setEditandoId(null)
        setNovaQuantidade('')
    }



    async function salvarEstoque(item) {
        if (salvando) return

        const quantidade = Number(novaQuantidade)

        if (
            novaQuantidade.trim() === '' ||
            !Number.isFinite(quantidade) ||
            quantidade < 0 ||
            quantidade > 99999.99 ||
            !/^\d+(\.\d{1,2})?$/.test(novaQuantidade.trim())
        ) {
            toast.error(
                'Informe uma quantidade entre 0 e 99.999,99, com até duas casas decimais.'
            )
            return
        }

        if (item.id_estoque == null) {
            toast.error('Estoque não identificado.')
            return
        }

        if (
            !Number.isInteger(Number(idUsuario)) ||
            !Number.isInteger(Number(item.id_medicamento)) ||
            idUsuario == null ||
            item.id_medicamento == null
        ) {
            toast.error('Não foi possível identificar o paciente ou medicamento.')
            return
        }

        setSalvando(true)

        try {
            await atualizarEstoqueAPI(item.id_estoque, {
                id_usuarios: Number(idUsuario),
                id_medicamentos: Number(item.id_medicamento),
                quantidade_em_estoque: quantidade
            })

            const atualizado = await buscarReceitaMedica(
                item.id_receita_medica
            )

            if (!atualizado) {
                throw new Error(
                    'Não foi possível consultar o estoque atualizado.'
                )
            }

            setEstoques(anteriores =>
                anteriores.map(estoque =>
                    Number(estoque.id_receita_medica) ===
                        Number(atualizado.id_receita_medica)
                        ? atualizado
                        : estoque
                )
            )

            toast.success('Estoque atualizado com sucesso!')
            setEditandoId(null)
            setNovaQuantidade('')

        } catch {
            toast.error('Não foi possível concluir a atualização.', {
                description: erro.message
            })
        } finally {
            setSalvando(false)
        }
    }


    return (
        <section className="estoque-paciente">
            <header className="estoque-cabecalho">
                <div>
                    <h2>Controle de Estoque</h2>
                    <p>Acompanhe e atualize os medicamentos disponíveis</p>
                </div>
            </header>
            {carregando ? (
                <p>Consultando estoque...</p>
            ) : (
                <>
                    {erro && <p role="alert">{erro}</p>}

                    {estoques.length === 0 ? (
                        <p>Nenhum estoque disponível para esta agenda.</p>
                    ) : (
                        <div className="estoque-grid">
                            {estoques.map(item => {
                                const editando = editandoId === item.id_estoque
                                const quantidade = Number(item.quantidade_em_estoque)
                                const dose = Number(item.dosagem)

                                const quantidadeValida =
                                    item.quantidade_em_estoque != null &&
                                    item.quantidade_em_estoque !== '' &&
                                    Number.isFinite(quantidade) &&
                                    quantidade >= 0

                                const unidadesCompativeis =
                                    item.id_unidade_medida != null &&
                                    item.id_unidade_medida_embalagem != null &&
                                    Number(item.id_unidade_medida) ===
                                    Number(item.id_unidade_medida_embalagem)

                                const doseValida = Number.isFinite(dose) && dose > 0

                                const esgotado = quantidadeValida && quantidade === 0

                                const estoqueBaixo =
                                    quantidadeValida &&
                                    quantidade > 0 &&
                                    unidadesCompativeis &&
                                    doseValida &&
                                    quantidade <= dose * 2

                                const statusEstoque = !quantidadeValida
                                    ? 'Não informado'
                                    : esgotado
                                        ? 'Estoque esgotado'
                                        : estoqueBaixo
                                            ? quantidade < dose
                                                ? 'Insuficiente para uma dose'
                                                : 'Estoque baixo'
                                            : 'Disponível'

                                const classeStatus = !quantidadeValida
                                    ? ''
                                    : esgotado
                                        ? 'esgotado'
                                        : estoqueBaixo
                                            ? 'baixo'
                                            : 'disponivel'

                                return (

                                    <article
                                        className="estoque-card"
                                        key={item.id_receita_medica}
                                    >

                                        <div className={`estoque-circulo estoque-circulo-${classeStatus}`}>
                                            <strong>
                                                {item.quantidade_em_estoque == null
                                                    ? '—'
                                                    : Number(item.quantidade_em_estoque).toLocaleString('pt-BR')}
                                            </strong>
                                            <span>
                                                {item.sigla_embalagem
                                                    ? `Restante (${item.sigla_embalagem})`
                                                    : 'Restante'}
                                            </span>
                                        </div>


                                        <h3>{item.nome_medicamento}</h3>

                                        {quantidadeValida && (

                                            <p className={`estoque-status ${classeStatus ? `estoque-status-${classeStatus}` : ''}`}>
                                                {statusEstoque}
                                            </p>

                                        )}

                                        {editando ? (
                                            <div className="estoque-edicao">
                                                <label htmlFor={`estoque-${item.id_estoque}`}>
                                                    Nova quantidade disponível
                                                </label>

                                                <input
                                                    id={`estoque-${item.id_estoque}`}
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={novaQuantidade}
                                                    onChange={evento =>
                                                        setNovaQuantidade(evento.target.value)
                                                    }
                                                    disabled={salvando}
                                                />

                                                <div className="estoque-edicao-acoes">
                                                    <button
                                                        type="button"
                                                        onClick={cancelarEdicao}
                                                        disabled={salvando}
                                                        className="estoque-cancelar"
                                                    >
                                                        <X size={16} aria-hidden="true" />
                                                        Cancelar
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => salvarEstoque(item)}
                                                        disabled={salvando}
                                                        className="estoque-salvar"
                                                    >
                                                        <Check size={16} aria-hidden="true" />
                                                        {salvando ? 'Salvando...' : 'Salvar'}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                className="estoque-gerenciar"
                                                onClick={() => iniciarEdicao(item)}
                                                disabled={salvando || item.id_estoque == null}
                                            >
                                                <Pencil size={16} aria-hidden="true" />
                                                Gerenciar estoque
                                            </button>
                                        )}
                                    </article>
                                )
                            })}
                        </div>
                    )}
                </>
            )}
        </section>
    )
}
export default EstoquePaciente
