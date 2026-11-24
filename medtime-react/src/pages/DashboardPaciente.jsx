import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { CalendarCheck2 } from 'lucide-react'
import { toast } from 'sonner'
import EstoquePaciente from '../components/EstoquePaciente.jsx'
import ListaMedicamentos from '../components/ListaMedicamentos.jsx'
import { useAgendaMedicamentos } from '../hooks/useAgendaMedicamentos.js'
import { excluirMedicamentoCompleto } from '../services/api.js'
import { gerarCorAvatar } from '../utils/gerarCorAvatar.js'
import { gerarIniciais } from '../utils/gerarIniciais.js'
import './DashboardPaciente.css'

function DashboardPaciente({ pacienteSelecionado, voltarParaInicio, aoClicarCadastrarRemedio, aoVerTodosMedicamentos, aoVerHistorico, aoVerAgenda, token }) {
    const corAvatar = gerarCorAvatar(pacienteSelecionado?.nome)
    const fotoPaciente = pacienteSelecionado?.foto

    const [fotoComErro, setFotoComErro] = useState(null)
    const [medicamentoParaExcluir, setMedicamentoParaExcluir] = useState(null)
    const [excluindo, setExcluindo] = useState(false)
    const botaoCancelarRef = useRef(null)

    const idPaciente =
        pacienteSelecionado?.id_paciente ??
        pacienteSelecionado?.id

    useEffect(() => {
        if (!medicamentoParaExcluir) return

        botaoCancelarRef.current?.focus()

        function tratarTeclado(evento) {
            if (evento.key === 'Escape' && !excluindo) {
                setMedicamentoParaExcluir(null)
            }
        }

        window.addEventListener('keydown', tratarTeclado)

        return () => {
            window.removeEventListener('keydown', tratarTeclado)
        }
    }, [medicamentoParaExcluir, excluindo])

    async function executarExclusao() {
        if (!medicamentoParaExcluir || excluindo) return

        try {
            setExcluindo(true)

            await excluirMedicamentoCompleto(
                medicamentoParaExcluir.id_receita_medica,
                idPaciente,
                token
            )

            setMedicamentoParaExcluir(null)

            toast.success('Medicamento excluído com sucesso!')

            await recarregarAgenda()
        } catch (erro) {
            toast.error('Não foi possível excluir o medicamento.', {
                description: erro.message
            })
        } finally {
            setExcluindo(false)
        }
    }

    const {
        agenda,
        carregandoAgenda,
        erroAgenda,
        recarregarAgenda
    } = useAgendaMedicamentos(
        pacienteSelecionado?.id_paciente ?? pacienteSelecionado?.id,
        undefined,
        token
    )

    const medicamentosDaAgenda = agenda.map((item) => ({
        id_medicamento: item.id_medicamento,
        id_programacao_medicamento: item.id_programacao_medicamento,
        id_receita_medica: item.id_receita_medica,
        nome: item.nome_medicamento,
        quantidade_dose: Number(item.dosagem),
        tipo_dosagem: item.tipo_dosagem,
        horario_programado: item.horario_programado,
        proximo_horario: new Date(
            item.horario_programado
        ).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        }),
        confirmado: item.confirmado,
        status: item.status,
    }))

    const proximosMedicamentos = medicamentosDaAgenda
        .filter(medicamento => !medicamento.confirmado)
        .sort((a, b) =>
            new Date(a.horario_programado) -
            new Date(b.horario_programado)
        )
        .slice(0, 3)

    const calcularIdade = (dataNascimento) => {
        if (!dataNascimento) return null

        const nascimento = new Date(dataNascimento)
        const hoje = new Date()

        let idade = hoje.getFullYear() - nascimento.getUTCFullYear()

        const aindaNaoFezAniversario =
            hoje.getMonth() < nascimento.getUTCMonth() ||
            (
                hoje.getMonth() === nascimento.getUTCMonth() &&
                hoje.getDate() < nascimento.getUTCDate()
            )

        if (aindaNaoFezAniversario) idade--

        return idade
    }

    const todasTomadasConfirmadas =
        !carregandoAgenda &&
        !erroAgenda &&
        medicamentosDaAgenda.length > 0 &&
        proximosMedicamentos.length === 0

    return (
        <MotionConfig reducedMotion="user">
            <div className="dashboard-conteudo">
                <motion.section
                    className="card-boas-vindas-paciente"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                >
                    <button
                        type="button"
                        className="botao-voltar"
                        onClick={voltarParaInicio}
                    >
                        &lt; Voltar
                    </button>

                    <div className="card-conteudo-principal">
                        <div className="info-perfil">
                            <div
                                className="foto-perfil"
                                style={{
                                    backgroundColor: corAvatar.fundo,
                                    color: corAvatar.texto
                                }}
                            >
                                {fotoPaciente && fotoComErro !== fotoPaciente ? (
                                    <img
                                        src={fotoPaciente}
                                        alt={`Foto de ${pacienteSelecionado?.nome ?? 'paciente'}`}
                                        referrerPolicy="no-referrer"
                                        onError={() => setFotoComErro(fotoPaciente)}
                                    />
                                ) : (
                                    <h2>{gerarIniciais(pacienteSelecionado?.nome)}</h2>
                                )}
                            </div>
                            <div className="dados-texto">
                                <h3 className="nome">
                                    {pacienteSelecionado?.nome || 'Paciente não identificado'}
                                </h3>
                                <p className="idade">
                                    {pacienteSelecionado?.data_nascimento
                                        ? `${calcularIdade(pacienteSelecionado.data_nascimento)} anos`
                                        : 'Idade não informada'}
                                </p>

                                <ul className="tags">
                                    {pacienteSelecionado?.condicoes?.map((condicao) => (
                                        <li key={condicao}>{condicao}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="botao-medicamento"
                            onClick={aoClicarCadastrarRemedio}
                        >
                            <img src={import.meta.env.BASE_URL + 'assets/cadastrar.svg'} alt="adicionar medicamento" />
                            Adicionar Medicamento
                        </button>
                    </div>
                </motion.section>

                <motion.div
                    className="dashboard-inferior-grid"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.06, ease: 'easeOut' }}
                >
                    <aside className="dashboard-lateral">
                        <div className="contato-de-emergencia">
                            <div className="titulo">
                                <img src={import.meta.env.BASE_URL + 'assets/telefone.svg'} alt="telefone" />
                                <h1>Contato de emergência</h1>
                            </div>
                            <div className="nome-telefone">
                                <span>Contato não cadastrado</span>
                                <p>
                                    As informações de emergência ainda não
                                    estão disponíveis neste painel.
                                </p>
                            </div>
                            <div className="botoes">
                                <button
                                    type="button"
                                    className="localizacao"
                                    disabled
                                    title="Funcionalidade em desenvolvimento"
                                >
                                    <img src={import.meta.env.BASE_URL + 'assets/localizacao.svg'} alt="" />
                                    <span>Localização</span>
                                </button>

                                <button
                                    type="button"
                                    className="historico"
                                    onClick={aoVerHistorico}
                                >
                                    <img src={import.meta.env.BASE_URL + 'assets/historico.svg'} alt="" />
                                    <span>Histórico</span>
                                </button>
                            </div>
                        </div>
                    </aside>

                    <div className="conteudo-principal-direita">
                        <div className="proximos-medicamentos-placeholder">
                            <div className="header-proximos-medicamentos">
                                <div className="proximos-cabecalho">
                                    <div className="proximos-remedios">
                                        <img
                                            src={import.meta.env.BASE_URL + 'assets/prancheta.svg'}
                                            alt=""
                                            aria-hidden="true"
                                        />
                                        <h2>Próximos Medicamentos</h2>
                                    </div>

                                    <div className="proximos-acoes">
                                        <button
                                            type="button"
                                            className="proximos-link"
                                            onClick={aoVerAgenda}
                                        >
                                            Ver agenda completa
                                        </button>

                                        <button
                                            type="button"
                                            className="proximos-link"
                                            onClick={aoVerTodosMedicamentos}
                                        >
                                            Ver todos medicamentos
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {todasTomadasConfirmadas ? (
                                <div className="dashboard-estado-vazio" role="status">
                                    <div className="dashboard-estado-vazio-icone">
                                        <CalendarCheck2 size={30} strokeWidth={1.8} />
                                    </div>

                                    <h3>Agenda em dia!</h3>

                                    <p>
                                        Todas as tomadas programadas para hoje
                                        foram confirmadas.
                                    </p>

                                    <span className="dashboard-estado-vazio-status">
                                        Nenhuma tomada pendente
                                    </span>
                                </div>
                            ) : (
                                <ListaMedicamentos
                                    medicamentos={proximosMedicamentos}
                                    carregando={carregandoAgenda}
                                    erro={erroAgenda}
                                    aoAdicionar={aoClicarCadastrarRemedio}
                                    idUsuario={idPaciente}
                                    aoConfirmarTomada={recarregarAgenda}
                                    token={token}
                                />
                            )}
                        </div>

                        <EstoquePaciente
                            agenda={agenda}
                            idUsuario={
                                pacienteSelecionado?.id_paciente ??
                                pacienteSelecionado?.id
                            }
                            token={token}
                        />
                    </div>
                </motion.div>

                <AnimatePresence>
                    {medicamentoParaExcluir && (
                    <motion.div
                        className="modal-exclusao-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                    >
                        <motion.div
                            className="modal-exclusao"
                            initial={{ opacity: 0, y: 14, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.98 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            role="alertdialog"
                            aria-modal="true"
                            aria-labelledby="titulo-exclusao"
                            aria-describedby="descricao-exclusao"
                        >
                            <h2 id="titulo-exclusao">
                                Excluir medicamento?
                            </h2>

                            <p id="descricao-exclusao">
                                Você está prestes a excluir
                                <strong> {medicamentoParaExcluir.nome}</strong>
                                {' '}e todas as suas programações.
                                O histórico de tomadas será preservado.
                            </p>

                            <div className="modal-exclusao-acoes">
                                <button
                                    ref={botaoCancelarRef}
                                    type="button"
                                    className="modal-botao-cancelar"
                                    disabled={excluindo}
                                    onClick={() => setMedicamentoParaExcluir(null)}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="button"
                                    className="modal-botao-excluir"
                                    disabled={excluindo}
                                    onClick={executarExclusao}
                                >
                                    {excluindo
                                        ? 'Excluindo...'
                                        : 'Excluir medicamento'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </MotionConfig>
    )
}

export default DashboardPaciente
