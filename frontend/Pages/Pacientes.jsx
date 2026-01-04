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
  } catch (e) {
    throw new Error(`Falha ao ligar ao servidor ao carregar ${url}. Confirma se o backend está a correr em http://localhost:3001.`);
  }

  if (!res.ok) {
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || `Erro ao carregar ${url} (${res.status})`);
    }

    const text = await res.text().catch(() => '');
    if (res.status === 500 && /ECONNREFUSED|connect\s+ECONNREFUSED|proxy\s+error/i.test(text)) {
      throw new Error(`Não foi possível ligar ao backend para ${url}. Confirma se o backend está a correr em http://127.0.0.1:3001.`);
    }

    throw new Error(`Erro ao carregar ${url} (${res.status})`);
  }

  return res.json();
}

export default function Pacientes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pacientes, setPacientes] = useState([]);
  const [page, setPage] = useState(1);

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
