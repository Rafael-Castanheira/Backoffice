import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './pacienteinfo.css';

function formatDatePt(dateLike) {
  if (!dateLike) return '';
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function boolPt(v) {
  if (v === true) return 'Sim';
  if (v === false) return 'Não';
  return '';
}

function showValue(v) {
  if (v === null || v === undefined) return '-';
  const s = String(v);
  return s.trim() ? s : '-';
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
    throw new Error(`Falha ao ligar ao servidor ao carregar ${url}.`);
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
    if (
      res.status === 500 &&
      /ECONNREFUSED|connect\s+ECONNREFUSED|proxy\s+error|socket\s+hang\s+up|HPE_INVALID|ENOTFOUND/i.test(
        `${raw}\n${msg}`
      )
    ) {
      throw new Error(`Não foi possível ligar ao backend para ${url}. Confirma se o backend está a correr em http://127.0.0.1:3001.`);
    }

    if (res.status === 500 && /internal server error/i.test(String(msg)) && url.startsWith('/')) {
      throw new Error(`Erro ao ligar ao backend para ${url}. Confirma se o backend está a correr em http://127.0.0.1:3001.`);
    }

    throw new Error(msg || `Erro ao carregar ${url} (${res.status})`);
  }
  return res.json();
}

function pickLatest(rows, dateField) {
  if (!Array.isArray(rows) || !rows.length) return null;
  const copy = [...rows];
  copy.sort((a, b) => {
    const da = a?.[dateField] ? new Date(a[dateField]).getTime() : 0;
    const db = b?.[dateField] ? new Date(b[dateField]).getTime() : 0;
    return db - da;
  });
  return copy[0] || null;
}

export default function PacienteInfo() {
  const navigate = useNavigate();
  const { utenteId } = useParams();

  const isAdmin = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null');
      const userType = String(u?.id_tipo_user || '');
      return userType === '1' || String(u?.email || '').toLowerCase() === 'admin@local';
    } catch {
      return false;
    }
  })();

  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [paciente, setPaciente] = useState(null);
  const [user, setUser] = useState(null);
  const [habitos, setHabitos] = useState(null);
  const [histDent, setHistDent] = useState(null);
  const [histMed, setHistMed] = useState(null);
  const [dependentes, setDependentes] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [estadosCivis, setEstadosCivis] = useState([]);

  const [docs, setDocs] = useState([]);
  const [docsError, setDocsError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      setDocsError('');

      try {
        let docsErr = '';
        const pacientePromise = fetchJson(`/paciente/${encodeURIComponent(utenteId)}`);
        const utilizadoresPromise = fetchJson('/utilizadores');
        const dependentesPromise = fetchJson('/paciente').catch(() => []);

        const generosPromise = fetchJson('/genero').catch(() => []);
        const estadosCivisPromise = fetchJson('/estadocivil').catch(() => []);

        const habitosPromise = fetchJson(`/habitosestilovida/paciente/${encodeURIComponent(utenteId)}`).catch(() => []);
        const histDentPromise = fetchJson(`/historicodentario/paciente/${encodeURIComponent(utenteId)}`).catch(() => []);
        const histMedPromise = fetchJson(`/historicomedico/paciente/${encodeURIComponent(utenteId)}`).catch(() => []);

        const docsPromise = fetchJson(`/paciente/${encodeURIComponent(utenteId)}/documentos`).catch((e) => {
          docsErr = e?.message || 'Erro ao carregar documentos.';
          return [];
        });

        const [
          pacienteRow,
          utilizadoresRows,
          dependentesRows,
          generosRows,
          estadosCivisRows,
          habitosRows,
          histDentRows,
          histMedRows,
          docsRows,
        ] = await Promise.all([
          pacientePromise,
          utilizadoresPromise,
          dependentesPromise,
          generosPromise,
          estadosCivisPromise,
          habitosPromise,
          histDentPromise,
          histMedPromise,
          docsPromise,
        ]);

        const utilizadoresArray = Array.isArray(utilizadoresRows) ? utilizadoresRows : [];

        // Primary lookup: by numero_utente. Fallbacks: by paciente.id_user and/or by included user in /paciente/:id.
        let u = utilizadoresArray.find((x) => String(x?.numero_utente || '') === String(utenteId)) || null;
        if (!u && pacienteRow?.id_user != null && pacienteRow?.id_user !== '') {
          u = utilizadoresArray.find((x) => String(x?.id_user || '') === String(pacienteRow.id_user)) || null;
        }
        if (!u && pacienteRow?.id_user_utilizadore) {
          u = pacienteRow.id_user_utilizadore;
        }

        const userByUtente = new Map(utilizadoresArray.map((x) => [String(x?.numero_utente || ''), x]));
        const userByIdUser = new Map(utilizadoresArray.map((x) => [String(x?.id_user || ''), x]));

        const deps = (Array.isArray(dependentesRows) ? dependentesRows : [])
          .filter((p) => String(p?.pac_numero_utente || '') === String(utenteId))
          .map((p) => {
            const depUtente = String(p?.numero_utente || '');
            const depUser = userByUtente.get(depUtente) || userByIdUser.get(String(p?.id_user || ''));
            return {
              numero_utente: depUtente,
              nif: p?.nif || depUtente,
              nome: depUser?.nome || '',
            };
          })
          .filter((x) => x.numero_utente)
          .sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt'));

        if (!cancelled) {
          setPaciente(pacienteRow || null);
          setUser(u || null);
          setGeneros(Array.isArray(generosRows) ? generosRows : []);
          setEstadosCivis(Array.isArray(estadosCivisRows) ? estadosCivisRows : []);
          setHabitos(pickLatest(habitosRows, 'data_registo'));
          setHistDent(pickLatest(histDentRows, 'data_registo'));
          setHistMed(pickLatest(histMedRows, 'data_registo'));
          setDependentes(deps);
          setDocs(Array.isArray(docsRows) ? docsRows : []);
          setDocsError(docsErr);
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
  }, [utenteId]);

  const headerName = useMemo(() => user?.nome || 'Paciente', [user]);

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

  const dadosGerais = {
    numeroUtente: paciente?.numero_utente ?? utenteId,
    nome: user?.nome || '',
    morada: paciente?.morada || '',
    codigoPostal: paciente?.codigo_postal || '',
    nif: paciente?.nif || '',
    contacto: paciente?.contacto_telefonico || '',
    profissao: paciente?.profissao || '',
    genero: generoDesc,
    dataNascimento: paciente?.data_nascimento ? formatDatePt(paciente.data_nascimento) : '',
    estadoCivil: estadoCivilDesc,
    email: user?.email || '',
  };

  const habitosVida = {
    higieneOral: habitos?.attribuhigiene_oralhigiene || '',
    atividades: habitos?.atividades_desportivas || '',
    habitosAlimentares: habitos?.habitos_alimentares || '',
    consumoSubstancias: habitos?.consumo_substancias || '',
    bruxismo: boolPt(habitos?.bruxismo) || '',
  };

  const historicoDentario = {
    motivo: histDent?.motivo_consulta_inicial || '',
    historicoTrat: histDent?.historico_tratamentos || '',
    condicoes: histDent?.condicao_dent_preexists || '',
    anestesias: histDent?.experiencia_anestesias || '',
    sensibilidade: histDent?.historico_dor_sensibilidade || '',
  };

  const condicoesSaude = {
    alergias: histMed?.alergias || '',
    medicamentos: histMed?.medicamentos || '',
    gravidez: boolPt(histMed?.gravidez) || '',
    internacoes: histMed?.internacoes || '',
    cirurgias: histMed?.historico_cirurgico || '',
  };

  async function refreshDocs() {
    try {
      setDocsError('');
      const rows = await fetchJson(`/paciente/${encodeURIComponent(utenteId)}/documentos`).catch(() => []);
      setDocs(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setDocsError(e?.message || 'Erro ao carregar documentos.');
    }
  }

  async function uploadPdf(file) {
    if (!file) return;

    setUploading(true);
    setDocsError('');

    const token = localStorage.getItem('token');
    const fd = new FormData();
    fd.append('file', file);

    let res;
    try {
      res = await fetch(`/paciente/${encodeURIComponent(utenteId)}/documentos`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: fd,
      });
    } catch {
      setUploading(false);
      setDocsError('Falha ao ligar ao servidor para carregar o PDF.');
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
      setUploading(false);
      setDocsError(msg || `Erro no upload (${res.status})`);
      return;
    }

    await refreshDocs();
    setUploading(false);
  }

  async function downloadDoc(doc) {
    setDocsError('');
    const token = localStorage.getItem('token');

    let res;
    try {
      res = await fetch(`/paciente/${encodeURIComponent(utenteId)}/documentos/${encodeURIComponent(doc.id)}`, {
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

  async function deleteDoc(doc) {
    if (!doc?.id) return;
    const ok = window.confirm(`Eliminar o documento "${doc.originalName || 'documento.pdf'}"?`);
    if (!ok) return;

    setDocsError('');
    const token = localStorage.getItem('token');

    let res;
    try {
      res = await fetch(`/paciente/${encodeURIComponent(utenteId)}/documentos/${encodeURIComponent(doc.id)}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch {
      setDocsError('Falha ao ligar ao servidor para eliminar o PDF.');
      return;
    }

    if (!res.ok && res.status !== 204) {
      const raw = await res.text().catch(() => '');
      let msg = raw;
      try {
        const data = raw ? JSON.parse(raw) : null;
        msg = data?.message || data?.error || raw;
      } catch {
        // ignore
      }

      if (/Cannot\s+DELETE\b/i.test(String(raw))) {
        msg = 'O backend ainda não tem a rota de eliminar ativa. Reinicia o backend e tenta novamente.';
      }

      setDocsError(msg || `Erro ao eliminar (${res.status})`);
      return;
    }

    await refreshDocs();
  }

  return (
    <div className="pi-page">
      <div className="pi-inner">
        <div className="pi-header">
          <button type="button" className="pi-back" aria-label="Voltar" onClick={() => navigate(-1)}>
            &lt;
          </button>
          <h1 className="pi-title">{headerName}</h1>
          <div className="pi-utenteWrap">
            {isAdmin ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (file) uploadPdf(file);
                  }}
                />
                <button
                  type="button"
                  className="pi-uploadBtn"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  title="Carregar PDF para este paciente"
                  aria-label="Carregar PDF"
                >
                  {uploading ? (
                    <span className="pi-uploadSpinner" aria-hidden="true" />
                  ) : (
                    <svg className="pi-uploadIcon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
                      <path
                        fill="currentColor"
                        d="M5 20h14v-2H5v2zM12 2l-5.5 5.5 1.41 1.41L11 5.83V16h2V5.83l3.09 3.09 1.41-1.41L12 2z"
                      />
                    </svg>
                  )}
                </button>
              </>
            ) : null}
            <div className="pi-utente">NIF: {paciente?.nif || utenteId}</div>
          </div>
        </div>

        {error && <div className="pi-error">{error}</div>}
        {loading && <div className="pi-loading">A carregar...</div>}

        {!loading && !error && (
          <>
            <div className="pi-topgrid">
              <section className="pi-section">
                <h2>Dados Gerais</h2>
                <div className="pi-formgrid">
                  <label>
                    Nº Utente
                    <input value={showValue(dadosGerais.numeroUtente)} readOnly />
                  </label>
                  <label>
                    Nome Completo
                    <input value={showValue(dadosGerais.nome)} readOnly />
                  </label>
                  <label>
                    Morada
                    <input value={showValue(dadosGerais.morada)} readOnly />
                  </label>
                  <label>
                    Código Postal
                    <input value={showValue(dadosGerais.codigoPostal)} readOnly />
                  </label>
                  <label>
                    NIF
                    <input value={showValue(dadosGerais.nif)} readOnly />
                  </label>
                  <label>
                    Contacto Telefónico
                    <input value={showValue(dadosGerais.contacto)} readOnly />
                  </label>
                  <label>
                    Profissão
                    <input value={showValue(dadosGerais.profissao)} readOnly />
                  </label>
                  <label>
                    Género
                    <input value={showValue(dadosGerais.genero)} readOnly />
                  </label>
                  <label>
                    Data de Nascimento
                    <input value={showValue(dadosGerais.dataNascimento)} readOnly />
                  </label>
                  <label>
                    Estado civil
                    <input value={showValue(dadosGerais.estadoCivil)} readOnly />
                  </label>
                  <label>
                    Email
                    <input value={showValue(dadosGerais.email)} readOnly />
                  </label>
                </div>
              </section>

              <section className="pi-section">
                <h2>Hábitos e Estilo de Vida</h2>
                <div className="pi-formgrid two">
                  <label>
                    Higiene oral:
                    <textarea value={showValue(habitosVida.higieneOral)} readOnly />
                  </label>
                  <label>
                    Atividades desportivas:
                    <textarea value={showValue(habitosVida.atividades)} readOnly />
                  </label>
                  <label>
                    Hábitos alimentares:
                    <textarea value={showValue(habitosVida.habitosAlimentares)} readOnly />
                  </label>
                  <label>
                    Consumo de substâncias:
                    <input value={showValue(habitosVida.consumoSubstancias)} readOnly />
                  </label>
                  <label>
                    Bruxismo:
                    <input value={showValue(habitosVida.bruxismo)} readOnly />
                  </label>
                </div>
              </section>
            </div>

            <section className="pi-section">
              <h2>Histórico Dentário</h2>
              <div className="pi-formgrid three">
                <label>
                  Motivo da consulta:
                  <textarea value={showValue(historicoDentario.motivo)} readOnly />
                </label>
                <label>
                  Histórico de tratamentos:
                  <textarea value={showValue(historicoDentario.historicoTrat)} readOnly />
                </label>
                <label>
                  Condições preexistentes:
                  <textarea value={showValue(historicoDentario.condicoes)} readOnly />
                </label>
                <label>
                  Experiência com anestesias:
                  <textarea value={showValue(historicoDentario.anestesias)} readOnly />
                </label>
                <label>
                  Histórico de sensibilidade:
                  <textarea value={showValue(historicoDentario.sensibilidade)} readOnly />
                </label>
              </div>
            </section>

            <section className="pi-section">
              <h2>Condições de Saúde</h2>
              <div className="pi-formgrid three compact">
                <label>
                  Alergias:
                  <input value={showValue(condicoesSaude.alergias)} readOnly />
                </label>
                <label>
                  Medicamentos:
                  <input value={showValue(condicoesSaude.medicamentos)} readOnly />
                </label>
                <label>
                  Gravidez
                  <input value={showValue(condicoesSaude.gravidez)} readOnly />
                </label>
                <label>
                  Internações:
                  <input value={showValue(condicoesSaude.internacoes)} readOnly />
                </label>
                <label>
                  Histórico de cirurgias:
                  <input value={showValue(condicoesSaude.cirurgias)} readOnly />
                </label>
              </div>
            </section>

            <section className="pi-section">
              <h2>Dependentes</h2>

              {!dependentes.length ? (
                <div className="pi-loading">Sem dependentes associados.</div>
              ) : (
                <div className="pi-formgrid">
                  {dependentes.map((d) => (
                    <button
                      key={d.numero_utente}
                      type="button"
                      className="pi-btn"
                      onClick={() => navigate(`/pacientes/${encodeURIComponent(d.numero_utente)}`)}
                      style={{ justifyContent: 'space-between', display: 'flex', gap: 12 }}
                    >
                      <span>{d.nome || 'Dependente'}</span>
                      <span style={{ opacity: 0.9 }}>NIF: {d.nif}</span>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="pi-section">
              <h2>Documentos (PDF)</h2>

              {docsError && <div className="pi-error">{docsError}</div>}

              {!docs.length ? (
                <div className="pi-loading">Sem documentos.</div>
              ) : (
                <div className="pi-docList">
                  {docs.map((d) => (
                    <div key={d.id} className="pi-docRow">
                      <button type="button" className="pi-docBtn" onClick={() => downloadDoc(d)}>
                        <span className="pi-docName">{d.originalName || 'documento.pdf'}</span>
                        <span className="pi-docMeta">{d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString('pt-PT') : ''}</span>
                      </button>
                      {isAdmin ? (
                        <button
                          type="button"
                          className="pi-docDel"
                          title="Eliminar PDF"
                          aria-label="Eliminar PDF"
                          onClick={() => deleteDoc(d)}
                        >
                          <svg className="pi-docTrashIcon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
                            <path
                              fill="currentColor"
                              d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9zm1 13h8a2 2 0 0 0 2-2V7H6v13a2 2 0 0 0 2 2z"
                            />
                          </svg>
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="pi-actions">
              <button type="button" className="pi-btn" onClick={() => navigate(-1)}>
                Voltar
              </button>
              <button
                type="button"
                className="pi-btn"
                onClick={() => navigate(`/pacientes/${encodeURIComponent(utenteId)}/dependente/novo`)}
              >
                Adicionar Dependente
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
