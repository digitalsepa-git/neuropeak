-- Segment kuralını kitleye çevirme.
--
-- Kurallar `segments.rules` içinde jsonb olarak duruyor ve şekilleri
-- @neuropeak/core'daki `SegmentRule` ile aynı. Çekirdek onları
-- cihazdaki tek bir kullanıcı için değerlendirebiliyor; burada aynı
-- kural kümesi bütün kullanıcılar üzerinde SQL olarak işletiliyor.
-- Kuralın veri olarak saklanmasının sebebi buydu.
--
-- İki giriş noktası var: panel kitle sayısını soruyor, gönderen
-- servis de kime yollayacağını. İkisi de aynı anlık görüntüyü
-- okuyor; sayının gösterdiği kitleyle bildirimin gittiği kitle
-- ayrışmasın.

-- ---------------------------------------------------------------- anlık görüntü

/*
 * Kullanıcı başına segment kurallarının baktığı bütün alanlar.
 *
 * Dışarıya kapalı: bu işlev tek tek kimin ne yaptığını döndürüyor ve
 * panelin böyle bir satıra ihtiyacı yok. Yalnızca aşağıdaki iki
 * `security definer` işlevin içinden çağrılıyor; onların içinde
 * etkin kullanıcı sahip olduğu için yetki sorunu çıkmıyor.
 *
 * Alan adları çekirdekteki `UserSnapshot` ile birebir: kural
 * değerlendiricisi ikisini aynı adla arıyor.
 */
create or replace function public.user_snapshots()
returns table (
  user_id uuid,
  snapshot jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    jsonb_build_object(
      'is_pro', p.is_pro,
      'level', p.level,
      'neuropeak', p.neuropeak_score,
      'streak_days', coalesce(s.current_days, 0),
      -- Hiç aktif olmamış kullanıcının "son aktifliği" kaydolduğu
      -- gün sayılıyor; null'ı sonsuz saymak yeni kullanıcıyı
      -- "uykuya dalmış" kitlesine sokardı.
      'days_since_last_active',
        (now()::date - coalesce(s.last_active_date, p.created_at::date)),
      'tests_finished', coalesce(t.count, 0),
      'total_rounds', coalesce(g.count, 0),
      'locale', p.locale,
      'league_tier', coalesce(l.tier::text, 'bronze'),
      'days_since_registered', (now()::date - p.created_at::date)
    )
  from public.profiles p
  left join public.streaks s on s.user_id = p.id
  left join lateral (
    select count(*) as count from public.test_results r where r.user_id = p.id
  ) t on true
  left join lateral (
    select count(*) as count from public.game_sessions gs where gs.user_id = p.id
  ) g on true
  -- Ligden en son haftanın kademesi; hiç lige girmemişse bronz.
  left join lateral (
    select lg.tier
    from public.league_members lm
    join public.league_groups lg on lg.id = lm.group_id
    where lm.user_id = p.id
    order by lm.week_start desc
    limit 1
  ) l on true;
$$;

revoke all on function public.user_snapshots() from public;

-- ---------------------------------------------------------------- kural

/*
 * Tek bir kuralı bir anlık görüntüye uygular.
 *
 * Tanınmayan kural türü sessizce `false` dönmüyor, hata veriyor.
 * Panelden kaydedilen yeni bir kuralı veritabanı bilmiyorsa kitle
 * fark edilmeden daralırdı; bildirimin yanlış kitleye gitmesi kadar
 * kötüsü, doğru kitleye hiç gitmemesidir ve ikisi de sessizdir.
 */
create or replace function public.segment_rule_matches(rule jsonb, snap jsonb)
returns boolean
language plpgsql
immutable
as $$
declare
  kind text := rule->>'kind';
begin
  case kind
    when 'is_pro' then
      return (snap->>'is_pro')::boolean = (rule->>'value')::boolean;
    when 'level_at_least' then
      return (snap->>'level')::int >= (rule->>'value')::int;
    when 'neuropeak_at_least' then
      return (snap->>'neuropeak')::int >= (rule->>'value')::int;
    when 'streak_at_least' then
      return (snap->>'streak_days')::int >= (rule->>'value')::int;
    when 'inactive_days' then
      return (snap->>'days_since_last_active')::int >= (rule->>'value')::int;
    when 'tests_at_least' then
      return (snap->>'tests_finished')::int >= (rule->>'value')::int;
    when 'tests_at_most' then
      return (snap->>'tests_finished')::int <= (rule->>'value')::int;
    when 'rounds_at_least' then
      return (snap->>'total_rounds')::int >= (rule->>'value')::int;
    when 'locale' then
      return snap->>'locale' = rule->>'value';
    when 'league_tier_at_least' then
      -- Enum'un bildirim sırası çekirdekteki `LEAGUE_TIERS` ile aynı,
      -- karşılaştırma da o sırayı kullanıyor.
      return (snap->>'league_tier')::public.league_tier
             >= (rule->>'tier')::public.league_tier;
    when 'registered_within_days' then
      return (snap->>'days_since_registered')::int <= (rule->>'value')::int;
    else
      raise exception 'bilinmeyen segment kuralı: %', coalesce(kind, '(yok)');
  end case;
end;
$$;

create or replace function public.segment_matches(rules jsonb, match_mode text, snap jsonb)
returns boolean
language sql
immutable
as $$
  -- Kuralsız segment herkesi kapsar; "tüm kullanıcılar" bunun adı.
  select case
    when rules is null or jsonb_array_length(rules) = 0 then true
    when match_mode = 'any' then exists (
      select 1 from jsonb_array_elements(rules) r
      where public.segment_rule_matches(r.value, snap)
    )
    else not exists (
      select 1 from jsonb_array_elements(rules) r
      where not public.segment_rule_matches(r.value, snap)
    )
  end;
$$;

-- ---------------------------------------------------------------- kitle

/*
 * Panelin kitle sayaçları.
 *
 * Kampanyası olmayan segment de listede: sayının sıfır olması ayrı
 * bir bilgi ve "bu segmente kimse girmiyor" demek, onu gizlemek
 * değil.
 */
create or replace function public.admin_segment_sizes()
returns table (segment_id text, audience bigint, reachable bigint)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.require_admin();

  return query
  with snaps as (select * from public.user_snapshots()),
  tokens as (
    select pt.user_id
    from public.push_tokens pt
    where pt.is_active
    group by pt.user_id
  )
  select
    seg.id,
    count(*) filter (where public.segment_matches(seg.rules, seg.match_mode, snaps.snapshot)),
    -- Kitlede olup bildirim izni vermemiş kullanıcıya gönderilemez;
    -- iki sayıyı ayırmak kampanyanın neden küçük gittiğini açıklıyor.
    count(*) filter (
      where public.segment_matches(seg.rules, seg.match_mode, snaps.snapshot)
        and tokens.user_id is not null
    )
  from public.segments seg
  cross join snaps
  left join tokens on tokens.user_id = snaps.user_id
  where seg.is_active
  group by seg.id;
end;
$$;

revoke all on function public.admin_segment_sizes() from public;
grant execute on function public.admin_segment_sizes() to authenticated;

/*
 * Gönderilecek cihazlar.
 *
 * Gönderen servis `service_role` ile çalışıyor, panel yöneticisi
 * kendi oturumuyla; ikisine de açık. Jeton satırı kullanıcıya ait
 * hassas bir kayıt olduğu için başka kimseye açık değil.
 *
 * Aynı kullanıcının birden çok cihazı olabilir ve hepsine gidiyor;
 * `push_deliveries` kullanıcı başına tek satır tuttuğu için
 * tekrarı orada engellemek gerekiyor, burada değil.
 */
create or replace function public.segment_audience(p_segment_id text)
returns table (user_id uuid, token text, locale text)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  seg public.segments%rowtype;
begin
  -- Servis önce sınanıyor: ucuz, ve gönderen servisin oturumunda
  -- JWT iddiası yok — `is_admin()` orada boşuna çalışırdı.
  if current_setting('role', true) is distinct from 'service_role'
     and not public.is_admin() then
    raise exception 'yalnızca yöneticiler ve gönderen servis'
      using errcode = 'insufficient_privilege';
  end if;

  select * into seg from public.segments where id = p_segment_id and is_active;
  if not found then
    raise exception 'etkin segment yok: %', p_segment_id;
  end if;

  return query
  select pt.user_id, pt.token, pt.locale
  from public.user_snapshots() s
  join public.push_tokens pt on pt.user_id = s.user_id and pt.is_active
  where public.segment_matches(seg.rules, seg.match_mode, s.snapshot);
end;
$$;

revoke all on function public.segment_audience(text) from public;
-- Panel yöneticisi kendi oturumuyla, gönderen servis `service_role`
-- ile çağırıyor; içerideki denetim ikisini de tanıyor.
grant execute on function public.segment_audience(text) to authenticated, service_role;
