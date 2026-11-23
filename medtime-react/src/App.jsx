
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast, Toaster } from 'sonner'
import './App.css'
import PainelAutenticacao from './components/auth/PainelAutenticacao'
import VerificacaoCodigo from './components/auth/VerificacaoCodigo'
import Cabecalho from './components/Cabecalho.jsx'
import CadastroRemedio from './pages/CadastroRemedio.jsx'
import CadastroUsuario from './pages/CadastroUsuario.jsx'
import DashboardPaciente from './pages/DashboardPaciente.jsx'
import HistoricoMedicamentos from './pages/HistoricoMedicamentos.jsx'
import Inicio from './pages/Inicio.jsx'
import Login from './pages/Login.jsx'
import MedicamentosPaciente from './pages/MedicamentosPaciente.jsx'
import Pacientes from './pages/Pacientes.jsx'
import RecuperarSenha from './pages/RecuperarSenha.jsx'
import RedefinirSenha from './pages/RedefinirSenha.jsx'
import TodosMedicamentos from './pages/TodosMedicamentos.jsx'
import MinhaConta from './pages/MinhaConta.jsx'
import { useAuth } from './hooks/useAuth.js'
import { useAutoRefresh } from './hooks/useAutoRefresh.js'
import { useAppVersion } from './hooks/useAppVersion.js'
import { buscarAgendaMedicamentos } from './services/api.js'
import { buscarMeusPacientes } from './services/vinculoService.js'
import { obterPerfilUsuario } from './utils/obterPerfilUsuario'


function App() {
  const [telaAtual, setTelaAtual] = useState(() => {
    try {
      const usuarioSalvo = JSON.parse(
        sessionStorage.getItem('medtime_usuario') || 'null'
      )

      return usuarioSalvo?.jwt ? 'inicio' : 'login'
    } catch {
      return 'login'
    }
  })
  const [perfilCadastro, setPerfilCadastro] = useState(null)
  const [alertasPendentes, setAlertasPendentes] = useState(0)
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null)
  const [medicamentoEmEdicao, setMedicamentoEmEdicao] = useState(null)
  const [pacientes, setPacientes] = useState([])
  const [carregandoPacientes, setCarregandoPacientes] = useState(false)
  const [erroPacientes, setErroPacientes] = useState(null)
  const [emailRecuperacao, setEmailRecuperacao] = useState('')
  const [dadosGoogle, setDadosGoogle] = useState(null)

  const {
    usuario: usuarioAutenticado,
    entrar,
    sair
  } = useAuth()


  const perfilAutenticado = obterPerfilUsuario(usuarioAutenticado?.jwt)

  const autenticado =
    Boolean(usuarioAutenticado?.jwt) &&
    perfilAutenticado === 'cuidador'

  const telasPublicas = [
    'login',
    'cadastro-usuario',
    'escolher-perfil',
    'recuperar-senha',
    'verificacao-recuperacao',
    'redefinir-senha'
  ]

  const telaExibida =
    !autenticado && !telasPublicas.includes(telaAtual)
      ? 'login'
      : telaAtual

  const alertasVisiveis =
    telaAtual === 'inicio' &&
      pacientes.length > 0 &&
      !erroPacientes
      ? alertasPendentes
      : 0




  const requisicaoDadosRef = useRef(0)
  const consultaEmAndamentoRef = useRef(false)
  const dadosCarregadosRef = useRef(false)
  const telasComDadosAtualizaveis = ['inicio', 'pacientes']

  const atualizarDados = useCallback(async () => {
    if (consultaEmAndamentoRef.current) return

    const requisicaoAtual = ++requisicaoDadosRef.current
    const telaDaRequisicao = telaAtual
    const token = usuarioAutenticado?.jwt
    const primeiraCarga = !dadosCarregadosRef.current

    if (!token || perfilAutenticado !== 'cuidador') return

    consultaEmAndamentoRef.current = true

    if (primeiraCarga) {
      setCarregandoPacientes(true)
      setErroPacientes(null)
    }

    try {
      const pacientesRecebidos = await buscarMeusPacientes(token)

      if (requisicaoAtual !== requisicaoDadosRef.current) return

      setPacientes(pacientesRecebidos)
      setErroPacientes(null)
      dadosCarregadosRef.current = true

      if (telaDaRequisicao !== 'inicio') return

      if (pacientesRecebidos.length === 0) {
        setAlertasPendentes(0)
        return
      }

      try {
        const hoje = new Date()
        const dataLocal = [
          hoje.getFullYear(),
          String(hoje.getMonth() + 1).padStart(2, '0'),
          String(hoje.getDate()).padStart(2, '0')
        ].join('-')

        const agendas = await Promise.all(
          pacientesRecebidos.map(paciente =>
            buscarAgendaMedicamentos(
              paciente.id_paciente ?? paciente.id,
              dataLocal,
              token
            )
          )
        )

        if (requisicaoAtual !== requisicaoDadosRef.current) return

        const totalAlertas = agendas
          .flatMap(agenda => Array.isArray(agenda) ? agenda : [])
          .filter(item =>
            String(item.status ?? '').toUpperCase() === 'ATRASADO' &&
            !item.confirmado
          ).length

        setAlertasPendentes(totalAlertas)
      } catch (erro) {
        console.error('Não foi possível atualizar os alertas:', erro)
      }
    } catch (erro) {
      if (requisicaoAtual !== requisicaoDadosRef.current) return

      if (primeiraCarga) {
        setErroPacientes(
          erro.message || 'Não foi possível carregar os pacientes.'
        )
      } else {
        console.warn('Falha na atualização automática dos pacientes:', erro)
      }
    } finally {
      if (requisicaoAtual === requisicaoDadosRef.current) {
        setCarregandoPacientes(false)
        consultaEmAndamentoRef.current = false
      }
    }
  }, [
    telaAtual,
    usuarioAutenticado?.jwt,
    perfilAutenticado
  ])

  // Uma nova sessão deve carregar os dados do novo usuário.
  useEffect(() => {
    dadosCarregadosRef.current = false
    requisicaoDadosRef.current += 1
    consultaEmAndamentoRef.current = false

    return () => {
      requisicaoDadosRef.current += 1
    }
  }, [usuarioAutenticado?.jwt])

  useAutoRefresh(atualizarDados, {
    enabled:
      Boolean(usuarioAutenticado?.jwt) &&
      perfilAutenticado === 'cuidador' &&
      telasComDadosAtualizaveis.includes(telaAtual),
    intervalMs: 60_000,
    minFocusIntervalMs: 10_000,
    refreshKey: telaAtual
  })

  useAppVersion(telaAtual)

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

  function iniciarEdicaoMedicamento(medicamento) {
    setMedicamentoEmEdicao(medicamento)
    setTelaAtual('cadastro-remedio')
  }


  function encerrarSessao() {
    sair()

    setPacientes([])
    dadosCarregadosRef.current = false
    setPacienteSelecionado(null)
    setMedicamentoEmEdicao(null)
    setAlertasPendentes(0)
    setErroPacientes(null)
    setCarregandoPacientes(false)
    setPerfilCadastro(null)

    setTelaAtual('login')
  }

  if (telaExibida === 'login') {
    return (
      <>
        <Toaster
          position="top-right"
          richColors
          closeButton
        />

        <Login
          aoCadastrar={() => {
            setDadosGoogle(null)
            setPerfilCadastro('cuidador')
            setTelaAtual('cadastro-usuario')
          }}
          aoRecuperarSenha={() => setTelaAtual('recuperar-senha')}
          aoEntrarDemo={() => setTelaAtual('inicio')}
          aoEntrar={(usuario) => {
            const perfil = obterPerfilUsuario(usuario.jwt)

            if (!perfil) {
              toast.error('Não foi possível identificar o perfil do usuário.')
              return
            }

            if (perfil !== 'cuidador') {
              sair()

              toast.info(
                'O acesso web é destinado aos cuidadores. Utilize o aplicativo MedTime para pacientes.'
              )

              setTelaAtual('login')
              return
            }

            entrar(usuario)
            setPacientes([])
            setPacienteSelecionado(null)
            setTelaAtual('inicio')

            toast.success('Bem-vindo ao MedTime!')
          }}
          aoCadastrarGoogle={(dados) => {
            setDadosGoogle(dados)
            setPerfilCadastro('cuidador')
            setTelaAtual('cadastro-usuario')
          }}

        />
      </>
    )
  }

  if (telaExibida === 'cadastro-usuario') {
    return (
      <>
        <Toaster
          position="top-right"
          richColors
          closeButton
        />
        <CadastroUsuario
          perfil={perfilCadastro}
          dadosGoogle={dadosGoogle}
          aoEntrar={(usuario) => {
            entrar(usuario)
            setDadosGoogle(null)
            setTelaAtual('inicio')
          }}
          aoVoltarLogin={() => {
            setDadosGoogle(null)
            setTelaAtual('login')
          }}
          aoIrParaLogin={() => {
            setDadosGoogle(null)
            setTelaAtual('login')
          }}
        />
      </>
    )
  }
  if (telaExibida === 'redefinir-senha') {
    return (
      <>
        <Toaster position="top-right" richColors closeButton />

        <RedefinirSenha
          aoVoltarLogin={() => setTelaAtual('login')}
        />
      </>
    )
  }

  if (telaExibida === 'recuperar-senha') {
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


  if (telaExibida === 'verificacao-recuperacao') {
    return (
      <>
        <Toaster
          position="top-right"
          richColors
          closeButton
        />

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
                  aoVoltar={() => setTelaAtual('recuperar-senha')}
                  aoConcluir={() => {
                    setEmailRecuperacao('')
                    setTelaAtual('login')
                  }}
                />
              </div>
            </section>

          </div>
        </main>
      </>
    )
  }

  return (
    <div className="aplicacao">

      <Cabecalho
        usuario={usuarioAutenticado}
        aoAbrirPerfil={() => setTelaAtual('minha-conta')}
      />


      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={4000}
      />

      <main className="conteudo">
        {telaExibida === 'inicio' && (
          <Inicio
            token={usuarioAutenticado?.jwt}
            nomeUsuario={usuarioAutenticado?.nome}
            aoAtualizarPacientes={() => { void atualizarDados() }}
            pacientes={pacientes}
            carregandoPacientes={carregandoPacientes}
            erroPacientes={erroPacientes}
            alertasPendentes={alertasVisiveis}
            abrirDashboard={(paciente) => {
              setPacienteSelecionado(paciente)
              setTelaAtual('dashboard')
            }}
            aoVerPacientes={() => setTelaAtual('pacientes')}
          />)}


        {telaExibida === 'pacientes' && (
          <Pacientes
            pacientes={pacientes}
            token={usuarioAutenticado?.jwt}
            aoVoltar={() => setTelaAtual('inicio')}
            abrirDashboard={(paciente) => {
              setPacienteSelecionado(paciente)
              setTelaAtual('dashboard')
            }}
          />
        )}


        {telaExibida === 'dashboard' && (<DashboardPaciente
          pacienteSelecionado={pacienteSelecionado}
          setPacienteSelecionado={setPacienteSelecionado}
          voltarParaInicio={voltarParaInicio}
          aoVerAgenda={() => setTelaAtual('todos-medicamentos')}
          aoClicarCadastrarRemedio={irParaCadastroRemedio}
          aoEditarMedicamento={iniciarEdicaoMedicamento}
          token={usuarioAutenticado?.jwt}
          aoVerTodosMedicamentos={() => setTelaAtual('medicamentos-paciente')}
          aoVerHistorico={() => setTelaAtual('historico-medicamentos')}
        />)}
        {telaExibida === 'cadastro-remedio' && (
          <CadastroRemedio
            voltarParaDashboard={() => {
              if (medicamentoEmEdicao) {
                setTelaAtual('medicamentos-paciente')
              } else {
                setTelaAtual('dashboard')
              }
            }}
            medicamentoEmEdicao={medicamentoEmEdicao}
            pacienteSelecionado={pacienteSelecionado}
            token={usuarioAutenticado?.jwt} />
        )}

        {telaExibida === 'todos-medicamentos' && (
          <TodosMedicamentos
            pacienteSelecionado={pacienteSelecionado}
            aoVoltar={voltarParaDashboard}
            token={usuarioAutenticado?.jwt}
          />
        )}

        {telaExibida === 'historico-medicamentos' && (
          <HistoricoMedicamentos
            pacienteSelecionado={pacienteSelecionado}
            aoVoltar={voltarParaDashboard}
            token={usuarioAutenticado?.jwt}
          />
        )}

        {telaExibida === 'medicamentos-paciente' && (
          <MedicamentosPaciente
            pacienteSelecionado={pacienteSelecionado}
            aoVoltar={voltarParaDashboard}
            aoEditar={iniciarEdicaoMedicamento}
            token={usuarioAutenticado?.jwt}
          />
        )}

        {telaExibida === 'minha-conta' && usuarioAutenticado?.jwt && (
          <MinhaConta
            usuario={usuarioAutenticado}
            aoVoltar={() => setTelaAtual('inicio')}
            aoSair={encerrarSessao}
          />
        )}

      </main>
    </div>
  )
}

export default App