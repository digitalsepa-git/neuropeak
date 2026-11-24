# Yayın hazırlığı — TestFlight ve mağaza

Kodla yapılabilecek her şey yapıldı. Kalanlar senin hesaplarını
istiyor ve hiçbiri bu makineden yapılamaz.

Sıra önemli: **Supabase projesi** olmadan panel, senkronizasyon,
analitik ve bildirim kapalı kalır; **Apple üyeliği** olmadan
TestFlight'a yükleme yapılamaz. İkisi de senin açman gereken hesap.

---

## Yayından önce kapatılması şart olan üç şey

İlk TestFlight derlemesi (1.0.0, build 3) bunlar **olmadan** çıktı;
bilerek, inceleme için değişken sayısını azaltmak ve zinciri erken
görmek için. Mağaza sürümü bunlarsız çıkmayacak.

1. **Supabase bağlı olacak.** Şu an içerik uygulamaya gömülü
   bankadan geliyor, ilerleme cihazda kalıyor, lig rakipleri cihazda
   üretiliyor, analitik ve bildirim kapalı. → aşağıda madde 1.
2. **Satın alma çalışacak.** Ürünler ve RevenueCat kurulumu bitti;
   geriye yalnızca API anahtarının derlemeye girmesi kaldı. Anahtar
   girmeden paywall görünüyor ama satın alma açılmıyor. → madde 4.
3. **Reklamlar olacak.** AdMob kimlikleri derlemeye girmedi;
   uygulama reklamsız derlendi. → madde 5.

Üçü de senin hesabını gerektiriyor, kodla kapatılamıyor.

## Kodda hazır olanlar

### Uygulama

- 29 mini oyun, 7 IQ testi, Beyin Yaşı ve üç profil testi — hepsi
  oynanıyor, hepsinin bankası yazılı. Listede "yakında" diye duran
  test yok.
- İçerik veritabanından okunuyor; bağlantı yoksa uygulamayla gelen
  gömülü bankaya düşüyor. Uygulama çevrimdışı tam çalışıyor.
- Türkçe ve İngilizce; dil ayarlardan değişiyor.
- Oyun başına ilerleme, XP, seviye, günlük seri, günlük görevler,
  rozetler, beyin haritası, haftalık lig.
- **Ayarlar → Gizlilik Politikası / Kullanım Şartları / E-posta
  Desteği** gerçekten açılıyor. Adresler `apps/mobile/src/lib/links.ts`
  içinde tek yerde.
- Bildirim anahtarı çalışıyor: izin istiyor, jetonu `push_tokens`'a
  yazıyor, kapatınca jetonu silmiyor pasife alıyor.

### Derleme yapılandırması

- `apps/mobile/eas.json` — development / preview / production
  profilleri. Production'da `autoIncrement` açık; build numarasını
  elle artırmaya gerek yok.
- `apps/mobile/app.json` — sürüm **1.0.0**, paket kimliği
  `com.neuropeak.iqarena` (iOS ve Android aynı),
  `ITSAppUsesNonExemptEncryption: false`. Bu bayrak olmadan her
  TestFlight yüklemesinde dışa aktarma uyumluluğu sorusu elle
  yanıtlanıyor; uygulama yalnızca standart HTTPS kullandığı için
  yanıt "hayır".
- `aps-environment` derleme profiline bağlı: geliştirme sandbox,
  TestFlight ve mağaza üretim APNs'i. Sabit bir değer, TestFlight
  derlemesinin sandbox'a kaydolmasına ve bildirimlerin sessizce hiç
  ulaşmamasına yol açıyordu.
- Simge, uyarlanabilir Android simgesi ve açılış ekranı yerinde
  (`assets/images/`, 1024×1024).

### Panel

- Giriş ve yönetici yetkilendirmesi; içerik düzenleme (oyun, test,
  soru, görev, rozet üst bilgileri); kullanıcı ve analitik ekranları;
  push kampanyası bestecisi ve segment kitle sayaçları.
- Sayılar veritabanında hesaplanıyor; panel ham olay satırı okumuyor.

### Belgeler

- `legal/` — gizlilik politikası ve kullanım şartları, iki dilde.
- `store/listing/{tr,en}.md` — mağaza metinleri.
- `store/app-privacy.md` — Apple'ın App Privacy anketinin yanıtları,
  hangi kodun hangi veriyi gönderdiğiyle birlikte.
- `store/screenshots/{tr,en}/` — 6.9" ekran görüntüleri, altı tane.

---

## Senin yapman gerekenler

### 1. Supabase projesi — **proje açıldı, şema uygulanmadı**

Panel, senkronizasyon, analitik ve bildirim bu olmadan açılmıyor.
Uygulama çalışmaya devam ediyor ama her şey cihazda kalıyor.

Proje `digitalsepa-git's Org` altında duruyor: adı `nuropeak`
(yazımda "e" eksik, ref `moocxozyxxiljugvnigf`), bölge
eu-central-1. İçi **boş** — hiç migration uygulanmadı.

**Şu an duraklatılmış.** Ücretsiz planda aynı anda yalnızca **iki
aktif proje** tutulabiliyor ve bir haftalık hareketsizlikten sonra
proje kendiliğinden duraklıyor. 24 Kasım 2026'da iki aktif slotu
`octopuspick` ve `kakuro` tutuyordu; `nuropeak` duraklayınca yeri
kakuro almıştı. Devam ettirmek için birini duraklatmak ya da Pro'ya
geçmek gerekiyor — Pro ayrıca duraklamayı tamamen kaldırıyor, ki
inceleme sırasında veritabanının uyur halde olması tek başına risk.

Kalan adımlar:

1. Projeyi devam ettir (Pro'ya geçildiyse zaten uyumuyor).
2. `supabase/migrations/` altındaki on dosyayı sırayla uygula.
   Doğrudan bağlantı IPv6 üzerinden çalışıyor:
   `postgresql://postgres:ŞİFRE@db.moocxozyxxiljugvnigf.supabase.co:5432/postgres`
3. `npm run db:seed` ile içeriği yaz.
4. Kendi kullanıcını `public.admins` tablosuna ekle; panel yönetici
   olmayan hesaba veri göstermiyor. Satır `auth.users`'a bağlı, yani
   önce projede bir auth hesabın olması gerekiyor.

Şema ve seed yerelde baştan sona doğrulandı (`npm run db:verify`):
on migration, RLS testleri, ardından 29 oyun, 7 test, 182 soru,
42 rozet, 9 görev.

Bağlantı bilgileri yazıldı: `apps/mobile/.env`, `apps/admin/.env` ve
**EAS ortam değişkenleri** (üç ortamda da). Proje yeni anahtar
biçimini kullanıyor (`sb_publishable_…`); supabase-js 2.118 bunu
destekliyor.

### 2. Adresleri canlıya al — **kısmen tamam**

`legal/` altındaki belgeler artık bir siteye dönüşüyor:
`scripts/build-legal-site.sh` onları `docs/` altına yazıyor, GitHub
Pages de `main` dalının o klasörünü sunuyor. Dört sayfa, iki dil:

- <https://digitalsepa-git.github.io/neuropeak/privacy/>
- <https://digitalsepa-git.github.io/neuropeak/terms/>
- <https://digitalsepa-git.github.io/neuropeak/en/privacy/>
- <https://digitalsepa-git.github.io/neuropeak/en/terms/>

Belgeler değişirse CI uyarıyor (`npm run legal:check`); siteyi
yeniden üretmek için `npm run legal:build`.

Apple gizlilik politikası adresine erişemezse inceleme reddediliyor,
o yüzden bu adres **Pages açık kaldığı sürece** geçerli. Alan adı
alınırsa Pages'e özel alan adı tanımlanır ve `links.ts` ile mağaza
metinlerindeki adresler `https://neuropeak.app/...` olur.

`destek@neuropeak.app` kutusu hâlâ açılmadı; şu an yalnızca
`links.ts`, site altlığı ve mağaza metinlerinde yazılı.

### 3. Apple Developer Program

- Üyelik (yıllık ücretli) ve App Store Connect erişimi.
- App Store Connect'te `com.neuropeak.iqarena` kimliğiyle uygulama
  kaydı.
- `eas.json` içindeki `ascAppId` ve `appleTeamId` yer tutucularını
  gerçek değerlerle doldur.

### 4. Abonelik ürünleri — **kuruldu**

App Store Connect'te `NeuroPeak PRO` abonelik grubu (22576766)
altında üç ürün de hazır: ülkeler (175'i de), fiyatlar, Türkçe ve
İngilizce adlar, grup görünen adı.

| Ürün kimliği                 | Tür                    | TR fiyat | Seviye |
| ---------------------------- | ---------------------- | -------- | ------ |
| `neuropeak_pro_annual`       | Yıllık                 | ₺999,99  | 1      |
| `neuropeak_pro_weekly`       | Haftalık, 3 gün deneme | ₺349,99  | 2      |
| `neuropeak_pro_annual_offer` | Yıllık, çıkış teklifi  | ₺499,99  | 2      |

Yıllık en üst seviyede duruyor: haftalık aboneden yıllığa geçiş
böylece anında yükseltme oluyor. Alttaki seviyeye koysaydık
değişiklik ancak bir sonraki yenilemede yürürlüğe girerdi, yani
kullanıcı "yıllığa geçtim" dedikten bir hafta sonra.

Fiyatlar koda yazılmıyor: üçünün de rakamı, haftalığa bölünmüş
fiyatı ve indirim oranı mağazadan geliyor. Katalogdaki rakamlar
yalnızca mağaza okunamadığında görünen yer tutucular.

RevenueCat projesi (`NeuroPeak`, `fa3de935`) de kurulu:

- App Store uygulaması `com.neuropeak.iqarena` bağlı. Satın alma
  anahtarı olarak hesapta duran `U35J7S3K6Y` seçildi; satın alma
  anahtarları uygulamaya değil Apple ekibine ait, issuer kimliği de
  App Store Connect'tekiyle aynı.
- `pro` **entitlement**'ı açık, üç ürün de bağlı. Kod yalnızca bu
  adı arıyor (`revenuecat.ts`), başka bir ad çalışmaz.
- `default` offering (current): `$rc_weekly` + `$rc_annual`.
- `exit_offer` offering: indirimli ürün. Ayrı duruyor çünkü
  `current`'a koyarsak normal paywall'da da görünür. Satın alma
  bütün offering'lere baktığı için ayrı offering sorun değil.

Geriye iki şey kaldı:

1. **API anahtarı.** RevenueCat → Project settings → API keys'teki
   App Store **public** anahtarını (`appl_` ile başlar) EAS ortam
   değişkeni olarak tanımla, `.env`'e değil:

   ```bash
   cd apps/mobile && npx eas-cli@latest env:create \
     --scope project --name EXPO_PUBLIC_REVENUECAT_IOS_KEY \
     --type string --visibility plaintext \
     --environment production --environment preview --environment development
   ```

   `.env` git tarafından yok sayılıyor, dolayısıyla bulut
   derlemesine ulaşmıyor. Yalnızca `.env`'e yazmak TestFlight
   derlemesini etkilemez — AdMob'da tam olarak bu başımıza geldi.

2. **İnceleme ekran görüntüsü.** Her abonelik için App Store Connect
   bir paywall ekran görüntüsü istiyor. Anahtar derlemeye girdi ve
   paywall simülatörde gerçek mağaza fiyatlarını gösteriyor, yani
   görüntü artık alınabilir.

Abonelikler ilk sürümle birlikte incelemeye giriyor; tek başlarına
gönderilemiyorlar.

### 5. AdMob — **kuruldu**

Hesap `digitalsepa@gmail.com` altında açık, yayıncı kimliği
`5819737950881065`. İki uygulama ve dört reklam birimi hazır:

| Uygulama          | Platform | Birimler       |
| ----------------- | -------- | -------------- |
| NeuroPeak iOS     | iOS      | Geçiş + ödüllü |
| NeuroPeak Android | Android  | Geçiş + ödüllü |

**İkisi birden gerekiyordu:** `app-ids.ts` yalnızca iki uygulama
kimliği de doluyken `isReal` diyor, tek platformun kimliğiyle
derlemek diğerini çöken hâline bırakacağı için böyle. Yani iOS'tan
önce çıkılsa bile Android uygulaması AdMob'da kayıtlı olmalı.

Altı kimlik `apps/mobile/.env`'e **ve EAS ortam değişkenlerine**
(üç ortamda da) yazıldı. EAS kısmı önemli: `.env` git tarafından yok
sayılıyor, dolayısıyla EAS sunucusuna gitmiyor ve yalnızca `.env`'e
yazmak bulut derlemesini etkilemiyor — daha önce tam burada hata
yapılmıştı. Kimlikler depoya yazılmadı; uygulama ikilisinde zaten
görünüyorlar ama herkese açık bir dosyada listelemek geçersiz
tıklama trafiğini davet ediyor.

Reklamlar henüz yayınlanmıyor, iki sebepten:

1. **Ödeme profili tamamlanmadı.** AdMob panelinde kırmızı uyarı
   duruyor; vergi ve ödeme bilgileri girilmeden inceleme başlamıyor.
2. **Uygulamalar mağazaya bağlı değil.** İkisi de "Requires review —
   limited ad serving" durumunda. Uygulama App Store'da yayımlandıktan
   sonra AdMob'da "Add store" ile bağlanması gerekiyor; inceleme
   birkaç gün sürüyor.

Yeni reklam birimlerinin sunmaya başlaması bir saati bulabiliyor.
Kimlikler boşken uygulama reklamsız derleniyordu: reklam birimi
kimliği olmayınca `admob.ts` hiç reklam istemiyor. Uygulama
kimliğinin kendisi yine de derlemeye giriyor — yoksa Google'ın
SDK'sı açılışta uygulamayı düşürüyor — ve gerçek kimlik verilmemişse
Google'ın örnek kimliği yazılıyordu.

### 6. İlk TestFlight yüklemesi

```bash
npm i -g eas-cli
eas login
cd apps/mobile
eas build --platform ios --profile production
eas submit --platform ios --latest
```

TestFlight'ta doldurulacaklar:

- **Beta App Description** — `store/listing/tr.md` içindeki promosyon
  metni yeterli.
- **Feedback Email** — `destek@neuropeak.app`.
- **Beta App Review Information** — test hesabı gerekmiyor; uygulama
  hesapsız çalışıyor. Not alanına şunu yazmak incelemeyi hızlandırır:
  _"Uygulama hesap gerektirmez. Temel IQ Testi ücretsizdir ve
  abonelik olmadan tamamlanabilir."_

### 7. Mağaza kaydı

- `store/listing/{tr,en}.md` metinlerini App Store Connect'e aktar.
- `store/screenshots/{tr,en}/` içindeki altı görseli her dil için
  yükle (6.9", 1320×2868).
- Yaş sınırı anketi: bütün içerik başlıkları "Yok", reklam kutusu
  işaretli. Beklenen sonuç **12+**.
- App Privacy anketi: `store/app-privacy.md`. Gönderdiğin derlemede
  AdMob ve RevenueCat anahtarlarının dolu olup olmadığına göre
  doğru sütunu doldur.

---

## İnceleme öncesi riskler

**IQ iddiası.** App Store, ölçüm ve sağlık iddialarına karşı
hassas. Önlem olarak:

- Uygulama içinde test girişinde ve sonuç ekranında "eğlence ve
  zihinsel egzersiz amaçlıdır; klinik veya psikometrik bir teşhis
  aracı değildir" uyarısı var.
- Aynı cümle mağaza açıklamasının sonunda da var.
- Açıklamada "gerçek IQ'nu ölç", "zekânı artır" gibi iddialar yok.

Yine de reddedilirse en olası gerekçe budur; metni yumuşatmak
gerekebilir.

**Abonelik ekranı.** Apple fiyatın, dönemin ve otomatik yenilemenin
satın alma ekranında görünmesini şart koşuyor. Üçü de var; deneme
süresi varsa açıklama cümlesi deneme süresini de yazıyor.

**Boş durum.** İnceleyen kişi hiç oyun oynamadan Lig sekmesine
bakarsa üretilmiş rakipleri görecek. Ekranda "Deneme ligi — rakipler
şimdilik cihazında üretiliyor" kartı var, gerçek oyuncu gibi
sunulmuyor.

---

## Yayını engellemeyen bilinen eksikler

**Bildirim gönderilemiyor.** Zincirin üç halkası hazır: uygulama
jetonu kaydediyor, panel kampanyayı taslak olarak saklıyor, segment
kuralı kitleye çevriliyor. Dördüncüsü — taslağı alıp Expo'nun push
servisine yollayan Edge Function — yazılmadı. Dağıtılmış bir
Supabase projesi olmadan ne yazılabilir ne denenebilirdi; proje
açıldıktan sonra yapılacak ilk iş bu. Panel kullanıcıya "gönderim
henüz yok" diyor, gönderebiliyormuş gibi davranmıyor.

**Panelden içerik eklenemiyor, silinemiyor.** Var olan içerik
düzenlenebiliyor; yeni oyun/test/soru eklemek ve silmek yok. İçerik
`packages/content` içinde yazılı ve seed ile gidiyor.

**Lig rakipleri gerçek değil.** Sunucu tarafı lig eşleştirmesi
yazılmadı; rakipler cihazda üretiliyor ve ekran bunu söylüyor.

**Dil desteği iki dil.** Arapça, İspanyolca ve Portekizce altyapısı
hazır ama çeviri yok.
