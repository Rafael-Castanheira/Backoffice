import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import './perfil.css';

function formatDatePt(dateLike) {
  if (!dateLike) return '';
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
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
    throw new Error('Falha ao ligar ao servidor.');
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
    throw new Error(msg || `Erro ao carregar (${res.status})`);
  }

  return res.json();
}

function readUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

function showValue(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return s.trim() ? s : '';
}

export default function Perfil() {
  const location = useLocation();
  const params = useParams();
  const sessionUser = useMemo(() => readUser(), []);
  const sessionUtenteId = String(sessionUser?.numero_utente || '').trim();
  const routeUtenteId = String(params?.utenteId || '').trim();
  const viewUtenteId = routeUtenteId || sessionUtenteId;
  const isSelfView = String(viewUtenteId) === String(sessionUtenteId);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paciente, setPaciente] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [docs, setDocs] = useState([]);
  const [docsError, setDocsError] = useState('');
  const [dependentes, setDependentes] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [estadosCivis, setEstadosCivis] = useState([]);

  const [showPassForm, setShowPassForm] = useState(false);
  const [passCurrent, setPassCurrent] = useState('');
  const [passNext, setPassNext] = useState('');
  const [passConfirm, setPassConfirm] = useState('');
  const [passError, setPassError] = useState('');
  const [passOk, setPassOk] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!viewUtenteId) {
        setLoading(false);
        setError('Não foi possível identificar o nº de utente deste utilizador.');
        return;
      }

      setLoading(true);
      setError('');
      setDocsError('');

      try {
        let docsErr = '';
        const pacientePromise = fetchJson(`/paciente/${encodeURIComponent(viewUtenteId)}`);
        const docsPromise = fetchJson(`/paciente/${encodeURIComponent(viewUtenteId)}/documentos`).catch((e) => {
          docsErr = e?.message || 'Erro ao carregar documentos.';
          return [];
        });
        const generosPromise = fetchJson('/genero').catch(() => []);
        const estadosCivisPromise = fetchJson('/estadocivil').catch(() => []);
        const dependentesPromise = fetchJson('/paciente').catch(() => []);
        const utilizadoresPromise = fetchJson('/utilizadores').catch(() => []);

        const [pacienteRow, docsRows, generosRows, estadosCivisRows, dependentesRows, utilizadoresRows] = await Promise.all([
          pacientePromise,
          docsPromise,
          generosPromise,
          estadosCivisPromise,
          dependentesPromise,
          utilizadoresPromise,
        ]);

        const utilizadoresArray = Array.isArray(utilizadoresRows) ? utilizadoresRows : [];
        const userByUtente = new Map(utilizadoresArray.map((x) => [String(x?.numero_utente || ''), x]));
        const userByIdUser = new Map(utilizadoresArray.map((x) => [String(x?.id_user || ''), x]));

        const viewedUser =
          userByUtente.get(String(viewUtenteId)) ||
          userByIdUser.get(String(pacienteRow?.id_user || '')) ||
          (String(viewUtenteId) === String(sessionUtenteId) ? sessionUser : null);

        const deps = (Array.isArray(dependentesRows) ? dependentesRows : [])
          .filter((p) => String(p?.pac_numero_utente || '') === String(viewUtenteId))
          .map((p) => {
            const depUtente = String(p?.numero_utente || '');
            const depUser = userByUtente.get(depUtente) || userByIdUser.get(String(p?.id_user || ''));
            return {
              numero_utente: depUtente,
              nome: depUser?.nome || '',
            };
          })
          .filter((x) => x.numero_utente)
          .sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt'));

        if (!cancelled) {
          setPaciente(pacienteRow || null);
          setProfileUser(viewedUser || null);
          setDocs(Array.isArray(docsRows) ? docsRows : []);
          setDocsError(docsErr);
          setDependentes(deps);
          setGeneros(Array.isArray(generosRows) ? generosRows : []);
          setEstadosCivis(Array.isArray(estadosCivisRows) ? estadosCivisRows : []);
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
  }, [viewUtenteId, sessionUtenteId, sessionUser]);

  const generoDesc = useMemo(() => {
    const id = paciente?.id_genero;
    if (id == null || id === '') return '';
    const row = Array.isArray(generos) ? generos.find((g) => String(g?.id_genero) === String(id)) : null;
    return row?.descricao_pt || String(id);
  }, [paciente, generos]);

  const estadoCivilDesc = useMemo(() => {
    const id = paciente?.id_estado_civil;
    if (id == null || id === '') return '';
    const row = Array.isArray(estadosCivis)
      ? estadosCivis.find((g) => String(g?.id_estado_civil) === String(id))
      : null;
    return row?.descricao_pt || String(id);
  }, [paciente, estadosCivis]);

  const dados = useMemo(
    () => ({
      nome: profileUser?.nome || sessionUser?.nome || '',
      morada: paciente?.morada || '',
      nif: paciente?.nif || '',
      contacto: paciente?.contacto_telefonico || '',
      genero: generoDesc,
      dataNascimento: paciente?.data_nascimento ? formatDatePt(paciente.data_nascimento) : '',
      estadoCivil: estadoCivilDesc,
      email: profileUser?.email || sessionUser?.email || '',
    }),
    [profileUser, sessionUser, paciente, generoDesc, estadoCivilDesc]
  );

  async function downloadDoc(doc) {
    if (!doc?.id) return;
    setDocsError('');

    const token = localStorage.getItem('token');
    let res;
    try {
      res = await fetch(`/paciente/${encodeURIComponent(viewUtenteId)}/documentos/${encodeURIComponent(doc.id)}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch {
      setDocsError('Falha ao ligar ao servidor para descarregar o PDF.');
      return;
    }

    if (!res.ok) {
      const raw = await res.text().catch(() => '');
      let msg = raw;
      try {
        const data = raw ? JSON.parse(raw) : null;
        msg = data?.message || data?.error || raw;
      } catch {
        // ignore
      }
      setDocsError(msg || `Erro no download (${res.status})`);
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc?.originalName || 'documento.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function submitPasswordChange(e) {
    e.preventDefault();
    setPassError('');
    setPassOk('');

    const cur = String(passCurrent || '');
    const nxt = String(passNext || '');
    const conf = String(passConfirm || '');

    if (!cur || !nxt || !conf) {
      setPassError('Preencha todos os campos.');
      return;
    }
    if (nxt !== conf) {
      setPassError('A confirmação não corresponde à nova password.');
      return;
    }
    if (nxt.length < 6) {
      setPassError('A nova password deve ter pelo menos 6 caracteres.');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ currentPassword: cur, newPassword: nxt }),
      });

      if (!res.ok) {
        const raw = await res.text().catch(() => '');
        let msg = raw;
        try {
          const data = raw ? JSON.parse(raw) : null;
          msg = data?.message || data?.error || raw;
        } catch {
          // ignore
        }
        setPassError(msg || `Erro ao alterar password (${res.status})`);
        return;
      }

      setPassOk('Password alterada com sucesso.');
      setPassCurrent('');
      setPassNext('');
      setPassConfirm('');
      setShowPassForm(false);
    } catch {
      setPassError('Falha ao ligar ao servidor.');
    }
  }

  return (
    <main className="perfil-page">
      <div className="perfil-inner">
        {error ? <div className="perfil-error">{error}</div> : null}
        {loading ? <div className="perfil-muted">A carregar...</div> : null}

        {!loading && !error && (
          <div className="perfil-grid">
            <section className="perfil-card" aria-label="Dados do perfil">
              <h1 className="perfil-title">Perfil</h1>

              <div className="perfil-form">
                <div className="perfil-field full">
                  <div className="perfil-label">Nome Completo</div>
                  <input className="perfil-input" value={showValue(dados.nome)} readOnly />
                </div>

                <div className="perfil-field full">
                  <div className="perfil-label">Morada</div>
                  <input className="perfil-input" value={showValue(dados.morada)} readOnly />
                </div>

                <div className="perfil-field">
                  <div className="perfil-label">NIF</div>
                  <input className="perfil-input" value={showValue(dados.nif)} readOnly />
                </div>

                <div className="perfil-field">
                  <div className="perfil-label">Contacto Telefónico</div>
                  <input className="perfil-input" value={showValue(dados.contacto)} readOnly />
                </div>

                <div className="perfil-field">
                  <div className="perfil-label">Género</div>
                  <input className="perfil-input" value={showValue(dados.genero)} readOnly />
                </div>

                <div className="perfil-field">
                  <div className="perfil-label">Data de Nascimento</div>
                  <input className="perfil-input" value={showValue(dados.dataNascimento)} readOnly />
                </div>

                <div className="perfil-field full">
                  <div className="perfil-label">Estado civil</div>
                  <input className="perfil-input" value={showValue(dados.estadoCivil)} readOnly />
                </div>

                <div className="perfil-field full">
                  <div className="perfil-label">Email</div>
                  <input className="perfil-input" value={showValue(dados.email)} readOnly />
                </div>
              </div>

              <div className="perfil-sectionTitle">Seus Dependentes</div>
              {dependentes.length ? (
                <div className="perfil-dependentList">
                  {dependentes.map((d) => (
                    <Link key={d.numero_utente} className="perfil-dependentLink" to={`/perfil/${encodeURIComponent(d.numero_utente)}`}>
                      {d.nome || d.numero_utente}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="perfil-muted">Não tem dependentes</div>
              )}

              <div className="perfil-sectionTitle">Segurança</div>
              {isSelfView ? (
                <div className="perfil-muted">
                  {passOk ? <div className="perfil-ok">{passOk}</div> : null}
                  {passError ? <div className="perfil-error">{passError}</div> : null}

                  {!showPassForm ? (
                    <button
                      type="button"
                      className="perfil-link perfil-linkBtn"
                      onClick={() => {
                        setPassOk('');
                        setPassError('');
                        setShowPassForm(true);
                      }}
                    >
                      Alterar Palavra-Passe
                    </button>
                  ) : (
                    <form className="perfil-passForm" onSubmit={submitPasswordChange}>
                      <input
                        className="perfil-passInput"
                        type="password"
                        placeholder="Password atual"
                        value={passCurrent}
                        onChange={(e) => setPassCurrent(e.target.value)}
                        autoComplete="current-password"
                      />
                      <input
                        className="perfil-passInput"
                        type="password"
                        placeholder="Nova password"
                        value={passNext}
                        onChange={(e) => setPassNext(e.target.value)}
                        autoComplete="new-password"
                      />
                      <input
                        className="perfil-passInput"
                        type="password"
                        placeholder="Confirmar nova password"
                        value={passConfirm}
                        onChange={(e) => setPassConfirm(e.target.value)}
                        autoComplete="new-password"
                      />
                      <div className="perfil-passActions">
                        <button type="submit" className="perfil-passBtn">Guardar</button>
                        <button
                          type="button"
                          className="perfil-passBtn perfil-passBtnSecondary"
                          onClick={() => {
                            setShowPassForm(false);
                            setPassError('');
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <div className="perfil-muted">&nbsp;</div>
              )}

              <div className="perfil-sectionTitle">Proteção de Dados</div>
              <Link className="perfil-link" to="/privacy" state={{ from: location.pathname }}>
                Política de Privacidade
              </Link>
            </section>

            <aside className="perfil-right" aria-label="Documentos e relatórios">
              <div className="perfil-photo" aria-label="Imagem">
                <img src="/image%206.png" alt="" />
              </div>

              <div className="perfil-docsTitle">Documentos e Relatórios</div>
              <div className="perfil-docsCard">
                {docsError ? <div className="perfil-error">{docsError}</div> : null}
                <div className="perfil-docsList">
                  {docs.length ? (
                    docs.map((doc, idx) => (
                      <button
                        key={doc.id || idx}
                        type="button"
                        className="perfil-docBtn"
                        onClick={() => downloadDoc(doc)}
                        title={doc.originalName || 'documento.pdf'}
                      >
                        <span className="perfil-docName">{doc.originalName || `Comprovativo ${idx + 1}`}</span>
                        <span className="perfil-docBadge">PDF</span>
                      </button>
                    ))
                  ) : (
                    <div className="perfil-muted">Sem documentos.</div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>

      <img className="perfil-watermark" src="/logo%20clini.png" alt="" aria-hidden="true" />
    </main>
  );
}
