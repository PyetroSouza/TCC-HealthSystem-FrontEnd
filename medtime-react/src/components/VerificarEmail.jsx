
import { useState } from 'react'
import { toast } from 'sonner'

import {
  cadastrarUsuarioAPI,
  solicitarCodigoVerificacao
} from '../services/authService.js'

export default function VerificarEmail({
  dadosCadastro,
  aoVoltar,
  aoConcluir
}) {
  const [codigo, setCodigo] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [reenviando, setReenviando] = useState(false)

  async function confirmarCadastro(evento) {
    evento.preventDefault()

    if (!/^\d{6}$/.test(codigo)) {
      toast.warning('Digite um código de 6 dígitos.')
      return
    }

    try {
      setCarregando(true)

      await cadastrarUsuarioAPI({
        ...dadosCadastro,
        codigo
      })

      toast.success('Conta criada com sucesso!')
      aoConcluir()
    } catch (erro) {
      toast.error(erro.message || 'Erro ao confirmar cadastro.')
    } finally {
      setCarregando(false)
    }
  }

  async function reenviarCodigo() {
    if (reenviando) return

    try {
      setReenviando(true)

      await solicitarCodigoVerificacao(dadosCadastro.email)

      setCodigo('')
      toast.success('Novo código enviado!')
    } catch (erro) {
      toast.error(erro.message || 'Erro ao reenviar código.')
    } finally {
      setReenviando(false)
    }
  }

  return (
    <main className="verificacao-email">
      <form onSubmit={confirmarCadastro}>
        <h1>Verifique seu e-mail</h1>

        <p>
          Enviamos um código de verificação para:
        </p>

        <strong>{dadosCadastro.email}</strong>

        <label htmlFor="codigo-verificacao">
          Código de verificação
        </label>

        <input
          id="codigo-verificacao"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={codigo}
          onChange={(evento) => {
            setCodigo(
              evento.target.value.replace(/\D/g, '').slice(0, 6)
            )
          }}
          placeholder="000000"
          required
        />

        <p>O código é válido por 10 minutos.</p>

        <button
          type="submit"
          disabled={carregando || codigo.length !== 6}
        >
          {carregando ? 'Verificando...' : 'Confirmar cadastro'}
        </button>

        <button
          type="button"
          onClick={reenviarCodigo}
          disabled={reenviando || carregando}
        >
          {reenviando ? 'Enviando...' : 'Reenviar código'}
        </button>

        <button
          type="button"
          onClick={aoVoltar}
          disabled={carregando}
        >
          Voltar ao cadastro
        </button>
      </form>
    </main>
  )
}
