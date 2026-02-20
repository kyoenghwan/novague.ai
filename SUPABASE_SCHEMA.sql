-- 1. Create a table for public profiles
create table if not exists public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  subscription_tier text default 'free',
  stripe_customer_id text,
  updated_at timestamp with time zone,
  
  primary key (id)
);

-- 2. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 3. Create policies (using DO block to avoid errors if policies exist)
do $$
begin
    if not exists (select 1 from pg_policies where policyname = 'Public profiles are viewable by everyone.' and tablename = 'profiles') then
        create policy "Public profiles are viewable by everyone." on profiles for select using ( true );
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Users can insert their own profile.' and tablename = 'profiles') then
        create policy "Users can insert their own profile." on profiles for insert with check ( auth.uid() = id );
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Users can update own profile.' and tablename = 'profiles') then
        create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );
    end if;
end
$$;

-- 4. Create a trigger to sync auth.users with public.profiles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- Trigger execution (Drop if exists to avoid error)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Create table for AI usage tracking
create table if not exists public.ai_usage (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  provider text not null,
  model text not null,
  prompt_tokens integer,
  completion_tokens integer,
  total_tokens integer,
  stage text, -- e.g. "Project Initializer", "Data Architect"
  created_at timestamp with time zone default now()
);

-- 6. Create table for Chat History
create table if not exists public.chat_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  project_id uuid references public.projects on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  stage text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- 7. Add RLS for new tables
alter table public.ai_usage enable row level security;
alter table public.chat_history enable row level security;

-- 8. Create policies (using DO block to avoid errors if policies exist)
do $$
begin
    -- ai_usage policies
    if not exists (select 1 from pg_policies where policyname = 'Users can view their own usage.' and tablename = 'ai_usage') then
        create policy "Users can view their own usage." on ai_usage for select using (auth.uid() = user_id);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Users can insert their own usage.' and tablename = 'ai_usage') then
        create policy "Users can insert their own usage." on ai_usage for insert with check (auth.uid() = user_id);
    end if;

    -- chat_history policies
    if not exists (select 1 from pg_policies where policyname = 'Users can view their own chat history.' and tablename = 'chat_history') then
        create policy "Users can view their own chat history." on chat_history for select using (auth.uid() = user_id);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Users can insert their own chat history.' and tablename = 'chat_history') then
        create policy "Users can insert their own chat history." on chat_history for insert with check (auth.uid() = user_id);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Users can delete their own chat history.' and tablename = 'chat_history') then
        create policy "Users can delete their own chat history." on chat_history for delete using (auth.uid() = user_id);
    end if;
end
$$;
