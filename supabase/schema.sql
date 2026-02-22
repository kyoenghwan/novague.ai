-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create projects table
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  tech_stack text[],
  nodes jsonb default '[]'::jsonb,
  edges jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade not null
);

-- Enable Row Level Security (RLS)
alter table public.projects enable row level security;

-- Create policies
create policy "Users can view their own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert their own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_projects_updated_at
  before update on public.projects
  for each row
  execute procedure public.handle_updated_at();

-- ============================================
-- 마이그레이션: 누락된 컬럼 추가
-- ai_config: AI 설정 정보를 JSON 문자열로 저장
-- author: 프로젝트 작성자 정보 저장
-- ============================================
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS ai_config text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS author text;
