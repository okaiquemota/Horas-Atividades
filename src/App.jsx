import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import NovoRelatorio from './pages/NovoRelatorio'
import FilaAprovacao from './pages/FilaAprovacao'
import BuscaRelatorios from './pages/BuscaRelatorios'
import './App.css'

function App() {
  const [professorId, setProfessorId] = useState('')
  const [coordenadorId, setCoordenadorId] = useState('')

  return (
    <BrowserRouter>
      <header id="topbar">
        <h1 className="brand">Relatórios de Aula</h1>
        <nav>
          <NavLink to="/novo">Novo relatório</NavLink>
          <NavLink to="/fila">Fila de aprovação</NavLink>
          <NavLink to="/busca">Arquivo</NavLink>
        </nav>
      </header>

      <section id="ids-demo">
        <label>
          Professor ID
          <input value={professorId} onChange={(e) => setProfessorId(e.target.value)} placeholder="uuid do professor" />
        </label>
        <label>
          Coordenador ID
          <input value={coordenadorId} onChange={(e) => setCoordenadorId(e.target.value)} placeholder="uuid do coordenador" />
        </label>
      </section>

      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/novo" replace />} />
          <Route path="/novo" element={<NovoRelatorio professorId={professorId} />} />
          <Route path="/fila" element={<FilaAprovacao coordenadorId={coordenadorId} />} />
          <Route path="/busca" element={<BuscaRelatorios />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
