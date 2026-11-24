import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import AnexarImagem from '../components/AnexarImagem'
import { ArrowLeft } from 'lucide-react'
import { criarMedicamentoSchema } from '../schemas/medicamentoSchema'
import {
  buscarReceitasDoPaciente,
  cadastrarMedicamentoCompleto,
  editarMedicamentoCompleto
} from '../services/api'
import {
  buscarTiposDosagem,
  buscarTiposIntervalo,
  buscarUnidadesMedida
} from '../services/api.js'
import { prepararMedicamento } from '../services/medicamentoService'
import { montarPayloadMedicamento } from '../utils/montarPayloadMedicamento'

import './CadastroRemedio.css'

function CadastroRemedio({
  voltarParaDashboard,
  pacienteSelecionado,
  medicamentoEmEdicao,
  token
}) {
  const [imagemMedicamento, setImagemMedicamento] = useState(null)
  const [imagemAtual, setImagemAtual] = useState(
    medicamentoEmEdicao?.imagem ?? null
  )
  const [unidades, setUnidades] = useState([])
  const [tiposDosagem, setTiposDosagem] = useState([])
  const [tiposIntervalo, setTiposIntervalo] = useState([])
  const [carregandoOpcoes, setCarregandoOpcoes] = useState(true)
  const [opcoesCarregadas, setOpcoesCarregadas] = useState(false)
  const [erroOpcoes, setErroOpcoes] = useState(null)
  const [tentativaCarregarOpcoes, setTentativaCarregarOpcoes] = useState(0)
  const [carregandoDadosEdicao, setCarregandoDadosEdicao] = useState(false)
  const [idEstoqueAtual, setIdEstoqueAtual] = useState(null)
  const [alterarProgramacao, setAlterarProgramacao] = useState(false)
  const [nomeOriginal, setNomeOriginal] = useState('')
  const [dadosOriginais, setDadosOriginais] = useState(null)
  const idPaciente =
    pacienteSelecionado?.id_paciente ??
    pacienteSelecionado?.id
  const modoEdicao = Boolean(medicamentoEmEdicao)
  const schema = useMemo(
    () => criarMedicamentoSchema({
      modoEdicao,
      alterarProgramacao
    }),
    [modoEdicao, alterarProgramacao]
  )
  const {
    register,
    handleSubmit,
    control,
    reset,
    getValues,
    formState: { errors, isSubmitting }

  } = useForm({
    resolver: zodResolver(schema),
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
    let ativo = true

    async function carregarOpcoes() {
      if (!token) {
        setUnidades([])
        setTiposDosagem([])
        setTiposIntervalo([])
        setOpcoesCarregadas(false)
        setCarregandoOpcoes(false)
        setErroOpcoes('Sessão não autenticada.')
        return
      }

      setCarregandoOpcoes(true)
      setOpcoesCarregadas(false)
      setErroOpcoes(null)

      try {
        const [unidadesAPI, dosagensAPI, intervalosAPI] =
          await Promise.all([
            buscarUnidadesMedida(token),
            buscarTiposDosagem(token),
            buscarTiposIntervalo(token)
          ])

        if (!ativo) return

        if (
          !Array.isArray(unidadesAPI) ||
          !Array.isArray(dosagensAPI) ||
          !Array.isArray(intervalosAPI)
        ) {
          throw new Error('O servidor retornou opções em um formato inesperado.')
        }

        setUnidades(unidadesAPI)
        setTiposDosagem(dosagensAPI)
        setTiposIntervalo(intervalosAPI)
        setOpcoesCarregadas(true)
      } catch (erro) {
        if (!ativo) return

        console.error('Erro ao carregar opções do medicamento:', erro)
        setErroOpcoes(
          erro.message || 'Não foi possível carregar as opções do formulário.'
        )
        setOpcoesCarregadas(false)
      } finally {
        if (ativo) {
          setCarregandoOpcoes(false)
        }
      }
    }

    carregarOpcoes()

    return () => {
      ativo = false
    }
  }, [token, tentativaCarregarOpcoes])


  useEffect(() => {
    let ativo = true

    async function carregarDadosEdicao() {
      if (
        !modoEdicao ||
        !medicamentoEmEdicao?.id_receita_medica ||
        !idPaciente ||
        !token ||
        !opcoesCarregadas
      ) {
        return
      }

      try {
        setCarregandoDadosEdicao(true)

        const receitas = await buscarReceitasDoPaciente(
          idPaciente,
          token
        )

        if (!ativo) return

        // 1. Encontrar a receita primeiro
        const receita = receitas.find(
          item =>
            Number(item.id_receita_medica) ===
            Number(medicamentoEmEdicao.id_receita_medica)
        )

        // 2. Verificar se ela existe
        if (!receita) {
          throw new Error('Receita não encontrada.')
        }

        // 3. Verificar se pertence ao paciente
        if (Number(receita.id_usuario) !== Number(idPaciente)) {
          throw new Error(
            'A receita não pertence ao paciente selecionado.'
          )
        }

        // 4. Agora podemos acessar os dados da receita
        setNomeOriginal(receita.nome_medicamento ?? '')
        setImagemAtual(receita.imagem ?? null)
        setIdEstoqueAtual(receita.id_estoque ?? null)
        setDadosOriginais(receita)

        // 5. Manter aqui o reset({...}) que já funciona


        reset({
          nome: receita.nome_medicamento ?? '',
          dose: String(receita.dosagem ?? ''),
          tipoDosagem: String(receita.id_tipo_dosagem ?? ''),
          unidadeDose: String(receita.id_unidade_medida ?? ''),
          concentracao: String(receita.concentracao ?? ''),
          unidadeConcentracao: String(
            receita.id_unidade_medida_embalagem ?? ''
          ),
          quantidade: String(receita.quantidade_em_estoque ?? ''),
          descricao: receita.descricao ?? '',
          frequencia: undefined,
          intervalo: '',
          horario: ''
        })


      } catch (erro) {
        if (!ativo) return

        console.error('Erro ao carregar edição:', erro)
        toast.error(erro.message || 'Não foi possível carregar os dados para edição.')
      } finally {
        if (ativo) {
          setCarregandoDadosEdicao(false)
        }
      }
    }

    carregarDadosEdicao()


    return () => {
      ativo = false
    }
  }, [
    modoEdicao,
    medicamentoEmEdicao?.id_receita_medica,
    idPaciente,
    token,
    reset,
    opcoesCarregadas
  ])


  const frequencia = useWatch({
    control,
    name: 'frequencia'
  })

  const intervalo = useWatch({
    control,
    name: 'intervalo'
  })

  const unidadeDoseSelecionada = useWatch({
    control,
    name: 'unidadeDose'
  })

  const unidadeConcentracaoSelecionada = useWatch({
    control,
    name: 'unidadeConcentracao'
  })

  const unidadesDiferentes =
    Boolean(unidadeDoseSelecionada) &&
    Boolean(unidadeConcentracaoSelecionada) &&
    unidadeDoseSelecionada !== unidadeConcentracaoSelecionada

  async function adicionarMedicamento(dados) {

    if (!pacienteSelecionado) {
      toast.error('Nenhum paciente selecionado.')
      return
    }

    if (!modoEdicao && !imagemMedicamento) {
      toast.warning('Selecione a imagem')
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
          receita_medica: {
            dosagem: Number(String(dados.dose).replace(',', '.')), 
            id_unidade_medida: Number(dados.unidadeDose),
            descricao: dados.descricao?.trim() ?? ''
          },
          estoque: {
            quantidade_em_estoque: Number(String(dados.quantidade).replace(',', '.')) // hoje está Number(dados.quantidade)
          }
        }

        // Atualiza o nome apenas quando ele foi alterado

        if (!dadosOriginais) {
          toast.error('Aguarde o carregamento da receita.')
          return
        }

        const alteracoesMedicamento = {}

        const concentracao = Number(
          String(dados.concentracao).replace(',', '.')
        )

        if (!Number.isFinite(concentracao) || concentracao < 0) {
          toast.error('Concentração inválida.')
          return
        }

        // Nome
        if (dados.nome.trim() !== nomeOriginal.trim()) {
          alteracoesMedicamento.nome = dados.nome.trim()
        }

        // Concentração
        if (
          concentracao !== Number(dadosOriginais.concentracao)
        ) {
          alteracoesMedicamento.concentracao = concentracao
        }

        // Unidade de concentração
        if (
          Number(dados.unidadeConcentracao) !==
          Number(dadosOriginais.id_unidade_medida_embalagem)
        ) {
          alteracoesMedicamento.id_unidade_medida_embalagem =
            Number(dados.unidadeConcentracao)
        }

        // Tipo de dosagem
        if (
          Number(dados.tipoDosagem) !==
          Number(dadosOriginais.id_tipo_dosagem)
        ) {
          alteracoesMedicamento.id_tipo_dosagem =
            Number(dados.tipoDosagem)
        }

        // Imagem: enviar apenas se foi selecionada uma nova
        if (imagemMedicamento) {
          if (!medicamentoPreparado.imagem) {
            throw new Error('Falha ao enviar a nova imagem.')
          }

          alteracoesMedicamento.imagem =
            medicamentoPreparado.imagem
        }

        // Incluir o bloco somente se houver alterações
        if (Object.keys(alteracoesMedicamento).length > 0) {
          payload.medicamento = alteracoesMedicamento
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
          idPaciente,
          payload,
          token
        )

        toast.success('Dados do medicamento atualizados!')
      } else {

        const payload = montarPayloadMedicamento(medicamentoPreparado)

        await cadastrarMedicamentoCompleto(
          pacienteSelecionado.id_paciente ?? pacienteSelecionado.id,
          payload,
          token
        )


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
    <div className="cadastro-remedio-container">
     <button
        type="button"
        className="botao-voltar-cadastro"
        onClick={voltarParaDashboard}
      >
        <ArrowLeft size={18} aria-hidden="true" />
        {medicamentoEmEdicao ? 'Voltar para medicamentos' : 'Voltar ao Dashboard'}
      </button>

      <form className="formulario-cadastro-remedio" onSubmit={handleSubmit(adicionarMedicamento, formularioInvalido)}>

        <motion.div className="header-formulario" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }}>
          <h1>{modoEdicao ? 'Editar Medicamento' : 'Cadastro de Medicamento'}</h1>
          <p>
            {modoEdicao
              ? 'Atualize as informações do medicamento conforme necessário.'
              : 'Preencha as informações do medicamento para adicioná-lo ao tratamento.'}
          </p>
        </motion.div>

        {erroOpcoes && (
          <div className="mensagem-erro" role="alert">
            <p>Não foi possível carregar as opções do formulário: {erroOpcoes}</p>
            <button
              type="button"
              onClick={() => setTentativaCarregarOpcoes(valor => valor + 1)}
              disabled={carregandoOpcoes}
            >
              {carregandoOpcoes ? 'Tentando novamente...' : 'Tentar novamente'}
            </button>
          </div>
        )}

        {modoEdicao && carregandoDadosEdicao && (
          <p role="status" aria-live="polite">
            Carregando dados do medicamento...
          </p>
        )}

        <motion.div className="cadastrar" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}>

          <AnexarImagem
            aoSelecionarImagem={setImagemMedicamento}
            imagemInicial={imagemAtual}
          />
<div className="formulario-esquerdo">

            {/* 1. Nome + Apresentação */}
            <div className="linha-campos linha-nome-tipo">
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
                  <p id="erro-nome" className="mensagem-erro">
                    {errors.nome.message}
                  </p>
                )}
              </div>

              <div className="campo-formulario">
                <label htmlFor="tipo-dosagem">Tipo da dosagem</label>
                <select
                  id="tipo-dosagem"
                  disabled={carregandoOpcoes || !opcoesCarregadas || tiposDosagem.length === 0}
                  aria-invalid={!!errors.tipoDosagem}
                  aria-describedby={errors.tipoDosagem ? 'erro-tipoDosagem' : undefined}
                  {...register('tipoDosagem')}
                >
                  <option value="">
                    {carregandoOpcoes
                      ? 'Carregando tipos...'
                      : erroOpcoes
                        ? 'Não foi possível carregar'
                        : tiposDosagem.length === 0
                          ? 'Nenhum tipo disponível'
                          : 'Selecione'}
                  </option>
                  {tiposDosagem.map((tipo) => (
                    <option key={tipo.id} value={String(tipo.id)}>
                      {tipo.tipo_dosagem}
                    </option>
                  ))}
                </select>
                {errors.tipoDosagem && (
                  <p id="erro-tipoDosagem" className="mensagem-erro" role="alert">
                    {errors.tipoDosagem.message}
                  </p>
                )}
              </div>
            </div>

            {/* 2. Concentração + Unidade */}
            <div className="linha-campos">
              <div className="campo-formulario">
                <label htmlFor="concentracao">Concentração</label>
                <input
                  type="number"
                  id="concentracao"
                  placeholder="Ex: 500"
                  aria-invalid={!!errors.concentracao}
                  aria-describedby={errors.concentracao ? 'erro-concentracao' : undefined}
                  className={errors.concentracao ? 'campo-invalido' : ''}
                  {...register('concentracao')}
                />
                {errors.concentracao && (
                  <p id="erro-concentracao" className="mensagem-erro">
                    {errors.concentracao.message}
                  </p>
                )}
              </div>

              <div className="campo-formulario">
                <label htmlFor="unidade-concentracao">Unidade da concentração</label>
                <select
                  id="unidade-concentracao"
                  disabled={carregandoOpcoes || !opcoesCarregadas || unidades.length === 0}
                  aria-invalid={!!errors.unidadeConcentracao}
                  aria-describedby={errors.unidadeConcentracao ? 'erro-unidadeConcentracao' : undefined}
                  {...register('unidadeConcentracao')}
                >
                  <option value="">
                    {carregandoOpcoes
                      ? 'Carregando unidades...'
                      : erroOpcoes
                        ? 'Não foi possível carregar'
                        : unidades.length === 0
                          ? 'Nenhuma unidade disponível'
                          : 'Selecione'}
                  </option>
                  {unidades.map((unidade) => (
                    <option key={unidade.id} value={String(unidade.id)}>
                      {unidade.sigla}
                    </option>
                  ))}
                </select>
                {errors.unidadeConcentracao && (
                  <p id="erro-unidadeConcentracao" className="mensagem-erro" role="alert">
                    {errors.unidadeConcentracao.message}
                  </p>
                )}
              </div>
            </div>

            {/* 3. Dose por tomada + Unidade da dose */}
            <div className="linha-campos">
              <div className="campo-formulario">
                <label htmlFor="dose">Dose por tomada</label>
                <input
                  type="number"
                  id="dose"
                  min="0"
                  step="any"
                  placeholder="Ex: 1"
                  aria-invalid={!!errors.dose}
                  aria-describedby={errors.dose ? 'erro-dose' : undefined}
                  className={errors.dose ? 'campo-invalido' : ''}
                  {...register('dose')}
                />
                {errors.dose && (
                  <p id="erro-dose" className="mensagem-erro">
                    {errors.dose.message}
                  </p>
                )}
              </div>

              <div className="campo-formulario">
                <label htmlFor="unidadeDose">Unidade da dose</label>
                <select
                  id="unidadeDose"
                  disabled={carregandoOpcoes || !opcoesCarregadas || unidades.length === 0}
                  aria-invalid={!!errors.unidadeDose}
                  aria-describedby={errors.unidadeDose ? 'erro-unidadeDose' : undefined}
                  {...register('unidadeDose')}
                >
                  <option value="">
                    {carregandoOpcoes
                      ? 'Carregando unidades...'
                      : erroOpcoes
                        ? 'Não foi possível carregar'
                        : unidades.length === 0
                          ? 'Nenhuma unidade disponível'
                          : 'Selecione'}
                  </option>
                  {unidades.map((unidade) => (
                    <option key={unidade.id} value={String(unidade.id)}>
                      {unidade.sigla}
                    </option>
                  ))}
                </select>
                {errors.unidadeDose && (
                  <p id="erro-unidadeDose" className="mensagem-erro" role="alert">
                    {errors.unidadeDose.message}
                  </p>
                )}
              </div>
            </div>

            {unidadesDiferentes && (
              <p className="aviso-unidades" role="status">
                Atenção: a unidade da dose é diferente da unidade informada para a concentração/embalagem.
                Verifique se os dados estão corretos. O cálculo automático do estoque pode exigir uma conversão adicional.
              </p>
            )}

            {/* 4. Intervalo primeiro + Frequência ao lado */}
            {(!modoEdicao || alterarProgramacao) && (
              <div className="linha-campos">
                <div className="campo-formulario">
                  <label htmlFor="intervalo">Intervalo de dosagem</label>
                  <select
                    id="intervalo"
                    aria-invalid={!!errors.intervalo}
                    aria-describedby={errors.intervalo ? 'erro-intervalo' : undefined}
                    {...register('intervalo')}
                  >
                    <option value="">Selecione</option>
                    {tiposIntervalo.map((tipo) => (
                      <option key={tipo.id} value={String(tipo.id)}>
                        {tipo.tipo_intervalo}
                      </option>
                    ))}
                  </select>
                  {errors.intervalo && (
                    <p id="erro-intervalo" className="mensagem-erro" role="alert">
                      {errors.intervalo.message}
                    </p>
                  )}
                </div>

                <div className="campo-formulario">
                  <label htmlFor="frequencia">Frequência</label>
                  <div className="input-container">
                    <span className="prefix">De</span>
                    <input
                      type="number"
                      id="frequencia"
                      min="1"
                      max={intervalo === '1' ? 24 : undefined}
                      placeholder="8"
                      aria-invalid={!!errors.frequencia}
                      aria-describedby={errors.frequencia ? 'erro-frequencia' : undefined}
                      className={errors.frequencia ? 'campo-invalido' : ''}
                      {...register('frequencia', { valueAsNumber: true })}
                    />
                    <span className="suffix">
                      em {frequencia || '—'}{' '}
                      {intervalo === '1'
                        ? 'hora(s)'
                        : intervalo === '2'
                          ? 'dia(s)'
                          : '—'}
                    </span>
                  </div>
                  {errors.frequencia && (
                    <p id="erro-frequencia" className="mensagem-erro" role="alert">
                      {errors.frequencia.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* 5. Horário inicial + Quantidade total lado a lado */}
            <div className="linha-campos">
              {(!modoEdicao || alterarProgramacao) && (
                <div className="campo-formulario">
                  <label htmlFor="horario">
                    {modoEdicao ? 'Nova data e hora de início' : 'Horário de tomada inicial'}
                  </label>
                  <input
                    type={modoEdicao ? 'datetime-local' : 'time'}
                    id="horario"
                    aria-invalid={!!errors.horario}
                    aria-describedby={errors.horario ? 'erro-horario' : undefined}
                    className={errors.horario ? 'campo-invalido' : ''}
                    {...register('horario')}
                  />
                  {errors.horario && (
                    <p id="erro-horario" className="mensagem-erro">
                      {errors.horario.message}
                    </p>
                  )}
                </div>
              )}

              <div className="campo-formulario">
                <label htmlFor="quantidade">Quantidade total do tratamento</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  id="quantidade"
                  placeholder="Ex: 30"
                  aria-invalid={!!errors.quantidade}
                  aria-describedby={errors.quantidade ? 'erro-quantidade' : undefined}
                  className={errors.quantidade ? 'campo-invalido' : ''}
                  {...register('quantidade')}
                />
                {errors.quantidade && (
                  <p id="erro-quantidade" className="mensagem-erro">
                    {errors.quantidade.message}
                  </p>
                )}
              </div>
            </div>

            {modoEdicao && (
              <div className="aviso-edicao-programacao">
                <label>
                  <input
                    type="checkbox"
                    checked={alterarProgramacao}
                    onChange={(e) => setAlterarProgramacao(e.target.checked)}
                  />
                  {' '}Alterar programação do medicamento
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
        </motion.div>

        <motion.div className="campos-inferiores" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.16, ease: "easeOut" }}>
        

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
            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              animate={{ opacity: isSubmitting ? 0.75 : 1 }}
              transition={{ duration: 0.18 }}
              className="botao-adicionar-medicamento"
              disabled={
                isSubmitting ||
                carregandoOpcoes ||
                !opcoesCarregadas ||
                carregandoDadosEdicao
              }
            >
              {isSubmitting
                ? 'Salvando...'
                : modoEdicao
                  ? 'Salvar alterações'
                  : 'Adicionar medicamento'
              }
            </motion.button>
          </div>
        </motion.div>
      </form>
    </div>
  )
}


export default CadastroRemedio