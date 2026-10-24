-- Panelin analitik sayıları.
--
-- Sayılar kullanıcı verisinden geliyor ama panele ham satır açmaya
-- gerek yok: burada yalnızca toplamlar var. `analytics_events` ve
-- `profiles` istemciye kapalı kalıyor, panel de kimin ne yaptığını
-- değil kaç kişinin ne yaptığını görüyor.
--
-- Her işlev `security definer` — tabloları kendi okuyor — ve ilk iş
-- olarak çağıranın yönetici olduğunu doğruluyor. Denetim gövdenin ilk
-- satırında, `where` içinde değil: `void is null` gibi bir koşul
-- sessizce sıfır satır döndürür ve o da "sayı yok" gibi görünür.

create or replace function public.require_admin()
returns void
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'yalnızca yöneticiler' using errcode = 'insufficient_privilege';
  end if;
end;
$$;

-- ---------------------------------------------------------------- özet

create or replace function public.admin_overview()
returns table (
  daily_active bigint,
  weekly_active bigint,
  new_today bigint,
  paywall_viewers bigint,
  subscribers bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.require_admin();

  return query select
    (select count(distinct user_id) from public.analytics_events
      where created_at >= date_trunc('day', now())),
    (select count(distinct user_id) from public.analytics_events
      where created_at >= now() - interval '7 days'),
    -- "Yeni": profili bugün açılmış kullanıcı. Olaylara değil profile
    -- bakılıyor; hesap anonim de olsa profil tetikleyiciyle açılıyor.
    (select count(*) from public.profiles
      where created_at >= date_trunc('day', now())),
    (select count(distinct user_id) from public.analytics_events
      where name = 'paywall_view'),
    (select count(*) from public.profiles where is_pro);
end;
$$;

-- ---------------------------------------------------------------- huni

-- Aktivasyon hunisi: her adım, kendinden önceki bütün adımları da
-- yapmış kullanıcıları sayıyor. Sıra çekirdekteki `ACTIVATION_FUNNEL`
-- ile aynı; burada tekrar edilmesinin nedeni sıranın sorgunun kendisi
-- olması — adımlar kümülatif kesişimle daralıyor.
create or replace function public.admin_funnel()
returns table (event text, users bigint)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.require_admin();

  return query
  with steps as (
    select * from (values
      (1, 'app_open'),
      (2, 'onboarding_complete'),
      (3, 'test_complete'),
      (4, 'game_complete'),
      (5, 'paywall_view'),
      (6, 'purchase_complete')
    ) as s (position, name)
  ),
  per_user as (
    select user_id, array_agg(distinct name) as names
    from public.analytics_events
    where user_id is not null
    group by user_id
  )
  select
    steps.name,
    (
      select count(*)
      from per_user
      -- Bu adıma kadarki bütün olayları yapmış kullanıcılar.
      where (select array_agg(s2.name) from steps s2 where s2.position <= steps.position)
            <@ per_user.names
    )
  from steps
  order by steps.position;
end;
$$;

-- ---------------------------------------------------------------- tutundurma

-- "İlk gününden tam N gün sonra geri dönenler": kohort, ilk olayı N
-- gün önce olan kullanıcılar; dönen, bugün de olayı olanlar.
create or replace function public.admin_retention()
returns table (day integer, cohort bigint, returned bigint)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.require_admin();

  return query
  with first_seen as (
    select user_id, min(created_at)::date as day
    from public.analytics_events
    where user_id is not null
    group by user_id
  ),
  active_today as (
    select distinct user_id
    from public.analytics_events
    where created_at >= date_trunc('day', now())
  )
  select
    d.day,
    (select count(*) from first_seen f where f.day = (now()::date - d.day)),
    (
      select count(*)
      from first_seen f
      join active_today a on a.user_id = f.user_id
      where f.day = (now()::date - d.day)
    )
  from (values (1), (7), (30)) as d (day)
  order by d.day;
end;
$$;

-- İşlevler `security definer`; çağrı hakkı açıkça veriliyor ve
-- içerideki yönetici denetimi asıl kapıyı tutuyor.
revoke all on function public.admin_overview() from public;
revoke all on function public.admin_funnel() from public;
revoke all on function public.admin_retention() from public;

grant execute on function public.admin_overview() to authenticated;
grant execute on function public.admin_funnel() to authenticated;
grant execute on function public.admin_retention() to authenticated;
