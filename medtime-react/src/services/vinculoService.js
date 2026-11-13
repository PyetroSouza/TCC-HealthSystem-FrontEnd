
const BASE_URL = 'http://localhost:8080/v1/healthSystem/medtime'

async function requisicaoAutenticada(caminho, token, opcoes = {}) {
  if (!token) {
    throw new Error('Usuário não autenticado.')
  }

  let resposta

  try {
    resposta = await fetch(`${BASE_URL}${caminho}`, {
      ...opcoes,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...opcoes.headers
      }
    })
  } catch {
    throw new Error('Não foi possível conectar ao servidor.')
  }

  const resultado = await resposta.json().catch(() => null)

  if (!resposta.ok) {
    const erro = new Error(
      resultado?.message || `Erro HTTP ${resposta.status}`
    )

    erro.status = resposta.status
    throw erro
  }

  return resultado
}

// Cuidador: gera um código temporário
export async function gerarCodigoVinculo(token) {
  const resultado = await requisicaoAutenticada(
    '/codigo_vinculo/gerar',
    token,
    { method: 'POST' }
  )

  return resultado.response
}

// Paciente: valida o código informado
export async function validarCodigoVinculo(token, codigo) {
  const resultado = await requisicaoAutenticada(
    '/codigo_vinculo/validar',
    token,
    {
      method: 'POST',
      body: JSON.stringify({ codigo: String(codigo) })
    }
  )

  return resultado.response
}

// Cuidador: consulta seus pacientes
export async function buscarMeusPacientes(token) {
  try {
    const resultado = await requisicaoAutenticada(
      '/vinculo_paciente/meus_pacientes',
      token
    )

    return resultado.response?.vinculo_paciente ?? []
  } catch (erro) {
    // O backend atual responde 404 quando não há vínculos.
    if (
      erro.status === 404 &&
      erro.message === 'Não foram encontrados dados para retorno'
    ) {
      return []
    }

    throw erro
  }
}

// Paciente: consulta o cuidador vinculado
export async function buscarMeuCuidador(token) {
  try {
    const resultado = await requisicaoAutenticada(
      '/vinculo_paciente/meu_cuidador',
      token
    )

    return resultado.response?.vinculo_paciente ?? []
  } catch (erro) {
    if (
      erro.status === 404 &&
      erro.message === 'Não foram encontrados dados para retorno'
    ) {
      return []
    }

    throw erro
  }
}
