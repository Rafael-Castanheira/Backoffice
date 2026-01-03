import React from 'react';
import './medicos.css';

export default function Medicos() {
  const medicos = [
    { id: 1, name: 'Dra. Sílvia Coimbra', title: 'Diretora clínica OMD nº5170', img: '/Adobe%20Express%20-%20file-2%201.png', bio: 'A Dra. Sílvia Coimbra é médica dentista dedicada às áreas de Medicina Dentária Generalista, Ortodontia e Ortodontia Funcional dos Maxilares. Com uma abordagem próxima e cuidadosa, procura oferecer tratamentos personalizados que promovam o equilíbrio estético e funcional do sorriso. Acredita numa relação de confiança e num acompanhamento atento em todas as fases do tratamento.' },
    { id: 2, name: 'Dr. Diogo Calçada', title: 'OMD nº8585', img: '/Adobe%20Express%20-%20file%201.png', bio: 'O Dr. Diogo Calçada é um médico dentista dedicado às áreas de Implantologia, Cirurgia e Reabilitação Oral. Com uma abordagem precisa e focada no bem-estar do paciente, alia conhecimento técnico a uma prática clínica de excelência. Procura criar planos de tratamento claros e personalizados, com foco na funcionalidade, estética e confiança do sorriso.' },
    { id: 3, name: 'Dra. Melissa Sousa', title: 'OMD nº11756', img: '/Adobe%20Express%20-%20file-3%201.png', bio: 'A Dra. Melissa Sousa Pinto é médica dentista que se dedica às áreas de Medicina Dentária Generalista, Odontopediatria e Harmonização Orofacial. Com uma abordagem centrada no paciente, alia tratamento oral funcional com estética facial. Aposta numa relação próxima e num acompanhamento cuidadoso, adaptando cada plano às necessidades de cada pessoa.' },
  ];

  return (
    <div className="medicos-page">
      <div className="medicos-watermark">
        <img src="/logo%20clini.png" alt="watermark" />
      </div>

      <div className="medicos-inner">
        

        <div className="medicos-grid">
          {medicos.map(m => (
            <article className="medico-card" key={m.id}>
              <div className="medico-photo">
                <img src={m.img} alt={m.name} />
                <div className="photo-tag">{m.title}</div>
              </div>
              <div className="medico-desc">
                <h3 className="medico-name">{m.name}</h3>
                <p className="medico-bio">{m.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
