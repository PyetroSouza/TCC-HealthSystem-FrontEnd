
import { useEffect, useState } from 'react'
import { toast, Toaster } from 'sonner'
import './App.css'
import PainelAutenticacao from './components/auth/PainelAutenticacao'
import VerificacaoCodigo from './components/auth/VerificacaoCodigo'
import Cabecalho from './components/Cabecalho.jsx'
import GerarCodigoVinculo from './components/vinculo/GerarCodigoVinculo.jsx'
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
import MinhaConta from './pages/MinhaConta.jsx'
import { useAuth } from './hooks/useAuth.js'
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
  const [dadosGoogle, setDadosGoogle] = useState(null)
  const [alertasPendentes, setAlertasPendentes] = useState(0)
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null)
  const [listaMedicamentos, setListaMedicamentos] = useState([])
  const [medicamentoEmEdicao, setMedicamentoEmEdicao] = useState(null)
  const [pacientes, setPacientes] = useState([])
  const [carregandoPacientes, setCarregandoPacientes] = useState(false)
  const [erroPacientes, setErroPacientes] = useState(null)
  const [emailRecuperacao, setEmailRecuperacao] = useState('')

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


  function encerrarSessao() {
    sair()

    setPacientes([])
    setPacienteSelecionado(null)
    setListaMedicamentos([])
    setMedicamentoEmEdicao(null)
    setAlertasPendentes(0)
    setErroPacientes(null)
    setCarregandoPacientes(false)
    setPerfilCadastro(null)
    setDadosGoogle(null)

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
          aoCadastrar={() => { setDadosGoogle(null); setTelaAtual('escolher-perfil') }}
          aoCadastrarGoogle={(dados) => {
            setDadosGoogle(dados)
            setPerfilCadastro('cuidador')
            setTelaAtual('cadastro-usuario')
          }}
          aoRecuperarSenha={() => setTelaAtual('recuperar-senha')}
          aoEntrarDemo={() => setTelaAtual('inicio')}
          aoEntrar={(usuario) => {
            console.log('Campos recebidos no login:', Object.keys(usuario))
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
          aoVoltarLogin={() => {
            setDadosGoogle(null)
            setTelaAtual('login')
          }}
          aoIrParaLogin={() => {
            setDadosGoogle(null)
            setTelaAtual('login')
          }}
          aoEntrar={(usuario) => {
            const perfil = obterPerfilUsuario(usuario.jwt)
            if (perfil !== 'cuidador') {
              toast.error('O acesso web é destinado aos cuidadores.')
              return
            }
            entrar(usuario)
            setDadosGoogle(null)
            setPacientes([])
            setPacienteSelecionado(null)
            setTelaAtual('inicio')
          }}
        />
      </>
    )
  }
  if (telaExibida=== 'escolher-perfil') {
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

  if (telaExibida=== 'recuperar-senha') {
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
        aoSair={encerrarSessao}
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
            aoCadastrar={() => {
              toast.info('Para adicionar um paciente, compartilhe o código de vínculo com ele no aplicativo MedTime.')
              setTelaAtual('inicio')
            }}
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


        {telaExibida === 'inicio' &&
          perfilAutenticado === 'cuidador' &&
          usuarioAutenticado?.jwt && (
            <GerarCodigoVinculo
              token={usuarioAutenticado.jwt}
            />
          )}


        {telaExibida === 'pacientes' && (
          <Pacientes
            token={usuarioAutenticado?.jwt}
            pacientes={pacientes}
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
          excluirMedicamento={excluirMedicamento}
          aoClicarCadastrarRemedio={irParaCadastroRemedio}
          aoEditarMedicamento={iniciarEdicaoMedicamento}
          medicamentos={listaMedicamentos}
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
            cadastrarMedicamento={cadastrarMedicamento}
            medicamentoEmEdicao={medicamentoEmEdicao}
            atualizarMedicamento={atualizarMedicamento}
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
          />
        )}

      </main>
    </div>
  )
}

export default App