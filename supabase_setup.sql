-- 运行在 Supabase Dashboard → SQL Editor

create table if not exists xiaoshanlu_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  date text not null,
  gratitude text[] not null default '{"","",""}',
  giving text not null default '',
  updated_at timestamptz default now(),
  unique(user_id, date)
);

alter table xiaoshanlu_records enable row level security;

create policy "users_own_records"
  on xiaoshanlu_records
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
