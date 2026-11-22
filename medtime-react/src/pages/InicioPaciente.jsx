
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import VincularCuidador from '../components/vinculo/VincularCuidador.jsx'
import { buscarMeuCuidador } from '../services/vinculoService.js'

export default function InicioPaciente({ token }) {
  const [vinculos, setVinculos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  const carregarCuidador = useCallback(async () => {
    if (!token) return

    setCarregando(true)
    setErro(null)

    try {
      const resultado = await buscarMeuCuidador(token)
      setVinculos(resultado)
    } catch (erro) {
      setErro(erro.message)
      toast.error('Não foi possível consultar seu cuidador.')
    } finally {
      setCarregando(false)
    }
  }, [token])

  useEffect(() => {
    const timer = setTimeout(() => {
      carregarCuidador()
    }, 0)

    return () => clearTimeout(timer)
  }, [carregarCuidador])

  const cuidadorVinculado = vinculos[0] ?? null

  return (
    <section className="inicio-paciente">
      <h1>Minha saúde</h1>
      <p>Bem-vindo ao seu espaço no MedTime.</p>

      {carregando && (
        <p>Consultando seu cuidador...</p>
      )}

      {!carregando && erro && (
        <div>
          <p role="alert">{erro}</p>
          <button
            type="button"
            onClick={carregarCuidador}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!carregando && !erro && cuidadorVinculado && (
        <div className="vinculo-painel">
          <h2>Meu cuidador</h2>
          <p>Você já possui um cuidador vinculado.</p>

          <p>
            Identificador do cuidador:{' '}
            <strong>{cuidadorVinculado.id_cuidador}</strong>
          </p>
        </div>
      )}

      {!carregando && !erro && !cuidadorVinculado && (
        <VincularCuidador
          token={token}
          aoVincular={carregarCuidador}
        />
      )}
    </section>
  )
}
