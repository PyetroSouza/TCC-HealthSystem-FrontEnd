
const API_URL = 'http://localhost:8080/v1/healthSystem/medtime'

export async function apiRequest(
  caminho,
  { token, headers, ...opcoes } = {}
) {
  const cabecalhos = new Headers(headers)

  if (token) {
    cabecalhos.set('Authorization', `Bearer ${token}`)
  }

  if (opcoes.body && !(opcoes.body instanceof FormData)) {
    if (!cabecalhos.has('Content-Type')) {
      cabecalhos.set('Content-Type', 'application/json')
    }
  }

  let resposta

  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      ...opcoes,
      headers: cabecalhos
    })
  } catch {
    throw new Error('Não foi possível conectar ao servidor.')
  }

  const resultado = await resposta.json().catch(() => null)

  if (!resposta.ok || resultado?.status === false) {
    const erro = new Error(
      resultado?.message ||
      `Erro na requisição (${resposta.status})`
    )

    erro.status = resposta.status
    throw erro
  }

  return resultado
}
