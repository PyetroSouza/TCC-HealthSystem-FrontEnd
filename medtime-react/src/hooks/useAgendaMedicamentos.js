
import { useCallback, useEffect, useRef, useState } from 'react'
import { buscarAgendaMedicamentos } from '../services/api.js'

const INTERVALO_ATUALIZACAO = 60_000
const INTERVALO_MINIMO = 10_000

function obterDataLocal() {
    const hoje = new Date()

    return [
        hoje.getFullYear(),
        String(hoje.getMonth() + 1).padStart(2, '0'),
        String(hoje.getDate()).padStart(2, '0')
    ].join('-')
}

export function useAgendaMedicamentos(idUsuario, dataConsulta) {
    const [agenda, setAgenda] = useState([])
    const [carregandoAgenda, setCarregandoAgenda] = useState(false)
    const [erroAgenda, setErroAgenda] = useState(null)

    const ultimaRequisicao = useRef(0)
    const ultimaConsultaAutomatica = useRef(0)

    const carregarAgenda = useCallback(async (silencioso = false) => {
        const requisicaoAtual = ++ultimaRequisicao.current

        if (!idUsuario) {
            setAgenda([])
            setErroAgenda(null)
            setCarregandoAgenda(false)
            return
        }

        if (!silencioso) {
            setCarregandoAgenda(true)
            setErroAgenda(null)
        }

        try {
            const data = dataConsulta || obterDataLocal()

            const medicamentosAPI = await buscarAgendaMedicamentos(
                idUsuario,
                data
            )

            // Impede respostas antigas de sobrescrever dados novos
            if (requisicaoAtual !== ultimaRequisicao.current) {
                return
            }

            setAgenda(medicamentosAPI)
            setErroAgenda(null)

        } catch (erro) {
            if (requisicaoAtual !== ultimaRequisicao.current) {
                return
            }

            console.error('Erro ao carregar agenda:', erro)

            if (!silencioso) {
                setAgenda([])
            }

            setErroAgenda(
                erro.message || 'Erro ao carregar agenda'
            )

        } finally {
            if (requisicaoAtual === ultimaRequisicao.current) {
                setCarregandoAgenda(false)
            }
        }
    }, [idUsuario, dataConsulta])

    // Mantém atualização imediata após ações do usuário
    const recarregarAgenda = useCallback(() => {
        return carregarAgenda(false)
    }, [carregarAgenda])

    useEffect(() => {
        // Primeira consulta ao abrir o dashboard
        setAgenda([])
        ultimaConsultaAutomatica.current = Date.now()
        carregarAgenda(false)

        if (!idUsuario) {
            return () => {
                ultimaRequisicao.current++
            }
        }

        function atualizarAutomaticamente() {
            if (document.visibilityState !== 'visible') {
                return
            }

            const agora = Date.now()

            // Evita consultas duplicadas ao alternar abas
            if (
                agora - ultimaConsultaAutomatica.current <
                INTERVALO_MINIMO
            ) {
                return
            }

            ultimaConsultaAutomatica.current = agora
            carregarAgenda(true)
        }

        const intervalo = setInterval(
            atualizarAutomaticamente,
            INTERVALO_ATUALIZACAO
        )

        document.addEventListener(
            'visibilitychange',
            atualizarAutomaticamente
        )

        window.addEventListener(
            'focus',
            atualizarAutomaticamente
        )

        return () => {
            clearInterval(intervalo)

            document.removeEventListener(
                'visibilitychange',
                atualizarAutomaticamente
            )

            window.removeEventListener(
                'focus',
                atualizarAutomaticamente
            )

            // Invalida requisições pendentes
            ultimaRequisicao.current++
        }
    }, [idUsuario, carregarAgenda])

    return {
        agenda,
        carregandoAgenda,
        erroAgenda,
        recarregarAgenda
    }
}
