
import { buscarAgendaMedicamentos } from './api.js'

export async function buscarProximoMedicamento(idUsuario, token) {
    if (!idUsuario) return null

    const agora = new Date()
    const limiteDias = 7

    for (let dia = 0; dia <= limiteDias; dia++) {
        const dataConsulta = new Date(agora)
        dataConsulta.setDate(agora.getDate() + dia)

        const dataFormatada = [
            dataConsulta.getFullYear(),
            String(dataConsulta.getMonth() + 1).padStart(2, '0'),
            String(dataConsulta.getDate()).padStart(2, '0')
        ].join('-')

        const agenda = await buscarAgendaMedicamentos(
            idUsuario,
            dataFormatada,
            token
        )

        const proximasDoses = agenda
            .filter((medicamento) => {
                const horario = new Date(
                    medicamento.horario_programado.replace(' ', 'T')
                )

                return (
                    !Number.isNaN(horario.getTime()) &&
                    horario > agora &&
                    !medicamento.confirmado
                )
            })
            .sort((a, b) =>
                a.horario_programado.localeCompare(
                    b.horario_programado
                )
            )

        if (proximasDoses.length > 0) {
            console.log(
                '✅ Próximo medicamento encontrado:',
                proximasDoses[0]
            )

            return proximasDoses[0]
        }
    }
    console.log(
        `Nenhuma dose futura encontrada para o usuário ${idUsuario}`
    )
    return null
}
