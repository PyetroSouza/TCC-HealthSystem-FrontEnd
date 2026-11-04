export function montarPayloadMedicamento(medicamento, idUsuario) {
    const hoje = new Date()
    const data = [
        hoje.getFullYear(),
        String(hoje.getMonth() + 1).padStart(2, '0'),
        String(hoje.getDate()).padStart(2, '0')
    ].join('-')

    const dataHoraInicio = new Date(
        `${data}T${medicamento.proximo_horario}:00`
    )
    
    if (Number.isNaN(dataHoraInicio.getTime())) {
        throw new Error('Data ou horário inicial inválido')
    }

    return {
        medicamento: {
            nome: medicamento.nome,
            imagem: medicamento.imagem,
            concentracao: medicamento.concentracao,
            id_unidade_medida_embalagem:
                medicamento.id_unidade_medida_embalagem,
            id_tipo_dosagem: medicamento.id_tipo_dosagem
        },

        receita_medica: {
            id_usuario: idUsuario,
            dosagem: medicamento.quantidade_dose,
            id_unidade_medida: medicamento.id_unidade_medida_dose,
            descricao: medicamento.descricao?.trim() || 'Sem observações'
        },

        programacao_medicamento: {
            frequencia: medicamento.frequencia,
            data_hora_inicio: dataHoraInicio.toISOString(),
            id_tipo_intervalo: medicamento.id_tipo_intervalo
        },

        estoque: {
            quantidade_em_estoque: Number(medicamento.quantidade)
        }
    }
}


