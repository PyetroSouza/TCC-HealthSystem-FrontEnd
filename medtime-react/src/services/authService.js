
const API_URL = 'http://localhost:8080/v1/healthSystem/medtime'

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
