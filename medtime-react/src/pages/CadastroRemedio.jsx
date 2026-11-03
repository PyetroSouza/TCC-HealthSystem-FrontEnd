import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  medicamentoSchema,
  medicamentoEdicaoSchema
} from '../schemas/medicamentoSchema'
import { prepararMedicamento } from '../services/medicamentoService'
import { montarPayloadMedicamento } from '../utils/montarPayloadMedicamento'
import {
  cadastrarMedicamentoCompleto,
  buscarReceitaMedica,
  buscarProgramacaoPorReceita,
  editarMedicamentoCompleto
} from '../services/api'
import {
  buscarUnidadesMedida,
  buscarTiposDosagem,
  buscarTiposIntervalo,
  cadastrarMedicamentoAPI
} from '../services/api.js'
import { toast } from 'sonner'
import AnexarImagem from '../components/AnexarImagem'

import './CadastroRemedio.css'

function CadastroRemedio({ voltarParaDashboard, cadastrarMedicamento: cadastrarMedicamentoLocal, pacienteSelecionado, medicamentoEmEdicao, atualizarMedicamento }) {
  const [imagemMedicamento, setImagemMedicamento] = useState(null)
  const [imagemAtual, setImagemAtual] = useState(
    medicamentoEmEdicao?.imagem ?? null
  )
  const [unidades, setUnidades] = useState([])
  const [tiposDosagem, setTiposDosagem] = useState([])
  const [tiposIntervalo, setTiposIntervalo] = useState([])
  const [idEstoqueAtual, setIdEstoqueAtual] = useState(null)
  const [alterarProgramacao, setAlterarProgramacao] = useState(false)
  const modoEdicao = Boolean(medicamentoEmEdicao)
  const {
    register,
    handleSubmit,
    watch,
    reset,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(
      modoEdicao ? medicamentoEdicaoSchema : medicamentoSchema
    ),
    mode: 'onTouched',

    defaultValues: {
      nome: medicamentoEmEdicao?.nome ?? '',

      dose: medicamentoEmEdicao?.quantidade_dose != null
        ? String(medicamentoEmEdicao.quantidade_dose)
        : '',

      tipoDosagem: medicamentoEmEdicao?.id_tipo_dosagem != null
        ? String(medicamentoEmEdicao.id_tipo_dosagem)
        : '',

      unidadeDose: '',

      concentracao: medicamentoEmEdicao
        ? String(medicamentoEmEdicao.concentracao)
        : '',

      unidadeConcentracao: medicamentoEmEdicao
        ? String(medicamentoEmEdicao.id_unidade_medida_embalagem ?? '')
        : '',

      frequencia: undefined,

      tipoMedicamento: medicamentoEmEdicao?.tipoMedicamento ?? 'comprimido',
      intervalo: '',
      horario: '',
      quantidade: medicamentoEmEdicao?.quantidade ?? '',
      descricao: medicamentoEmEdicao?.descricao ?? ''
    }

  })

  useEffect(() => {
    async function carregarOpcoes() {
      try {
        const [unidadesAPI, dosagensAPI, intervalosAPI] = await Promise.all([
          buscarUnidadesMedida(),
          buscarTiposDosagem(),
          buscarTiposIntervalo()
        ])

        setUnidades(unidadesAPI)
        setTiposDosagem(dosagensAPI)
        setTiposIntervalo(intervalosAPI)
      } catch (erro) {
        console.error('Erro ao carregar opções:', erro)
        toast.error('Não foi possível carregar as opções do formulário')
      }
    }

    carregarOpcoes()
  }, [])

  useEffect(() => {
    async function carregarDadosEdicao() {
      if (!modoEdicao || !medicamentoEmEdicao?.id_receita_medica) {
        return
      }

      try {
        const [receita, programacoes] = await Promise.all([
          buscarReceitaMedica(medicamentoEmEdicao.id_receita_medica),
          buscarProgramacaoPorReceita(medicamentoEmEdicao.id_receita_medica)
        ])

        const programacaoAtiva = programacoes.find(
          (programacao) => programacao.data_hora_fim == null
        )

        if (!programacaoAtiva) {
          throw new Error('Programação ativa não encontrada')
        }

        if (!receita) {
          throw new Error('Receita não encontrada')
        }

        if (receita.id_usuario !== pacienteSelecionado?.id) {
          throw new Error('A receita não pertence ao paciente selecionado')
        }

        setImagemAtual(receita.imagem)
        setIdEstoqueAtual(receita.id_estoque)
        reset({
          nome: receita.nome_medicamento,
          dose: String(receita.dosagem),
          tipoDosagem: String(receita.id_tipo_dosagem),
          unidadeDose: String(receita.id_unidade_medida),
          concentracao: String(receita.concentracao),
          unidadeConcentracao: String(receita.id_unidade_medida_embalagem),
          quantidade: String(receita.quantidade_em_estoque),
          descricao: receita.descricao ?? '',
          frequencia: Number(programacaoAtiva.frequencia),
          intervalo: String(programacaoAtiva.id_tipo_intervalo),
          horario: ''
        })

      } catch (erro) {
        console.error('Erro ao carregar edição:', erro)
        toast.error('Não foi possível carregar os dados da edição')
      }
    }

    carregarDadosEdicao()
  }, [modoEdicao, medicamentoEmEdicao?.id_receita_medica, pacienteSelecionado?.id])

  const frequencia = watch('frequencia')
  const intervalo = watch('intervalo')

  async function adicionarMedicamento(dados) {

    if (!pacienteSelecionado) {
      toast.error('Nenhum paciente selecionado.')
      return
    }

    if (!modoEdicao && !imagemMedicamento) {
      toast.warning('Selecione uma imagem primeiro.')
      return
    }

    try {
      const medicamentoPreparado = await prepararMedicamento({
        dados,
        pacienteId: pacienteSelecionado.id,
        imagemMedicamento,
        medicamentoEmEdicao
      })


      if (modoEdicao) {
        if (!idEstoqueAtual) {
          toast.error('Os dados da receita ainda não foram carregados.')
          return
        }

        const imagemFinal = imagemMedicamento
          ? medicamentoPreparado.imagem
          : imagemAtual

        if (!imagemFinal) {
          toast.error('A imagem do medicamento não foi carregada.')
          return
        }

        const payload = {
          medicamento: {
            nome: medicamentoPreparado.nome,
            imagem: imagemFinal,
            concentracao: medicamentoPreparado.concentracao,
            id_unidade_medida_embalagem:
              medicamentoPreparado.id_unidade_medida_embalagem,
            id_tipo_dosagem: medicamentoPreparado.id_tipo_dosagem
          },

          receita_medica: {
            dosagem: Number(dados.dose),
            id_unidade_medida: Number(dados.unidadeDose),
            descricao: dados.descricao || null
          },

          estoque: {
            quantidade_em_estoque: Number(dados.quantidade)
          }
        }


        if (alterarProgramacao) {
          const {
            frequencia,
            intervalo,
            horario
          } = getValues()

          const frequenciaNumero = Number(frequencia)
          const intervaloNumero = Number(intervalo)
          const dataInicio = new Date(horario)

          if (
            !Number.isInteger(frequenciaNumero) ||
            frequenciaNumero <= 0 ||
            ![1, 2].includes(intervaloNumero) ||
            !horario ||
            Number.isNaN(dataInicio.getTime()) ||
            dataInicio <= new Date()
          ) {
            toast.error('Verifique os dados da nova programação.')
            return
          }

          // O datetime-local fornece YYYY-MM-DDTHH:mm.
          // Formato local atualmente aceito pelo backend/MySQL.
          const dataHoraFormatada = new Date(horario).toISOString()

          payload.programacao_medicamento = {
            frequencia: frequenciaNumero,
            id_tipo_intervalo: intervaloNumero,
            data_hora_inicio: dataHoraFormatada
          }
        }


        await editarMedicamentoCompleto(
          medicamentoEmEdicao.id_receita_medica,
          pacienteSelecionado.id,
          payload
        )

        toast.success('Dados do medicamento atualizados!')
      } else {
        const payload = montarPayloadMedicamento(
          medicamentoPreparado,
          pacienteSelecionado.id
        )

        const resultado = await cadastrarMedicamentoCompleto(payload)


        cadastrarMedicamentoLocal(medicamentoPreparado)

        toast.success('Medicamento cadastrado com sucesso!')
      }

      voltarParaDashboard()

    } catch (erro) {
      console.error(erro)

      toast.error('Não foi possível salvar o medicamento.', {
        description: erro.message
      })
    }
  }

  function formularioInvalido(erros) {
    const primeiroErro = Object.values(erros)[0]

    if (primeiroErro) {
      toast.error('Verifique os dados do formulário', {
        description: primeiroErro.message
      })
    }
  }
  return (
    <div className="conteudo">
      <button type="button" className="botao-voltar" onClick={voltarParaDashboard}>
        &lt; Voltar
      </button>

      <form className="formulario-cadastro-remedio" onSubmit={handleSubmit(adicionarMedicamento, formularioInvalido)}>

        <div className="header-formulario">
          <h1>{modoEdicao ? 'Editar Medicamento' : 'Cadastro de Medicamento'}</h1>
          <p>
            {modoEdicao
              ? 'Atualize as informações do medicamento conforme necessário.'
              : 'Preencha as informações do medicamento para adicioná-lo ao tratamento.'}
          </p>
        </div>

        <div className="cadastrar">

          <AnexarImagem
            aoSelecionarImagem={setImagemMedicamento}
            imagemInicial={imagemAtual}
          />
          <div className="formulario-esquerdo">

            <div className="campo-formulario">
              <label htmlFor="nome-medicamento">Nome do medicamento</label>
              <input
                type="text"
                id="nome-medicamento"
                maxLength={45}
                placeholder="Ex: Dipirona"
                aria-invalid={!!errors.nome}
                aria-describedby={errors.nome ? 'erro-nome' : undefined}
                className={errors.nome ? 'campo-invalido' : ''}
                {...register('nome')}
              />
              {errors.nome && (

                <p
                  id="erro-nome"
                  className="mensagem-erro">
                  {errors.nome.message}
                </p>
              )}
            </div>

            <div className="linha-campos">
              <div className="campo-formulario">
                <label htmlFor="dose">Dose</label>
                <input
                  type="number"
                  id="dose"
                  min="0"
                  step="any"
                  placeholder="Ex: 10"
                  aria-invalid={!!errors.dose}
                  aria-describedby={errors.dose ? 'erro-dose' : undefined}
                  className={errors.dose ? 'campo-invalido' : ''}
                  {...register('dose')}
                />
                {errors.dose && (
                  <p id="erro-dose"
                    className="mensagem-erro">
                    {errors.dose.message}
                  </p>
                )}

              </div>
              <div className="campo-formulario">
                <label htmlFor="unidade-dose">Unidade da dose</label>

                <select
                  id="unidadeDose"
                  aria-invalid={!!errors.unidadeDose}
                  aria-describedby={
                    errors.unidadeDose ? 'erro-unidadeDose' : undefined
                  }
                  {...register('unidadeDose')}
                >
                  <option value="">Selecione</option>

                  {unidades.map((unidade) => (
                    <option key={unidade.id} value={String(unidade.id)}>
                      {unidade.sigla}
                    </option>
                  ))}
                </select>

                {errors.unidadeDose && (
                  <p
                    id="erro-unidadeDose"
                    className="mensagem-erro"
                    role="alert"
                  >
                    {errors.unidadeDose.message}
                  </p>
                )}
              </div>

              <div className="campo-formulario">
                <label htmlFor="tipo-dosagem">Tipo da dosagem</label>
                <select id="tipo-dosagem"
                  aria-invalid={!!errors.tipoDosagem}
                  aria-describedby={
                    errors.tipoDosagem ? 'erro-tipoDosagem' : undefined
                  }{...register('tipoDosagem')}>
                  <option value="">Selecione</option>

                  {tiposDosagem.map((tipo) => (
                    <option key={tipo.id} value={String(tipo.id)}>
                      {tipo.tipo_dosagem}
                    </option>
                  ))}
                </select>
                {errors.tipoDosagem && (
                  <p
                    id="erro-tipoDosagem"
                    className="mensagem-erro"
                    role="alert">
                    {errors.tipoDosagem.message}
                  </p>
                )}
              </div>
            </div>

            <div className="linha-campos">
              <div className="campo-formulario">
                <label htmlFor="concentracao">Concentração</label>
                <input
                  type="text"
                  id="concentracao"
                  aria-invalid={!!errors.concentracao}
                  aria-describedby={errors.concentracao ? 'erro-concentracao' : undefined}
                  className={errors.concentracao ? 'campo-invalido' : ''}
                  {...register('concentracao')}
                  placeholder="Ex: 50"
                />
                {errors.concentracao && (
                  <p
                    id="erro-concentracao"
                    className="mensagem-erro">
                    {errors.concentracao.message}
                  </p>
                )}
                <div className="campo-formulario">
                  <label htmlFor="unidade-concentracao">
                    Unidade de medida
                  </label>

                  <select
                    id="unidade-concentracao"
                    aria-invalid={!!errors.unidadeConcentracao}
                    aria-describedby={
                      errors.unidadeConcentracao ? 'erro-unidadeConcentracao' : undefined
                    }
                    {...register('unidadeConcentracao')}
                  >
                    <option value="">Selecione</option>

                    {unidades.map((unidade) => (
                      <option
                        key={unidade.id}
                        value={String(unidade.id)}
                      >
                        {unidade.sigla}
                      </option>
                    ))}
                  </select>

                  {errors.unidadeConcentracao && (
                    <p
                      id='erro-unidadeConcentracao'
                      className="mensagem-erro"
                      role='alert'>
                      {errors.unidadeConcentracao.message}
                    </p>
                  )}
                </div>
              </div>

              {(!modoEdicao || alterarProgramacao) && (
                <div className="campo-formulario">
                  <label htmlFor="frequencia">Frequência</label>

                  <div className="input-container">
                    <span className="prefix">De</span>
                    <input
                      type="number"
                      id="frequencia"
                      min="1"
                      max={intervalo === '1' ? 24 : undefined}
                      placeholder="5"
                      aria-invalid={!!errors.frequencia}
                      aria-describedby={
                        errors.frequencia ? 'erro-frequencia' : undefined
                      }
                      className={errors.frequencia ? 'campo-invalido' : ''}
                      {...register('frequencia', { valueAsNumber: true })}
                    />


                    <span className="suffix">
                      em {frequencia || '—'} {
                        intervalo === '1'
                          ? 'hora(s)'
                          : intervalo === '2'
                            ? 'dia(s)'
                            : '—'
                      }
                    </span>
                  </div>
                  {errors.frequencia && (
                    <p
                      id="erro-frequencia"
                      className="mensagem-erro"
                      role="alert"
                    >
                      {errors.frequencia.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            {(!modoEdicao || alterarProgramacao) && (
              <div className="linha-campos">
                <div className="campo-formulario">
                  <label htmlFor="intervalo">
                    Intervalo de dosagem
                  </label>

                  <select id="intervalo"
                    aria-invalid={!!errors.intervalo}
                    aria-describedby={
                      errors.intervalo ? 'erro-intervalo' : undefined
                    }
                    {...register('intervalo')}>
                    <option value="">Selecione</option>

                    {tiposIntervalo.map((tipo) => (
                      <option key={tipo.id} value={String(tipo.id)}>
                        {tipo.tipo_intervalo}
                      </option>
                    ))}
                  </select>

                  {errors.intervalo && (
                    <p
                      id="erro-intervalo"
                      className="mensagem-erro"
                      role="alert"
                    >
                      {errors.intervalo.message}
                    </p>
                  )}
                </div>

                <div className="campo-formulario">
                  <label htmlFor="horario">
                    {modoEdicao
                      ? 'Nova data e hora de início'
                      : 'Horário de tomada inicial'}
                  </label>

                  <input
                    type={modoEdicao ? 'datetime-local' : 'time'}
                    id="horario"
                    aria-invalid={!!errors.horario}
                    aria-describedby={
                      errors.horario ? 'erro-horario' : undefined
                    }
                    className={
                      errors.horario ? 'campo-invalido' : ''
                    }
                    {...register('horario')}
                  />

                  {errors.horario && (
                    <p
                      id="erro-horario"
                      className="mensagem-erro"
                    >
                      {errors.horario.message}
                    </p>
                  )}
                </div>
              </div>
            )}


            {modoEdicao && (
              <div className="aviso-edicao-programacao">
                <label>
                  <input
                    type="checkbox"
                    checked={alterarProgramacao}
                    onChange={(e) => setAlterarProgramacao(e.target.checked)}
                  />
                  Alterar programação do medicamento
                </label>

                {alterarProgramacao && (
                  <p>
                    A nova programação substituirá a atual a partir da
                    data e hora escolhidas.
                  </p>
                )}
              </div>
            )}

          </div>
        </div>

        <div className="campos-inferiores">
          <div className="campo-formulario">
            <label htmlFor="quantidade">
              Quantidade total do tratamento
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              id="quantidade"
              aria-invalid={!!errors.quantidade}
              aria-describedby={
                errors.quantidade ? 'erro-quantidade' : undefined
              }
              className={
                errors.quantidade ? 'campo-invalido' : ''
              }
              {...register('quantidade')}
              placeholder="Ex: 30"
            />

            {errors.quantidade && (
              <p
                id="erro-quantidade"
                className="mensagem-erro"
              >
                {errors.quantidade.message}
              </p>
            )}
          </div>

          <div className="campo-formulario">
            <label htmlFor="descricao">
              Descrição (opcional)
            </label>

            <textarea
              id="descricao"
              {...register('descricao')}
              rows="4"
              placeholder="Ex: Tomar após o almoço"
            />
          </div>

          <div className="acoes-formulario">
            <button
              type="submit"
              className="botao-adicionar-medicamento"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Salvando...'
                : modoEdicao
                  ? 'Salvar alterações'
                  : 'Adicionar medicamento'
              }
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}


export default CadastroRemedio