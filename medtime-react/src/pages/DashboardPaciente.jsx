import './DashboardPaciente.css'
import { useRef, useState, useEffect } from 'react'
import ListaMedicamentos from '../components/ListaMedicamentos.jsx'
import EstoquePaciente from '../components/EstoquePaciente.jsx'
import { useAgendaMedicamentos } from '../hooks/useAgendaMedicamentos.js'
import { gerarIniciais } from '../utils/gerarIniciais.js'
import { gerarCorAvatar } from '../utils/gerarCorAvatar.js'
import { excluirMedicamentoCompleto } from '../services/api.js'
import { toast } from 'sonner'



function DashboardPaciente({ pacienteSelecionado, voltarParaInicio, aoClicarCadastrarRemedio, medicamentos, excluirMedicamento, aoEditarMedicamento, aoVerTodosMedicamentos, aoVerHistorico }) {
    const corAvatar = gerarCorAvatar(pacienteSelecionado?.nome)

    const [medicamentoParaExcluir, setMedicamentoParaExcluir] = useState(null)
    const [excluindo, setExcluindo] = useState(false)
    const botaoCancelarRef = useRef(null)




    function confirmarExclusao(medicamento) {
        setMedicamentoParaExcluir(medicamento)
    }

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
                pacienteSelecionado.id
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
    } = useAgendaMedicamentos(pacienteSelecionado?.id)

    console.log('📋 Agenda do Dashboard:', agenda)


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

    return (
        <div className="dashboard-conteudo">
            <section className="card-boas-vindas-paciente">
                <button
                    type='button'
                    className='botao-voltar'
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
                            <h2>{gerarIniciais(pacienteSelecionado?.nome)}</h2>
                        </div>
                        <div className='dados-texto'>
                            <h3 className="nome">{pacienteSelecionado?.nome || "Ana Maria De Jesus"}</h3>
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

                    <button type='button' className='botao-medicamento' onClick={aoClicarCadastrarRemedio}>
                        <img src="/assets/cadastrar.svg" alt="adicionar medicamento" />
                        Adicionar Medicamento
                    </button>
                </div>
            </section>

            <div className="dashboard-inferior-grid">
                <aside className="dashboard-lateral">



                    <div className="contato-de-emergencia">
                        <div className="titulo">
                            <img src="/assets/telefone.svg" alt="telefone" />
                            <h1>Contato de emergência</h1>
                        </div>
                        <div className="nome-telefone">
                            <span>Charles Haenke (Filho)</span>
                            <p>(11) 97699-2487</p>
                        </div>
                        <div className="botoes">
                            <button
                                type="button"
                                className="localizacao"
                                disabled
                                title="Funcionalidade em desenvolvimento"
                            >
                                <img src="/assets/localizacao.svg" alt="" />
                                <span>Localização</span>
                            </button>

                            <button
                                type="button"
                                className="historico"
                                onClick={aoVerHistorico}
                            >
                                <img src="/assets/historico.svg" alt="" />
                                <span>Histórico</span>
                            </button>
                        </div>
                    </div>



                    <div className="dados-pulseira">
                        <div className="temperatura">
                            <span>37°C</span>
                            <p>Temperatura Corporal</p>
                        </div>

                        <div className="frequencia-cardiaca">
                            <span>70 BPM</span>
                            <p>Frequência Cardíaca</p>
                        </div>

                        <div className="pressao-sanguinea">
                            <span>120/80</span>
                            <p>Pressão Sanguínea</p>
                        </div>
                    </div>

                    <p className="aviso-dados-pulseira">
                        Dados demonstrativos da pulseira
                    </p>



                </aside>


                <div className="conteudo-principal-direita">

                    <div className="proximos-medicamentos-placeholder">
                        <div className="header-proximos-medicamentos">
                            <div className="proximos-remedios">
                                <img src="/assets/prancheta.svg" alt="prancheta de remédios" />
                                <span>Próximos Medicamentos</span>
                            </div>
                            <button
                                type="button"
                                className="menu-medicamentos botao-ver-todos"
                                onClick={aoVerTodosMedicamentos}
                            >
                                <img src="/assets/menu.svg" alt="" aria-hidden="true" />
                                Ver todos medicamentos
                            </button>
                        </div>

                        <ListaMedicamentos
                            medicamentos={medicamentosDaAgenda}
                            carregando={carregandoAgenda}
                            erro={erroAgenda}
                            aoAdicionar={aoClicarCadastrarRemedio}
                            aoEditar={aoEditarMedicamento}
                            aoExcluir={confirmarExclusao}
                            idUsuario={pacienteSelecionado.id}
                            aoConfirmarTomada={recarregarAgenda}
                        />


                    </div>
            <EstoquePaciente
                agenda={agenda}
                idUsuario={pacienteSelecionado?.id}
            />
                </div>
            </div>

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
                    </div>
                </div>
            )}

        </div>
    )
}

export default DashboardPaciente
