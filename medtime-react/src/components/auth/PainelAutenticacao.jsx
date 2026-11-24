
import { ShieldCheck } from 'lucide-react'
import { motion } from 'motion/react'

function PainelAutenticacao({
    titulo,
    descricao,
    etiqueta = 'Bem-vindo ao MedTime'
}) {
    return (
        <aside className="login-apresentacao">

            <motion.div className="login-marca" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.12 }}>
                <span className="login-marca-badge">
                    <img
                        src={import.meta.env.BASE_URL + 'assets/logo.png'}
                        alt="Logo MedTime"
                    />
                </span>

                <span>
                    Med<span className="login-marca-destaque">Time</span>
                </span>
            </motion.div>

            <motion.div className="login-mensagem" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } } }}>
                <motion.span className="login-etiqueta" variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                    {etiqueta}
                </motion.span>

                <motion.h1 variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}>{titulo}</motion.h1>

                <motion.p variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}>{descricao}</motion.p>
            </motion.div>

            <motion.div className="login-rodape-painel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.5 }}>
                <ShieldCheck size={18} aria-hidden="true" />

                <span>
                    Organização e cuidado em um só lugar
                </span>
            </motion.div>

        </aside>
    )
}

export default PainelAutenticacao
