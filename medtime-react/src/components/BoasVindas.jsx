
import './BoasVindas.css'

function BoasVindas({ nomeUsuario }) {
  const primeiroNome = nomeUsuario
    ?.trim()
    .split(/\s+/)[0] || 'Usuário'

  return (
    <section className="card-boas-vindas">
      <div className="texto-boas-vindas">
        <h1>Olá, {primeiroNome}!</h1>
        <h2>
          Veja como estão as pessoas que você acompanha
        </h2>
      </div>
    </section>
  )
}

export default BoasVindas
