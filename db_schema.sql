create table public.betakeys (
  id text not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  constraint betakeys_pkey primary key (id)
) TABLESPACE pg_default;

create table public.movie_night (
  created_at timestamp with time zone not null default now(),
  date timestamp with time zone not null,
  imdb_id text null,
  movies jsonb null,
  description text not null,
  id uuid not null default gen_random_uuid (),
  movie_night_group_id uuid not null,
  constraint movie_night_pkey primary key (id)
) TABLESPACE pg_default;

create table public.movie_night_group (
  created_at timestamp with time zone not null default now(),
  handle text not null,
  name text not null,
  description text null,
  betakey uuid null default gen_random_uuid (),
  secret text not null,
  id uuid not null default gen_random_uuid (),
  constraint movie_night_group_pkey primary key (id),
  constraint movienightgroup_betakey_key unique (betakey),
  constraint movienightgroup_handle_key unique (handle)
) TABLESPACE pg_default;

create table public.sessions (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  expires_at timestamp with time zone not null,
  movie_night_group_id uuid not null,
  constraint sessions_pkey primary key (id),
  constraint sessions_movie_night_group_id_key unique (movie_night_group_id)
) TABLESPACE pg_default;