
import { z } from 'zod'

// Valida números positivos com até duas casas decimais.
const numeroPositivo = (campo, maximo = 999.99) =>
  z.string()
    .trim()
    .min(1, `Informe ${campo}`)
    .regex(
      /^\d+(?:[.,]\d{1,2})?$/,
      `${campo} deve ser um número com até duas casas decimais`
    )
    .refine(
      valor => {
        const numero = Number(valor.replace(',', '.'))
        return numero > 0 && numero <= maximo
      },
      `${campo} deve ser maior que zero e no máximo ${maximo}`
    )

// A quantidade em estoque pode ser zero.
const quantidadeEstoque = z.string()
  .trim()
  .min(1, 'Informe a quantidade em estoque')
  .regex(
    /^\d+(?:[.,]\d{1,2})?$/,
    'Informe uma quantidade com até duas casas decimais'
  )
  .refine(
    valor => {
      const numero = Number(valor.replace(',', '.'))
      return numero >= 0 && numero <= 99999.99
    },
    'A quantidade deve estar entre 0 e 99.999,99'
  )

const idObrigatorio = mensagem =>
  z.string().regex(/^[1-9]\d*$/, mensagem)

// Campos comuns ao cadastro e à edição.
const camposMedicamento = z.object({
  nome: z.string()
    .trim()
    .min(2, 'Informe pelo menos 2 caracteres')
    .max(45, 'Máximo de 45 caracteres')
    .regex(/\p{L}/u, 'O nome deve conter uma letra'),

  dose: numeroPositivo('a dose'),

  unidadeDose: idObrigatorio(
    'Selecione a unidade da dose'
  ),

  tipoDosagem: idObrigatorio(
    'Selecione um tipo de dosagem válido'
  ),

  concentracao: numeroPositivo('a concentração'),

  unidadeConcentracao: idObrigatorio(
    'Selecione a unidade de medida'
  ),

  quantidade: quantidadeEstoque,

  descricao: z.string()
    .trim()
    .max(1000, 'Máximo de 1000 caracteres')
    .optional()
})

// Campos específicos da programação.
const camposProgramacao = {
  frequencia: z.number({
    error: 'Informe a frequência'
  })
    .int('A frequência deve ser um número inteiro')
    .min(1, 'A frequência deve ser maior que zero'),

  intervalo: idObrigatorio(
    'Selecione um intervalo válido'
  )
}

const horarioCadastro = z.string()
  .regex(
    /^([01]\d|2[0-3]):[0-5]\d$/,
    'Informe um horário válido'
  )

const horarioEdicao = z.string()
  .min(1, 'Informe a nova data e hora de início')
  .refine(
    valor => {
      const data = new Date(valor)
      return !Number.isNaN(data.getTime())
    },
    'Informe uma data e hora válidas'
  )
  .refine(
    valor => new Date(valor).getTime() > Date.now(),
    'A nova programação deve começar no futuro'
  )

function validarProgramacao(dados, contexto) {
  // O backend utiliza 1 = horas e 2 = dias.
  if (
    dados.intervalo === '1' &&
    dados.frequencia > 24
  ) {
    contexto.addIssue({
      code: 'custom',
      path: ['frequencia'],
      message: 'O intervalo em horas deve ser de no máximo 24'
    })
  }

  if (!['1', '2'].includes(dados.intervalo)) {
    contexto.addIssue({
      code: 'custom',
      path: ['intervalo'],
      message: 'Selecione horas ou dias'
    })
  }
}

export const medicamentoSchema = camposMedicamento
  .extend({
    ...camposProgramacao,
    horario: horarioCadastro
  })
  .superRefine(validarProgramacao)

export const medicamentoEdicaoSchema = camposMedicamento

export function criarMedicamentoSchema({
  modoEdicao = false,
  alterarProgramacao = false
} = {}) {
  if (!modoEdicao) {
    return medicamentoSchema
  }

  if (!alterarProgramacao) {
    return medicamentoEdicaoSchema
  }

  return camposMedicamento
    .extend({
      ...camposProgramacao,
      horario: horarioEdicao
    })
    .superRefine(validarProgramacao)
}
