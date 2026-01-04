import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './novopaciente.css';

const initialState = {
  nome: '',
  morada: '',
  nif: '',
  contacto: '',
  genero: '',
  data_nascimento: '',
  estado_civil: '',
  email: '',

  higiene_oral: '',
  atividades_desportivas: '',
  habitos_alimentares: '',
  consumo_substancias: '',
  bruxismo: '',

  motivo_consulta: '',
  historico_tratamento: '',
  condicoes_preexistentes: '',
  experiencias_anestesicos: '',
  historico_sensibilidade: '',

  alergias: '',
  medicamentos: '',
  gravidez: '',
  internacoes: '',
  historico_cirurgias: ''
};

export default function NovoPaciente() {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const validate = () => {
    if (!form.nome.trim()) return 'O nome é obrigatório.';
    if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return 'Email inválido.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const v = validate();
    if (v) return setError(v);
    setLoading(true);
    try {
      // Map frontend form fields to backend model fields
      const generateTempUtente = () => {
        const s = ('TMP' + Date.now()).replace(/[^A-Z0-9]/ig, '');
        return s.slice(-9);
      };

      const payload = {
        numero_utente: form.nif ? String(form.nif).slice(0,9) : generateTempUtente(), // ensure max 9 chars
        nome: form.nome || null,
        nif: form.nif || null,
        contacto_telefonico: form.contacto || null,
        morada: form.morada || null,
        data_nascimento: form.data_nascimento || null,
        id_genero: form.genero ? parseInt(form.genero) : null,
        id_estado_civil: form.estado_civil ? parseInt(form.estado_civil) : null,
        email: form.email || null
      };

      const token = localStorage.getItem('token');
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      const parseBooleanPt = (val) => {
        const v = String(val || '').trim().toLowerCase();
        if (!v) return null;
        if (['sim', 's', '1', 'true', 'yes'].includes(v)) return true;
        if (['nao', 'não', 'n', '0', 'false', 'no'].includes(v)) return false;
        return null;
      };

      const res = await fetch('/paciente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Erro ao guardar paciente');
      }

      const data = await res.json().catch(() => ({}));

      const numeroUtenteCriado = data?.numero_utente || payload.numero_utente;

      // Guardar dados clínicos (best-effort). Se falhar, não impede a criação do paciente.
      const habitosPayload = {
        numero_utente: numeroUtenteCriado,
        attribuhigiene_oralhigiene: form.higiene_oral || null,
        atividades_desportivas: form.atividades_desportivas || null,
        habitos_alimentares: form.habitos_alimentares || null,
        consumo_substancias: form.consumo_substancias || null,
        bruxismo: parseBooleanPt(form.bruxismo)
      };

      const histDentPayload = {
        numero_utente: numeroUtenteCriado,
        motivo_consulta_inicial: form.motivo_consulta || null,
        historico_tratamentos: form.historico_tratamento || null,
        condicao_dent_preexists: form.condicoes_preexistentes || null,
        experiencia_anestesias: form.experiencias_anestesicos || null,
        historico_dor_sensibilidade: form.historico_sensibilidade || null
      };

      const histMedPayload = {
        numero_utente: numeroUtenteCriado,
        alergias: form.alergias || null,
        medicamentos: form.medicamentos || null,
        gravidez: parseBooleanPt(form.gravidez),
        internacoes: form.internacoes || null,
        historico_cirurgico: form.historico_cirurgias || null
      };

      const postClinical = async (url, body) => {
        const r = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify(body)
        });
        if (!r.ok) {
          const errData = await r.json().catch(() => ({}));
          throw new Error(errData.message || `Erro ao guardar ${url} (${r.status})`);
        }
      };

      let clinicalWarning = '';
      try {
        await postClinical('/habitosestilovida', habitosPayload);
        await postClinical('/historicodentario', histDentPayload);
        await postClinical('/historicomedico', histMedPayload);
      } catch (e) {
        clinicalWarning = ` (Aviso: não foi possível guardar todos os dados clínicos: ${e.message})`;
      }
      if (data.temp_password) {
        setSuccess(
          `Paciente guardado. Credenciais provisórias enviadas por email (senha: ${data.temp_password}).${clinicalWarning}`
        );
      } else {
        setSuccess(`Paciente guardado com sucesso.${clinicalWarning}`);
      }

      setForm(initialState);
    } catch (err) {
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="np-page">
      
      <header className="np-header" style={{boxSizing:'border-box'}}>
        <div className="np-logo">Clínica</div>
        <nav className="np-nav">Marcações · Médicos · Pacientes · Sair</nav>
      </header>

      <main className="np-container">
        <div className="np-title-row">
          <button type="button" className="np-back" aria-label="Voltar" onClick={() => navigate(-1)}>&lt;</button>
          <h1 className="np-title">Novo Paciente</h1>
        </div>

        <form className="np-form" onSubmit={handleSubmit}>
          <section className="np-section">
            <h2>Dados Gerais</h2>
            <div className="np-grid">
              <label>
                Nome Completo
                <input name="nome" value={form.nome} onChange={handleChange} className="form-control" />
              </label>
              <label>
                Morada
                <input name="morada" value={form.morada} onChange={handleChange} className="form-control" />
              </label>
              <label>
                NIF
                <input name="nif" value={form.nif} onChange={handleChange} className="form-control" />
              </label>
              <label>
                Contacto Telefónico
                <input name="contacto" value={form.contacto} onChange={handleChange} className="form-control" />
              </label>
              <label>
                Género
                <input name="genero" value={form.genero} onChange={handleChange} className="form-control" />
              </label>
              <label>
                Data de Nascimento
                <input name="data_nascimento" type="date" value={form.data_nascimento} onChange={handleChange} className="form-control" />
              </label>
              <label>
                Estado civil
                <input name="estado_civil" value={form.estado_civil} onChange={handleChange} className="form-control" />
              </label>
              <label>
                Email
                <input name="email" type="email" value={form.email} onChange={handleChange} className="form-control" />
              </label>
            </div>
          </section>

          <section className="np-section two-col">
            <h2>Hábitos e Estilo de Vida</h2>
            <div className="np-grid-2">
              <label>
                Higiene oral
                <textarea name="higiene_oral" value={form.higiene_oral} onChange={handleChange} className="form-control" />
              </label>
              <label>
                Atividades desportivas
                <textarea name="atividades_desportivas" value={form.atividades_desportivas} onChange={handleChange} className="form-control" />
              </label>
              <label>
                Hábitos alimentares
                <textarea name="habitos_alimentares" value={form.habitos_alimentares} onChange={handleChange} className="form-control" />
              </label>
              <label>
                Consumo de substâncias
                <textarea name="consumo_substancias" value={form.consumo_substancias} onChange={handleChange} className="form-control" />
              </label>
              <label>
                Bruxismo
                <input name="bruxismo" value={form.bruxismo} onChange={handleChange} className="form-control" />
              </label>
            </div>
          </section>

          <section className="np-section">
            <h2>Histórico Dentário</h2>
            <div className="np-grid-3">
              <label>
                Motivo da consulta
                <textarea name="motivo_consulta" value={form.motivo_consulta} onChange={handleChange} className="form-control" />
              </label>
              <label>
                Histórico de tratamento
                <textarea name="historico_tratamento" value={form.historico_tratamento} onChange={handleChange} className="form-control" />
              </label>
              <label>
                Condições preexistentes
                <textarea name="condicoes_preexistentes" value={form.condicoes_preexistentes} onChange={handleChange} className="form-control" />
              </label>
              <label>
                Experiências com anestésicos
                <textarea name="experiencias_anestesicos" value={form.experiencias_anestesicos} onChange={handleChange} className="form-control" />
              </label>
              <label>
                Histórico de sensibilidade
                <textarea name="historico_sensibilidade" value={form.historico_sensibilidade} onChange={handleChange} className="form-control" />
              </label>
            </div>
          </section>

          <section className="np-section">
            <h2>Condições de Saúde</h2>
            <div className="np-grid-3">
              <label>
                Alergias
                <textarea name="alergias" value={form.alergias} onChange={handleChange} className="form-control" />
              </label>
              <label>
                Medicamentos
                <textarea name="medicamentos" value={form.medicamentos} onChange={handleChange} className="form-control" />
              </label>
              <label>
                Gravidez
                <input name="gravidez" value={form.gravidez} onChange={handleChange} className="form-control" />
              </label>
              <label>
                Internações
                <textarea name="internacoes" value={form.internacoes} onChange={handleChange} className="form-control" />
              </label>
              <label>
                Histórico de cirurgias
                <textarea name="historico_cirurgias" value={form.historico_cirurgias} onChange={handleChange} className="form-control" />
              </label>
            </div>
          </section>

          <div className="np-actions">
            {error && <div className="np-error">{error}</div>}
            {success && <div className="np-success">{success}</div>}
            <button className="np-save" type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </main>
    </div>
  );
}
