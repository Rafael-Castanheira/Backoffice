import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './pacientes.css';

const PAGE_SIZE = 7;
const PACIENTE_TIPO_USER_ID_FALLBACK = 2;

function formatDatePt(dateLike) {
  if (!dateLike) return '';
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd} / ${mm} / ${yy}`;
}

async function fetchJson(url) {
  const token = localStorage.getItem('token');
  let res;
  try {
    res = await fetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    throw new Error(`Falha ao ligar ao servidor ao carregar ${url}. Confirma se o backend está a correr em http://localhost:3001.`);
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

    // Quando o backend não está a correr, o Vite proxy tende a devolver 500 com um corpo de erro.
    // Em algumas versões, vem em JSON com { error: "Internal Server Error" }.
    if (
      res.status === 500 &&
      /ECONNREFUSED|connect\s+ECONNREFUSED|proxy\s+error|socket\s+hang\s+up|HPE_INVALID|ENOTFOUND/i.test(
        `${raw}\n${msg}`
      )
    ) {
      throw new Error(`Não foi possível ligar ao backend para ${url}. Confirma se o backend está a correr em http://127.0.0.1:3001.`);
    }

    // Fallback: Vite proxy pode devolver apenas "Internal Server Error" sem detalhes.
    if (res.status === 500 && /internal server error/i.test(String(msg)) && url.startsWith('/')) {
      throw new Error(`Erro ao ligar ao backend para ${url}. Confirma se o backend está a correr em http://127.0.0.1:3001.`);
    }

    throw new Error(msg || `Erro ao carregar ${url} (${res.status})`);
  }

  return res.json();
}

export default function Pacientes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pacientes, setPacientes] = useState([]);
  const [page, setPage] = useState(1);

  const deletePaciente = async (numeroUtente, nome) => {
    if (!numeroUtente) return;
    const label = nome ? `${nome} (${numeroUtente})` : String(numeroUtente);
    const ok = window.confirm(`Eliminar o paciente ${label}?`);
    if (!ok) return;

    setError('');
    try {
      const token = localStorage.getItem('token');
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`/paciente/${encodeURIComponent(numeroUtente)}`, {
        method: 'DELETE',
        headers: { ...authHeaders },
      });

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
        throw new Error(msg || `Erro ao eliminar paciente (${res.status})`);
      }

      setPacientes((rows) => rows.filter((r) => String(r.numero_utente) !== String(numeroUtente)));
      setPage((p) => Math.max(1, p));
    } catch (e) {
      setError(e?.message || 'Erro ao eliminar paciente');
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const [pacienteRows, utilizadoresRows] = await Promise.all([
          fetchJson('/paciente'),
          fetchJson('/utilizadores'),
        ]);

        const tipoPacienteId = PACIENTE_TIPO_USER_ID_FALLBACK;

        const utilizadoresPaciente = Array.isArray(utilizadoresRows)
          ? utilizadoresRows.filter((u) => {
              if (u?.id_tipo_user === tipoPacienteId) return true;
              // fallback: se tiver numero_utente, muito provável ser paciente
              return !!u?.numero_utente;
            })
          : [];

        const userByUtente = new Map(utilizadoresPaciente.map((u) => [String(u.numero_utente || ''), u]));

        const merged = (Array.isArray(pacienteRows) ? pacienteRows : [])
          .map((p) => {
            const utente = String(p.numero_utente || '');
            const user = userByUtente.get(utente);
            return {
              numero_utente: utente,
              nome: user?.nome || '',
              data: user?.data_criacao || null,
            };
          })
          // garantir que aparece só quem é utilizador do tipo paciente
          .filter((row) => row.numero_utente && userByUtente.has(row.numero_utente))
          .sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt'));

        if (!cancelled) {
          setPacientes(merged);
          setPage(1);
        }
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
  }, []);

  const totalPages = Math.max(1, Math.ceil(pacientes.length / PAGE_SIZE));

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return pacientes.slice(start, start + PAGE_SIZE);
  }, [pacientes, page]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="pacientes-page">
      <div className="pacientes-watermark">
        <img src="/logo%20clini.png" alt="watermark" />
      </div>

      <div className="pacientes-inner">
        <div className="pacientes-title-row">
          <h1 className="pacientes-title">Lista de Pacientes</h1>
          <button type="button" className="pacientes-add" onClick={() => navigate('/paciente/novo')}>
            Adicionar+
          </button>
        </div>

        {error && <div className="pacientes-error">{error}</div>}

        <div className="pacientes-table">
          <div className="pacientes-head">
            <div className="pacientes-head-cell">NIF</div>
            <div className="pacientes-head-cell">Nome</div>
            <div className="pacientes-head-cell">Data</div>
            <div className="pacientes-head-cell pacientes-head-actions" title="Ações" aria-label="Ações">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
                <path
                  fill="currentColor"
                  d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9zm1 13h8a2 2 0 0 0 2-2V7H6v13a2 2 0 0 0 2 2z"
                />
              </svg>
            </div>
          </div>

          {loading ? (
            <div className="pacientes-loading">A carregar...</div>
          ) : (
            <div className="pacientes-body">
              {pageItems.map((p) => (
                <div
                  className="pacientes-row pacientes-row-click"
                  key={p.numero_utente}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/pacientes/${encodeURIComponent(p.numero_utente)}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      navigate(`/pacientes/${encodeURIComponent(p.numero_utente)}`);
                    }
                  }}
                >
                  <div className="pacientes-cell">{p.numero_utente}</div>
                  <div className="pacientes-cell">{p.nome || '-'}</div>
                  <div className="pacientes-cell">{formatDatePt(p.data)}</div>
                  <div className="pacientes-cell pacientes-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="pacientes-delete"
                      aria-label={`Eliminar ${p.nome || 'paciente'} (${p.numero_utente})`}
                      title="Eliminar"
                      onClick={() => deletePaciente(p.numero_utente, p.nome)}
                    >
                      <svg className="pacientes-trash-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
                        <path
                          fill="currentColor"
                          d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9zm1 13h8a2 2 0 0 0 2-2V7H6v13a2 2 0 0 0 2 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              {!pageItems.length && !error && <div className="pacientes-empty">Sem pacientes para mostrar.</div>}
            </div>
          )}
        </div>

        <div className="pacientes-pagination">
          <button
            type="button"
            className="pacientes-pagebtn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={loading || page <= 1}
          >
            «
          </button>

          {Array.from({ length: totalPages }).slice(0, 9).map((_, idx) => {
            const p = idx + 1;
            return (
              <button
                type="button"
                key={p}
                className={p === page ? 'pacientes-pagebtn active' : 'pacientes-pagebtn'}
                onClick={() => setPage(p)}
                disabled={loading}
              >
                {p}
              </button>
            );
          })}

          <button
            type="button"
            className="pacientes-pagebtn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={loading || page >= totalPages}
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}
