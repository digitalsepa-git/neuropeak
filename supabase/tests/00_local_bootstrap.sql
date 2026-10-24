-- Supabase'in migration'lardan önce hazır sunduğu ortamın yerel karşılığı.
-- Yalnızca şemayı sade bir Postgres üzerinde doğrulamak için kullanılır;
-- gerçek projede bu nesneler zaten vardır ve bu dosya çalıştırılmaz.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
end;
$$;

create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  is_anonymous boolean not null default false,
  created_at timestamptz not null default now()
);

-- Supabase'deki karşılıklarıyla aynı davranır: istek üzerindeki JWT
-- iddialarından kullanıcıyı ve rolü okur.
--
-- `nullif` cast'ten önce: `reset request.jwt.claims` ayarı
-- kaldırmıyor, boş dizgeye çeviriyor ve `''::jsonb` hata veriyor.
-- Gerçek Supabase de bu sırayla yazılmış; taklidin ayrışması,
-- iddiasız çağrılan her işlevi burada anlaşılmaz bir JSON hatasıyla
-- düşürüyordu.
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid;
$$;

create or replace function auth.role()
returns text
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role',
    current_user
  );
$$;

grant usage on schema auth to anon, authenticated, service_role;
grant select on auth.users to service_role;

grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;

alter default privileges in schema public
grant all on tables to anon, authenticated, service_role;

alter default privileges in schema public
grant all on sequences to anon, authenticated, service_role;
