import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

const FORMATOS_PERMITIDOS = ['image/png', 'image/jpeg', 'image/webp']
const TAMANHO_MAXIMO = 5 * 1024 * 1024

function AnexarImagem({ aoSelecionarImagem, imagemInicial }) {
    const [preview, setPreview] = useState(null)

    const processarImagem = useCallback((arquivo) => {
        if (!arquivo) return false

        if (!FORMATOS_PERMITIDOS.includes(arquivo.type)) {
            toast.error('Formato de imagem não permitido', {
                description: 'Selecione ou cole uma imagem PNG, JPG ou WEBP.'
            })
            return false
        }

        if (arquivo.size > TAMANHO_MAXIMO) {
            toast.error('Imagem muito grande', {
                description: 'A imagem deve ter no máximo 5 MB.'
            })
            return false
        }

        const url = URL.createObjectURL(arquivo)

        setPreview(url)
        aoSelecionarImagem(arquivo)
        return true
    }, [aoSelecionarImagem])

    function selecionarImagem(event) {
        const arquivo = event.target.files?.[0]

        if (arquivo) {
            processarImagem(arquivo)
        }

        // Permite selecionar novamente o mesmo arquivo.
        event.target.value = ''
    }

    useEffect(() => {
        function colarImagem(event) {
            const itens = Array.from(event.clipboardData?.items ?? [])
            const itemImagem = itens.find(item =>
                item.kind === 'file' && item.type.startsWith('image/')
            )

            if (!itemImagem) return

            const imagemColada = itemImagem.getAsFile()
            if (!imagemColada) return

            event.preventDefault()

            const extensaoPorTipo = {
                'image/png': 'png',
                'image/jpeg': 'jpg',
                'image/webp': 'webp'
            }

            const extensao = extensaoPorTipo[imagemColada.type] ?? 'png'
            const arquivo = new File(
                [imagemColada],
                `imagem-colada-${Date.now()}.${extensao}`,
                {
                    type: imagemColada.type,
                    lastModified: Date.now()
                }
            )

            processarImagem(arquivo)
        }

        // O listener existe somente enquanto o campo de imagem está montado.
        document.addEventListener('paste', colarImagem)

        return () => {
            document.removeEventListener('paste', colarImagem)
        }
    }, [processarImagem])

    useEffect(() => {
        if (!preview) return undefined

        return () => {
            URL.revokeObjectURL(preview)
        }
    }, [preview])

    return (
        <div className="anexar-imagem">
            <input
                type="file"
                id="imagem-medicamento"
                accept="image/png,image/jpeg,image/webp"
                onChange={selecionarImagem}
                aria-label="Selecionar imagem do medicamento"
            />

            <label htmlFor="imagem-medicamento" className="area-upload">
                {(preview || imagemInicial) ? (
                    <>
                        <img
                            src={preview || imagemInicial}
                            alt="Pré-visualização do medicamento"
                            className="preview-medicamento"
                        />
                        <span className="upload-ajuda upload-ajuda-preview">
                            Clique para trocar ou pressione Ctrl+V
                        </span>
                    </>
                ) : (
                    <>
                        <span className="icone-upload">+</span>
                        <p>Adicionar imagem</p>
                        <small>PNG, JPG ou WEBP · até 5 MB</small>
                        <span className="upload-ajuda">
                            Clique para escolher ou pressione Ctrl+V
                        </span>
                    </>
                )}
            </label>
        </div>
    )
}

export default AnexarImagem
