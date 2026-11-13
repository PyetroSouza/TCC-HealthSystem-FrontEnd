
import { useState } from 'react'
import { toast } from 'sonner'
import { gerarCodigoVinculo } from '../../services/vinculoService.js'
import './Vinculo.css'

export default function GerarCodigoVinculo({ token }) {
  const [dadosCodigo, setDadosCodigo] = useState(null)
  const [carregando, setCarregando] = useState(false)

  async function gerarCodigo() {
    if (!token || carregando) return

    setCarregando(true)
    setDadosCodigo(null)

    try {
      const resultado = await gerarCodigoVinculo(token)
      setDadosCodigo(resultado)
      toast.success('Código gerado com sucesso!')
    } catch (erro) {
      toast.error(erro.message)
    } finally {
      setCarregando(false)
    }
  }

  async function copiarCodigo() {
    if (!dadosCodigo?.codigo) return

    try {
      await navigator.clipboard.writeText(dadosCodigo.codigo)
      toast.success('Código copiado!')
    } catch {
      toast.error('Não foi possível copiar o código.')
    }
  }

  return (
    <section className="vinculo-painel">
      <h2>Vincular paciente</h2>

      <p>
        Gere um código temporário e compartilhe com o
        paciente que deseja acompanhar.
      </p>

      <button
        type="button"
        onClick={gerarCodigo}
        disabled={carregando || !token}
      >
        {carregando ? 'Gerando...' : 'Gerar código'}
      </button>

      {dadosCodigo?.codigo && (
        <div>
          <h3>Código de vínculo</h3>
          <strong>{dadosCodigo.codigo}</strong>

          <p>
            Válido até:{' '}
            {new Date(
              dadosCodigo.data_expiracao
            ).toLocaleTimeString('pt-BR')}
          </p>

          <button type="button" onClick={copiarCodigo}>
            Copiar código
          </button>
        </div>
      )}
    </section>
  )
}
