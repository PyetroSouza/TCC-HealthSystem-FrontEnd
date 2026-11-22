
export function montarMedicamento(dados, pacienteId, urlImagem) {
  return {
    id_medicamento: crypto.randomUUID(),
    id_paciente: pacienteId,

    nome: dados.nome,
    imagem: urlImagem,

    concentracao: Number(
      String(dados.concentracao).replace(',', '.')
    ),

    id_unidade_medida_embalagem: Number(dados.unidadeConcentracao),


    quantidade_dose: Number(
      String(dados.dose).replace(',', '.')
    ),
    frequencia: Number(dados.frequencia),
    id_tipo_dosagem: Number(dados.tipoDosagem),
    id_tipo_intervalo: Number(dados.intervalo),
    id_unidade_medida_dose: Number(dados.unidadeDose),
    proximo_horario: dados.horario,

    quantidade: Number(
      String(dados.quantidade).replace(',', '.')
    ),
    descricao: dados.descricao
  }
}
