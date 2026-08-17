-- ============================================
-- Schema: Sistema de Relatórios de Aula
-- ============================================

create table if not exists professores (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid references auth.users(id) unique,
  nome text not null,
  email text unique not null,
  created_at timestamptz default now()
);

create table if not exists coordenadores (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid references auth.users(id) unique,
  nome text not null,
  email text unique not null,
  created_at timestamptz default now()
);

create table if not exists relatorios (
  id uuid primary key default gen_random_uuid(),
  professor_id uuid references professores(id) not null,
  turma text not null,
  disciplina text not null,
  periodo date not null,
  frequencia int,
  conteudo_ministrado text,
  observacoes text,
  status text not null default 'pendente' check (status in ('pendente', 'aprovado', 'reprovado')),
  motivo_reprovacao text,
  aprovado_por uuid references coordenadores(id),
  created_at timestamptz default now(),
  atualizado_at timestamptz default now()
);

-- busca textual (português) no conteúdo livre
alter table relatorios add column if not exists busca_texto tsvector
  generated always as (
    to_tsvector('portuguese', coalesce(conteudo_ministrado,'') || ' ' || coalesce(observacoes,''))
  ) stored;

create index if not exists idx_relatorios_status on relatorios(status);
create index if not exists idx_relatorios_turma on relatorios(turma);
create index if not exists idx_relatorios_disciplina on relatorios(disciplina);
create index if not exists idx_relatorios_periodo on relatorios(periodo);
create index if not exists idx_relatorios_busca on relatorios using gin(busca_texto);

-- trigger para atualizado_at
create or replace function set_atualizado_at()
returns trigger as $$
begin
  new.atualizado_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_relatorios_atualizado_at on relatorios;
create trigger trg_relatorios_atualizado_at
  before update on relatorios
  for each row execute function set_atualizado_at();

-- ============================================
-- Row Level Security
-- ============================================

alter table professores enable row level security;
alter table coordenadores enable row level security;
alter table relatorios enable row level security;

-- professor só vê/edita o próprio registro
create policy "professor le proprio perfil"
  on professores for select
  using (auth_id = auth.uid());

-- coordenador só vê/edita o próprio registro
create policy "coordenador le proprio perfil"
  on coordenadores for select
  using (auth_id = auth.uid());

-- professor vê e cria seus próprios relatórios
create policy "professor le proprios relatorios"
  on relatorios for select
  using (
    professor_id in (select id from professores where auth_id = auth.uid())
  );

create policy "professor cria relatorio"
  on relatorios for insert
  with check (
    professor_id in (select id from professores where auth_id = auth.uid())
  );

-- professor edita próprio relatório só se ainda pendente ou reprovado (reenvio)
create policy "professor edita relatorio proprio pendente"
  on relatorios for update
  using (
    professor_id in (select id from professores where auth_id = auth.uid())
    and status in ('pendente', 'reprovado')
  );

-- coordenador vê todos os relatórios (ajustar depois se precisar restringir por turma/curso)
create policy "coordenador le todos relatorios"
  on relatorios for select
  using (
    exists (select 1 from coordenadores where auth_id = auth.uid())
  );

-- coordenador pode atualizar status (aprovar/reprovar)
create policy "coordenador atualiza status"
  on relatorios for update
  using (
    exists (select 1 from coordenadores where auth_id = auth.uid())
  );
