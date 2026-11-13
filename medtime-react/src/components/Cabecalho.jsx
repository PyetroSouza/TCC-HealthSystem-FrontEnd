import { useState, useEffect } from 'react';
import { formatarDataHora } from '../utils/formatadorData';
import { LogOut } from 'lucide-react'
import './Cabecalho.css';

function Cabecalho({aoSair}) {
  const [tempo, setTempo] = useState(new Date());

  useEffect(() => {
    const intervalo = setInterval(() => {
      setTempo(new Date());
    }, 1000);

    return () => clearInterval(intervalo);
  }, []);

  const { data, hora } = formatarDataHora(tempo);

  return (
    <header className="cabecalho-original">
      <div className="logo-app">
        <img src="/assets/logo.png" alt="Logo MedTime" />

        <h1>
          <span>Med</span>Time
        </h1>
      </div>

      <div className="data-hora">
        <h2>{data}</h2>
        <h2>{hora}</h2>
      </div>

      <div className="perfil">
        <div className="foto-perfil">
          <h2>RB</h2>
        </div>

        <div className="dados-perfil">
          <p className="nome-perfil">Rafael Braga</p>
          <p className="email-perfil">rafaelbraga@gmail.com</p>
        </div>
      </div>

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

    </header>
  );
}

export default Cabecalho;
