import React from 'react';
import { useNavigate } from 'react-router-dom';
import './privacy.css';

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="privacy-page">
      <div className="privacy-wrap">
        <h1 className="privacy-title">
          Politicas
          <br />
          de privacidade
        </h1>

        <div className="privacy-card" role="document" aria-label="Políticas de privacidade">
          <div className="privacy-content">
            <h2>1. Identificação do responsável pelo tratamento</h2>
            <p>
              <strong>CLINIMOLELOS, LDA</strong>, sociedade comercial por quotas, com o NIPC nº508353424 e com sede
              na Rua Dr. Adriano Figueiredo, nº 158, Pedra da Vista, 3640 Tondela
              <br />
              Contato do EPD (Encarregado da Proteção de Dados) xxxxx@xxxxx
            </p>

            <h2>2. Informação, consentimento e finalidade do tratamento</h2>
            <p>
              A Lei da Proteção de Dados Pessoais (em diante “LPPD”) e o Regulamento Geral de Proteção de
              Dados (Regulamento (UE) 2016/679 do Parlamento Europeu e do Conselho de 27 de abril de
              2016, em diante “RGPD”) e a Lei 58/2019, de 8 de agosto, asseguram a proteção das pessoas
              singulares no que diz respeito ao tratamento de dados pessoais e a livre circulação desses
              dados.
              <br />
              Mediante a aceitação da presente Política de Privacidade e/ou Termos e Condições o utilizador
              presta o seu consentimento informado, expresso, livre e inequívoco para que os dados
              pessoais fornecidos sejam incluídos num ficheiro da responsabilidade da CLINIMOLELOS, cujo
              tratamento nos termos do RGPD cumpre as medidas de segurança técnicas e organizativas
              adequadas.
              <br />
              Os dados presentes nesta base são unicamente os dados prestados pelos próprios,
              progenitores em caso de menores, maiores acompanhados ou cuidadores informais, na altura
              do seu registo, sendo tratados apenas para a criação do histórico clínico do utente.
              <br />
              Em caso algum será solicitada informação sobre convicções filosóficas ou políticas, filiação
              partidária ou sindical, fé religiosa, vida privada e origem racial. Os dados recolhidos não serão
              cedidos a outras pessoas ou outras entidades, sem o consentimento prévio do titular dos
              dados.
            </p>

            <h2>3. Medidas de segurança</h2>
            <p>
              A CLINIMOLELOS, declara que implementou e continuará a implementar as medidas de
              segurança de natureza técnica e organizativa necessárias para garantir a segurança dos
              dados de carácter pessoal e clínico que lhe sejam fornecidos visando evitar a sua alteração,
              perda, tratamento e/ou acesso não autorizado, tendo em conta o estado atual da tecnologia, a
              natureza dos dados armazenados e os riscos a que estão expostos bem como garante a
              confidencialidade dos mesmos.
            </p>

            <h2>4. Exercício dos direitos</h2>
            <p>
              O titular dos dados pessoais ou os representantes legais podem exercer, a todo o tempo, os
              seus direitos de acesso, retificação, apagamento, limitação, oposição e portabilidade.
            </p>

            <h2>5. Prazo de conservação</h2>
            <p>
              A clínica apenas trata os dados pessoais durante o período que se revele necessário ao
              cumprimento da sua finalidade (criação do histórico de saúde do utente), sem prejuízo dos
              dados serem conservados por um período superior, por exigências legais.
            </p>

            <h2>6. Autoridade de controlo</h2>
            <p>
              Nos termos legais, o titular dos dados tem o direito de apresentar uma reclamação em matéria
              de proteção de dados pessoais à autoridade de controlo competente, a Comissão Nacional de
              Proteção de Dados (CNPD).
            </p>
          </div>
        </div>

        <button type="button" className="privacy-accept" onClick={() => navigate('/login')}>Concordo</button>
      </div>
    </div>
  );
}
