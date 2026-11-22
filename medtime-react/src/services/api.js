
import { API_URL } from '../config.js'

export async function buscarUnidadesMedida(token) {
  if (!token) throw new Error('Sessão não autenticada.')

  const resposta = await fetch(`${API_URL}/unidade_medida`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!resposta.ok) {
    throw new Error('Erro ao buscar unidades de medida')
  }

  const dados = await resposta.json()
  return dados.response.unidade_medida
}

export async function buscarTiposDosagem(token) {
  if (!token) throw new Error('Sessão não autenticada.')

  const resposta = await fetch(`${API_URL}/tipo_dosagem`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!resposta.ok) {
    throw new Error('Erro ao buscar tipos de dosagem')
  }

  const dados = await resposta.json()
  return dados.response.tipo_dosagem
}


export async function cadastrarMedicamentoAPI(dadosMedicamento) {
  const resposta = await fetch(`${API_URL}/medicamento`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dadosMedicamento)
  })

  const resultado = await resposta.json()

  if (!resposta.ok || resultado.status === false) {
    throw new Error(
      resultado.field?.join(', ') ||
      resultado.message ||
      'Erro ao cadastrar medicamento'
    )
  }

  return resultado
}


export async function buscarTiposIntervalo(token) {
  if (!token) throw new Error('Sessão não autenticada.')

  const resposta = await fetch(`${API_URL}/tipo_intervalo`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!resposta.ok) {
    throw new Error('Erro ao buscar intervalos')
  }

  const dados = await resposta.json()
  return dados.response.tipoIntervalo
}


export async function cadastrarMedicamentoCompleto(
  idPaciente,
  payload,
  token
) {
  if (!token) {
    throw new Error('Sessão não autenticada.')
  }

  if (!Number.isSafeInteger(Number(idPaciente)) ||
    Number(idPaciente) <= 0) {
    throw new Error('Paciente inválido.')
  }

  const resposta = await fetch(
    `${API_URL}/cadastro_medicamento/${idPaciente}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    }
  )

  const resultado = await resposta.json().catch(() => null)

  if (!resposta.ok || resultado?.status === false) {
    throw new Error(
      resultado?.field?.join(', ') ||
      resultado?.message ||
      'Não foi possível cadastrar o medicamento.'
    )
  }

  return resultado
}



export async function buscarAgendaMedicamentos(idUsuario, data, token) {
  if (!token) {
    throw new Error('Sessão não autenticada.')
  }

  const fuso = Intl.DateTimeFormat().resolvedOptions().timeZone

  const parametros = new URLSearchParams({
    data,
    fuso
  })

  const resposta = await fetch(
    `${API_URL}/agenda_medicamento/${idUsuario}?${parametros}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  const resultado = await resposta.json().catch(() => null)

  if (!resposta.ok || resultado?.status === false) {
    throw new Error(
      resultado?.message || 'Erro ao buscar a agenda.'
    )
  }

  return resultado?.response?.agenda ?? []
}


export async function buscarUsuarios() {
  const resposta = await fetch(`${API_URL}/usuario`)

  const resultado = await resposta.json()

  if (!resposta.ok) {
    throw new Error(resultado.message || 'Erro ao buscar usuários')
  }

  return resultado.response.usuario
}

export async function buscarReceitaMedica(idReceita) {
  const resposta = await fetch(
    `${API_URL}/receita_medica/${idReceita}`
  )

  const resultado = await resposta.json()

  if (!resposta.ok) {
    throw new Error(
      resultado.message || 'Erro ao buscar receita médica'
    )
  }

  return resultado.response.receita_medica[0] ?? null
}
export async function atualizarMedicamentoAPI(idMedicamento, dados) {
  const resposta = await fetch(
    `${API_URL}/medicamento/${idMedicamento}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dados)
    }
  )

  const resultado = await resposta.json()

  if (!resposta.ok || resultado.status === false) {
    throw new Error(
      resultado.message || 'Erro ao atualizar medicamento'
    )
  }

  return resultado
}

export async function atualizarReceitaMedicaAPI(idReceita, dados) {
  const resposta = await fetch(`${API_URL}/receita_medica/${idReceita}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dados)
  })

  const resultado = await resposta.json()

  if (!resposta.ok || resultado.status === false) {
    throw new Error(
      resultado.message || 'Erro ao atualizar a receita médica'
    )
  }

  return resultado
}



export async function atualizarEstoqueAPI(
  idReceitaMedica,
  idPaciente,
  quantidade,
  token
) {
  return editarMedicamentoCompleto(
    idReceitaMedica,
    idPaciente,
    {
      estoque: {
        quantidade_em_estoque: Number(quantidade)
      }
    },
    token
  )
}



export async function buscarProgramacaoPorReceita(idReceitaMedica) {
  const resposta = await fetch(
    `${API_URL}/programacao_medicamento/${idReceitaMedica}`
  )

  const dados = await resposta.json()

  if (!resposta.ok || !dados.status) {
    throw new Error(dados.message || 'Erro ao buscar programação')
  }

  return dados.response?.programacao_medicamento ?? []
}

export async function editarMedicamentoCompleto(
  idReceitaMedica,
  idPaciente,
  payload,
  token
) {
  if (!token) {
    throw new Error('Sessão não autenticada.')
  }

  if (!idReceitaMedica || !idPaciente) {
    throw new Error('Receita ou paciente não identificado.')
  }

  const resposta = await fetch(
    `${API_URL}/editar_medicamento/${idReceitaMedica}/${idPaciente}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    }
  )

  const resultado = await resposta.json().catch(() => null)

  if (!resposta.ok || resultado?.status === false) {
    throw new Error(
      resultado?.message ||
      `Erro ao editar medicamento (${resposta.status}).`
    )
  }

  return resultado
}



export async function confirmarIngestaoMedicamento(
  idReceitaMedica,
  horarioProgramado,
  token
) {
  if (!token) {
    throw new Error('Sessão não autenticada.')
  }

  if (!idReceitaMedica || !horarioProgramado) {
    throw new Error('Dados da tomada incompletos.')
  }

  const resposta = await fetch(
    `${API_URL}/historico_medicamento/confirmar_ingestao/${idReceitaMedica}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        horario_programado: horarioProgramado
      })
    }
  )

  const resultado = await resposta.json().catch(() => null)

  if (!resposta.ok || resultado?.status === false) {
    const campo = Array.isArray(resultado?.field)
      ? resultado.field.join(', ')
      : null

    throw new Error(
      resultado?.message
        ? `${resultado.message}${campo ? ` (${campo})` : ''}`
        : `Não foi possível confirmar a tomada (${resposta.status}).`
    )
  }

  return resultado
}



export async function excluirMedicamentoCompleto(
  idReceitaMedica,
  idUsuario,
  token
) {
  if (!token) {
    throw new Error('Sessão não autenticada.')
  }

  if (!idReceitaMedica || !idUsuario) {
    throw new Error('Receita ou paciente não identificado.')
  }

  const resposta = await fetch(
    `${API_URL}/excluir_medicamento/${idReceitaMedica}/${idUsuario}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  if (resposta.status === 204) {
    return true
  }

  const resultado = await resposta.json().catch(() => null)

  if (!resposta.ok || resultado?.status === false) {
    throw new Error(
      resultado?.message ||
      `Não foi possível excluir o medicamento (${resposta.status}).`
    )
  }

  return true
}


export async function buscarHistoricoMedicamentos(idPaciente, token) {
  if (!token) {
    throw new Error('Sessão não autenticada.')
  }

  if (!idPaciente) {
    throw new Error('Paciente não identificado.')
  }

  const resposta = await fetch(
    `${API_URL}/historico_medicamento/usuario/${idPaciente}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  const resultado = await resposta.json().catch(() => null)

  if (resposta.status === 404) {
    return []
  }

  if (!resposta.ok || resultado?.status === false) {
    throw new Error(
      resultado?.message || 'Erro ao buscar o histórico.'
    )
  }

  return resultado?.response?.historico_medicamento ?? []
}




export async function buscarTodasReceitasMedicas() {
  const resposta = await fetch(`${API_URL}/receita_medica`)
  const resultado = await resposta.json()

  if (!resposta.ok || resultado.status === false) {
    throw new Error(
      resultado.message || 'Erro ao buscar medicamentos.'
    )
  }

  return resultado.response?.receita_medica ?? []
}

export async function buscarReceitasDoPaciente(idPaciente, token) {
  if (!token) {
    throw new Error('Sessão não autenticada.')
  }

  if (!Number.isSafeInteger(Number(idPaciente)) ||
    Number(idPaciente) <= 0) {
    throw new Error('Paciente inválido.')
  }

  const resposta = await fetch(
    `${API_URL}/receita_medica/usuario/${idPaciente}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  const resultado = await resposta.json()

  if (!resposta.ok || resultado.status === false) {
    throw new Error(
      resultado.message || 'Erro ao buscar receitas médicas.'
    )
  }

  return resultado.response?.receita_medica ?? []
}
