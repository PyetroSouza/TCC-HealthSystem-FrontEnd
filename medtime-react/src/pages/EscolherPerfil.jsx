
import { HeartPulse, HandHeart, UsersRound, ArrowLeft } from 'lucide-react'
import './EscolherPerfil.css'

function EscolherPerfil({ aoSelecionarPerfil, aoVoltar }) {
    return (
        <main className="escolher-perfil-pagina">
            <div className="escolher-perfil-container">

                <button
                    type="button"
                    className="escolher-perfil-voltar"
                    onClick={aoVoltar}
                >
                    <ArrowLeft size={18} />
                    Voltar ao login
                </button>

                <div className="escolher-perfil-marca">
                    <HeartPulse size={34} aria-hidden="true" />
                    <span>MedTime</span>
                </div>

                <header className="escolher-perfil-cabecalho">
                    <h1>Como deseja utilizar o MedTime?</h1>
                    <p>Escolha seu perfil para continuar o cadastro.</p>
                </header>

                <div className="escolher-perfil-opcoes">
                    <button
                        type="button"
                        className="escolher-perfil-card"
                        onClick={() => aoSelecionarPerfil('cuidador')}
                    >
                        <span className="escolher-perfil-icone">
                            <HandHeart size={42} aria-hidden="true" />
                        </span>
                        <strong>Cuidador</strong>
                        <span>
                            Organize e acompanhe os medicamentos
                            de quem está sob seus cuidados.
                        </span>
                    </button>

                    <button
                        type="button"
                        className="escolher-perfil-card"
                        onClick={() => aoSelecionarPerfil('paciente')}
                    >
                        <span className="escolher-perfil-icone">
                            <UsersRound size={42} aria-hidden="true" />
                        </span>
                        <strong>Paciente</strong>
                        <span>
                            Acompanhe seus medicamentos e
                            seus horários de forma simples.
                        </span>
                    </button>
                </div>

            </div>
        </main>
    )
}

export default EscolherPerfil
