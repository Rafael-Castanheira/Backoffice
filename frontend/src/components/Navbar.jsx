import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './navbar.css';

export default function Navbar() {
  const navigate = useNavigate();

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    user = null;
  }

  const userType = String(user?.id_tipo_user || '');
  const isAdmin = userType === '1' || String(user?.email || '').toLowerCase() === 'admin@local';
  const homePath = isAdmin ? '/marcacoes' : '/home';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="site-navbar">
      <div className="site-navbar-inner">
        <NavLink to={homePath} className="site-logo" aria-label="Home">
          <img src="/logo%20clini.png" alt="CliniMofelos" />
        </NavLink>

        <nav className="site-links">
          <NavLink to="/marcacoes" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>Marcações</NavLink>
          <NavLink to="/medicos" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>Médicos</NavLink>
          {isAdmin ? (
            <NavLink to="/pacientes" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>Pacientes</NavLink>
          ) : (
            <>
              <NavLink to="/contactos" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>Contactos</NavLink>
              <NavLink to="/perfil" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>Perfil</NavLink>
            </>
          )}
          <button type="button" className="nav-item nav-logout" onClick={handleLogout}>Sair</button>
        </nav>
      </div>
    </header>
  );
}
