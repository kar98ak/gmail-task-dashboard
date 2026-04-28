create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  email_id text not null,
  email_subject text not null,
  email_from text not null,
  email_date text not null,
  title text not null,
  description text not null,
  category text not null check (category in ('school', 'job_application', 'general')),
  priority text not null check (priority in ('high', 'medium', 'low')),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'done')),
  deadline timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- One set of tasks per email per user (no duplicate processing)
create unique index if not exists tasks_user_email_idx on tasks (user_id, email_id);

-- Row-level security: users only see their own tasks
alter table tasks enable row level security;

create policy "users can manage own tasks"
  on tasks for all
  using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);
