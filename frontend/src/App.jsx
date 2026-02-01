import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../Pages/LoginPage';
import NovoPaciente from '../Pages/NovoPaciente';
import Medicos from '../Pages/Medicos';
import Pacientes from '../Pages/Pacientes';
import PacienteInfo from '../Pages/PacienteInfo';
import Marcacoes from '../Pages/Marcacoes';
import MarcacaoDetalhe from '../Pages/MarcacaoDetalhe';
import PrivacyPage from '../Pages/PrivacyPage';
import HomePaciente from '../Pages/HomePaciente';
import Contactos from '../Pages/Contactos';
import Perfil from '../Pages/Perfil';
import Navbar from './components/Navbar';
import RequireAuth from './components/RequireAuth';
import Footer from './components/Footer';
import './App.css';
import { useLocation } from 'react-router-dom';

function isAdminUser(user) {
  const userType = String(user?.id_tipo_user || '');
  return userType === '1' || String(user?.email || '').toLowerCase() === 'admin@local';
}

function App() {
  const location = useLocation();

  const token = localStorage.getItem('token');
  let userType = '';
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user') || 'null');
    userType = String(user?.id_tipo_user || '');
  } catch {
    userType = '';
    user = null;
  }
  const authedHome = userType === '1' ? '/marcacoes' : '/home';
  const isAdmin = isAdminUser(user);
  const showFooter = !isAdmin && location.pathname !== '/login' && location.pathname !== '/privacy';

  return (
    <>
      {location.pathname !== '/login' && location.pathname !== '/privacy' && <Navbar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to={token ? authedHome : '/login'} replace />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        <Route path="/home" element={<RequireAuth><HomePaciente /></RequireAuth>} />
        <Route path="/contactos" element={<RequireAuth><Contactos /></RequireAuth>} />
        <Route path="/perfil" element={<RequireAuth><Perfil /></RequireAuth>} />
        <Route path="/perfil/:utenteId" element={<RequireAuth><Perfil /></RequireAuth>} />

        <Route path="/marcacoes" element={<RequireAuth><Marcacoes /></RequireAuth>} />
        <Route path="/marcacoes/:consultaId" element={<RequireAuth><MarcacaoDetalhe /></RequireAuth>} />
        <Route path="/paciente/novo" element={<RequireAuth><NovoPaciente /></RequireAuth>} />
        <Route path="/pacientes/:utenteId/dependente/novo" element={<RequireAuth><NovoPaciente /></RequireAuth>} />
        <Route path="/medicos" element={<RequireAuth><Medicos /></RequireAuth>} />
        <Route path="/pacientes" element={<RequireAuth><Pacientes /></RequireAuth>} />
        <Route path="/pacientes/:utenteId" element={<RequireAuth><PacienteInfo /></RequireAuth>} />

        <Route path="*" element={<Navigate to={token ? authedHome : '/login'} replace />} />
      </Routes>
      {showFooter ? <Footer /> : null}
    </>
  );
}

export default App;
