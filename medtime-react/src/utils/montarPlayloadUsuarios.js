
export function montarPayloadUsuario(dados) {
    return {
        nome: dados.nome.trim(),
        email: dados.email.trim().toLowerCase(),
        senha: dados.senha,
        cpf: dados.cpf?.trim() || null,
        data_nascimento: dados.data_nascimento
    }
}
