
import { useState, useEffect } from 'react'
import { formatarDataHora } from '../utils/formatadorData'
import { gerarIniciais } from '../utils/gerarIniciais.js'
import { LogOut } from 'lucide-react'
import './Cabecalho.css'

function Cabecalho({ aoSair, aoAbrirPerfil, usuario }) {
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
    <header className="cabecalho-original">

      {/* Coluna 1: logo */}
      <div className="logo-app">
        <img src={import.meta.env.BASE_URL + 'assets/logo.png'} alt="Logo MedTime" />

        <h1>
          <span>Med</span>Time
        </h1>
      </div>

      {/* Coluna 2: data e hora */}
      <div className="data-hora">
        <h2>{data}</h2>
        <h2>{hora}</h2>
      </div>

      {/* Coluna 3: perfil e logout */}
      <div className="acoes-cabecalho">

        <button
          type="button"
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
        </button>
        <button
          type="button"
          className="botao-logout"
          onClick={aoSair}
          aria-label="Encerrar sessão"
          title="Sair do MedTime"
        >
          <LogOut size={18} />
          <span>Sair</span>
        </button>

      </div>

    </header>
  )
}

export default Cabecalho
