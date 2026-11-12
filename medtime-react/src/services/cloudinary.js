export async function enviarImagem(arquivo) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  const formData = new FormData()

  formData.append('file', arquivo)
  formData.append('upload_preset', uploadPreset)

  const resposta = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData
    }
  )

  if (!resposta.ok) {
    const erro = await resposta.json()

    console.error('Erro do Cloudinary:', erro)

    throw new Error(
      erro.error?.message || 'Não foi possível enviar a imagem.'
    )
  }

  const dados = await resposta.json()

  return dados.secure_url
}
