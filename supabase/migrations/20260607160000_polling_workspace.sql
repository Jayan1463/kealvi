-- Kealvi polling workspace schema.
-- Run this in the Supabase SQL editor. It preserves the older Q&A tables.

create extension if not exists pgcrypto;

create table if not exists polls (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 180),
  description text check (description is null or char_length(description) <= 500),
  creator_name text not null default 'Anonymous',
  creator_id text not null,
  category text not null default 'General',
  status text not null default 'active' check (status in ('active', 'closed')),
  allow_vote_changes boolean not null default true,
  expires_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references polls(id) on delete cascade,
  label text not null check (char_length(label) between 1 and 120),
  position smallint not null default 0,
  unique (poll_id, position)
);

create table if not exists poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references polls(id) on delete cascade,
  option_id uuid not null references poll_options(id) on delete cascade,
  voter_id text not null,
  voter_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (poll_id, voter_id)
);

create index if not exists polls_created_at_idx on polls (created_at desc);
create index if not exists polls_status_expires_idx on polls (status, expires_at);
create index if not exists polls_category_idx on polls (category);
create unique index if not exists polls_unique_question_idx on polls (lower(btrim(title)));
create index if not exists poll_options_poll_id_idx on poll_options (poll_id);
create index if not exists poll_votes_poll_id_idx on poll_votes (poll_id);
create index if not exists poll_votes_option_id_idx on poll_votes (option_id);

create or replace function validate_poll_vote()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1 from poll_options
    where id = new.option_id and poll_id = new.poll_id
  ) then
    raise exception 'Option does not belong to this poll';
  end if;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists poll_votes_validate on poll_votes;
create trigger poll_votes_validate
before insert or update on poll_votes
for each row execute function validate_poll_vote();

alter table polls enable row level security;
alter table poll_options enable row level security;
alter table poll_votes enable row level security;

-- The application uses a server-only service role client. No public table
-- policies are required, so direct browser access remains blocked.

do $$
declare
  sample_poll_id uuid;
begin
  if not exists (select 1 from polls) then
    insert into polls (
      title, description, creator_name, creator_id, category,
      allow_vote_changes, expires_at
    ) values (
      'Which feature should we ship next?',
      'Help the product team choose the next Kealvi milestone.',
      'Maya', 'seed-maya', 'Product', true, now() + interval '2 days'
    ) returning id into sample_poll_id;

    insert into poll_options (poll_id, label, position) values
      (sample_poll_id, 'Live word clouds', 0),
      (sample_poll_id, 'Audience quiz mode', 1),
      (sample_poll_id, 'Team workspaces', 2);
  end if;
end $$;
