
import { useRef, useState } from 'react'
import {
  Pencil,
  Trash2,
  ChevronDown,
  Check,
  Clock3,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { confirmarIngestaoMedicamento } from '../services/api'
import { obterIconeDosagem } from '../utils/obterIconeDosagem'
import './CardMedicamento.css'

function CardMedicamento({
  medicamento,
  idUsuario,
  aoEditar,
  aoExcluir,
  aoConfirmarTomada
}) {
  const [expandido, setExpandido] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const confirmacaoEmAndamento = useRef(false)

  const confirmado = Boolean(medicamento.confirmado)
  const atrasado = !confirmado &&
    medicamento.status === 'ATRASADO'

  const IconeDosagem = obterIconeDosagem(
    medicamento.tipo_dosagem
  )

  const horarioProgramado = medicamento.horario_programado

  const horarioValido = horarioProgramado &&
    !Number.isNaN(new Date(horarioProgramado).getTime())

  const liberado = horarioValido &&
    Date.now() >=
      new Date(horarioProgramado).getTime() - 30 * 60 * 1000

  async function confirmarTomada() {
    if (
      confirmacaoEmAndamento.current ||
      confirmado ||
      !liberado
    ) return

    if (!medicamento.id_receita_medica || !idUsuario) {
      toast.error('Dados da receita ou do paciente indisponíveis.')
      return
    }

    confirmacaoEmAndamento.current = true
    setConfirmando(true)

    try {
      await confirmarIngestaoMedicamento(
        medicamento.id_receita_medica,
        idUsuario,
        horarioProgramado
      )

      toast.success('Tomada registrada com sucesso!')
      setExpandido(false)

      await aoConfirmarTomada?.()
    } catch (erro) {
      toast.error('Não foi possível registrar a tomada.', {
        description: erro.message
      })
    } finally {
      confirmacaoEmAndamento.current = false
      setConfirmando(false)
    }
  }

  return (
    <article className="remedio medtime-card">

      <button
        type="button"
        className="cabecalho-medicamento medtime-card-toggle"
        onClick={() => setExpandido(!expandido)}
        aria-expanded={expandido}
        aria-label={`${medicamento.nome}, ${medicamento.proximo_horario}. ${expandido ? 'Recolher' : 'Expandir'} detalhes`}
      >

        <div className="info-esquerda">
          <div className="medtime-card-icone">
            <IconeDosagem
              className="icone-tipo-dosagem"
              size={24}
              strokeWidth={2}
              aria-hidden="true"
            />
          </div>

          <div className="nome-quantidade">
            <span>{medicamento.nome}</span>
            <p>Dose: {medicamento.quantidade_dose}</p>
          </div>
        </div>

        <div className="tempo-remedio">
          <strong className="medtime-card-horario">
            {medicamento.proximo_horario}
          </strong>

          <p>Horário previsto</p>

          {confirmado ? (
            <span className="status-tomada">
              <Check size={14} aria-hidden="true" />
              Tomada registrada
            </span>
          ) : atrasado ? (
            <span className="status-atrasado">
              <AlertCircle size={14} aria-hidden="true" />
              Atrasado
            </span>
          ) : (
            <span className="status-programado">
              <Clock3 size={14} aria-hidden="true" />
              Programado
            </span>
          )}
        </div>

        <ChevronDown
          className={`medtime-card-seta ${expandido ? 'expandida' : ''}`}
          size={20}
          aria-hidden="true"
        />
      </button>

      {!confirmado && (
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
      )}

      {expandido && (
        <div className="confirmacao-tomada">
          {confirmado ? (
            <p className="tomada-confirmada">
              <Check size={18} aria-hidden="true" />
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

    </article>
  )
}

export default CardMedicamento
