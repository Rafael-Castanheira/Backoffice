import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../Pages/LoginPage';
import NovoPaciente from '../Pages/NovoPaciente';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/paciente/novo" element={<NovoPaciente />} />
      <Route path="/home" element={<div>Home Page</div>} />
    </Routes>
  );
}

export default App;
