import React from 'react';
import { useNavigate } from 'react-router-dom';
import './homepaciente.css';


export default function HomePaciente() {
  const navigate = useNavigate();

  return (
    <div className="homepaciente-page">
      <div className="homepaciente-watermark" aria-hidden="true">
        <div className="homepaciente-ring" />
      </div>

      <div className="homepaciente-inner">
        <div className="homepaciente-grid">
          <div className="homepaciente-copy">
            <h1 className="homepaciente-title">Clinimolelos</h1>
            <h2 className="homepaciente-subtitle">O seu sorriso é a nossa missão!</h2>

            <p className="homepaciente-text">
              No coração da cidade, a Clinimolelos destaca-se pelo atendimento personalizado e pela excelência em cuidados dentários.
              Com uma equipa experiente e tecnologia de ponta, oferecemos prevenção, diagnóstico e tratamentos eficazes num ambiente
              acolhedor e de confiança.
            </p>
            <p className="homepaciente-text">
              Mais do que uma clínica, somos um espaço onde o bem-estar e o conforto dos nossos pacientes estão sempre em primeiro lugar.
            </p>

            <div className="homepaciente-actions">
              <button type="button" className="homepaciente-primary" onClick={() => navigate('/marcacoes')}>Ver marcações</button>
              <button type="button" className="homepaciente-secondary" onClick={() => navigate('/medicos')}>Conhecer médicos</button>
            </div>
          </div>

          <div className="homepaciente-hero" aria-label="Imagem de boas-vindas">
            <div className="homepaciente-hero-card">
              <img src="/image%206.png" alt="" className="homepaciente-hero-img" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
