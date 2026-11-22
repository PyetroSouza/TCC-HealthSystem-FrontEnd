export function montarPayloadUsuario(dados, perfil) {
  const roles = {
    cuidador: 1,
    paciente: 2
  }

  const idRole = roles[perfil]

  if (!idRole) {
    throw new Error('Perfil de usuário inválido.')
  }

  return {
    nome: dados.nome.trim(),
    foto: null,
    email: dados.email.trim().toLowerCase(),
    senha: dados.senha,
    cpf: dados.cpf?.trim() || null,
    telefone: dados.telefone?.replace(/\D/g, '') || null,
    data_nascimento: dados.data_nascimento,
    usuario_role: {
      id_role: idRole
    }
  }
}