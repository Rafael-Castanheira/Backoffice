import React, { useEffect, useMemo, useState } from 'react';
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
    const data = contentType.includes('application/json') ? await res.json().catch(() => ({})) : {};
    throw new Error(data.message || `Erro ao carregar ${url} (${res.status})`);
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [paciente, setPaciente] = useState(null);
  const [user, setUser] = useState(null);
  const [habitos, setHabitos] = useState(null);
  const [histDent, setHistDent] = useState(null);
  const [histMed, setHistMed] = useState(null);
  const [generos, setGeneros] = useState([]);
  const [estadosCivis, setEstadosCivis] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const pacientePromise = fetchJson(`/paciente/${encodeURIComponent(utenteId)}`);
        const utilizadoresPromise = fetchJson('/utilizadores');

        const generosPromise = fetchJson('/genero').catch(() => []);
        const estadosCivisPromise = fetchJson('/estadocivil').catch(() => []);

        const habitosPromise = fetchJson(`/habitosestilovida/paciente/${encodeURIComponent(utenteId)}`).catch(() => []);
        const histDentPromise = fetchJson(`/historicodentario/paciente/${encodeURIComponent(utenteId)}`).catch(() => []);
        const histMedPromise = fetchJson(`/historicomedico/paciente/${encodeURIComponent(utenteId)}`).catch(() => []);

        const [pacienteRow, utilizadoresRows, generosRows, estadosCivisRows, habitosRows, histDentRows, histMedRows] = await Promise.all([
          pacientePromise,
          utilizadoresPromise,
          generosPromise,
          estadosCivisPromise,
          habitosPromise,
          histDentPromise,
          histMedPromise,
        ]);

        const u = Array.isArray(utilizadoresRows)
          ? utilizadoresRows.find((x) => String(x?.numero_utente || '') === String(utenteId))
          : null;

        if (!cancelled) {
          setPaciente(pacienteRow || null);
          setUser(u || null);
          setGeneros(Array.isArray(generosRows) ? generosRows : []);
          setEstadosCivis(Array.isArray(estadosCivisRows) ? estadosCivisRows : []);
          setHabitos(pickLatest(habitosRows, 'data_registo'));
          setHistDent(pickLatest(histDentRows, 'data_registo'));
          setHistMed(pickLatest(histMedRows, 'data_registo'));
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

  return (
    <div className="pi-page">
      <div className="pi-inner">
        <div className="pi-header">
          <button type="button" className="pi-back" aria-label="Voltar" onClick={() => navigate(-1)}>
            &lt;
          </button>
          <h1 className="pi-title">{headerName}</h1>
          <div className="pi-utente">NIF: {paciente?.nif || utenteId}</div>
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

            <div className="pi-actions">
              <button type="button" className="pi-btn" onClick={() => navigate(-1)}>
                Voltar
              </button>
              <button type="button" className="pi-btn" onClick={() => navigate('/paciente/novo')}>
                Adicionar Dependente
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
