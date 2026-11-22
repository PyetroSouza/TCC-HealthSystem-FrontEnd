
import BoasVindas from '../components/BoasVindas.jsx'
import CardPaciente from '../components/CardPaciente.jsx'
import VincularPaciente from '../components/vinculo/VincularPaciente.jsx'
import './Inicio.css'

function Inicio({
  aoVerPacientes,
  aoAtualizarPacientes,
  abrirDashboard,
  pacientes = [],
  carregandoPacientes = false,
  erroPacientes = null,
  token,
  nomeUsuario,
  alertasPendentes = 0
}) {


  return (
    <>
      <BoasVindas nomeUsuario={nomeUsuario} />

      <div className="container">
        <section className="resumo">
          <div className="card_resumo card_ativos">
            <p className="resumo_numero">
              {carregandoPacientes || erroPacientes ? '—' : pacientes.length}
            </p>
            <p className="resumo_texto">Pacientes Ativos</p>
          </div>

          <div className="card_resumo card_alertas">
            <p className="resumo_numero">{alertasPendentes}</p>
            <p className="resumo_texto">Alertas Pendentes</p>
          </div>
        </section>
        <section className="secao-pacientes-inicio">
          <div className="cabecalho-pacientes-inicio">
            <h2>Pacientes acompanhados</h2>

            <div className="acoes-pacientes-inicio">
              <VincularPaciente
                token={token}
                aoFechar={aoAtualizarPacientes}
              />

              <button
                type="button"
                className="botao-ver-pacientes"
                onClick={aoVerPacientes}
              >
                Ver todos
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>

          <div className="lista_pacientes">
            {carregandoPacientes ? (
              <p role="status">Carregando pacientes...</p>
            ) : erroPacientes ? (
              <p role="alert">
                Não foi possível carregar os pacientes. Tente novamente mais tarde.
              </p>
            ) : pacientes.length === 0 ? (
              <div className="vp-vazio">
                <p>Nenhum paciente vinculado ainda.</p>
                <p className="vp-vazio-dica">
                  Use o botão “Vincular paciente” para gerar um código e
                  peça para a pessoa informá-lo no aplicativo MedTime.
                </p>
              </div>
            ) : (
              pacientes.slice(0, 3).map((paciente) => (
                <CardPaciente
                  key={paciente.id ?? paciente.id_usuario}
                  paciente={paciente}
                  token={token}
                  aoClicar={() => abrirDashboard(paciente)}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </>
  )
}


export default Inicio
