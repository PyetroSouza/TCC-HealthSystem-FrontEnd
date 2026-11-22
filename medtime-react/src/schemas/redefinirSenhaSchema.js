import { z } from 'zod'

export const redefinirSenhaSchema = z.object({
    novaSenha: z.string()
        .min(1, 'Informe sua nova senha')
        .max(70, 'A senha deve ter no máximo 70 caracteres'),

    confirmarSenha: z.string()
        .min(1, 'Confirme sua nova senha')
}).refine((dados) => dados.novaSenha === dados.confirmarSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmarSenha']
})