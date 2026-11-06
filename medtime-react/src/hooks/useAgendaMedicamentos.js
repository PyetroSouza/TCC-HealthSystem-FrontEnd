
import { useEffect, useState, useCallback } from 'react'
import { buscarAgendaMedicamentos } from '../services/api.js'

export function useAgendaMedicamentos(idUsuario, dataConsulta) {
    const [agenda, setAgenda] = useState([])
    const [carregandoAgenda, setCarregandoAgenda] = useState(false)
    const [erroAgenda, setErroAgenda] = useState(null)

    const carregarAgenda = useCallback(async () => {
        if (!idUsuario) {
            setAgenda([])
            setErroAgenda(null)
            setCarregandoAgenda(false)
            return
        }

        setCarregandoAgenda(true)
        setErroAgenda(null)

        try {
            const hoje = new Date()

            const dataLocal = [
                hoje.getFullYear(),
                String(hoje.getMonth() + 1).padStart(2, '0'),
                String(hoje.getDate()).padStart(2, '0')
            ].join('-')

            const medicamentosAPI = await buscarAgendaMedicamentos(
                idUsuario,
                dataConsulta || dataLocal
            )

            setAgenda(medicamentosAPI)

        } catch (erro) {
            console.error('Erro ao carregar agenda:', erro)

            setAgenda([])
            setErroAgenda(erro.message || 'Erro ao carregar agenda')

        } finally {
            setCarregandoAgenda(false)
        }
    }, [idUsuario, dataConsulta])

    useEffect(() => {
        carregarAgenda()
    }, [carregarAgenda])

    return {
        agenda,
        carregandoAgenda,
        erroAgenda,
        recarregarAgenda: carregarAgenda
    }
}
