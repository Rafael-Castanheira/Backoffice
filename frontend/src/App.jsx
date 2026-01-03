import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../Pages/LoginPage';
import NovoPaciente from '../Pages/NovoPaciente';
import Medicos from '../Pages/Medicos';
import Navbar from './components/Navbar';
import './App.css';
import { useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  return (
    <>
      {location.pathname !== '/login' && <Navbar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/paciente/novo" element={<NovoPaciente />} />
        <Route path="/medicos" element={<Medicos />} />
        <Route path="/home" element={<div>Home Page</div>} />
      </Routes>
    </>
  );
}

export default App;
