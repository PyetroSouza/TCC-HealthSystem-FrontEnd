
import { z } from 'zod'

export const cadastroUsuarioSchema = z.object({
    nome: z.string()
        .min(1, 'Informe seu nome')
        .max(80, 'O nome deve ter no máximo 80 caracteres'),

    email: z.email('Informe um e-mail válido')
        .max(255, 'O e-mail deve ter no máximo 255 caracteres'),

    senha: z.string()
        .min(1, 'Informe uma senha')
        .max(70, 'A senha deve ter no máximo 70 caracteres'),

    confirmarSenha: z.string()
        .min(1, 'Confirme sua senha'),

    cpf: z.string()
        .max(20, 'O CPF deve ter no máximo 20 caracteres')
        .optional(),

    telefone: z.string()
        .max(20, 'O telefone deve ter no máximo 20 caracteres')
        .optional(),

    data_nascimento: z.iso.date({
        error: 'Informe uma data de nascimento válida'
    }),

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
