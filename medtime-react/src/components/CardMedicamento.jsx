
import { useState } from 'react'
import { Pencil, Trash2, ChevronDown, Check } from 'lucide-react'
import { toast } from 'sonner'
import { confirmarIngestaoMedicamento } from '../services/api'

function CardMedicamento({
  medicamento,
  idUsuario,
  aoEditar,
  aoExcluir,
  aoConfirmarTomada
}) {
  const [expandido, setExpandido] = useState(false)
  const [confirmando, setConfirmando] = useState(false)

  const confirmado = Boolean(medicamento.confirmado)

  const horarioProgramado = medicamento.horario_programado

  const horarioValido = horarioProgramado &&
    !Number.isNaN(new Date(horarioProgramado).getTime())

  const liberado = horarioValido &&
    Date.now() >= new Date(horarioProgramado).getTime() - 30 * 60 * 1000

  async function confirmarTomada() {
    if (confirmando || confirmado || !liberado) return

    if (!medicamento.id_receita_medica || !idUsuario) {
      toast.error('Dados da receita ou do paciente indisponíveis.')
      return
    }

    try {
      setConfirmando(true)

      await confirmarIngestaoMedicamento(
        medicamento.id_receita_medica,
        idUsuario,
        horarioProgramado
      )

      toast.success('Tomada registrada com sucesso!')
      setExpandido(false)
      aoConfirmarTomada?.()

    } catch (erro) {
      toast.error('Não foi possível registrar a tomada.', {
        description: erro.message
      })
    } finally {
      setConfirmando(false)
    }
  }

  return (
    <div className="remedio">
      <button
        type="button"
        className="cabecalho-medicamento"
        onClick={() => setExpandido(!expandido)}
        aria-expanded={expandido}
      >
        <div className="info-esquerda">
          <img
            src="/assets/remedio.svg"
            alt=""
          />

          <div className="nome-quantidade">
            <span>{medicamento.nome}</span>
            <p>Dose: {medicamento.quantidade_dose}</p>
          </div>
        </div>

        <div className="tempo-remedio">
          <h1>{medicamento.proximo_horario}</h1>
          <p>Horário previsto</p>
          {confirmado && (
            <span className="status-tomada">
              <Check size={14} />
              Tomada registrada
            </span>
          )}
        </div>

        <ChevronDown size={20} />
      </button>

      <div className="acoes-medicamento">
        <button
          type="button"
          className="botao-editar"
          aria-label={`Editar ${medicamento.nome}`}
          title="Editar medicamento"
          onClick={() => aoEditar(medicamento)}
        >
          <Pencil size={18} />
        </button>

        <button
          type="button"
          className="botao-excluir"
          aria-label={`Excluir ${medicamento.nome}`}
          title="Excluir medicamento"
          onClick={() => aoExcluir(medicamento)}
        >
          <Trash2 size={18} />
        </button>
      </div>

      {expandido && (
        <div className="confirmacao-tomada">
          {confirmado ? (
            <p className="tomada-confirmada">
              <Check size={18} />
              Tomada já registrada
            </p>
          ) : (
            <>
              <p>
                {liberado
                  ? 'Você já tomou este medicamento?'
                  : 'A confirmação estará disponível 30 minutos antes do horário programado.'}
              </p>

              <button
                type="button"
                className="botao-confirmar-tomada"
                onClick={confirmarTomada}
                disabled={!liberado || confirmando}
              >
                {confirmando ? 'Confirmando...' : 'Já tomei'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default CardMedicamento
