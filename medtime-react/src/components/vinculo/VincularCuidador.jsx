
import { useState } from 'react'
import { toast } from 'sonner'
import { validarCodigoVinculo } from '../../services/vinculoService.js'
import './Vinculo.css'

export default function VincularCuidador({ token, aoVincular }) {
  const [codigo, setCodigo] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function enviarCodigo(evento) {
    evento.preventDefault()

    if (!/^\d{6}$/.test(codigo)) {
      toast.warning('Informe um código de 6 dígitos.')
      return
    }

    if (!token || carregando) return

    setCarregando(true)

    try {
      const resultado = await validarCodigoVinculo(token, codigo)

      toast.success('Cuidador vinculado com sucesso!')
      setCodigo('')
      aoVincular?.(resultado)
    } catch (erro) {
      toast.error(erro.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <section className="vinculo-painel">
      <h2>Vincular meu cuidador</h2>

      <p>
        Digite o código de 6 dígitos fornecido pelo
        seu cuidador.
      </p>

      <form onSubmit={enviarCodigo}>
        <label htmlFor="codigo-vinculo">
          Código de vínculo
        </label>

        <input
          id="codigo-vinculo"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={codigo}
          placeholder="000000"
          onChange={(evento) => {
            setCodigo(evento.target.value.replace(/\D/g, ''))
          }}
          disabled={carregando}
          required
        />

        <button
          type="submit"
          disabled={carregando || codigo.length !== 6}
        >
          {carregando ? 'Validando...' : 'Vincular cuidador'}
        </button>
      </form>
    </section>
  )
}
