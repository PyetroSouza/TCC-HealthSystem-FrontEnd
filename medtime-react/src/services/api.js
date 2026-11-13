
const API_URL = 'http://localhost:8080/v1/healthSystem/medtime'

export async function buscarUnidadesMedida() {
  const resposta = await fetch(`${API_URL}/unidade_medida`)

  if (!resposta.ok) {
    throw new Error('Erro ao buscar unidades de medida')
  }

  const dados = await resposta.json()
  return dados.response.unidade_medida
}

export async function buscarTiposDosagem() {
  const resposta = await fetch(`${API_URL}/tipo_dosagem`)

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


export async function buscarTiposIntervalo() {
  const resposta = await fetch(`${API_URL}/tipo_intervalo`)

  if (!resposta.ok) {
    throw new Error('Erro ao buscar intervalos')
  }

  const dados = await resposta.json()
  return dados.response.tipoIntervalo
}

export async function cadastrarMedicamentoCompleto(payload) {
  const resposta = await fetch(
    `${API_URL}/cadastro_medicamento`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }
  )

  const resultado = await resposta.json()

  if (!resposta.ok) {
    console.error('❌ Erros retornados pela API:', resultado)

    throw new Error(
      resultado.field?.join(', ') ||
      resultado.message ||
      'Não foi possível cadastrar o medicamento'
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
  console.log('📨 Resposta completa do PUT:', resultado)

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


export async function atualizarEstoqueAPI(idEstoque, dados) {

  const resposta = await fetch(`${API_URL}/estoque/${idEstoque}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dados)
  })

  const resultado = await resposta.json()

  if (!resposta.ok || resultado.status === false) {
    throw new Error(
      resultado.message || 'Erro ao atualizar o estoque'
    )
  }

  return resultado
}


export async function buscarProgramacaoPorReceita(idReceitaMedica) {
  const resposta = await fetch(
    `http://localhost:8080/v1/healthSystem/medtime/programacao_medicamento/${idReceitaMedica}`
  )

  const dados = await resposta.json()

  if (!resposta.ok || !dados.status) {
    throw new Error(dados.message || 'Erro ao buscar programação')
  }

  return dados.response?.programacao_medicamento ?? []
}

export async function editarMedicamentoCompleto(
  idReceitaMedica,
  idUsuario,
  payload
) {
  const resposta = await fetch(
    `http://localhost:8080/v1/healthSystem/medtime/editar_medicamento/${idReceitaMedica}/${idUsuario}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }
  )

  const dados = await resposta.json()

  if (!resposta.ok || !dados.status) {
    throw new Error(dados.message || 'Erro ao editar medicamento')
  }

  return dados
}

export async function confirmarIngestaoMedicamento(
  idReceitaMedica,
  idUsuario,
  horarioProgramado
) {
  const resposta = await fetch(
    `http://localhost:8080/v1/healthSystem/medtime/historico_medicamento/confirmar_ingestao/${idReceitaMedica}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id_usuario: idUsuario,
        horario_programado: horarioProgramado
      })
    }
  )

  const resultado = await resposta.json()


  if (!resposta.ok || resultado.status === false) {
    if (resultado.field?.includes('ESTOQUE_INSUFICIENTE')) {
      throw new Error(
        'Estoque insuficiente para a dose programada. Verifique a quantidade disponível no Controle de Estoque.'
      )
    }

    const campo = resultado.field?.join(', ')

    throw new Error(
      campo
        ? `${resultado.message} (${campo})`
        : resultado.message || 'Não foi possível confirmar a tomada.'
    )
  }


  return resultado
}

export async function excluirMedicamentoCompleto(
  idReceitaMedica,
  idUsuario
) {
  const resposta = await fetch(
    `http://localhost:8080/v1/healthSystem/medtime/excluir_medicamento/${idReceitaMedica}/${idUsuario}`,
    {
      method: 'DELETE'
    }
  )

  if (resposta.status === 204) {
    return true
  }

  const resultado = await resposta.json().catch(() => null)

  if (!resposta.ok || resultado?.status === false) {
    throw new Error(
      resultado?.message || 'Não foi possível excluir o medicamento.'
    )
  }

  return true
}

export async function buscarHistoricoMedicamentos(idUsuario) {
  const resposta = await fetch(
    `${API_URL}/historico_medicamento/usuario/${idUsuario}`
  )

  const resultado = await resposta.json()

  if (!resposta.ok || resultado.status === false) {
    throw new Error(
      resultado.message || 'Erro ao buscar o histórico'
    )
  }

  return resultado.response?.historico_medicamento ?? []
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


