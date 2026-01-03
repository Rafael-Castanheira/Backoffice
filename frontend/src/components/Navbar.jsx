import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  return (
    <header className="site-navbar">
      <div className="site-navbar-inner">
        <div className="site-logo">
          <img src="/logo%20clini.png" alt="CliniMofelos" />
        </div>

        <nav className="site-links">
          <NavLink to="/marcacoes" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>Marcações</NavLink>
          <NavLink to="/medicos" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>Médicos</NavLink>
          <NavLink to="/pacientes" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>Pacientes</NavLink>
          <button type="button" className="nav-item nav-logout" onClick={() => navigate('/login')}>Sair</button>
        </nav>
      </div>
    </header>
  );
}
