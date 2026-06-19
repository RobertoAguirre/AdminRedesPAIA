-- Ejecuta este script en Supabase → SQL Editor → New query → Run

create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists social_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  platform text not null check (platform in ('facebook','instagram','x','linkedin','tiktok','youtube')),
  account_name text not null,
  account_id text,
  access_token text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, platform, account_name)
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null default '',
  content text not null,
  media_url text,
  platforms text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft','scheduled','published','failed')),
  scheduled_at timestamptz,
  published_at timestamptz,
  publish_results jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists post_accounts (
  post_id uuid not null references posts(id) on delete cascade,
  account_id uuid not null references social_accounts(id) on delete cascade,
  primary key (post_id, account_id)
);

create index if not exists idx_social_accounts_user on social_accounts(user_id);
create index if not exists idx_posts_user on posts(user_id);
create index if not exists idx_posts_status on posts(user_id, status);
