import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../Pages/LoginPage';
import NovoPaciente from '../Pages/NovoPaciente';
import Medicos from '../Pages/Medicos';
import Pacientes from '../Pages/Pacientes';
import PacienteInfo from '../Pages/PacienteInfo';
import Marcacoes from '../Pages/Marcacoes';
import PrivacyPage from '../Pages/PrivacyPage';
import Navbar from './components/Navbar';
import './App.css';
import { useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  return (
    <>
      {location.pathname !== '/login' && location.pathname !== '/privacy' && <Navbar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/marcacoes" element={<Marcacoes />} />
        <Route path="/paciente/novo" element={<NovoPaciente />} />
        <Route path="/pacientes/:utenteId/dependente/novo" element={<NovoPaciente />} />
        <Route path="/medicos" element={<Medicos />} />
        <Route path="/pacientes" element={<Pacientes />} />
        <Route path="/pacientes/:utenteId" element={<PacienteInfo />} />
        <Route path="/home" element={<div>Home Page</div>} />
      </Routes>
    </>
  );
}

export default App;
