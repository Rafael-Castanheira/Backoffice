import React, { useState } from 'react';

const pageCss = `
.np-page { font-family: Inter, Roboto, Arial, sans-serif; color: #334155; min-height: 100vh; display:flex; flex-direction:column; width:100%; box-sizing:border-box }
.np-header { display:flex; justify-content:space-between; align-items:center; padding:14px 28px; background:#f6f0e0; border-bottom:4px solid #cbd5e1 }
.np-logo { font-weight:700; color:#9b7b3a }
.np-container { max-width:1100px; margin:22px auto; padding:0 18px; flex:1 }
.np-title { color:#8b6b3a; font-size:28px; margin:6px 0 18px }
.np-form { display:block }
.np-section { margin-bottom:26px }
.np-section h2 { color:#8b6b3a; margin-bottom:12px }
.np-grid { display:grid; grid-template-columns: repeat(2, 1fr); gap:12px }
.np-grid label { display:flex; flex-direction:column; font-size:13px }
.np-grid input, .np-grid textarea, .np-grid-2 textarea, .np-grid-3 textarea { padding:8px; border:1px solid #e6e6e6; border-radius:6px; resize:vertical }
.np-grid-2 { display:grid; grid-template-columns: repeat(2,1fr); gap:16px }
.np-grid-3 { display:grid; grid-template-columns: repeat(3,1fr); gap:16px }
.np-actions { display:flex; justify-content:center; align-items:center; margin:20px 0 }
.np-save { background:#9b7b3a; color:white; padding:10px 28px; border-radius:20px; border:none; box-shadow:0 6px 12px rgba(0,0,0,0.15); cursor:pointer }
.np-error { color:#ef4444; margin-right:12px }
.np-success { color:#16a34a; margin-right:12px }

@media (max-width:900px){
  .np-grid, .np-grid-2, .np-grid-3 { grid-template-columns:1fr }
}
`;

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
        nif: form.nif || null,
        contacto_telefonico: form.contacto || null,
        morada: form.morada || null,
        data_nascimento: form.data_nascimento || null,
        id_genero: form.genero ? parseInt(form.genero) : null,
        id_estado_civil: form.estado_civil ? parseInt(form.estado_civil) : null,
        email: form.email || null
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
      if (data.temp_password) {
        setSuccess(`Paciente guardado. Credenciais provisórias enviadas por email (senha: ${data.temp_password}).`);
      } else {
        setSuccess('Paciente guardado com sucesso.');
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
      <style>{pageCss}</style>
      <header className="np-header" style={{boxSizing:'border-box'}}>
        <div className="np-logo">Clínica</div>
        <nav className="np-nav">Marcações · Médicos · Pacientes · Sair</nav>
      </header>

      <main className="np-container">
        <h1 className="np-title">&lt; Novo Paciente</h1>

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
            <button className="btn btn-success" type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </main>
    </div>
  );
}
