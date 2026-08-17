import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function NovoRelatorio({ professorId }) {
  const [form, setForm] = useState({
    turma: '',
    disciplina: '',
    periodo: '',
    frequencia: '',
    conteudo_ministrado: '',
    observacoes: '',
  })
  const [enviando, setEnviando] = useState(false)
  const [mensagem, setMensagem] = useState(null)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setEnviando(true)
    setMensagem(null)

    const { error } = await supabase.from('relatorios').insert({
      professor_id: professorId,
      turma: form.turma,
      disciplina: form.disciplina,
      periodo: form.periodo,
      frequencia: form.frequencia ? Number(form.frequencia) : null,
      conteudo_ministrado: form.conteudo_ministrado,
      observacoes: form.observacoes,
    })

    setEnviando(false)

    if (error) {
      setMensagem({ tipo: 'erro', texto: error.message })
    } else {
      setMensagem({ tipo: 'sucesso', texto: 'Relatório enviado para aprovação.' })
      setForm({
        turma: '',
        disciplina: '',
        periodo: '',
        frequencia: '',
        conteudo_ministrado: '',
        observacoes: '',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Novo Relatório de Aula</h2>

      <label>
        Turma
        <input name="turma" value={form.turma} onChange={handleChange} required />
      </label>

      <label>
        Disciplina
        <input name="disciplina" value={form.disciplina} onChange={handleChange} required />
      </label>

      <label>
        Período (data da aula)
        <input type="date" name="periodo" value={form.periodo} onChange={handleChange} required />
      </label>

      <label>
        Frequência (nº de alunos presentes)
        <input type="number" name="frequencia" value={form.frequencia} onChange={handleChange} />
      </label>

      <label>
        Conteúdo ministrado
        <textarea name="conteudo_ministrado" value={form.conteudo_ministrado} onChange={handleChange} rows={5} />
      </label>

      <label>
        Observações
        <textarea name="observacoes" value={form.observacoes} onChange={handleChange} rows={3} />
      </label>

      <button type="submit" disabled={enviando}>
        {enviando ? 'Enviando...' : 'Enviar relatório'}
      </button>

      {mensagem && <p className={mensagem.tipo}>{mensagem.texto}</p>}
    </form>
  )
}
