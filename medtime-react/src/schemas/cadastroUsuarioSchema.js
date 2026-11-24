import { z } from 'zod'

function cpfValido(cpf) {
  const numeros = cpf.replace(/\D/g, '')
  if (numeros.length === 0) return true
  if (numeros.length !== 11 || /^(\d)\1{10}$/.test(numeros)) return false

  for (let t = 9; t < 11; t++) {
    let soma = 0
    for (let i = 0; i < t; i++) {
      soma += Number(numeros[i]) * (t + 1 - i)
    }
    const digito = ((soma * 10) % 11) % 10
    if (Number(numeros[t]) !== digito) return false
  }
  return true
}

export const cadastroUsuarioSchema = z.object({
  nome: z.string()
    .trim()
    .min(2, 'Informe seu nome completo')
    .max(80, 'O nome deve ter no máximo 80 caracteres'),

  email: z.email('Informe um e-mail válido')
    .max(255, 'O e-mail deve ter no máximo 255 caracteres'),

  senha: z.string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres')
    .max(70, 'A senha deve ter no máximo 70 caracteres'),

  confirmarSenha: z.string()
    .min(1, 'Confirme sua senha'),

  cpf: z.string()
    .max(20, 'O CPF deve ter no máximo 20 caracteres')
    .refine(cpfValido, 'Informe um CPF válido')
    .optional(),

  telefone: z.string()
    .refine(
      (valor) => {
        const numeros = valor.replace(/\D/g, '')
        return numeros.length === 0 || numeros.length === 10 || numeros.length === 11
      },
      { message: 'Informe um telefone válido com DDD' }
    )
    .optional(),

  data_nascimento: z.iso.date({
    error: 'Informe uma data de nascimento válida'
  }).refine((valor) => {
    const data = new Date(`${valor}T00:00:00`)
    const hoje = new Date()
    return data >= new Date('1900-01-01') && data <= hoje
  }, 'Informe uma data de nascimento válida no passado'),

  aceitouTermos: z.literal(true, {
    error: 'É necessário aceitar os Termos de Uso'
  })
}).refine(
  (dados) => dados.senha === dados.confirmarSenha,
  {
    message: 'As senhas não coincidem',
    path: ['confirmarSenha']
  }
)

export const cadastroGoogleSchema =
  cadastroUsuarioSchema.safeExtend({
    senha: z.string().optional(),
    confirmarSenha: z.string().optional()
  })