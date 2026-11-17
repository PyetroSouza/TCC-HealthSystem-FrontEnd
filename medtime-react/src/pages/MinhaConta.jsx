
import { ArrowLeft, UserRound, Mail, Phone, CalendarDays, ShieldCheck, IdCard } from 'lucide-react'
import { gerarIniciais } from '../utils/gerarIniciais.js'
import './MinhaConta.css'

function MinhaConta({ usuario, aoVoltar }) {
  const nome = usuario?.nome || 'Usuário'
  const email = usuario?.email || 'Não informado'
  const telefone = usuario?.telefone || 'Não informado'

  const cpfLimpo = String(usuario?.cpf ?? '').replace(/\D/g, '')
  const cpfMascarado = cpfLimpo.length === 11
    ? `***.***.${cpfLimpo.slice(6, 9)}-**`
    : 'Não informado'

  const nascimento = usuario?.data_nascimento
    ? new Date(usuario.data_nascimento).toLocaleDateString('pt-BR', {
        timeZone: 'UTC'
      })
    : 'Não informado'

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
          <h2>Informações pessoais</h2>

          <div className="minha-conta-grid">
            <Campo icon={UserRound} titulo="Nome completo" valor={nome} />
            <Campo icon={Mail} titulo="E-mail" valor={email} />
            <Campo icon={Phone} titulo="Telefone" valor={telefone} />
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
