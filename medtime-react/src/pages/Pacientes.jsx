
import { useState } from 'react'
import { ArrowLeft, UsersRound, UserPlus } from 'lucide-react'

import Buscar from '../components/Buscar.jsx'
import CardPaciente from '../components/CardPaciente.jsx'

import './Inicio.css'
import './Pacientes.css'

function Pacientes({
    pacientes = [],
    abrirDashboard,
    aoVoltar,
    aoAdicionar
}) {
    const [busca, setBusca] = useState('')

    const pacientesFiltrados = pacientes.filter((paciente) =>
        paciente.nome?.toLowerCase().includes(
            busca.trim().toLowerCase()
        )
    )

    return (
        <section className="pagina-pacientes">

            <button
                type="button"
                className="pacientes-voltar"
                onClick={aoVoltar}
            >
                <ArrowLeft size={18} />
                Voltar ao início
            </button>

            <header className="pacientes-cabecalho">
                <div>
                    <h1>Meus pacientes</h1>
                    <p>
                        Consulte os pacientes cadastrados
                        e acompanhe seus cuidados.
                    </p>
                </div>
            </header>

            <div className="pacientes-pesquisa">
                <Buscar
                    busca={busca}
                    setBusca={setBusca}
                />
            </div>

            <div className="pacientes-resultado">
                <UsersRound size={20} />

                <span>
                    {pacientesFiltrados.length}
                    {' '}
                    {pacientesFiltrados.length === 1
                        ? 'paciente encontrado'
                        : 'pacientes encontrados'}
                </span>
            </div>

            {pacientesFiltrados.length === 0 ? (
                <div className="pacientes-vazio">
                    <UsersRound size={38} />

                    <h2>
                        {busca
                            ? 'Nenhum paciente encontrado'
                            : 'Nenhum paciente cadastrado'}
                    </h2>

                    <p>
                        {busca
                            ? 'Tente pesquisar por outro nome.'
                            : 'Os pacientes disponíveis aparecerão aqui.'}
                    </p>
                </div>
            ) : (
                <div className="lista_pacientes">
                    {pacientesFiltrados.map((paciente) => (
                        <CardPaciente
                            key={paciente.id ?? paciente.id_usuario}
                            paciente={paciente}
                            aoClicar={() => abrirDashboard(paciente)}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}

export default Pacientes
