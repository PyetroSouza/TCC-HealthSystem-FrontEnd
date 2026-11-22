
import { HeartPulse, ShieldCheck } from 'lucide-react'

function PainelAutenticacao({
    titulo,
    descricao,
    etiqueta = 'Bem-vindo ao MedTime'
}) {
    return (
        <aside className="login-apresentacao">

            <div className="login-marca">
                <HeartPulse size={30} aria-hidden="true" />

                <span>
                    Med<span className="login-marca-destaque">Time</span>
                </span>
            </div>

            <div className="login-mensagem">
                <span className="login-etiqueta">
                    {etiqueta}
                </span>

                <h1>{titulo}</h1>

                <p>{descricao}</p>
            </div>

            <div className="login-rodape-painel">
                <ShieldCheck size={18} aria-hidden="true" />

                <span>
                    Organização e cuidado em um só lugar
                </span>
            </div>

        </aside>
    )
}

export default PainelAutenticacao
