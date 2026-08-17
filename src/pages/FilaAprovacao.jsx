import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function FilaAprovacao({ coordenadorId }) {
  const [relatorios, setRelatorios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [motivos, setMotivos] = useState({})

  useEffect(() => {
    carregarPendentes()
  }, [])

  async function carregarPendentes() {
    setCarregando(true)
    const { data, error } = await supabase
      .from('relatorios')
      .select('*, professores(nome)')
      .eq('status', 'pendente')
      .order('created_at', { ascending: true })

    if (!error) setRelatorios(data)
    setCarregando(false)
  }

  async function aprovar(id) {
    await supabase
      .from('relatorios')
      .update({ status: 'aprovado', aprovado_por: coordenadorId })
      .eq('id', id)
    carregarPendentes()
  }

  async function reprovar(id) {
    const motivo = motivos[id]
    if (!motivo) {
      alert('Informe o motivo da reprovação.')
      return
    }
    await supabase
      .from('relatorios')
      .update({ status: 'reprovado', motivo_reprovacao: motivo, aprovado_por: coordenadorId })
      .eq('id', id)
    carregarPendentes()
  }

  if (carregando) return <p>Carregando...</p>

  return (
    <div>
      <h2>Relatórios pendentes de aprovação</h2>

      {relatorios.length === 0 && <p>Nenhum relatório pendente.</p>}

      {relatorios.map((r) => (
        <div key={r.id} className="card-relatorio">
          <p><strong>Professor:</strong> {r.professores?.nome}</p>
          <p><strong>Turma:</strong> {r.turma} — <strong>Disciplina:</strong> {r.disciplina}</p>
          <p><strong>Período:</strong> {r.periodo}</p>
          <p><strong>Frequência:</strong> {r.frequencia ?? '—'}</p>
          <p><strong>Conteúdo:</strong> {r.conteudo_ministrado}</p>
          <p><strong>Observações:</strong> {r.observacoes}</p>

          <div className="acoes">
            <button onClick={() => aprovar(r.id)}>Aprovar</button>
            <input
              placeholder="Motivo da reprovação"
              value={motivos[r.id] || ''}
              onChange={(e) => setMotivos((prev) => ({ ...prev, [r.id]: e.target.value }))}
            />
            <button onClick={() => reprovar(r.id)}>Reprovar</button>
          </div>
        </div>
      ))}
    </div>
  )
}
