import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { formatarDataHora } from '../utils/formatadorData'
import { gerarIniciais } from '../utils/gerarIniciais.js'
import './Cabecalho.css'

function Cabecalho({ aoAbrirPerfil, usuario }) {
  const [tempo, setTempo] = useState(new Date())

  useEffect(() => {
    const intervalo = setInterval(() => {
      setTempo(new Date())
    }, 1000)

    return () => clearInterval(intervalo)
  }, [])

  const { data, hora } = formatarDataHora(tempo)

  const nomeUsuario =
    usuario?.nome_usuario ??
    usuario?.nome ??
    'Usuário'

  const emailUsuario =
    usuario?.email ??
    'E-mail não disponível'

  return (
    <motion.header className="cabecalho-original" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="logo-app">
        <img src={import.meta.env.BASE_URL + 'assets/logo.png'} alt="Logo MedTime" />
        <h1><span>Med</span>Time</h1>
      </div>

      <div className="data-hora">
        <h2>{data}</h2>
        <h2>{hora}</h2>
      </div>

      <div className="acoes-cabecalho">
        <motion.button
          type="button"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className="perfil"
          onClick={aoAbrirPerfil}
          aria-label="Abrir minha conta"
          title="Minha Conta"
        >
          <div className="perfil">
            <div className="foto-perfil">
              {usuario?.foto ? (
                <img
                  src={usuario.foto}
                  alt={`Foto de ${nomeUsuario}`}
                  referrerPolicy="no-referrer"
                  className="imagem-perfil"
                />
              ) : (
                <h2>{gerarIniciais(nomeUsuario)}</h2>
              )}
            </div>

            <div className="dados-perfil">
              <p className="nome-perfil">{nomeUsuario}</p>
              <p className="email-perfil">{emailUsuario}</p>
            </div>
          </div>
        </motion.button>
      </div>
    </motion.header>
  )
}

export default Cabecalho
