-- ═══════════════════════════════════════════════════════════════════
-- Painel Comercial · Papéis (gestor × vendedor)
-- Rode UMA vez, depois do 0001. Supabase → SQL Editor → cole → Run.
--
-- gestor  = vê e faz tudo da empresa (comportamento atual).
-- vendedor = vê e mexe SÓ nos leads onde ele é o responsável; não vê
--            tráfego, equipe, nem os leads dos colegas. Tudo no BANCO
--            (RLS), não só escondido na tela.
-- ═══════════════════════════════════════════════════════════════════

-- Liga cada login a um vendedor (por id — robusto a renomear). Gestor = null.
alter table perfis add column if not exists vendedor_id uuid references vendedores(id) on delete set null;

-- ── Helpers (SECURITY DEFINER: leem sem cair no próprio RLS) ─────────
create or replace function meu_papel()
returns text language sql stable security definer set search_path = public as $$
  select papel from perfis where id = auth.uid()
$$;

create or replace function meu_vendedor_nome()
returns text language sql stable security definer set search_path = public as $$
  select v.nome from vendedores v
  join perfis p on p.vendedor_id = v.id
  where p.id = auth.uid()
$$;

-- ── LEADS: gestor vê tudo; vendedor só os seus ──────────────────────
drop policy if exists "dados da empresa" on leads;
create policy "leads ver" on leads for select
  using (empresa_id = empresa_do_usuario()
         and (meu_papel() = 'gestor' or responsavel = meu_vendedor_nome()));
create policy "leads inserir" on leads for insert
  with check (empresa_id = empresa_do_usuario()
              and (meu_papel() = 'gestor' or responsavel = meu_vendedor_nome()));
create policy "leads editar" on leads for update
  using (empresa_id = empresa_do_usuario()
         and (meu_papel() = 'gestor' or responsavel = meu_vendedor_nome()))
  with check (empresa_id = empresa_do_usuario()
              and (meu_papel() = 'gestor' or responsavel = meu_vendedor_nome()));
create policy "leads apagar" on leads for delete
  using (empresa_id = empresa_do_usuario()
         and (meu_papel() = 'gestor' or responsavel = meu_vendedor_nome()));

-- ── INTERAÇÕES: seguem o lead ───────────────────────────────────────
drop policy if exists "dados da empresa" on interacoes;
create policy "interacoes acesso" on interacoes for all
  using (empresa_id = empresa_do_usuario()
         and (meu_papel() = 'gestor'
              or lead_id in (select id from leads
                             where empresa_id = empresa_do_usuario()
                               and responsavel = meu_vendedor_nome())))
  with check (empresa_id = empresa_do_usuario()
              and (meu_papel() = 'gestor'
                   or lead_id in (select id from leads
                                  where empresa_id = empresa_do_usuario()
                                    and responsavel = meu_vendedor_nome())));

-- ── LANÇAMENTOS (tráfego): só gestor ────────────────────────────────
drop policy if exists "dados da empresa" on lancamentos;
create policy "lancamentos gestor" on lancamentos for all
  using (empresa_id = empresa_do_usuario() and meu_papel() = 'gestor')
  with check (empresa_id = empresa_do_usuario() and meu_papel() = 'gestor');

-- ── VENDEDORES: todos leem; só gestor mexe ──────────────────────────
drop policy if exists "dados da empresa" on vendedores;
create policy "vendedores ler" on vendedores for select
  using (empresa_id = empresa_do_usuario());
create policy "vendedores inserir" on vendedores for insert
  with check (empresa_id = empresa_do_usuario() and meu_papel() = 'gestor');
create policy "vendedores editar" on vendedores for update
  using (empresa_id = empresa_do_usuario() and meu_papel() = 'gestor')
  with check (empresa_id = empresa_do_usuario() and meu_papel() = 'gestor');
create policy "vendedores apagar" on vendedores for delete
  using (empresa_id = empresa_do_usuario() and meu_papel() = 'gestor');

-- ── EMPRESA: todos leem; só gestor edita (nome/logo) ────────────────
drop policy if exists "empresa própria" on empresas;
create policy "empresa ler" on empresas for select using (id = empresa_do_usuario());
create policy "empresa editar" on empresas for update
  using (id = empresa_do_usuario() and meu_papel() = 'gestor')
  with check (id = empresa_do_usuario() and meu_papel() = 'gestor');

-- ── Trigger: novo usuário entra numa empresa existente se vier
--    'empresa_id' no metadata (= vendedor convidado); senão cria a
--    própria empresa como gestor (comportamento atual). ─────────────
create or replace function ao_criar_usuario()
returns trigger language plpgsql security definer set search_path = public as $$
declare nova_empresa uuid; meta_empresa uuid;
begin
  meta_empresa := nullif(new.raw_user_meta_data->>'empresa_id','')::uuid;
  if meta_empresa is not null then
    insert into perfis (id, empresa_id, nome, papel, vendedor_id)
      values (new.id, meta_empresa,
              coalesce(new.raw_user_meta_data->>'nome',''),
              coalesce(new.raw_user_meta_data->>'papel','vendedor'),
              nullif(new.raw_user_meta_data->>'vendedor_id','')::uuid);
  else
    insert into empresas (nome)
      values (coalesce(new.raw_user_meta_data->>'empresa','Minha empresa'))
      returning id into nova_empresa;
    insert into perfis (id, empresa_id, nome, papel)
      values (new.id, nova_empresa, coalesce(new.raw_user_meta_data->>'nome',''), 'gestor');
  end if;
  return new;
end $$;
