import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './marcacaoDetalhe.css';

const API = import.meta.env.VITE_API_URL;

/**
 * Normalizes the URL to prevent double slashes or missing slashes
 */
function getFullUrl(endpoint) {
  const base = API.endsWith('/') ? API.slice(0, -1) : API;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
}

function getLoggedUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

function isAdminUser(user) {
  const userType = String(user?.id_tipo_user || '');
  return userType === '1' || String(user?.email || '').toLowerCase() === 'admin@local';
}

async function fetchJson(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const url = getFullUrl(endpoint);

  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error(`Falha ao ligar ao servidor ao carregar ${endpoint}. Confirma se o backend está a correr em ${API}.`);
  }

  if (!res.ok) {
    const contentType = res.headers.get('content-type') || '';
    const raw = await res.text().catch(() => '');
    let data = null;
    if (contentType.includes('application/json')) {
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        data = null;
      }
    }

    const msg = data?.message || data?.error || '';
    throw new Error(msg || `Erro ao carregar ${endpoint} (${res.status})`);
  }

  if (res.status === 204) return null;
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) return null;
  return res.json();
}

function formatDateDdMmYyNoSpaces(dateOnly) {
  const s = String(dateOnly || '').trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return '';
  return `${m[3]}/${m[2]}/${m[1].slice(2)}`;
}

export default function MarcacaoDetalhe() {
  const navigate = useNavigate();
  const { consultaId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [consulta, setConsulta] = useState(null);

  const user = useMemo(() => getLoggedUser(), []);
  const isAdmin = useMemo(() => isAdminUser(user), [user]);
  const numeroUtente = String(user?.numero_utente || '').trim();
  const nomePaciente = String(user?.nome || '').trim();

  const MEDICOS_FULL = useMemo(
    () =>
      new Map([
        ['1', 'Dra. Sílvia Coimbra'],
        ['2', 'Dr. Diogo Calçada'],
        ['3', 'Dra. Melissa Sousa'],
      ]),
    []
  );

  const STATUS_LABEL = useMemo(
    () =>
      new Map([
        ['1', 'Pendente'],
        ['2', 'Concluída'],
      ]),
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      const id = String(consultaId || '').trim();
      if (!id) {
        setError('Marcação inválida.');
        setLoading(false);
        return;
      }

      try {
        // Updated to use relative path; fetchJson handles the full URL now
        const row = await fetchJson(`/consulta/${encodeURIComponent(id)}`);
        if (cancelled) return;

        // Segurança básica no frontend: um paciente só vê as suas consultas.
        if (!isAdmin) {
          const ut = String(row?.numero_utente || '').trim();
          if (!numeroUtente || !ut || ut !== numeroUtente) {
            setError('Não tens permissão para ver esta marcação.');
            setConsulta(null);
            setLoading(false);
            return;
          }
        }

        setConsulta(row);
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Erro desconhecido');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [consultaId, isAdmin, numeroUtente]);

  const dateLabel = formatDateDdMmYyNoSpaces(consulta?.data_hora_consulta);
  const medicoLabel = MEDICOS_FULL.get(String(consulta?.id_medico ?? '')) || '—';
  const pacienteLabel = nomePaciente || '—';
  const utenteLabel = String(consulta?.numero_utente || numeroUtente || '—');
  const statusLabel = STATUS_LABEL.get(String(consulta?.id_status_consulta ?? '1')) || 'Pendente';
  const obs = String(consulta?.observacoes || '').trim();

  return (
    <div className="md-page">
      <div className="md-watermark" aria-hidden="true">
        <div className="md-ring" />
      </div>

      <div className="md-inner">
        <div className="md-header">
          <button type="button" className="md-back" onClick={() => navigate('/marcacoes')} aria-label="Voltar">
            &lt;
          </button>
          <h1 className="md-title">Marcação {dateLabel || ''}</h1>
        </div>

        {error && <div className="md-error">{error}</div>}

        <div className="md-card" aria-label="Detalhes da marcação">
          {loading ? (
            <div className="md-loading">A carregar…</div>
          ) : (
            <>
              <div className="md-line md-line--top">Dia {dateLabel || '—'}</div>
              <div className="md-line">Médico: {medicoLabel}</div>
              <div className="md-line">Paciente: {pacienteLabel}</div>
              <div className="md-line">NIF: {utenteLabel}</div>
              <div className="md-line">Estado: {statusLabel}</div>

              <div className="md-obs-label">Observação geral:</div>
              <div className="md-obs-box" role="textbox" aria-readonly="true">
                {obs || '—'}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}