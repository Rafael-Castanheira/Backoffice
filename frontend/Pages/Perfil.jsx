import React from 'react';
import './simplepage.css';

export default function Perfil() {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  })();

  return (
    <div className="simplepage">
      <div className="simplepage-inner">
        <h1 className="simplepage-title">Perfil</h1>
        <p className="simplepage-text">{user?.nome ? `Olá, ${user.nome}.` : 'Dados de utilizador indisponíveis.'}</p>
      </div>
    </div>
  );
}
