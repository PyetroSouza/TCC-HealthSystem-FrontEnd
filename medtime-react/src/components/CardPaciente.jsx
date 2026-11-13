
import { useEffect, useState } from 'react'
import { buscarProximoMedicamento } from '../services/proximoMedicamentoService.js'
import { gerarIniciais } from '../utils/gerarIniciais.js'
import { gerarCorAvatar } from '../utils/gerarCorAvatar.js'
import { calcularIdade } from '../utils/calcularIdade.js'

function CardPaciente({ paciente, aoClicar, token }) {
    const corAvatar = gerarCorAvatar(paciente.nome)
    const idade = calcularIdade(paciente.data_nascimento)
    const [proximoMedicamento, setProximoMedicamento] = useState(null)
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState(false)

    useEffect(() => {
        let ativo = true

        async function carregarProximoMedicamento() {
            setCarregando(true)
            setErro(false)
            setProximoMedicamento(null)

            try {
                const medicamento = await buscarProximoMedicamento(paciente.id_paciente ?? paciente.id,
                    token)

                if (ativo) {
                    setProximoMedicamento(medicamento)
                }
            } catch (erro) {
                if (ativo) {
                    console.error('Erro ao buscar próximo medicamento:', erro)
                    setErro(true)
                }
            } finally {
                if (ativo) {
                    setCarregando(false)
                }
            }
        }

        carregarProximoMedicamento()

        return () => {
            ativo = false
        }
    }, [paciente.id_paciente, paciente.id, token])


    return (
        <article
            className="card_paciente"
            onClick={aoClicar}
        >
            <div
                className="avatar"
                style={{
                    backgroundColor: corAvatar.fundo,
                    color: corAvatar.texto
                }}
            >
                {gerarIniciais(paciente.nome)}
            </div>

            <div className="info">
                <h3 className="nome">{paciente.nome}</h3>

                <p className="idade">
                    {idade !== null
                        ? `${idade} anos`
                        : 'Idade não informada'}
                </p>



                <ul className="tags">
                    {(paciente.condicoes ?? []).map((condicao) => (
                        <li key={condicao}>{condicao}</li>
                    ))}
                </ul>
            </div>

            <p className="proximo_remedio">
                <img src="/assets/relogio.svg" alt="" />
                Próx. Med.: {
                    carregando
                        ? 'Carregando...'
                        : erro
                            ? 'Indisponível'
                            : proximoMedicamento
                                ? `${proximoMedicamento.nome_medicamento} - ${proximoMedicamento.horario_programado.slice(8, 10)}/${proximoMedicamento.horario_programado.slice(5, 7)} às ${proximoMedicamento.horario_programado.slice(11, 16)}`
                                : 'Nenhuma dose nos próximos 7 dias'
                }
            </p>
        </article>
    )
}

export default CardPaciente
