
import { useEffect, useState } from 'react'

function AnexarImagem({ aoSelecionarImagem, imagemInicial }) {
    const [preview, setPreview] = useState(null)

    function selecionarImagem(event) {
        const arquivo = event.target.files?.[0]

        if (!arquivo) return

        const formatosPermitidos = [
            'image/png',
            'image/jpeg',
            'image/webp'
        ]

        const tamanhoMaximo = 5 * 1024 * 1024

        if (!formatosPermitidos.includes(arquivo.type)) {
            alert('Selecione uma imagem PNG, JPG ou WEBP.')
            event.target.value = ''
            return
        }

        if (arquivo.size > tamanhoMaximo) {
            alert('A imagem deve ter no máximo 5 MB.')
            event.target.value = ''
            return
        }

        const url = URL.createObjectURL(arquivo)

        setPreview(url)
        aoSelecionarImagem(arquivo)
    }

    useEffect(() => {
        if (!preview) return

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
                        <small>PNG, JPG ou WEBP</small>
                    </>
                )}
            </label>
        </div>
    )
}

export default AnexarImagem
