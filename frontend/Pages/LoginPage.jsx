import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
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
    <div className="container vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow" style={{ maxWidth: 400, width: '100%' }}>
        <div className="card-body p-4">
          <h2 className="h5 mb-3">Entrar na sua conta</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                placeholder="seu@exemplo.com"
                autoComplete="email"
              />
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>

            <div className="d-flex justify-content-between align-items-center mt-3 small text-muted">
              <div>
                Não tem conta? <span className="text-primary" style={{ cursor: 'pointer' }} onClick={() => navigate('/signup')}>Registar</span>
              </div>
              <div className="text-primary" style={{ cursor: 'pointer' }} onClick={() => navigate('/forgot-password')}>Esqueci a password</div>
            </div>

            {error && <div className="text-danger small mt-3">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
