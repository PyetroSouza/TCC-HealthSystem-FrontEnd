import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../hooks/useAuth.js'
import { atualizarPerfilAPI } from '../services/authService.js'
import { ArrowLeft, UserRound, Mail, Phone, CalendarDays, ShieldCheck, IdCard, LogOut } from 'lucide-react'
import { gerarIniciais } from '../utils/gerarIniciais.js'
import { formatarTelefone } from '../utils/formatarTelefone.js'
import './MinhaConta.css'

// Edição desativada enquanto o PUT /usuario/:id não estiver pronto no back.
// Quando o back liberar, basta trocar para true.
const EDICAO_HABILITADA = false

function MinhaConta({ usuario, aoVoltar, aoSair }) {
  const nome = usuario?.nome || 'Usuário'
  const email = usuario?.email || 'Não informado'
  const telefone = usuario?.telefone
    ? formatarTelefone(usuario.telefone)
    : 'Não informado'

  const cpfLimpo = String(usuario?.cpf ?? '').replace(/\D/g, '')
  const cpfMascarado = cpfLimpo.length === 11
    ? `***.***.${cpfLimpo.slice(6, 9)}-**`
    : 'Não informado'

  const nascimento = usuario?.data_nascimento
    ? new Date(usuario.data_nascimento).toLocaleDateString('pt-BR', {
      timeZone: 'UTC'
    })
    : 'Não informado'

  const { atualizarUsuario } = useAuth()

  const [editando, setEditando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [nomeEditado, setNomeEditado] = useState(usuario?.nome ?? '')
  const [telefoneEditado, setTelefoneEditado] = useState(
    formatarTelefone(usuario?.telefone ?? '')
  )

  async function salvarPerfil() {
    const nome = nomeEditado.trim()
    const telefone = telefoneEditado.replace(/\D/g, '')

    if (nome.length < 2) {
      toast.error('Informe um nome válido.')
      return
    }

    if (telefone.length < 10 || telefone.length > 11) {
      toast.error('Informe um telefone com DDD (10 ou 11 dígitos).')
      return
    }

    setSalvando(true)

    try {
      await atualizarPerfilAPI(usuario.id, usuario.jwt, {
        nome,
        telefone
      })

      atualizarUsuario({ nome, telefone })
      setEditando(false)
      toast.success('Perfil atualizado!')
    } catch (erro) {
      toast.error(erro.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <section className="minha-conta">
      <button
        type="button"
        className="minha-conta-voltar"
        onClick={aoVoltar}
      >
        <ArrowLeft size={18} />
        Voltar
      </button>

      <div className="minha-conta-card">
        <div className="minha-conta-capa">
          <div className="minha-conta-avatar">
            {usuario?.foto ? (
              <img src={usuario.foto} alt={`Foto de ${nome}`} />
            ) : (
              gerarIniciais(nome)
            )}
          </div>

          <h1>{nome}</h1>
          <p>Minha Conta • Cuidador</p>
        </div>

        <div className="minha-conta-conteudo">
          <div className="minha-conta-cabecalho-acoes">
            <h2>Informações pessoais</h2>
            <button type="button" className="minha-conta-sair" onClick={aoSair}>
              <LogOut size={17} />
              Sair da conta
            </button>
          </div>

          {EDICAO_HABILITADA && (
            <div className="minha-conta-acoes">
              {!editando ? (
                <button
                  type="button"
                  onClick={() => setEditando(true)}
                >
                  Editar perfil
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setNomeEditado(usuario?.nome ?? '')
                      setTelefoneEditado(formatarTelefone(usuario?.telefone ?? ''))
                      setEditando(false)
                    }}
                    disabled={salvando}
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={salvarPerfil}
                    disabled={salvando}
                  >
                    {salvando ? 'Salvando...' : 'Salvar alterações'}
                  </button>
                </>
              )}
            </div>
          )}

          <div className="minha-conta-grid">
            {editando ? (
              <label className="minha-conta-campo">
                <UserRound size={20} />
                <span>Nome completo</span>
                <input
                  type="text"
                  value={nomeEditado}
                  onChange={(e) => setNomeEditado(e.target.value)}
                  maxLength={100}
                  disabled={salvando}
                />
              </label>
            ) : (
              <Campo icon={UserRound} titulo="Nome completo" valor={nome} />
            )}
            <Campo icon={Mail} titulo="E-mail" valor={email} />
            {editando ? (
              <label className="minha-conta-campo">
                <Phone size={20} />
                <span>Telefone</span>
                <input
                  type="tel"
                  value={telefoneEditado}
                  onChange={(e) => setTelefoneEditado(formatarTelefone(e.target.value))}
                  placeholder="(11) 91234-5678"
                  inputMode="tel"
                  disabled={salvando}
                />
              </label>
            ) : (
              <Campo icon={Phone} titulo="Telefone" valor={telefone} />
            )}
            <Campo icon={CalendarDays} titulo="Nascimento" valor={nascimento} />
            <Campo icon={IdCard} titulo="CPF" valor={cpfMascarado} />
            <Campo
              icon={ShieldCheck}
              titulo="Verificação de e-mail"
              valor={usuario?.email_verificado ? 'Verificado' : 'Não verificado'}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function Campo({ icon: Icone, titulo, valor }) {
  return (
    <div className="minha-conta-campo">
      <Icone size={20} />
      <div>
        <span>{titulo}</span>
        <strong>{valor}</strong>
      </div>
    </div>
  )
}

export default MinhaConta