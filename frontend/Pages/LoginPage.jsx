import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!email.trim()) {
      setError('Por favor, insira o email.');
      return false;
    }
    // A more permissive regex to allow for local domains like 'admin@local'
    const re = /^[^\s@]+@[^\s@]+$/;
    if (!re.test(email)) {
      setError('Email inválido.');
      return false;
    }
    if (!password) {
      setError('Por favor, insira a password.');
      return false;
    }
    if (password.length < 4) {
      setError('A password deve ter pelo menos 4 caracteres.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      console.log('Fetching URL: /auth/login');
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Erro no login');
      }
      const data = await res.json();
      if (data.token) localStorage.setItem('token', data.token);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo"> 
          <img src="/logo%20clini.png" alt="CliniMofelos" className="login-image" />
          <div className="logo-sub">CLINIMOFELOS</div>
        </div>

        <h1 className="login-title">LOGIN</h1>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label" htmlFor="email">Utilizador</label>
          <input
            id="email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
            placeholder="" 
            autoComplete="username"
          />

          <label className="login-label" htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            placeholder="" 
            autoComplete="current-password"
          />

          <button type="submit" className="login-button" disabled={loading}>{loading ? 'Entrando...' : 'ENTRAR'}</button>

          <div className="login-links">
            <a onClick={() => navigate('/privacy')} className="small-link">política de privacidade</a>
            <a onClick={() => navigate('/forgot-password')} className="small-link">esqueceu-se da palavra-passe?</a>
          </div>

          {error && <div className="login-error">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
