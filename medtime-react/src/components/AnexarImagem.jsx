import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

const FORMATOS_PERMITIDOS = [
    'image/png',
    'image/jpeg',
    'image/webp'
]

const TAMANHO_MAXIMO = 5 * 1024 * 1024

function AnexarImagem({ aoSelecionarImagem, imagemInicial }) {
    const [preview, setPreview] = useState(null)
    const inputRef = useRef(null)

    const processarArquivo = useCallback((arquivo, origem = 'selecao') => {
        if (!arquivo) return

        if (!FORMATOS_PERMITIDOS.includes(arquivo.type)) {
            toast.warning('Selecione ou cole uma imagem PNG, JPG ou WEBP.')
            if (inputRef.current) inputRef.current.value = ''
            return
        }

        if (arquivo.size > TAMANHO_MAXIMO) {
            toast.warning('A imagem deve ter no máximo 5 MB.')
            if (inputRef.current) inputRef.current.value = ''
            return
        }

        const url = URL.createObjectURL(arquivo)

        setPreview(url)
        aoSelecionarImagem(arquivo)

        if (origem === 'colar') {
            toast.success('Imagem colada com sucesso!')
        }
    }, [aoSelecionarImagem])

    function selecionarImagem(event) {
        const arquivo = event.target.files?.[0]
        processarArquivo(arquivo, 'selecao')
    }

    useEffect(() => {
        function aoColar(event) {
            const itens = event.clipboardData?.items
            if (!itens) return

            for (const item of itens) {
                if (item.kind === 'file' && item.type.startsWith('image/')) {
                    const arquivo = item.getAsFile()
                    if (arquivo) {
                        event.preventDefault()
                        processarArquivo(arquivo, 'colar')
                        break
                    }
                }
            }
        }

        window.addEventListener('paste', aoColar)
        return () => window.removeEventListener('paste', aoColar)
    }, [processarArquivo])

    useEffect(() => {
        if (!preview) return

        return () => {
            URL.revokeObjectURL(preview)
        }
    }, [preview])

    return (
        <div className="anexar-imagem">
            <input
                ref={inputRef}
                type="file"
                id="imagem-medicamento"
                accept="image/png,image/jpeg,image/webp"
                onChange={selecionarImagem}
            />

            <label htmlFor="imagem-medicamento" className="area-upload">
                {(preview || imagemInicial) ? (
                    <img
                        src={preview || imagemInicial}
                        alt="Pré-visualização do medicamento"
                        className="preview-medicamento"
                    />
                ) : (
                    <>
                        <span className="icone-upload">+</span>
                        <p>Adicionar imagem</p>
                        <small>Clique ou cole com Ctrl+V</small>
                        <small>PNG, JPG ou WEBP (máx. 5 MB)</small>
                    </>
                )}
            </label>
        </div>
    )
}

export default AnexarImagem