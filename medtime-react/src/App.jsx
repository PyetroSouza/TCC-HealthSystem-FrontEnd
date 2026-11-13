
import { useEffect, useState } from 'react'
import { toast, Toaster } from 'sonner'
import './App.css'
import PainelAutenticacao from './components/auth/PainelAutenticacao'
import VerificacaoCodigo from './components/auth/VerificacaoCodigo'
import Cabecalho from './components/Cabecalho.jsx'
import GerarCodigoVinculo from './components/vinculo/GerarCodigoVinculo.jsx'
import VincularCuidador from './components/vinculo/VincularCuidador.jsx'
import { medicamentos as medicamentosIniciais } from './data/medicamentos'
import CadastroIdoso from './pages/CadastroIdoso'
import CadastroRemedio from './pages/CadastroRemedio.jsx'
import CadastroUsuario from './pages/CadastroUsuario.jsx'
import DashboardPaciente from './pages/DashboardPaciente.jsx'
import EscolherPerfil from './pages/EscolherPerfil.jsx'
import HistoricoMedicamentos from './pages/HistoricoMedicamentos.jsx'
import Inicio from './pages/Inicio.jsx'
import Login from './pages/Login.jsx'
import MedicamentosPaciente from './pages/MedicamentosPaciente.jsx'
import Pacientes from './pages/Pacientes.jsx'
import RecuperarSenha from './pages/RecuperarSenha.jsx'
import RedefinirSenha from './pages/RedefinirSenha.jsx'
import TodosMedicamentos from './pages/TodosMedicamentos.jsx'
import { buscarAgendaMedicamentos } from './services/api.js'
import { buscarMeusPacientes } from './services/vinculoService.js'
import { obterPerfilUsuario } from './utils/obterPerfilUsuario'


function App() {
  const [telaAtual, setTelaAtual] = useState('login')
  const [perfilCadastro, setPerfilCadastro] = useState(null)
  const [alertasPendentes, setAlertasPendentes] = useState(0)
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null)
  const [listaMedicamentos, setListaMedicamentos] = useState(
    () => [...medicamentosIniciais]
  )
  const [medicamentoEmEdicao, setMedicamentoEmEdicao] = useState(null)
  const [pacientes, setPacientes] = useState([])
  const [carregandoPacientes, setCarregandoPacientes] = useState(false)
  const [erroPacientes, setErroPacientes] = useState(null)
  const [emailRecuperacao, setEmailRecuperacao] = useState('')
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(null)
  const perfilAutenticado = obterPerfilUsuario(usuarioAutenticado?.jwt)

  const alertasVisiveis =
    telaAtual === 'inicio' &&
      pacientes.length > 0 &&
      !erroPacientes
      ? alertasPendentes
      : 0


  useEffect(() => {
    if (
      telaAtual !== 'inicio' ||
      !usuarioAutenticado?.jwt ||
      perfilAutenticado !== 'cuidador'
    ) {
      return
    }

    let ativo = true

    async function carregarPacientes() {
      setCarregandoPacientes(true)
      setErroPacientes(null)

      try {
        const pacientesRecebidos = await buscarMeusPacientes(
          usuarioAutenticado.jwt
        )

        if (!ativo) return

        console.log(
          'Pacientes vinculados recebidos:',
          pacientesRecebidos
        )

        setPacientes(pacientesRecebidos)
      } catch (erro) {
        if (!ativo) return

        console.error(
          'Erro ao carregar pacientes vinculados:',
          erro
        )

        setErroPacientes(erro.message)
      } finally {
        if (ativo) {
          setCarregandoPacientes(false)
        }
      }
    }

    carregarPacientes()

    return () => {
      ativo = false
    }
  }, [telaAtual, usuarioAutenticado?.jwt, perfilAutenticado])



  useEffect(() => {
    if (
      telaAtual !== 'inicio' ||
      pacientes.length === 0 ||
      erroPacientes ||
      !usuarioAutenticado?.jwt
    ) {
      return
    }

    let ativo = true

    async function carregarAlertas() {
      try {
        const resultados = await Promise.all(

          pacientes.map(paciente => {
            const hoje = new Date()

            const dataLocal = [
              hoje.getFullYear(),
              String(hoje.getMonth() + 1).padStart(2, '0'),
              String(hoje.getDate()).padStart(2, '0')
            ].join('-')

            return buscarAgendaMedicamentos(
              paciente.id_paciente ?? paciente.id,
              dataLocal,
              usuarioAutenticado.jwt
            )
          })

        )

        const total = resultados
          .flatMap(resultado =>
            Array.isArray(resultado) ? resultado : []
          )
          .filter(item =>
            String(item.status ?? '').toUpperCase() === 'ATRASADO' &&
            !item.confirmado
          ).length

        if (ativo) setAlertasPendentes(total)
      } catch (erro) {
        console.error('Erro ao carregar alertas:', erro)
      }
    }

    carregarAlertas()

    return () => {
      ativo = false
    }
  }, [telaAtual, pacientes, erroPacientes, usuarioAutenticado?.jwt])

  function voltarParaInicio() {
    setTelaAtual('inicio')
    setPacienteSelecionado(null)
  }

  function voltarParaDashboard() {
    setTelaAtual('dashboard')
  }

  function irParaCadastroRemedio() {
    setMedicamentoEmEdicao(null)
    setTelaAtual('cadastro-remedio')
  }

  function cadastrarMedicamento(novoMedicamento) {
    setListaMedicamentos((listaAnterior) => [
      ...listaAnterior,
      novoMedicamento
    ])
  }

  function excluirMedicamento(idMedicamento) {
    console.log('ID recebido para excluir:', idMedicamento)

    setListaMedicamentos((listaAnterior) => {
      console.log('Lista antes:', listaAnterior)

      const novaLista = listaAnterior.filter(
        (medicamento) => medicamento.id_medicamento !== idMedicamento
      )

      console.log('Lista depois:', novaLista)

      return novaLista
    })
  }

  function iniciarEdicaoMedicamento(medicamento) {
    setMedicamentoEmEdicao(medicamento)
    setTelaAtual('cadastro-remedio')
  }

  function atualizarMedicamento(medicamentoAtualizado) {
    setListaMedicamentos((listaAnterior) =>
      listaAnterior.map((medicamento) =>
        medicamento.id_medicamento === medicamentoAtualizado.id_medicamento
          ? medicamentoAtualizado
          : medicamento
      )
    )
  }


  if (telaAtual === 'login') {
    return (
      <>
        <Toaster
          position="top-right"
          richColors
          closeButton
        />

        <Login
          aoCadastrar={() => setTelaAtual('escolher-perfil')}
          aoRecuperarSenha={() => setTelaAtual('recuperar-senha')}
          aoEntrarDemo={() => setTelaAtual('inicio')}
          aoEntrar={(usuario) => {
            const perfil = obterPerfilUsuario(usuario.jwt)

            if (!perfil) {
              toast.error('Não foi possível identificar o perfil do usuário.')
              return
            }

            setUsuarioAutenticado(usuario)

            if (perfil === 'cuidador') {
              setTelaAtual('inicio')
            } else {
              setTelaAtual('inicio-paciente')
            }
          }}
        />
      </>
    )
  }

  if (telaAtual === 'cadastro-usuario') {
    return (
      <>
        <Toaster
          position="top-right"
          richColors
          closeButton
        />

        <CadastroUsuario
          perfil={perfilCadastro}
          aoVoltarLogin={() => setTelaAtual('escolher-perfil')}
          aoIrParaLogin={() => setTelaAtual('login')}
        />
      </>
    )
  }
  if (telaAtual === 'escolher-perfil') {
    return (
      <EscolherPerfil
        aoVoltar={() => setTelaAtual('login')}
        aoSelecionarPerfil={(perfil) => {
          setPerfilCadastro(perfil)
          setTelaAtual('cadastro-usuario')
        }}
      />
    )
  }
  if (telaAtual === 'redefinir-senha') {
    return (
      <>
        <Toaster position="top-right" richColors closeButton />

        <RedefinirSenha
          aoVoltarLogin={() => setTelaAtual('login')}
        />
      </>
    )
  }

  if (telaAtual === 'recuperar-senha') {
    return (
      <>
        <Toaster position="top-right" richColors closeButton />

        <RecuperarSenha
          aoVoltarLogin={() => setTelaAtual('login')}
          aoVisualizarVerificacao={(email) => {
            setEmailRecuperacao(email)
            setTelaAtual('verificacao-recuperacao')
          }}
        />
      </>
    )
  }


  if (telaAtual === 'verificacao-recuperacao') {
    return (
      <main className="login-pagina">
        <div className="login-container">

          <PainelAutenticacao
            etiqueta="Verificação da conta"
            titulo="Sua segurança é importante."
            descricao="Confira as informações para proteger o acesso ao MedTime."
          />

          <section className="login-area-formulario">
            <div className="login-formulario-conteudo">
              <VerificacaoCodigo
                finalidade="recuperacao"
                email={emailRecuperacao}
                aoVoltar={() =>
                  setTelaAtual('recuperar-senha')
                }
              />
            </div>
          </section>

        </div>
      </main>
    )
  }

  return (
    <div className="aplicacao">
      <Cabecalho />

      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={4000}
      />

      <main className="conteudo">
        {telaAtual === 'inicio' && (
          <Inicio
            token={usuarioAutenticado?.jwt}
            aoCadastrar={() => setTelaAtual('cadastro')}
            pacientes={pacientes}
            medicamentos={listaMedicamentos}
            carregandoPacientes={carregandoPacientes}
            erroPacientes={erroPacientes}
            alertasPendentes={alertasVisiveis}
            abrirDashboard={(paciente) => {
              setPacienteSelecionado(paciente)
              setTelaAtual('dashboard')
            }}
            aoVerPacientes={() => setTelaAtual('pacientes')}
          />)}

        {telaAtual === 'cadastro' && <CadastroIdoso />}

        {telaAtual === 'inicio' &&
          perfilAutenticado === 'cuidador' &&
          usuarioAutenticado?.jwt && (
            <GerarCodigoVinculo
              token={usuarioAutenticado.jwt}
            />
          )}

        {telaAtual === 'inicio-paciente' &&
          perfilAutenticado === 'paciente' &&
          usuarioAutenticado?.jwt && (
            <VincularCuidador
              token={usuarioAutenticado.jwt}
            />
          )}


        {telaAtual === 'pacientes' && (
          <Pacientes
            pacientes={pacientes}
            aoVoltar={() => setTelaAtual('inicio')}
            abrirDashboard={(paciente) => {
              setPacienteSelecionado(paciente)
              setTelaAtual('dashboard')
            }}
          />
        )}


        {telaAtual === 'dashboard' && (<DashboardPaciente
          pacienteSelecionado={pacienteSelecionado}
          setPacienteSelecionado={setPacienteSelecionado}
          voltarParaInicio={voltarParaInicio}
          aoVerAgenda={() => setTelaAtual('todos-medicamentos')}
          excluirMedicamento={excluirMedicamento}
          aoClicarCadastrarRemedio={irParaCadastroRemedio}
          aoEditarMedicamento={iniciarEdicaoMedicamento}
          medicamentos={listaMedicamentos}
          token={usuarioAutenticado?.jwt}
          aoVerTodosMedicamentos={() => setTelaAtual('medicamentos-paciente')}
          aoVerHistorico={() => setTelaAtual('historico-medicamentos')}
        />)}
        {telaAtual === 'cadastro-remedio' && (
          <CadastroRemedio
            voltarParaDashboard={() => {
              if (medicamentoEmEdicao) {
                setTelaAtual('medicamentos-paciente')
              } else {
                setTelaAtual('dashboard')
              }
            }}
            cadastrarMedicamento={cadastrarMedicamento}
            medicamentoEmEdicao={medicamentoEmEdicao}
            atualizarMedicamento={atualizarMedicamento}
            pacienteSelecionado={pacienteSelecionado} />
        )}

        {telaAtual === 'todos-medicamentos' && (
          <TodosMedicamentos
            pacienteSelecionado={pacienteSelecionado}
            aoVoltar={voltarParaDashboard}
          />
        )}

        {telaAtual === 'historico-medicamentos' && (
          <HistoricoMedicamentos
            pacienteSelecionado={pacienteSelecionado}
            aoVoltar={voltarParaDashboard}
          />
        )}

        {telaAtual === 'medicamentos-paciente' && (
          <MedicamentosPaciente
            pacienteSelecionado={pacienteSelecionado}
            aoVoltar={voltarParaDashboard}
            aoEditar={iniciarEdicaoMedicamento}
          />
        )}

      </main>
    </div>
  )
}

export default App