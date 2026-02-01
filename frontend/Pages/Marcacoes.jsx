import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './marcacoes.css';

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

function toYmd(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function parseYmd(ymd) {
  if (!ymd) return null;
  const [y, m, d] = String(ymd).split('-').map((x) => Number(x));
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, delta) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function getMondayBasedWeekday(date) {
  // 0..6 where 0=Monday, 6=Sunday
  const js = date.getDay(); // 0=Sunday
  return (js + 6) % 7;
}

function parseTimeToMinutes(time) {
  const s = String(time || '').trim();
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(s);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

async function fetchJson(url, options = {}) {
  const token = localStorage.getItem('token');
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
    if (
      res.status === 500 &&
      /ECONNREFUSED|connect\s+ECONNREFUSED|proxy\s+error|socket\s+hang\s+up|HPE_INVALID|ENOTFOUND/i.test(`${raw}\n${msg}`)
    ) {
      throw new Error(`Não foi possível ligar ao backend para ${url}. Confirma se o backend está a correr em http://127.0.0.1:3001.`);
    }
    if (res.status === 500 && /internal server error/i.test(String(msg)) && url.startsWith('/')) {
      throw new Error(`Erro ao ligar ao backend para ${url}. Confirma se o backend está a correr em http://127.0.0.1:3001.`);
    }

    throw new Error(msg || `Erro ao carregar ${url} (${res.status})`);
  }

  if (res.status === 204) return null;
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) return null;
  return res.json();
}

function monthLabelPt(date) {
  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

function dayLabelPt(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function nextNonSunday(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (d.getDay() !== 0) return d;
  d.setDate(d.getDate() + 1);
  return d;
}

function formatDateDdMmYyWithSpaces(dateOnly) {
  const s = String(dateOnly || '').trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return '';
  const yy = m[1].slice(2);
  return `${m[3]} / ${m[2]} / ${yy}`;
}

function PacienteMarcacoes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [consultas, setConsultas] = useState([]);
  const [page, setPage] = useState(1);

  const user = useMemo(() => getLoggedUser(), []);
  const numeroUtente = String(user?.numero_utente || '').trim();

  const FIXED_MEDICOS_SHORT = useMemo(
    () => new Map([
      ['1', 'Dr.Sílvia'],
      ['2', 'Dr.Diogo'],
      ['3', 'Dr.Melissa'],
    ]),
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      if (!numeroUtente) {
        setConsultas([]);
        setError('Não foi possível identificar o número de utente deste utilizador.');
        setLoading(false);
        return;
      }

      try {
        const rows = await fetchJson(`/consulta?numero_utente=${encodeURIComponent(numeroUtente)}`);
        if (cancelled) return;
        const list = Array.isArray(rows) ? rows : [];
        // Extra safety: filtrar no frontend também.
        setConsultas(list.filter((c) => String(c?.numero_utente || '').trim() === numeroUtente));
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
  }, [numeroUtente]);

  const rows = useMemo(() => {
    const list = Array.isArray(consultas) ? consultas : [];
    // Já vem ordenado do backend (DESC), mas garantimos estabilidade.
    return [...list].sort((a, b) => Number(b?.id_consulta) - Number(a?.id_consulta));
  }, [consultas]);

  const PAGE_SIZE = 7;
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, page]);

  const pageNumbers = useMemo(() => {
    const maxButtons = 7;
    if (totalPages <= maxButtons) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(1, page - half);
    let end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  return (
    <div className="marcacoes-page marcacoes-page--paciente">
      <div className="marcacoes-watermark" aria-hidden="true">
        <div className="marcacoes-ring" />
      </div>

      <div className="marcacoes-inner">
        <div className="marcacoes-title-row">
          <h1 className="marcacoes-title">As suas Marcações</h1>
        </div>

        {error && <div className="marcacoes-error">{error}</div>}

        <div className="marcacoes-paciente-table" aria-label="Lista de marcações">
          <div className="marcacoes-paciente-head">
            <div className="marcacoes-paciente-head-cell">Motivo</div>
            <div className="marcacoes-paciente-head-cell">Médico</div>
            <div className="marcacoes-paciente-head-cell">Data</div>
          </div>

          <div className="marcacoes-paciente-body">
            {loading ? (
              <div className="marcacoes-loading">A carregar…</div>
            ) : pageRows.length ? (
              pageRows.map((c) => {
                const motivo = String(c?.observacoes || '').trim();
                const medico = FIXED_MEDICOS_SHORT.get(String(c?.id_medico ?? '')) || '—';
                const data = formatDateDdMmYyWithSpaces(c?.data_hora_consulta) || '—';

                const onOpen = () => {
                  if (c?.id_consulta == null) return;
                  navigate(`/marcacoes/${encodeURIComponent(String(c.id_consulta))}`);
                };

                return (
                  <button
                    key={c.id_consulta}
                    type="button"
                    className="marcacoes-paciente-row marcacoes-paciente-row--clickable"
                    onClick={onOpen}
                    aria-label={`Abrir marcação ${data}`}
                  >
                    <div className="marcacoes-paciente-cell">{motivo || '—'}</div>
                    <div className="marcacoes-paciente-cell">{medico}</div>
                    <div className="marcacoes-paciente-cell">{data}</div>
                  </button>
                );
              })
            ) : (
              <div className="marcacoes-empty">Sem marcações.</div>
            )}
          </div>
        </div>

        <div className="marcacoes-paciente-pagination" aria-label="Paginação">
          <button
            type="button"
            className="marcacoes-paciente-pagebtn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            aria-label="Página anterior"
          >
            «
          </button>

          {pageNumbers.map((n) => (
            <button
              key={n}
              type="button"
              className={'marcacoes-paciente-pagebtn' + (n === page ? ' active' : '')}
              onClick={() => setPage(n)}
              aria-current={n === page ? 'page' : undefined}
            >
              {n}
            </button>
          ))}

          <button
            type="button"
            className="marcacoes-paciente-pagebtn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            aria-label="Página seguinte"
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminMarcacoes() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedYmd, setSelectedYmd] = useState(() => toYmd(nextNonSunday(new Date())));

  const [consultas, setConsultas] = useState([]);
  const [utilizadores, setUtilizadores] = useState([]);
  const [pacientes, setPacientes] = useState([]);

  const [filterMedicoId, setFilterMedicoId] = useState('');

  const [showForm, setShowForm] = useState(false);
  // Nota: neste projeto, o "NIF" mostrado na lista corresponde ao numero_utente.
  const [form, setForm] = useState({ nif: '', id_medico: '', hora_consulta: '', duracao_min: '30', observacoes: '' });
  const [saving, setSaving] = useState(false);

  const FIXED_MEDICOS = useMemo(
    () => [
      { id: '1', nome: 'Dra. Sílvia Coimbra' },
      { id: '2', nome: 'Dr. Diogo Calçada' },
      { id: '3', nome: 'Dra. Melissa Sousa' },
    ],
    []
  );

  const medicoNameById = useMemo(() => {
    const m = new Map();
    for (const row of FIXED_MEDICOS) m.set(String(row.id), row.nome);
    return m;
  }, [FIXED_MEDICOS]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const [consultaRows, utilizadoresRows, pacientesRows] = await Promise.all([
          fetchJson('/consulta'),
          fetchJson('/utilizadores'),
          fetchJson('/paciente'),
        ]);

        if (cancelled) return;

        setConsultas(Array.isArray(consultaRows) ? consultaRows : []);
        setUtilizadores(Array.isArray(utilizadoresRows) ? utilizadoresRows : []);
        setPacientes(Array.isArray(pacientesRows) ? pacientesRows : []);
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

  const selectedDate = useMemo(() => parseYmd(selectedYmd) || new Date(), [selectedYmd]);

  useEffect(() => {
    if (selectedDate.getDay() === 0) {
      setSelectedYmd(toYmd(nextNonSunday(selectedDate)));
      setShowForm(false);
    }
  }, [selectedDate]);

  const userByUtente = useMemo(() => {
    const m = new Map();
    for (const u of Array.isArray(utilizadores) ? utilizadores : []) {
      if (u?.numero_utente != null) m.set(String(u.numero_utente), u);
    }
    return m;
  }, [utilizadores]);

  const pacienteByNumeroUtente = useMemo(() => {
    const m = new Map();
    for (const p of Array.isArray(pacientes) ? pacientes : []) {
      const ut = String(p?.numero_utente || '').trim();
      if (!ut) continue;
      m.set(ut, p);
    }
    return m;
  }, [pacientes]);

  const consultasByDay = useMemo(() => {
    const map = new Map();
    for (const c of Array.isArray(consultas) ? consultas : []) {
      const key = String(c?.data_hora_consulta || '');
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(c);
    }
    // stable order
    for (const [, list] of map) list.sort((a, b) => Number(a.id_consulta) - Number(b.id_consulta));
    return map;
  }, [consultas]);

  const selectedConsultas = useMemo(() => {
    const list = consultasByDay.get(selectedYmd) || [];
    if (!filterMedicoId) return list;
    return list.filter((c) => String(c?.id_medico ?? '') === String(filterMedicoId));
  }, [consultasByDay, selectedYmd, filterMedicoId]);

  const medicoOptions = FIXED_MEDICOS;

  const STATUS_LABEL_PT = useMemo(() => new Map([
    ['1', 'Pendente'],
    ['2', 'Confirmado'],
  ]), []);

  const confirmConsulta = async (c) => {
    const id = c?.id_consulta;
    if (id == null) return;

    const ok = window.confirm(`Confirmar que a consulta #${id} foi realizada?`);
    if (!ok) return;

    setError('');
    try {
      let updated;
      try {
        updated = await fetchJson(`/consulta/${encodeURIComponent(id)}/confirmar`, { method: 'PUT' });
      } catch (e1) {
        // Backward compatible fallback in case backend hasn't been restarted / route not present.
        if (String(e1?.message || '').includes('(404)')) {
          updated = await fetchJson(`/consulta/${encodeURIComponent(id)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_status_consulta: 2 }),
          });
        } else {
          throw e1;
        }
      }

      if (updated) setConsultas((prev) => prev.map((x) => (String(x?.id_consulta) === String(id) ? updated : x)));
    } catch (e) {
      setError(e?.message || 'Erro ao confirmar consulta');
    }
  };

  const calendarCells = useMemo(() => {
    const first = startOfMonth(currentMonth);
    const startOffset = getMondayBasedWeekday(first);
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();

    const cells = [];
    // leading blanks
    for (let i = 0; i < startOffset; i++) cells.push(null);

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(first.getFullYear(), first.getMonth(), day);
      cells.push(d);
    }

    // trailing blanks to fill 6 weeks grid (42)
    while (cells.length < 42) cells.push(null);

    return cells;
  }, [currentMonth]);

  const openNew = () => {
    if (selectedDate.getDay() === 0) {
      setError('A clínica está fechada ao domingo. Escolhe outro dia.');
      return;
    }
    setError('');
    setForm({ nif: '', id_medico: filterMedicoId || '', hora_consulta: '', duracao_min: '30', observacoes: '' });
    setShowForm(true);
  };

  const saveConsulta = async (e) => {
    e.preventDefault();
    if (selectedDate.getDay() === 0) {
      setError('A clínica está fechada ao domingo. Escolhe outro dia.');
      return;
    }
    const nif = String(form.nif || '').trim();
    if (!nif || !form.id_medico || !form.hora_consulta || !form.duracao_min) {
      setError('Indica o NIF do paciente, escolhe um médico, a hora e a duração.');
      return;
    }

    const startMin = parseTimeToMinutes(form.hora_consulta);
    const dur = Number(form.duracao_min);
    if (startMin == null || !dur || dur <= 0) {
      setError('Indica uma hora e duração válidas.');
      return;
    }
    const endMin = startMin + dur;
    const OPEN = 9 * 60 + 30;
    const CLOSE = 19 * 60;
    if (startMin < OPEN || endMin > CLOSE) {
      setError('Horário inválido: só é possível marcar entre as 09:30 e as 19:00.');
      return;
    }

    // Neste ecrã, o "NIF" é o numero_utente (como aparece na lista de pacientes)
    const paciente = pacienteByNumeroUtente.get(nif);
    if (!paciente) {
      setError('Não existe nenhum paciente com esse NIF.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        numero_utente: nif,
        id_medico: Number(form.id_medico),
        data_hora_consulta: selectedYmd,
        hora_consulta: form.hora_consulta,
        duracao_min: Number(form.duracao_min),
        observacoes: form.observacoes || null,
      };

      const created = await fetchJson('/consulta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setConsultas((prev) => [created, ...prev].filter(Boolean));
      setShowForm(false);
    } catch (e2) {
      setError(e2?.message || 'Erro ao criar marcação');
    } finally {
      setSaving(false);
    }
  };

  const deleteConsulta = async (c) => {
    const id = c?.id_consulta;
    if (id == null) return;

    const ok = window.confirm(`Eliminar esta marcação (#${id})?`);
    if (!ok) return;

    setError('');
    try {
      await fetchJson(`/consulta/${encodeURIComponent(id)}`, { method: 'DELETE' });
      setConsultas((prev) => prev.filter((x) => String(x?.id_consulta) !== String(id)));
    } catch (e) {
      setError(e?.message || 'Erro ao eliminar marcação');
    }
  };

  return (
    <div className="marcacoes-page">
      <div className="marcacoes-watermark">
        <img src="/logo%20clini.png" alt="watermark" />
      </div>

      <div className="marcacoes-inner">
        <div className="marcacoes-title-row">
          <h1 className="marcacoes-title">Marcações</h1>
        </div>

        {error && <div className="marcacoes-error">{error}</div>}

        <div className="marcacoes-grid">
          <section className="marcacoes-calendar" aria-label="Calendário">
            <div className="marcacoes-cal-header">
              <button type="button" className="marcacoes-cal-nav" onClick={() => setCurrentMonth((m) => addMonths(m, -1))} aria-label="Mês anterior">
                ‹
              </button>
              <div className="marcacoes-cal-title">{monthLabelPt(currentMonth)}</div>
              <button type="button" className="marcacoes-cal-nav" onClick={() => setCurrentMonth((m) => addMonths(m, +1))} aria-label="Próximo mês">
                ›
              </button>
            </div>

            <div className="marcacoes-calendar-body">
              <div className="marcacoes-weekdays">
                <div>Seg</div>
                <div>Ter</div>
                <div>Qua</div>
                <div>Qui</div>
                <div>Sex</div>
                <div>Sáb</div>
                <div>Dom</div>
              </div>

              <div className="marcacoes-cal-grid">
                {calendarCells.map((d, idx) => {
                  if (!d) return <div key={idx} className="marcacoes-day marcacoes-day-empty" />;

                  const ymd = toYmd(d);
                  const isSelected = ymd === selectedYmd;
                  const isToday = ymd === toYmd(new Date());
                  const count = (consultasByDay.get(ymd) || []).length;
                  const isSunday = d.getDay() === 0;

                  return (
                    <button
                      key={idx}
                      type="button"
                      className={
                        'marcacoes-day' +
                        (isSelected ? ' selected' : '') +
                        (isToday ? ' today' : '') +
                        (count ? ' has' : '') +
                        (isSunday ? ' closed' : '')
                      }
                      disabled={isSunday}
                      onClick={() => {
                        if (isSunday) return;
                        setSelectedYmd(ymd);
                        setShowForm(false);
                      }}
                      aria-label={
                        isSunday
                          ? `Domingo ${d.getDate()}, clínica fechada`
                          : `Dia ${d.getDate()}${count ? `, ${count} marcações` : ''}`
                      }
                    >
                      <div className="marcacoes-daynum">{d.getDate()}</div>
                      {count ? <div className="marcacoes-badge">{count}</div> : null}
                    </button>
                  );
                })}
              </div>

              {loading ? <div className="marcacoes-loading">A carregar…</div> : null}
            </div>
          </section>

          <section className="marcacoes-panel" aria-label="Detalhes">
            <div className="marcacoes-panel-header">
              <div className="marcacoes-panel-title">{dayLabelPt(selectedDate)}</div>
              <div className="marcacoes-panel-actions">
                <label className="marcacoes-panel-filter" aria-label="Filtrar por médico">
                  <span>Médico:</span>
                  <select value={filterMedicoId} onChange={(e) => setFilterMedicoId(e.target.value)}>
                    <option value="">Todos</option>
                    {medicoOptions.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nome}
                      </option>
                    ))}
                  </select>
                </label>

                <button type="button" className="marcacoes-panel-add" onClick={openNew}>
                  Adicionar+
                </button>
              </div>
            </div>

            <div className="marcacoes-panel-body">
              {showForm ? (
                <form className="marcacoes-form" onSubmit={saveConsulta}>
                <label className="marcacoes-field">
                  <span>NIF do paciente</span>
                  <input
                    value={form.nif}
                    inputMode="numeric"
                    placeholder="ex: 123456789"
                    onChange={(e) => {
                      const digits = String(e.target.value || '').replace(/\D+/g, '').slice(0, 9);
                      setForm((f) => ({ ...f, nif: digits }));
                    }}
                  />
                  {(() => {
                    const nif = String(form.nif || '').trim();
                    if (!nif) return null;
                    const p = pacienteByNumeroUtente.get(nif);
                    const nome = userByUtente.get(nif)?.nome || '';
                    if (!p) return <div className="marcacoes-hint">Paciente: não encontrado</div>;
                    return <div className="marcacoes-hint">Paciente: {nome ? `${nome} (${nif})` : nif}</div>;
                  })()}
                </label>

                <label className="marcacoes-field">
                  <span>Médico</span>
                  <select value={form.id_medico} onChange={(e) => setForm((f) => ({ ...f, id_medico: e.target.value }))}>
                    <option value="">— selecionar —</option>
                    {medicoOptions.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nome}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="marcacoes-field">
                  <span>Hora</span>
                  <input
                    type="time"
                    min="09:30"
                    max="19:00"
                    value={form.hora_consulta}
                    onChange={(e) => setForm((f) => ({ ...f, hora_consulta: e.target.value }))}
                  />
                </label>

                <label className="marcacoes-field">
                  <span>Duração (min)</span>
                  <select value={form.duracao_min} onChange={(e) => setForm((f) => ({ ...f, duracao_min: e.target.value }))}>
                    <option value="15">15</option>
                    <option value="30">30</option>
                    <option value="45">45</option>
                    <option value="60">60</option>
                    <option value="90">90</option>
                  </select>
                </label>

                <label className="marcacoes-field">
                  <span>Observações</span>
                  <textarea value={form.observacoes} onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))} rows={3} />
                </label>

                <div className="marcacoes-form-actions">
                  <button type="button" className="marcacoes-action" onClick={() => setShowForm(false)} disabled={saving}>
                    Cancelar
                  </button>
                  <button type="submit" className="marcacoes-add" disabled={saving}>
                    {saving ? 'A guardar…' : 'Guardar'}
                  </button>
                </div>

                <div className="marcacoes-hint">Data: {selectedYmd}</div>
                </form>
              ) : null}

              {!showForm ? (
                <div className="marcacoes-list">
                  {loading ? (
                    <div className="marcacoes-loading">A carregar…</div>
                  ) : selectedConsultas.length ? (
                    selectedConsultas.map((c) => {
                      const ut = String(c?.numero_utente || '');
                      const patientName = userByUtente.get(ut)?.nome || (ut ? `Utente ${ut}` : '—');
                      const medName = c?.id_medico != null ? medicoNameById.get(String(c.id_medico)) : '';
                      const hora = c?.hora_consulta ? String(c.hora_consulta).slice(0, 5) : '—';
                      const dur = c?.duracao_min != null ? `${c.duracao_min} min` : '—';
                      const statusId = c?.id_status_consulta != null ? String(c.id_status_consulta) : '1';
                      const statusLabel = STATUS_LABEL_PT.get(statusId) || 'Pendente';
                      const isConfirmed = statusId === '2';

                      return (
                        <article key={c.id_consulta} className="marcacoes-item">
                          <div className="marcacoes-item-top">
                            <div className="marcacoes-item-title">{patientName}</div>
                            <div className="marcacoes-item-actions">
                              {!isConfirmed ? (
                                <button
                                  type="button"
                                  className="marcacoes-item-confirm"
                                  onClick={() => confirmConsulta(c)}
                                  aria-label={`Confirmar consulta ${c.id_consulta}`}
                                  title="Confirmar consulta realizada"
                                >
                                  Confirmar
                                </button>
                              ) : null}

                              <button type="button" className="marcacoes-item-del" onClick={() => deleteConsulta(c)} aria-label={`Eliminar marcação ${c.id_consulta}`}>
                                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
                                  <path
                                    fill="currentColor"
                                    d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9zm1 13h8a2 2 0 0 0 2-2V7H6v13a2 2 0 0 0 2 2z"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="marcacoes-item-meta">
                            <div><strong>Estado:</strong> {statusLabel}</div>
                            <div><strong>Médico:</strong> {medName || '—'}</div>
                            <div><strong>Hora:</strong> {hora} &nbsp; <strong>Duração:</strong> {dur}</div>
                          </div>
                          {c?.observacoes ? <div className="marcacoes-item-notes">{c.observacoes}</div> : null}
                        </article>
                      );
                    })
                  ) : (
                    <div className="marcacoes-empty">
                      {filterMedicoId ? 'Sem marcações para este médico neste dia.' : 'Sem marcações neste dia.'}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function Marcacoes() {
  const user = getLoggedUser();
  if (isAdminUser(user)) return <AdminMarcacoes />;
  return <PacienteMarcacoes />;
}
