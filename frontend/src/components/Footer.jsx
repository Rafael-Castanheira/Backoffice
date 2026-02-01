import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Footer.css';

function IconPin(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        fill="currentColor"
        d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"
      />
    </svg>
  );
}

function IconPhone(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        fill="currentColor"
        d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V21a1 1 0 0 1-1 1C10.3 22 2 13.7 2 3a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2z"
      />
    </svg>
  );
}

function IconFacebook(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="44"
      height="44"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        fill="currentColor"
        d="M13.5 22v-8h2.7l.4-3H13.5V9.1c0-.9.3-1.6 1.7-1.6h1.4V4.8c-.7-.1-1.6-.2-2.7-.2-2.7 0-4.6 1.6-4.6 4.6V11H7v3h2.3v8h4.2z"
      />
    </svg>
  );
}

export default function Footer() {
  const location = useLocation();

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer-inner">
        <div className="site-footer-col">
          <div className="site-footer-brand">
            <div className="site-footer-title">Clinica Clinimolelos</div>
            <img
              className="site-footer-logo"
              src="/logo%20clini.png"
              alt=""
              aria-hidden="true"
            />
          </div>

          <div className="site-footer-item">
            <span className="site-footer-icon" aria-hidden="true">
              <IconPin />
            </span>
            <div className="site-footer-text">
              Av. Dr. Adriano Figueiredo
              <br />
              158,
              <br />
              3460-009 Tondela
            </div>
          </div>

          <div className="site-footer-item">
            <span className="site-footer-icon" aria-hidden="true">
              <IconPhone />
            </span>
            <div className="site-footer-text">+351 232 823 220</div>
          </div>

          <div className="site-footer-item site-footer-hours">
            <div className="site-footer-muted">
              Horário: De Segunda a Sábado,
              <br />
              das 9:30h às 19h
            </div>
          </div>
        </div>

        <div className="site-footer-col site-footer-col--legal">
          <div className="site-footer-title">Informação Legal</div>
          <Link className="site-footer-link" to="/privacy" state={{ from: location.pathname }}>Politica de Privacidade</Link>
          <a
            className="site-footer-link"
            href="https://www.livroreclamacoes.pt/Inicio/"
            target="_blank"
            rel="noreferrer"
          >
            Livro de Reclamações
          </a>
          <div className="site-footer-link site-footer-link--static">Registo ERS: [XXXXX]</div>
        </div>

        <div className="site-footer-col site-footer-col--social">
          <div className="site-footer-title">Siga-nos</div>
          <a
            className="site-footer-social"
            href="https://www.facebook.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
          >
            <IconFacebook />
          </a>
        </div>
      </div>
    </footer>
  );
}
