-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run
create table if not exists scores (
  id bigint generated always as identity primary key,
  player text not null,
  challenge text not null,
  points int not null,
  created_at timestamptz not null default now()
);

-- Lock the table. Only the server (service key) can read/write it.
alter table scores enable row level security;
