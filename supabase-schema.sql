-- Setup Supabase Note Stack Schema --

-- 1. Create tables

-- We will just use the pages table. The auth is handled by auth.users

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  title text default 'Untitled',
  content text default '',
  author_id uuid not null references auth.users(id) on delete cascade,
  parent_page_id uuid references public.pages(id) on delete cascade,
  yjs_state text,
  deleted boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Realtime triggers on pages table
alter publication supabase_realtime add table public.pages;

-- 3. Row Level Security (RLS) Policies
alter table public.pages enable row level security;

-- Policy: Select - Users can select only their own pages
create policy "Users can read own pages" on public.pages
  for select
  using (auth.uid() = author_id);

-- Policy: Insert - Users can insert only if author_id matches their uid
create policy "Users can insert own pages" on public.pages
  for insert
  with check (auth.uid() = author_id);

-- Policy: Update - Users can update only their own pages
create policy "Users can update own pages" on public.pages
  for update
  using (auth.uid() = author_id);

-- Policy: Delete - Users can delete their own pages
create policy "Users can delete own pages" on public.pages
  for delete
  using (auth.uid() = author_id);
