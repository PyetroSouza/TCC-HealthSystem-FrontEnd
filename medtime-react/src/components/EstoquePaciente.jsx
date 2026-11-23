import { AlertTriangle, Check, Pencil, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
    atualizarEstoqueAPI,
    buscarReceitasDoPaciente
} from '../services/api.js'
import { useAutoRefresh } from '../hooks/useAutoRefresh.js'
import './EstoquePaciente.css'
function EstoquePaciente({ agenda = [], idUsuario, token }) {
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
    const estoquesCarregadosRef = useRef(false)
    const requisicaoEstoqueRef = useRef(0)

    const carregarEstoques = useCallback(async () => {
        if (!idUsuario || !chaveReceitas || !token) {
            setEstoques([])
            setCarregando(false)
            setEditandoId(null)
            return
        }

        // Não substitui os dados enquanto o usuário está alterando o estoque.
        if (editandoId !== null || salvando) return

        const requisicaoAtual = ++requisicaoEstoqueRef.current
        const primeiraCarga = !estoquesCarregadosRef.current

        if (primeiraCarga) {
            setCarregando(true)
            setErro(null)
        }

        try {
            const receitas = await buscarReceitasDoPaciente(
                idUsuario,
                token
            )

            if (requisicaoAtual !== requisicaoEstoqueRef.current) return

            const idsAgenda = new Set(
                chaveReceitas.split(',').map(Number)
            )
            const estoquesEncontrados = receitas.filter(
                receita => idsAgenda.has(
                    Number(receita.id_receita_medica)
                )
            )

            setEstoques(estoquesEncontrados)
            setErro(null)
            estoquesCarregadosRef.current = true
        } catch (erro) {
            if (requisicaoAtual !== requisicaoEstoqueRef.current) return

            if (primeiraCarga) {
                setErro(erro.message)
            } else {
                console.warn('Falha ao atualizar o estoque:', erro)
            }
        } finally {
            if (requisicaoAtual === requisicaoEstoqueRef.current) {
                setCarregando(false)
            }
        }
    }, [
        idUsuario,
        token,
        chaveReceitas,
        editandoId,
        salvando
    ])

    useEffect(() => {
        estoquesCarregadosRef.current = false
        requisicaoEstoqueRef.current += 1

        return () => {
            requisicaoEstoqueRef.current += 1
        }
    }, [idUsuario, token])

    useAutoRefresh(carregarEstoques, {
        enabled: Boolean(idUsuario && chaveReceitas && token),
        intervalMs: 5 * 60_000,
        minFocusIntervalMs: 30_000,
        refreshKey: `${idUsuario}:${chaveReceitas}:${chaveConfirmacoes}`
    })

    useEffect(() => {
        if (chaveReceitas || editandoId !== null || salvando) return

        setEstoques([])
        setErro(null)
        setCarregando(false)
    }, [chaveReceitas, editandoId, salvando])

    function iniciarEdicao(item) {
        if (salvando || item.id_estoque == null) return
        requisicaoEstoqueRef.current += 1
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
        requisicaoEstoqueRef.current += 1
        setSalvando(true)
        try {
            await atualizarEstoqueAPI(
                item.id_receita_medica,
                idUsuario,
                novaQuantidade,
                token
            )
            const receitas = await buscarReceitasDoPaciente(
                idUsuario,
                token
            )
            const atualizado = receitas.find(
                receita =>
                    Number(receita.id_receita_medica) ===
                    Number(item.id_receita_medica)
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
        } catch (erro) {
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
                                // A dose e o estoque só podem ser comparados diretamente
                                // quando usam a mesma unidade. Conversões exigem dados do backend.
                                const calculoPossivel = unidadesCompativeis && doseValida
                                const consumoPorTomada = calculoPossivel ? dose : null
                                const estoqueIndeterminado = quantidadeValida && !esgotado && !calculoPossivel
                                const estoqueBaixo =
                                    quantidadeValida &&
                                    !esgotado &&
                                    calculoPossivel &&
                                    quantidade <= consumoPorTomada * 2
                                const insuficiente =
                                    quantidadeValida &&
                                    !esgotado &&
                                    calculoPossivel &&
                                    quantidade < consumoPorTomada
                                const statusEstoque = !quantidadeValida
                                    ? 'Não informado'
                                    : esgotado
                                        ? 'Estoque esgotado'
                                        : estoqueIndeterminado
                                            ? 'Estoque não calculável'
                                            : insuficiente
                                                ? 'Insuficiente para uma dose'
                                                : estoqueBaixo
                                                    ? 'Estoque baixo'
                                                    : 'Disponível'
                                const classeStatus = !quantidadeValida
                                    ? ''
                                    : esgotado
                                        ? 'esgotado'
                                        : estoqueIndeterminado
                                            ? 'indeterminado'
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
                                        {estoqueBaixo && (
                                            <div className="estoque-alerta-baixo" role="status">
                                                <AlertTriangle size={16} aria-hidden="true" />
                                                <span>
                                                    {insuficiente
                                                        ? 'Estoque insuficiente para a próxima dose.'
                                                        : 'Estoque baixo! Considere repor o medicamento.'}
                                                </span>
                                            </div>
                                        )}
                                        {estoqueIndeterminado && (
                                            <div className="estoque-alerta-indeterminado" role="status">
                                                <AlertTriangle size={16} aria-hidden="true" />
                                                <span>
                                                    Não é possível calcular as doses restantes: confira as unidades da dose e do estoque.
                                                </span>
                                            </div>
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
