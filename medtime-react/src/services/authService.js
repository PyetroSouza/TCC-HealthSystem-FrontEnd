
import { API_URL } from '../config.js'

export async function cadastrarUsuarioAPI(dados) {
    let resposta

    try {
        resposta = await fetch(`${API_URL}/usuario`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        })
    } catch {
        throw new Error(
            'Não foi possível conectar ao servidor do MedTime.'
        )
    }

    const texto = await resposta.text()

    let resultado = null

    if (texto) {
        try {
            resultado = JSON.parse(texto)
        } catch {
            throw new Error(
                'O servidor retornou uma resposta inválida.'
            )
        }
    }

    // Algumas APIs retornam HTTP 200 com status: false.
    if (!resposta.ok || resultado?.status === false) {
        const mensagem =
            resultado?.message ||
            resultado?.mensagem ||
            resultado?.error ||
            'Não foi possível cadastrar o usuário.'

        throw new Error(
            typeof mensagem === 'string'
                ? mensagem
                : 'Verifique os dados informados.'
        )
    }

    return resultado
}


export async function entrarUsuarioAPI(dados) {
    let resposta
  
    try {
      resposta = await fetch(`${API_URL}/usuario/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: dados.email.trim().toLowerCase(),
          senha: dados.senha
        })
      })
    } catch {
      throw new Error('Não foi possível conectar ao servidor do MedTime.')
    }
  
    const resultado = await resposta.json().catch(() => null)
  
    if (!resposta.ok) {
      if (resposta.status === 401) {
        throw new Error('E-mail ou senha inválidos.')
      }
  
      if (resposta.status === 403) {
        throw new Error('Sua conta está inativa ou sem acesso autorizado.')
      }
  
      throw new Error(
        resultado?.message || 'Não foi possível realizar o login.'
      )
    }
  
    if (!resultado?.id || !resultado?.jwt) {
      throw new Error('O servidor retornou dados de autenticação incompletos.')
    }
  
    return resultado
  }
  

export async function solicitarCodigoVerificacao(email) {
  const response = await fetch(
    `${API_URL}/codigo_verificacao_email/gerar`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase()
      })
    }
  )

  const resultado = await response.json()

  if (!response.ok || resultado.status === false) {
    throw new Error(
      resultado.message ||
        'Não foi possível enviar o código de verificação.'
    )
  }

  return resultado
}

const URL_RECUPERACAO =
  `${API_URL}/codigo_verificacao_email`

export async function solicitarCodigoRecuperacao(email) {
  const resposta = await fetch(
    `${URL_RECUPERACAO}/redefinir_senha/gerar`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase()
      })
    }
  )

  const resultado = await resposta.json()

  if (!resposta.ok || resultado.status === false) {
    throw new Error(
      resultado.message ||
      'Não foi possível solicitar a recuperação de senha.'
    )
  }

  return resultado
}

export async function redefinirSenhaAPI({
  email,
  codigo,
  novaSenha
}) {
  const resposta = await fetch(
    `${URL_RECUPERACAO}/redefinir_senha`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        codigo,
        nova_senha: novaSenha
      })
    }
  )

  const resultado = await resposta.json()

  if (!resposta.ok || resultado.status === false) {
    throw new Error(
      resultado.message ||
      'Não foi possível redefinir a senha.'
    )
  }

  return resultado
}

export async function entrarComGoogleAPI(tokenGoogle) {
  const resposta = await fetch(
    `${API_URL}/usuario/google/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: tokenGoogle
      })
    }
  )

  const resultado = await resposta.json().catch(() => null)

  if (!resposta.ok || resultado?.status === false) {
    throw new Error(
      resultado?.message || 'Erro ao entrar com Google.'
    )
  }

  if (resultado?.response?.cadastro_necessario) {
    return {
      cadastroNecessario: true,
      dadosGoogle: {
        nome: resultado.response.nome,
        email: resultado.response.email,
        foto: resultado.response.foto
      }
    }
  }

  const usuario = resultado?.response

  if (!usuario?.id || !usuario?.jwt) {
    throw new Error('Resposta de autenticação incompleta.')
  }

  return {
    cadastroNecessario: false,
    usuario
  }
}

export async function atualizarPerfilAPI(id, token, dados) {
  const resposta = await fetch(`${API_URL}/usuario/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      usuario: dados
    })
  })

  const resultado = await resposta.json().catch(() => null)

  if (!resposta.ok || resultado?.status === false) {
    throw new Error(resultado?.message || 'Erro ao atualizar perfil.')
  }

  return resultado
}


export async function cadastrarUsuarioGoogleAPI(dados) {
  let resposta

  try {
    resposta = await fetch(
      `${API_URL}/usuario/google/cadastro`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
      }
    )
  } catch {
    throw new Error(
      'Não foi possível conectar ao servidor do MedTime.'
    )
  }

  const resultado = await resposta.json().catch(() => null)

  if (!resposta.ok || resultado?.status === false) {
    throw new Error(
      resultado?.message ||
      'Não foi possível cadastrar sua conta Google.'
    )
  }

  if (resultado?.response?.login_necessario) {
    throw new Error(
      resultado.response.tipo_login === 'tradicional'
        ? 'Este e-mail já possui uma conta convencional. Entre com sua senha para continuar.'
        : 'Esta conta Google já está cadastrada. Faça login.'
    )
  }

  if (!resultado?.response?.id) {
    throw new Error(
      'O servidor não confirmou a criação da conta Google.'
    )
  }

  return resultado
}
