
import CardMedicamento from './CardMedicamento.jsx'

function ListaMedicamentos({
    medicamentos,
    carregando,
    erro,
    aoAdicionar,
    idUsuario,
    aoConfirmarTomada
}) {
    return (
        <div className="container-remedios">
            {carregando ? (
                <p>Carregando medicamentos...</p>
            ) : erro ? (
                <p>Não foi possível carregar os medicamentos.</p>
            ) : medicamentos.length === 0 ? (
                <div className="sem-medicamentos">
                    <img
                        src="/assets/remedio.svg"
                        alt=""
                        aria-hidden="true"
                    />

                    <p>Nenhuma dose programada para hoje</p>

                    <span>
                        Você pode adicionar medicamentos ou consultar
                        a programação de outra data.
                    </span>

                    <button
                        type="button"
                        onClick={aoAdicionar}
                    >
                        Adicionar medicamento
                    </button>
                </div>
            ) : (
                medicamentos.map((medicamento) => (
                    <CardMedicamento
                    key={`${medicamento.id_receita_medica}-${medicamento.horario_programado}-${medicamento.id_programacao_medicamento ?? 'sem-programacao'}`}
                        medicamento={medicamento}
                        idUsuario={idUsuario}
                        aoConfirmarTomada={aoConfirmarTomada}
                    />
                ))
            )}
        </div>
    )
}

export default ListaMedicamentos
