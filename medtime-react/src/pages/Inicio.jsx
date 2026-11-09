
import BoasVindas from '../components/BoasVindas.jsx'
import CardPaciente from '../components/CardPaciente.jsx'
import './Inicio.css'

function Inicio({
  aoCadastrar,
  aoVerPacientes,
  abrirDashboard,
  pacientes
}) {


  return (
    <>
      <BoasVindas aoCadastrar={aoCadastrar} />

      <div className="container">
        <section className="resumo">
          <div className="card_resumo card_ativos">
            <p className="resumo_numero">{pacientes.length}</p>
            <p className="resumo_texto">Pacientes Ativos</p>
          </div>

          <div className="card_resumo card_alertas">
            <p className="resumo_numero">0</p>
            <p className="resumo_texto">Alertas Pendentes</p>
          </div>
        </section>
        <section className="secao-pacientes-inicio">
          <div className="cabecalho-pacientes-inicio">
            <h2>Pacientes acompanhados</h2>

            <button
              type="button"
              className="botao-ver-pacientes"
              onClick={aoVerPacientes}
            >
              Ver todos
              <span aria-hidden="true">→</span>
            </button>
          </div>

          <div className="lista_pacientes">
            {pacientes.slice(0, 3).map((paciente) => (
              <CardPaciente
                key={paciente.id ?? paciente.id_usuario}
                paciente={paciente}
                aoClicar={() => abrirDashboard(paciente)}
              />
            ))}
          </div>
        </section>
      </div>
    </>
  )
}


export default Inicio