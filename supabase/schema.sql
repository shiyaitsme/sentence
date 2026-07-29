-- sentence · 摘抄本
-- 在 Supabase 项目的 SQL Editor 里粘贴并运行这份脚本即可建好表。

create extension if not exists pgcrypto;

create table if not exists public.excerpts (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  source text,
  tags text[] not null default '{}',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 按标签筛选、按时间排序时用得到
create index if not exists excerpts_tags_idx on public.excerpts using gin (tags);
create index if not exists excerpts_created_at_idx on public.excerpts (created_at desc);

-- 简单的全文关键词搜索（正文 + 出处 + 批注）
create index if not exists excerpts_search_idx on public.excerpts
  using gin (to_tsvector('simple', coalesce(content, '') || ' ' || coalesce(source, '') || ' ' || coalesce(note, '')));

-- 自动维护 updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists excerpts_set_updated_at on public.excerpts;
create trigger excerpts_set_updated_at
  before update on public.excerpts
  for each row execute function public.set_updated_at();

-- 开启行级安全
alter table public.excerpts enable row level security;

-- 这个项目暂时不接登录系统，前端用 anon key 直连。
-- 下面的策略允许"任何拿到 anon key 的人"读写这张表——
-- 这对个人摘抄本够用，但 anon key 会出现在前端打包代码里，
-- 相当于"知道网址就能读写"，请不要在这张表里存敏感隐私内容。
-- 以后想加登录/仅自己可写，把这几条策略换成 auth.uid() 判断即可。
drop policy if exists "anon can read excerpts" on public.excerpts;
create policy "anon can read excerpts"
  on public.excerpts for select
  using (true);

drop policy if exists "anon can insert excerpts" on public.excerpts;
create policy "anon can insert excerpts"
  on public.excerpts for insert
  with check (true);

drop policy if exists "anon can update excerpts" on public.excerpts;
create policy "anon can update excerpts"
  on public.excerpts for update
  using (true)
  with check (true);

drop policy if exists "anon can delete excerpts" on public.excerpts;
create policy "anon can delete excerpts"
  on public.excerpts for delete
  using (true);
