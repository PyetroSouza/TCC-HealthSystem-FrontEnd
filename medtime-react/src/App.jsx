
import { buscarUnidadesMedida } from './services/api.js'
import { useEffect } from 'react'
import { useState } from 'react'
import Login from './pages/Login.jsx'
import Inicio from './pages/Inicio.jsx'
import CadastroIdoso from './pages/CadastroIdoso'
import Pacientes from './pages/Pacientes.jsx'
import Cabecalho from './components/Cabecalho.jsx'
import DashboardPaciente from './pages/DashboardPaciente.jsx'
import CadastroRemedio from './pages/CadastroRemedio.jsx'
import TodosMedicamentos from './pages/TodosMedicamentos.jsx'
import HistoricoMedicamentos from './pages/HistoricoMedicamentos.jsx'
import { buscarUsuarios } from './services/api.js'
import { Toaster } from 'sonner'
import { medicamentos as medicamentosIniciais } from './data/medicamentos'
import './App.css'


function App() {
  const [telaAtual, setTelaAtual] = useState('login')
  const [busca, setBusca] = useState('')
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null)
  const [listaMedicamentos, setListaMedicamentos] = useState(
    () => [...medicamentosIniciais]
  )
  const [medicamentoEmEdicao, setMedicamentoEmEdicao] = useState(null)
  const [pacientes, setPacientes] = useState([])

  useEffect(() => {
    async function carregarPacientes() {
      try {
        const usuarios = await buscarUsuarios()

        setPacientes(usuarios)
        console.log('👥 Usuários recebidos:', usuarios)
      } catch (erro) {
        console.error('Erro ao carregar usuários:', erro)
      }
    }

    carregarPacientes()
  }, [])

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

  useEffect(() => {
    async function testarAPI() {
      try {
        const unidades = await buscarUnidadesMedida()
        console.log('Dados recebidos da API:', unidades)
      } catch (erro) {
        console.error('Erro na conexão:', erro.message)
      }
    }

    testarAPI()
  }, [])
  if (telaAtual === 'login') {
    return (
      <>
        <Toaster position="top-right" richColors />
        <Login />
      </>
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
        {telaAtual === 'login' && <Login />}
        {telaAtual === 'inicio' && (
          <Inicio
            aoCadastrar={() => setTelaAtual('cadastro')}
            busca={busca}
            setBusca={setBusca}
            pacientes={pacientes}
            medicamentos={listaMedicamentos}
            abrirDashboard={(paciente) => {
              setPacienteSelecionado(paciente)
              setTelaAtual('dashboard')
            }}
          />
        )}

        {telaAtual === 'cadastro' && <CadastroIdoso />}

        {telaAtual === 'pacientes' && <Pacientes />}

        {telaAtual === 'dashboard' && (<DashboardPaciente
          pacienteSelecionado={pacienteSelecionado}
          setPacienteSelecionado={setPacienteSelecionado}
          voltarParaInicio={voltarParaInicio}
          excluirMedicamento={excluirMedicamento}
          aoClicarCadastrarRemedio={irParaCadastroRemedio}
          aoEditarMedicamento={iniciarEdicaoMedicamento}
          medicamentos={listaMedicamentos}
          aoVerTodosMedicamentos={() => setTelaAtual('todos-medicamentos')}
          aoVerHistorico={() => setTelaAtual('historico-medicamentos')}
        />)}
        {telaAtual === 'cadastro-remedio' && (
          <CadastroRemedio
            voltarParaDashboard={voltarParaDashboard}
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
      </main>
    </div>
  )
}

export default App