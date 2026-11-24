import { useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import {
    ArrowLeft,
    CalendarDays,
    HeartPulse,
    IdCard,
    Mail,
    Phone,
    ShieldAlert,
    UserMinus
} from 'lucide-react'
import { toast } from 'sonner'
import { desvincularPaciente } from '../services/api.js'
import { gerarIniciais } from '../utils/gerarIniciais.js'
import './PerfilPaciente.css'

function normalizarListaJson(valor) {
    if (Array.isArray(valor)) return valor
    if (typeof valor === 'string') {
        try {
            const convertido = JSON.parse(valor)
            return Array.isArray(convertido) ? convertido : []
        } catch {
            return []
        }
    }
    return []
}

function formatarData(valor) {
    if (!valor) return 'Não informada'
    const texto = String(valor).slice(0, 10)
    const partes = texto.split('-')
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`
    }
    const data = new Date(valor)
    return Number.isNaN(data.getTime())
        ? 'Não informada'
        : data.toLocaleDateString('pt-BR')
}

function calcularIdadeTexto(dataNascimento) {
    if (!dataNascimento) return null
    const [ano, mes, dia] = String(dataNascimento).slice(0, 10).split('-').map(Number)
    if (!ano || !mes || !dia) return null

    const hoje = new Date()
    let idade = hoje.getFullYear() - ano
    const aindaNaoFezAniversario =
        hoje.getMonth() + 1 < mes ||
        (hoje.getMonth() + 1 === mes && hoje.getDate() < dia)

    if (aindaNaoFezAniversario) idade -= 1
    return idade >= 0 ? `${idade} anos` : null
}

function formatarTelefoneTexto(telefone) {
    const digitos = String(telefone ?? '').replace(/\D/g, '')
    if (digitos.length === 11) {
        return digitos.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    if (digitos.length === 10) {
        return digitos.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    return telefone || 'Não informado'
}

function formatarCpfTexto(cpf) {
    const digitos = String(cpf ?? '').replace(/\D/g, '')
    if (digitos.length === 11) {
        return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    return cpf || 'Não informado'
}

function PerfilPaciente({
    paciente,
    token,
    aoVoltar,
    aoPacienteDesvinculado
}) {
    const [confirmarDesvinculo, setConfirmarDesvinculo] = useState(false)
    const [desvinculando, setDesvinculando] = useState(false)

    if (!paciente) {
        return (
            <section className="perfil-paciente-pagina">
                <button type="button" className="perfil-paciente-voltar" onClick={aoVoltar}>
                    <ArrowLeft size={18} aria-hidden="true" />
                    Voltar
                </button>
                <p role="alert">Nenhum paciente selecionado.</p>
            </section>
        )
    }

    const idPaciente = paciente.id_paciente ?? paciente.id
    const idade = calcularIdadeTexto(paciente.data_nascimento)
    const contatosEmergencia = normalizarListaJson(paciente.contatos_emergencia)
    const doencasCronicas = normalizarListaJson(paciente.doencas_cronicas)

    async function handleDesvincular() {
        if (desvinculando) return

        setDesvinculando(true)
        try {
            await desvincularPaciente(idPaciente, token)
            toast.success('Paciente desvinculado com sucesso.')
            setConfirmarDesvinculo(false)
            aoPacienteDesvinculado?.(idPaciente)
        } catch (erro) {
            toast.error('Não foi possível desvincular o paciente.', {
                description: erro.message
            })
        } finally {
            setDesvinculando(false)
        }
    }

    return (
        <MotionConfig reducedMotion="user">
            <motion.section
                className="perfil-paciente-pagina"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
            >
                <button
                    type="button"
                    className="perfil-paciente-voltar"
                    onClick={aoVoltar}
                >
                    <ArrowLeft size={18} aria-hidden="true" />
                    Voltar ao Dashboard
                </button>

                {/* Cabeçalho do perfil */}
                <header className="perfil-paciente-topo">
                    <div className="perfil-paciente-avatar">
                        {paciente.foto ? (
                            <img
                                src={paciente.foto}
                                alt={`Foto de ${paciente.nome}`}
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <span>{gerarIniciais(paciente.nome)}</span>
                        )}
                    </div>

                    <div className="perfil-paciente-titulo">
                        <h1>{paciente.nome}</h1>
                        <p>
                            {idade ? `${idade} • ` : ''}
                            Vinculado em {formatarData(paciente.data_vinculo)}
                        </p>
                    </div>
                </header>

                {/* Dados pessoais */}
                <div className="perfil-paciente-card">
                    <h2>Dados pessoais</h2>

                    <div className="perfil-paciente-grid">
                        <div className="perfil-paciente-dado">
                            <Mail size={18} aria-hidden="true" />
                            <div>
                                <span>E-mail</span>
                                <strong>{paciente.email || 'Não informado'}</strong>
                            </div>
                        </div>

                        <div className="perfil-paciente-dado">
                            <Phone size={18} aria-hidden="true" />
                            <div>
                                <span>Telefone</span>
                                <strong>{formatarTelefoneTexto(paciente.telefone)}</strong>
                            </div>
                        </div>

                        <div className="perfil-paciente-dado">
                            <IdCard size={18} aria-hidden="true" />
                            <div>
                                <span>CPF</span>
                                <strong>{formatarCpfTexto(paciente.cpf)}</strong>
                            </div>
                        </div>

                        <div className="perfil-paciente-dado">
                            <CalendarDays size={18} aria-hidden="true" />
                            <div>
                                <span>Data de nascimento</span>
                                <strong>{formatarData(paciente.data_nascimento)}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                {(doencasCronicas.length > 0 || contatosEmergencia.length > 0) && (
                    <div className="perfil-paciente-duplo">
                        {doencasCronicas.length > 0 && (
                            <div className="perfil-paciente-card">
                                <h2 className="perfil-paciente-subtitulo-icone">
                                    <HeartPulse size={19} aria-hidden="true" />
                                    Condições de saúde
                                </h2>

                                <ul className="perfil-paciente-tags">
                                    {doencasCronicas.map((doenca, index) => (
                                        <li key={doenca.id ?? index}>
                                            {doenca.nome_doenca}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {contatosEmergencia.length > 0 && (
                            <div className="perfil-paciente-card">
                                <h2 className="perfil-paciente-subtitulo-icone">
                                    <ShieldAlert size={19} aria-hidden="true" />
                                    Contatos de emergência
                                </h2>

                                <ul className="perfil-paciente-contatos">
                                    {contatosEmergencia.map((contato, index) => (
                                        <li key={contato.id ?? index}>
                                            <strong>{contato.nome}</strong>
                                            <span>{formatarTelefoneTexto(contato.telefone)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                <div className="perfil-paciente-card perfil-paciente-zona-vinculo">
                    <div>
                        <h2>Vínculo de acompanhamento</h2>
                        <p>
                            Ao desvincular, você deixará de visualizar a agenda, o estoque e os
                            medicamentos de <strong>{paciente.nome}</strong>.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="botao-desvincular-paciente"
                        onClick={() => setConfirmarDesvinculo(true)}
                        disabled={desvinculando}
                    >
                        <UserMinus size={18} aria-hidden="true" />
                        Desvincular paciente
                    </button>
                </div>

                {/* Modal de confirmação */}
                <AnimatePresence>
                    {confirmarDesvinculo && (
                        <motion.div
                            className="modal-desvincular-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.18 }}
                        >
                            <motion.div
                                className="modal-desvincular"
                                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.97, y: 6 }}
                                transition={{ duration: 0.18 }}
                                role="alertdialog"
                                aria-modal="true"
                                aria-labelledby="titulo-desvincular"
                                aria-describedby="descricao-desvincular"
                            >
                                <h2 id="titulo-desvincular">Desvincular paciente?</h2>
                                <p id="descricao-desvincular">
                                    Tem certeza que deseja encerrar o vínculo com{' '}
                                    <strong>{paciente.nome}</strong>? Para acompanhar novamente no
                                    futuro, será necessário gerar um novo código de vínculo.
                                </p>

                                <div className="modal-desvincular-acoes">
                                    <button
                                        type="button"
                                        className="modal-desvincular-cancelar"
                                        onClick={() => setConfirmarDesvinculo(false)}
                                        disabled={desvinculando}
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="button"
                                        className="modal-desvincular-confirmar"
                                        onClick={handleDesvincular}
                                        disabled={desvinculando}
                                    >
                                        {desvinculando ? 'Desvinculando...' : 'Confirmar desvínculo'}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.section>
        </MotionConfig>
    )
}

export default PerfilPaciente