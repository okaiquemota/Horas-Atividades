import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function BuscaRelatorios() {
  const [filtros, setFiltros] = useState({
    turma: '',
    disciplina: '',
    periodoInicio: '',
    periodoFim: '',
    texto: '',
  })
  const [resultados, setResultados] = useState([])
  const [buscando, setBuscando] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setFiltros((prev) => ({ ...prev, [name]: value }))
  }

  async function buscar(e) {
    e.preventDefault()
    setBuscando(true)

    let query = supabase.from('relatorios').select('*, professores(nome)').eq('status', 'aprovado')

    if (filtros.turma) query = query.ilike('turma', `%${filtros.turma}%`)
    if (filtros.disciplina) query = query.ilike('disciplina', `%${filtros.disciplina}%`)
    if (filtros.periodoInicio) query = query.gte('periodo', filtros.periodoInicio)
    if (filtros.periodoFim) query = query.lte('periodo', filtros.periodoFim)
    if (filtros.texto) query = query.textSearch('busca_texto', filtros.texto, { type: 'websearch', config: 'portuguese' })

    const { data, error } = await query.order('periodo', { ascending: false })

    if (!error) setResultados(data)
    setBuscando(false)
  }

  return (
    <div>
      <h2>Arquivo de Relatórios</h2>

      <form onSubmit={buscar} className="filtros">
        <input name="turma" placeholder="Turma" value={filtros.turma} onChange={handleChange} />
        <input name="disciplina" placeholder="Disciplina" value={filtros.disciplina} onChange={handleChange} />
        <input type="date" name="periodoInicio" value={filtros.periodoInicio} onChange={handleChange} />
        <input type="date" name="periodoFim" value={filtros.periodoFim} onChange={handleChange} />
        <input name="texto" placeholder="Buscar no conteúdo..." value={filtros.texto} onChange={handleChange} />
        <button type="submit" disabled={buscando}>{buscando ? 'Buscando...' : 'Buscar'}</button>
      </form>

      <div className="resultados">
        {resultados.map((r) => (
          <div key={r.id} className="card-relatorio">
            <p><strong>{r.disciplina}</strong> — {r.turma} — {r.periodo}</p>
            <p>Professor: {r.professores?.nome}</p>
            <p>{r.conteudo_ministrado}</p>
          </div>
        ))}
        {resultados.length === 0 && <p>Nenhum resultado ainda — use os filtros acima.</p>}
      </div>
    </div>
  )
}
